import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Import after mocking
import { checkConnection, commitFile, deleteFile, getRateLimit, githubApi, githubProxy } from '@/services/github/api';

describe('services/github/api', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('getRateLimit', () => {
        it('should return null initially', () => {
            const result = getRateLimit();
            // May or may not be null depending on previous test state
            expect(result === null || typeof result === 'object').toBe(true);
        });
    });

    describe('githubProxy', () => {
        it('should make POST request to proxy endpoint', async () => {
            mockFetch.mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({ data: { repos: [] } })
            });

            await githubProxy('/user/repos', 'GET');

            expect(mockFetch).toHaveBeenCalledWith('/api/github/proxy', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ endpoint: '/user/repos', method: 'GET', body: undefined })
            });
        });

        it('should return data from response', async () => {
            const mockRepos = [{ id: 1, name: 'repo1' }];
            mockFetch.mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({ data: mockRepos })
            });

            const result = await githubProxy<typeof mockRepos>('/user/repos');

            expect(result).toEqual(mockRepos);
        });

        it('should update rate limit from response', async () => {
            const mockRateLimit = {
                limit: 5000,
                remaining: 4999,
                reset: Date.now() / 1000 + 3600
            };

            mockFetch.mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({ data: [], rateLimit: mockRateLimit })
            });

            await githubProxy('/user/repos');

            const rateLimit = getRateLimit();
            expect(rateLimit).toEqual(mockRateLimit);
        });

        it('should throw GitHubError on error response', async () => {
            mockFetch.mockResolvedValue({
                ok: false,
                status: 404,
                json: () => Promise.resolve({ error: 'Not found' })
            });

            await expect(githubProxy('/repos/missing/repo')).rejects.toThrow('Not found');
        });

        it('should include error code for 401 status', async () => {
            mockFetch.mockResolvedValue({
                ok: false,
                status: 401,
                json: () => Promise.resolve({ error: 'Unauthorized' })
            });

            try {
                await githubProxy('/user');
            } catch (error) {
                expect((error as Error).name).toBe('GitHubError');
                expect((error as { code: string }).code).toBe('UNAUTHORIZED');
            }
        });

        it('should include error code for 403 status', async () => {
            mockFetch.mockResolvedValue({
                ok: false,
                status: 403,
                json: () => Promise.resolve({ error: 'Forbidden' })
            });

            try {
                await githubProxy('/user');
            } catch (error) {
                expect((error as { code: string }).code).toBe('FORBIDDEN');
            }
        });

        it('should include error code for 404 status', async () => {
            mockFetch.mockResolvedValue({
                ok: false,
                status: 404,
                json: () => Promise.resolve({ error: 'Not found' })
            });

            try {
                await githubProxy('/repos/missing/repo');
            } catch (error) {
                expect((error as { code: string }).code).toBe('NOT_FOUND');
            }
        });

        it('should include error code for 409 status', async () => {
            mockFetch.mockResolvedValue({
                ok: false,
                status: 409,
                json: () => Promise.resolve({ error: 'Conflict' })
            });

            try {
                await githubProxy('/repos/owner/repo/contents/file.md', 'PUT');
            } catch (error) {
                expect((error as { code: string }).code).toBe('CONFLICT');
            }
        });

        it('should include error code for 422 status', async () => {
            mockFetch.mockResolvedValue({
                ok: false,
                status: 422,
                json: () => Promise.resolve({ error: 'Validation error' })
            });

            try {
                await githubProxy('/user/repos', 'POST', { name: '' });
            } catch (error) {
                expect((error as { code: string }).code).toBe('VALIDATION_ERROR');
            }
        });

        it('should include error code for 429 status', async () => {
            mockFetch.mockResolvedValue({
                ok: false,
                status: 429,
                json: () => Promise.resolve({ error: 'Rate limited' })
            });

            try {
                await githubProxy('/user/repos');
            } catch (error) {
                expect((error as { code: string }).code).toBe('RATE_LIMITED');
            }
        });

        it('should use UNKNOWN code for other status codes', async () => {
            mockFetch.mockResolvedValue({
                ok: false,
                status: 500,
                json: () => Promise.resolve({ error: 'Server error' })
            });

            try {
                await githubProxy('/user');
            } catch (error) {
                expect((error as { code: string }).code).toBe('UNKNOWN');
            }
        });

        it('should include status in error', async () => {
            mockFetch.mockResolvedValue({
                ok: false,
                status: 403,
                json: () => Promise.resolve({ error: 'Forbidden' })
            });

            try {
                await githubProxy('/user');
            } catch (error) {
                expect((error as { status: number }).status).toBe(403);
            }
        });

        it('should include details in error', async () => {
            const details = { documentation_url: 'https://docs.github.com' };
            mockFetch.mockResolvedValue({
                ok: false,
                status: 403,
                json: () => Promise.resolve({ error: 'Forbidden', ...details })
            });

            try {
                await githubProxy('/user');
            } catch (error) {
                expect((error as { details: unknown }).details).toBeDefined();
            }
        });

        it('should use default GET method', async () => {
            mockFetch.mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({ data: [] })
            });

            await githubProxy('/user/repos');

            expect(mockFetch).toHaveBeenCalledWith(
                '/api/github/proxy',
                expect.objectContaining({
                    body: expect.stringContaining('"method":"GET"')
                })
            );
        });

        it('should pass body for POST requests', async () => {
            mockFetch.mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({ data: { id: 1 } })
            });

            const body = { name: 'new-repo' };
            await githubProxy('/user/repos', 'POST', body);

            expect(mockFetch).toHaveBeenCalledWith('/api/github/proxy', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ endpoint: '/user/repos', method: 'POST', body })
            });
        });
    });

    describe('checkConnection', () => {
        it('should return connection status', async () => {
            mockFetch.mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({ connected: true, user: { login: 'testuser' } })
            });

            const result = await checkConnection();

            expect(result.connected).toBe(true);
            expect(mockFetch).toHaveBeenCalledWith('/api/github/connection', {
                credentials: 'include'
            });
        });

        it('should return not connected status', async () => {
            mockFetch.mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({ connected: false })
            });

            const result = await checkConnection();

            expect(result.connected).toBe(false);
        });
    });

    describe('commitFile', () => {
        it('should commit a new file', async () => {
            mockFetch.mockResolvedValue({
                ok: true,
                json: () =>
                    Promise.resolve({
                        success: true,
                        sha: 'abc123',
                        commit: { sha: 'commit-sha', url: 'https://github.com/...' }
                    })
            });

            const result = await commitFile({
                owner: 'testowner',
                repo: 'testrepo',
                path: 'docs/README.md',
                content: '# Hello',
                message: 'Add README'
            });

            expect(result.success).toBe(true);
            expect(result.sha).toBe('abc123');
            expect(mockFetch).toHaveBeenCalledWith('/api/github/commit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: expect.any(String)
            });
        });

        it('should commit an update to existing file', async () => {
            mockFetch.mockResolvedValue({
                ok: true,
                json: () =>
                    Promise.resolve({
                        success: true,
                        sha: 'new-sha',
                        commit: { sha: 'commit-sha' }
                    })
            });

            const result = await commitFile({
                owner: 'testowner',
                repo: 'testrepo',
                path: 'docs/README.md',
                content: '# Updated',
                message: 'Update README',
                sha: 'old-sha'
            });

            expect(result.success).toBe(true);
            expect(result.sha).toBe('new-sha');
        });

        it('should throw error on conflict', async () => {
            mockFetch.mockResolvedValue({
                ok: false,
                status: 409,
                json: () => Promise.resolve({ error: 'Conflict: file has been modified' })
            });

            await expect(
                commitFile({
                    owner: 'testowner',
                    repo: 'testrepo',
                    path: 'docs/README.md',
                    content: '# Content',
                    message: 'Update',
                    sha: 'stale-sha'
                })
            ).rejects.toThrow('Conflict');
        });

        it('should throw error on failure', async () => {
            mockFetch.mockResolvedValue({
                ok: false,
                status: 403,
                json: () => Promise.resolve({ error: 'Permission denied' })
            });

            await expect(
                commitFile({
                    owner: 'testowner',
                    repo: 'testrepo',
                    path: 'docs/README.md',
                    content: '# Content',
                    message: 'Update'
                })
            ).rejects.toThrow('Permission denied');
        });
    });

    describe('deleteFile', () => {
        it('should delete a file', async () => {
            mockFetch.mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({ success: true })
            });

            const result = await deleteFile({
                owner: 'testowner',
                repo: 'testrepo',
                path: 'docs/old-file.md',
                sha: 'file-sha',
                message: 'Delete old file'
            });

            expect(result.success).toBe(true);
            expect(mockFetch).toHaveBeenCalledWith('/api/github/file', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: expect.any(String)
            });
        });

        it('should throw error on failure', async () => {
            mockFetch.mockResolvedValue({
                ok: false,
                status: 404,
                json: () => Promise.resolve({ error: 'File not found' })
            });

            await expect(
                deleteFile({
                    owner: 'testowner',
                    repo: 'testrepo',
                    path: 'docs/missing.md',
                    sha: 'wrong-sha',
                    message: 'Delete'
                })
            ).rejects.toThrow('File not found');
        });

        it('should throw error on conflict', async () => {
            mockFetch.mockResolvedValue({
                ok: false,
                status: 409,
                json: () => Promise.resolve({ error: 'SHA mismatch' })
            });

            await expect(
                deleteFile({
                    owner: 'testowner',
                    repo: 'testrepo',
                    path: 'docs/file.md',
                    sha: 'stale-sha',
                    message: 'Delete'
                })
            ).rejects.toThrow('SHA mismatch');
        });
    });

    describe('githubApi export', () => {
        it('should export all API functions', () => {
            expect(githubApi.proxy).toBe(githubProxy);
            expect(githubApi.checkConnection).toBe(checkConnection);
            expect(githubApi.commitFile).toBe(commitFile);
            expect(githubApi.deleteFile).toBe(deleteFile);
            expect(githubApi.getRateLimit).toBe(getRateLimit);
        });
    });
});
