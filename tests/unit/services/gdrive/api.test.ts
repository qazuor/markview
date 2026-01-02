import { GoogleDriveError } from '@/types/gdrive';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Import after mocking
import { checkConnection, fetchFileContent, fileOperation, gdriveApi, getQuota, googleProxy } from '@/services/gdrive/api';

describe('services/gdrive/api', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('googleProxy', () => {
        it('should make POST request to proxy endpoint', async () => {
            mockFetch.mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({ data: { files: [] } })
            });

            await googleProxy('/drive/v3/files', 'GET');

            expect(mockFetch).toHaveBeenCalledWith('/api/google/proxy', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ endpoint: '/drive/v3/files', method: 'GET', body: undefined })
            });
        });

        it('should return data from response', async () => {
            const mockFiles = [{ id: '1', name: 'test.md' }];
            mockFetch.mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({ data: { files: mockFiles } })
            });

            const result = await googleProxy<{ files: typeof mockFiles }>('/drive/v3/files');

            expect(result.files).toEqual(mockFiles);
        });

        it('should return content for file download requests', async () => {
            mockFetch.mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({ content: '# Hello World' })
            });

            const result = await googleProxy<string>('/drive/v3/files/123?alt=media');

            expect(result).toBe('# Hello World');
        });

        it('should throw GoogleDriveError on error response', async () => {
            mockFetch.mockResolvedValue({
                ok: false,
                status: 404,
                json: () => Promise.resolve({ error: 'File not found' })
            });

            await expect(googleProxy('/drive/v3/files/missing')).rejects.toThrow(GoogleDriveError);
        });

        it('should map 401 status to UNAUTHORIZED error code', async () => {
            mockFetch.mockResolvedValue({
                ok: false,
                status: 401,
                json: () => Promise.resolve({ error: 'Unauthorized' })
            });

            try {
                await googleProxy('/drive/v3/files');
            } catch (error) {
                expect(error).toBeInstanceOf(GoogleDriveError);
                expect((error as GoogleDriveError).code).toBe('UNAUTHORIZED');
            }
        });

        it('should map 403 status to FORBIDDEN error code', async () => {
            mockFetch.mockResolvedValue({
                ok: false,
                status: 403,
                json: () => Promise.resolve({ error: 'Forbidden' })
            });

            try {
                await googleProxy('/drive/v3/files');
            } catch (error) {
                expect(error).toBeInstanceOf(GoogleDriveError);
                expect((error as GoogleDriveError).code).toBe('FORBIDDEN');
            }
        });

        it('should map 404 status to NOT_FOUND error code', async () => {
            mockFetch.mockResolvedValue({
                ok: false,
                status: 404,
                json: () => Promise.resolve({ error: 'Not found' })
            });

            try {
                await googleProxy('/drive/v3/files/missing');
            } catch (error) {
                expect(error).toBeInstanceOf(GoogleDriveError);
                expect((error as GoogleDriveError).code).toBe('NOT_FOUND');
            }
        });

        it('should map 429 status to RATE_LIMITED error code', async () => {
            mockFetch.mockResolvedValue({
                ok: false,
                status: 429,
                json: () => Promise.resolve({ error: 'Rate limited' })
            });

            try {
                await googleProxy('/drive/v3/files');
            } catch (error) {
                expect(error).toBeInstanceOf(GoogleDriveError);
                expect((error as GoogleDriveError).code).toBe('RATE_LIMITED');
            }
        });

        it('should map unknown status to UNKNOWN error code', async () => {
            mockFetch.mockResolvedValue({
                ok: false,
                status: 500,
                json: () => Promise.resolve({ error: 'Server error' })
            });

            try {
                await googleProxy('/drive/v3/files');
            } catch (error) {
                expect(error).toBeInstanceOf(GoogleDriveError);
                expect((error as GoogleDriveError).code).toBe('UNKNOWN');
            }
        });

        it('should throw error when response has no data or content', async () => {
            mockFetch.mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({})
            });

            await expect(googleProxy('/drive/v3/files')).rejects.toThrow('Invalid response');
        });

        it('should pass body for POST/PUT requests', async () => {
            mockFetch.mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({ data: { id: '123' } })
            });

            const body = { name: 'new-file.md' };
            await googleProxy('/drive/v3/files', 'POST', body);

            expect(mockFetch).toHaveBeenCalledWith('/api/google/proxy', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ endpoint: '/drive/v3/files', method: 'POST', body })
            });
        });

        it('should use default GET method when not specified', async () => {
            mockFetch.mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({ data: [] })
            });

            await googleProxy('/drive/v3/files');

            expect(mockFetch).toHaveBeenCalledWith(
                '/api/google/proxy',
                expect.objectContaining({
                    body: expect.stringContaining('"method":"GET"')
                })
            );
        });
    });

    describe('checkConnection', () => {
        it('should return connection status', async () => {
            mockFetch.mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({ connected: true, user: { email: 'user@gmail.com' } })
            });

            const result = await checkConnection();

            expect(result.connected).toBe(true);
            expect(mockFetch).toHaveBeenCalledWith('/api/google/connection', {
                credentials: 'include'
            });
        });

        it('should return not connected when response is not ok', async () => {
            mockFetch.mockResolvedValue({
                ok: false
            });

            const result = await checkConnection();

            expect(result.connected).toBe(false);
            expect(result.error).toBe('Failed to check connection');
        });

        it('should handle network errors', async () => {
            mockFetch.mockRejectedValue(new Error('Network error'));

            const result = await checkConnection();

            expect(result.connected).toBe(false);
            expect(result.error).toBe('Network error');
        });
    });

    describe('getQuota', () => {
        it('should return quota information', async () => {
            const mockQuota = {
                used: 1000000,
                limit: 15000000000,
                usedInDrive: 500000,
                usedInTrash: 100000
            };

            mockFetch.mockResolvedValue({
                ok: true,
                json: () => Promise.resolve(mockQuota)
            });

            const result = await getQuota();

            expect(result).toEqual(mockQuota);
            expect(mockFetch).toHaveBeenCalledWith('/api/google/quota', {
                credentials: 'include'
            });
        });

        it('should return null when response is not ok', async () => {
            mockFetch.mockResolvedValue({
                ok: false
            });

            const result = await getQuota();

            expect(result).toBeNull();
        });

        it('should handle network errors', async () => {
            mockFetch.mockRejectedValue(new Error('Network error'));

            const result = await getQuota();

            expect(result).toBeNull();
        });
    });

    describe('fileOperation', () => {
        it('should create a file', async () => {
            mockFetch.mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({ success: true, file: { id: '123', name: 'test.md' } })
            });

            const result = await fileOperation({
                operation: 'create',
                name: 'test.md',
                content: '# Test'
            });

            expect(result.success).toBe(true);
            expect(mockFetch).toHaveBeenCalledWith('/api/google/files', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: expect.any(String)
            });
        });

        it('should update a file', async () => {
            mockFetch.mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({ success: true, file: { id: '123' } })
            });

            const result = await fileOperation({
                operation: 'update',
                fileId: '123',
                content: '# Updated'
            });

            expect(result.success).toBe(true);
        });

        it('should delete a file', async () => {
            mockFetch.mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({ success: true })
            });

            const result = await fileOperation({
                operation: 'delete',
                fileId: '123'
            });

            expect(result.success).toBe(true);
        });

        it('should rename a file', async () => {
            mockFetch.mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({ success: true, file: { id: '123', name: 'renamed.md' } })
            });

            const result = await fileOperation({
                operation: 'rename',
                fileId: '123',
                name: 'renamed.md'
            });

            expect(result.success).toBe(true);
        });

        it('should move a file', async () => {
            mockFetch.mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({ success: true })
            });

            const result = await fileOperation({
                operation: 'move',
                fileId: '123',
                parentId: 'folder-456'
            });

            expect(result.success).toBe(true);
        });

        it('should return error when response is not ok', async () => {
            mockFetch.mockResolvedValue({
                ok: false,
                json: () => Promise.resolve({ error: 'File not found' })
            });

            const result = await fileOperation({
                operation: 'update',
                fileId: 'missing',
                content: '# Content'
            });

            expect(result.success).toBe(false);
            expect(result.error).toBe('File not found');
        });

        it('should handle network errors', async () => {
            mockFetch.mockRejectedValue(new Error('Network error'));

            const result = await fileOperation({
                operation: 'create',
                name: 'test.md'
            });

            expect(result.success).toBe(false);
            expect(result.error).toBe('Network error');
        });
    });

    describe('fetchFileContent', () => {
        it('should fetch file metadata and content', async () => {
            // First call: metadata
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () =>
                    Promise.resolve({
                        data: { id: '123', name: 'test.md', mimeType: 'text/markdown', modifiedTime: '2024-01-01T00:00:00Z' }
                    })
            });

            // Second call: content
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ content: '# Hello World' })
            });

            const result = await fetchFileContent('123');

            expect(result).toEqual({
                id: '123',
                name: 'test.md',
                content: '# Hello World',
                mimeType: 'text/markdown',
                modifiedTime: '2024-01-01T00:00:00Z'
            });
        });

        it('should return null on metadata fetch error', async () => {
            mockFetch.mockResolvedValue({
                ok: false,
                status: 404,
                json: () => Promise.resolve({ error: 'Not found' })
            });

            const result = await fetchFileContent('missing');

            expect(result).toBeNull();
        });

        it('should return null on content fetch error', async () => {
            // First call: metadata succeeds
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () =>
                    Promise.resolve({
                        data: { id: '123', name: 'test.md', mimeType: 'text/markdown', modifiedTime: '2024-01-01T00:00:00Z' }
                    })
            });

            // Second call: content fails
            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 500,
                json: () => Promise.resolve({ error: 'Server error' })
            });

            const result = await fetchFileContent('123');

            expect(result).toBeNull();
        });
    });

    describe('gdriveApi export', () => {
        it('should export all API functions', () => {
            expect(gdriveApi.proxy).toBe(googleProxy);
            expect(gdriveApi.checkConnection).toBe(checkConnection);
            expect(gdriveApi.getQuota).toBe(getQuota);
            expect(gdriveApi.fileOperation).toBe(fileOperation);
            expect(gdriveApi.fetchFileContent).toBe(fetchFileContent);
        });
    });
});
