import { createMockAccount } from '@test/helpers/db';
import { createMockUser } from '@test/helpers/server';
import type { Session, User } from 'better-auth';
import { Hono } from 'hono';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Use vi.hoisted to create mocks that can be used in vi.mock
const { mockDbQuery, mockFetch } = vi.hoisted(() => {
    const mockDbQuery = {
        accounts: {
            findFirst: vi.fn()
        }
    };
    const mockFetch = vi.fn();
    return { mockDbQuery, mockFetch };
});

// Mock fetch globally
global.fetch = mockFetch;

vi.mock('@/server/db', () => ({
    db: { query: mockDbQuery },
    accounts: { userId: 'userId', providerId: 'providerId' }
}));

// Import after mocking
import githubRoutes from '@/server/api/routes/github';

describe('github routes', () => {
    type Variables = {
        user: User | null;
        session: Session | null;
    };

    let app: Hono<{ Variables: Variables }>;
    let mockUser: User;

    beforeEach(() => {
        vi.clearAllMocks();
        mockUser = createMockUser({ id: 'test-user-123' });

        app = new Hono<{ Variables: Variables }>();
        app.use('*', async (c, next) => {
            c.set('user', mockUser);
            c.set('session', null);
            await next();
        });
        app.route('/api/github', githubRoutes);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('POST /api/github/proxy', () => {
        it('should proxy GitHub API requests', async () => {
            const mockAccount = createMockAccount({ accessToken: 'github-token-123' });
            mockDbQuery.accounts.findFirst.mockResolvedValue(mockAccount);

            mockFetch.mockResolvedValue({
                ok: true,
                status: 200,
                json: () => Promise.resolve({ login: 'testuser' }),
                headers: new Map([
                    ['x-ratelimit-limit', '5000'],
                    ['x-ratelimit-remaining', '4999'],
                    ['x-ratelimit-reset', '1234567890']
                ])
            });

            const res = await app.request('/api/github/proxy', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    endpoint: '/user',
                    method: 'GET'
                })
            });
            const json = await res.json();

            expect(res.status).toBe(200);
            expect(json.data).toEqual({ login: 'testuser' });
        });

        it('should return 401 when GitHub not connected', async () => {
            mockDbQuery.accounts.findFirst.mockResolvedValue(null);

            const res = await app.request('/api/github/proxy', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    endpoint: '/user',
                    method: 'GET'
                })
            });
            const json = await res.json();

            expect(res.status).toBe(401);
            expect(json.error).toBe('GitHub not connected');
        });

        it('should forward GitHub API errors', async () => {
            const mockAccount = createMockAccount({ accessToken: 'github-token-123' });
            mockDbQuery.accounts.findFirst.mockResolvedValue(mockAccount);

            mockFetch.mockResolvedValue({
                ok: false,
                status: 404,
                json: () => Promise.resolve({ message: 'Not Found' }),
                headers: new Map()
            });

            const res = await app.request('/api/github/proxy', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    endpoint: '/repos/nonexistent/repo',
                    method: 'GET'
                })
            });
            const json = await res.json();

            expect(res.status).toBe(404);
            expect(json.error).toBe('Not Found');
        });

        it('should handle fetch errors gracefully', async () => {
            const mockAccount = createMockAccount({ accessToken: 'github-token-123' });
            mockDbQuery.accounts.findFirst.mockResolvedValue(mockAccount);

            mockFetch.mockRejectedValue(new Error('Network error'));

            vi.spyOn(console, 'error').mockImplementation(() => {});

            const res = await app.request('/api/github/proxy', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    endpoint: '/user',
                    method: 'GET'
                })
            });
            const json = await res.json();

            expect(res.status).toBe(500);
            expect(json.error).toBe('Failed to connect to GitHub');
        });
    });

    describe('POST /api/github/commit', () => {
        it('should create a new file', async () => {
            const mockAccount = createMockAccount({ accessToken: 'github-token-123' });
            mockDbQuery.accounts.findFirst.mockResolvedValue(mockAccount);

            // Mock repo info request
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ default_branch: 'main' })
            });

            // Mock commit request
            mockFetch.mockResolvedValueOnce({
                ok: true,
                status: 201,
                json: () =>
                    Promise.resolve({
                        content: { sha: 'new-file-sha' },
                        commit: { sha: 'commit-sha', html_url: 'https://github.com/...' }
                    })
            });

            const res = await app.request('/api/github/commit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    repo: 'owner/repo',
                    path: 'docs/test.md',
                    content: '# Hello World',
                    message: 'Add test.md'
                })
            });
            const json = await res.json();

            expect(res.status).toBe(200);
            expect(json.success).toBe(true);
            expect(json.sha).toBe('new-file-sha');
        });

        it('should update an existing file with sha', async () => {
            const mockAccount = createMockAccount({ accessToken: 'github-token-123' });
            mockDbQuery.accounts.findFirst.mockResolvedValue(mockAccount);

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ default_branch: 'main' })
            });

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () =>
                    Promise.resolve({
                        content: { sha: 'updated-sha' },
                        commit: { sha: 'commit-sha' }
                    })
            });

            const res = await app.request('/api/github/commit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    repo: 'owner/repo',
                    path: 'docs/test.md',
                    content: '# Updated',
                    message: 'Update test.md',
                    sha: 'old-file-sha'
                })
            });
            const json = await res.json();

            expect(res.status).toBe(200);
            expect(json.success).toBe(true);
        });

        it('should return 409 on conflict', async () => {
            const mockAccount = createMockAccount({ accessToken: 'github-token-123' });
            mockDbQuery.accounts.findFirst.mockResolvedValue(mockAccount);

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ default_branch: 'main' })
            });

            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 409,
                json: () => Promise.resolve({ message: 'Conflict' })
            });

            const res = await app.request('/api/github/commit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    repo: 'owner/repo',
                    path: 'docs/test.md',
                    content: '# Stale',
                    message: 'Update',
                    sha: 'old-sha'
                })
            });
            const json = await res.json();

            expect(res.status).toBe(409);
            expect(json.error).toBe('Conflict');
        });

        it('should return 401 when not connected', async () => {
            mockDbQuery.accounts.findFirst.mockResolvedValue(null);

            const res = await app.request('/api/github/commit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    repo: 'owner/repo',
                    path: 'test.md',
                    content: '# Test',
                    message: 'Test'
                })
            });
            const json = await res.json();

            expect(res.status).toBe(401);
            expect(json.error).toBe('GitHub not connected');
        });

        it('should handle network errors during commit', async () => {
            const mockAccount = createMockAccount({ accessToken: 'github-token-123' });
            mockDbQuery.accounts.findFirst.mockResolvedValue(mockAccount);

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ default_branch: 'main' })
            });

            mockFetch.mockRejectedValueOnce(new Error('Network error'));

            vi.spyOn(console, 'error').mockImplementation(() => {});

            const res = await app.request('/api/github/commit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    repo: 'owner/repo',
                    path: 'test.md',
                    content: '# Test',
                    message: 'Test commit'
                })
            });
            const json = await res.json();

            expect(res.status).toBe(500);
            expect(json.error).toBe('Failed to commit to GitHub');
        });
    });

    describe('DELETE /api/github/file', () => {
        it('should delete a file', async () => {
            const mockAccount = createMockAccount({ accessToken: 'github-token-123' });
            mockDbQuery.accounts.findFirst.mockResolvedValue(mockAccount);

            mockFetch.mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({})
            });

            const res = await app.request('/api/github/file', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    repo: 'owner/repo',
                    path: 'docs/test.md',
                    message: 'Delete test.md',
                    sha: 'file-sha'
                })
            });
            const json = await res.json();

            expect(res.status).toBe(200);
            expect(json.success).toBe(true);
        });

        it('should return 401 when not connected', async () => {
            mockDbQuery.accounts.findFirst.mockResolvedValue(null);

            const res = await app.request('/api/github/file', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    repo: 'owner/repo',
                    path: 'test.md',
                    message: 'Delete',
                    sha: 'sha'
                })
            });
            const json = await res.json();

            expect(res.status).toBe(401);
            expect(json.error).toBe('GitHub not connected');
        });

        it('should handle delete failure from GitHub API', async () => {
            const mockAccount = createMockAccount({ accessToken: 'github-token-123' });
            mockDbQuery.accounts.findFirst.mockResolvedValue(mockAccount);

            mockFetch.mockResolvedValue({
                ok: false,
                status: 404,
                json: () => Promise.resolve({ message: 'File not found' })
            });

            const res = await app.request('/api/github/file', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    repo: 'owner/repo',
                    path: 'nonexistent.md',
                    message: 'Delete',
                    sha: 'sha'
                })
            });
            const json = await res.json();

            expect(res.status).toBe(404);
            expect(json.error).toBe('File not found');
        });

        it('should handle network errors during delete', async () => {
            const mockAccount = createMockAccount({ accessToken: 'github-token-123' });
            mockDbQuery.accounts.findFirst.mockResolvedValue(mockAccount);

            mockFetch.mockRejectedValue(new Error('Network error'));

            vi.spyOn(console, 'error').mockImplementation(() => {});

            const res = await app.request('/api/github/file', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    repo: 'owner/repo',
                    path: 'test.md',
                    message: 'Delete',
                    sha: 'sha'
                })
            });
            const json = await res.json();

            expect(res.status).toBe(500);
            expect(json.error).toBe('Failed to delete from GitHub');
        });
    });

    describe('GET /api/github/connection', () => {
        it('should return connected status with user info', async () => {
            const mockAccount = createMockAccount({ accessToken: 'github-token-123' });
            mockDbQuery.accounts.findFirst.mockResolvedValue(mockAccount);

            mockFetch.mockResolvedValue({
                ok: true,
                json: () =>
                    Promise.resolve({
                        login: 'testuser',
                        name: 'Test User',
                        avatar_url: 'https://github.com/avatar.png'
                    })
            });

            const res = await app.request('/api/github/connection');
            const json = await res.json();

            expect(res.status).toBe(200);
            expect(json.connected).toBe(true);
            expect(json.user.login).toBe('testuser');
        });

        it('should return not connected when no account', async () => {
            mockDbQuery.accounts.findFirst.mockResolvedValue(null);

            const res = await app.request('/api/github/connection');
            const json = await res.json();

            expect(res.status).toBe(200);
            expect(json.connected).toBe(false);
        });

        it('should return not connected when token expired', async () => {
            const mockAccount = createMockAccount({ accessToken: 'expired-token' });
            mockDbQuery.accounts.findFirst.mockResolvedValue(mockAccount);

            mockFetch.mockResolvedValue({
                ok: false,
                status: 401
            });

            const res = await app.request('/api/github/connection');
            const json = await res.json();

            expect(res.status).toBe(200);
            expect(json.connected).toBe(false);
            expect(json.error).toBe('Token expired');
        });

        it('should handle network errors when checking connection', async () => {
            const mockAccount = createMockAccount({ accessToken: 'github-token-123' });
            mockDbQuery.accounts.findFirst.mockResolvedValue(mockAccount);

            mockFetch.mockRejectedValue(new Error('Network error'));

            const res = await app.request('/api/github/connection');
            const json = await res.json();

            expect(res.status).toBe(200);
            expect(json.connected).toBe(false);
            expect(json.error).toBe('Failed to verify');
        });
    });
});
