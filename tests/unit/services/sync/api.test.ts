import {
    SyncApiError,
    SyncConflictError,
    deleteDocument,
    deleteFolder,
    fetchDocuments,
    fetchFolders,
    fetchSyncStatus,
    syncApi,
    upsertDocument,
    upsertFolder
} from '@/services/sync/api';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('Sync API', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockFetch.mockReset();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('SyncApiError', () => {
        it('should create error with message and status', () => {
            const error = new SyncApiError('Test error', 500);

            expect(error.message).toBe('Test error');
            expect(error.status).toBe(500);
            expect(error.name).toBe('SyncApiError');
        });

        it('should create error with optional code', () => {
            const error = new SyncApiError('Test error', 400, 'INVALID_REQUEST');

            expect(error.code).toBe('INVALID_REQUEST');
        });

        it('should be instanceof Error', () => {
            const error = new SyncApiError('Test', 500);

            expect(error).toBeInstanceOf(Error);
        });
    });

    describe('SyncConflictError', () => {
        const mockServerDocument = {
            id: 'doc-1',
            title: 'Server Doc',
            content: 'Server content',
            version: 2,
            updatedAt: new Date().toISOString()
        };

        it('should create error with conflict details', () => {
            const error = new SyncConflictError('Conflict', 2, mockServerDocument as never);

            expect(error.message).toBe('Conflict');
            expect(error.serverVersion).toBe(2);
            expect(error.serverDocument).toEqual(mockServerDocument);
            expect(error.name).toBe('SyncConflictError');
        });

        it('should be instanceof Error', () => {
            const error = new SyncConflictError('Conflict', 1, mockServerDocument as never);

            expect(error).toBeInstanceOf(Error);
        });
    });

    describe('fetchDocuments', () => {
        it('should fetch all documents', async () => {
            const mockResponse = {
                documents: [{ id: 'doc-1', title: 'Test' }],
                syncedAt: new Date().toISOString()
            };

            mockFetch.mockResolvedValue({
                ok: true,
                status: 200,
                json: () => Promise.resolve(mockResponse)
            });

            const result = await fetchDocuments();

            expect(mockFetch).toHaveBeenCalledWith(
                expect.stringContaining('/api/sync/documents'),
                expect.objectContaining({
                    method: 'GET',
                    credentials: 'include'
                })
            );
            expect(result).toEqual(mockResponse);
        });

        it('should fetch documents with since parameter', async () => {
            const since = '2024-01-01T00:00:00Z';
            mockFetch.mockResolvedValue({
                ok: true,
                status: 200,
                json: () => Promise.resolve({ documents: [] })
            });

            await fetchDocuments(since);

            expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining(`since=${encodeURIComponent(since)}`), expect.any(Object));
        });

        it('should throw SyncApiError on failure', async () => {
            mockFetch.mockResolvedValue({
                ok: false,
                status: 500,
                json: () => Promise.resolve({ error: 'Server error' })
            });

            await expect(fetchDocuments()).rejects.toThrow(SyncApiError);
        });

        it('should handle unknown error format', async () => {
            mockFetch.mockResolvedValue({
                ok: false,
                status: 500,
                json: () => Promise.reject(new Error('Parse error'))
            });

            await expect(fetchDocuments()).rejects.toThrow('Unknown error');
        });
    });

    describe('upsertDocument', () => {
        const payload = {
            id: 'doc-1',
            name: 'Test Doc',
            content: '# Test',
            syncVersion: 1
        };

        it('should create or update a document', async () => {
            const mockResponse = {
                document: { ...payload, version: 2 }
            };

            mockFetch.mockResolvedValue({
                ok: true,
                status: 200,
                json: () => Promise.resolve(mockResponse)
            });

            const result = await upsertDocument(payload);

            expect(mockFetch).toHaveBeenCalledWith(
                expect.stringContaining(`/api/sync/documents/${payload.id}`),
                expect.objectContaining({
                    method: 'PUT',
                    credentials: 'include',
                    body: JSON.stringify(payload)
                })
            );
            expect(result).toEqual(mockResponse);
        });

        it('should throw SyncConflictError on 409', async () => {
            const conflictResponse = {
                message: 'Version conflict',
                serverVersion: 3,
                serverDocument: { ...payload, version: 3, content: 'Different' }
            };

            mockFetch.mockResolvedValue({
                ok: false,
                status: 409,
                json: () => Promise.resolve(conflictResponse)
            });

            await expect(upsertDocument(payload)).rejects.toThrow(SyncConflictError);

            try {
                await upsertDocument(payload);
            } catch (error) {
                expect((error as SyncConflictError).serverVersion).toBe(3);
            }
        });

        it('should throw SyncApiError on other errors', async () => {
            mockFetch.mockResolvedValue({
                ok: false,
                status: 400,
                json: () => Promise.resolve({ error: 'Bad request' })
            });

            await expect(upsertDocument(payload)).rejects.toThrow(SyncApiError);
        });
    });

    describe('deleteDocument', () => {
        it('should soft delete a document', async () => {
            const mockResponse = { success: true };

            mockFetch.mockResolvedValue({
                ok: true,
                status: 200,
                json: () => Promise.resolve(mockResponse)
            });

            const result = await deleteDocument('doc-1');

            expect(mockFetch).toHaveBeenCalledWith(
                expect.stringContaining('/api/sync/documents/doc-1'),
                expect.objectContaining({
                    method: 'DELETE',
                    credentials: 'include'
                })
            );
            expect(result).toEqual(mockResponse);
        });

        it('should throw SyncApiError on failure', async () => {
            mockFetch.mockResolvedValue({
                ok: false,
                status: 404,
                json: () => Promise.resolve({ error: 'Not found' })
            });

            await expect(deleteDocument('doc-1')).rejects.toThrow(SyncApiError);
        });
    });

    describe('fetchFolders', () => {
        it('should fetch all folders', async () => {
            const mockResponse = {
                folders: [{ id: 'folder-1', name: 'Test Folder' }],
                syncedAt: new Date().toISOString()
            };

            mockFetch.mockResolvedValue({
                ok: true,
                status: 200,
                json: () => Promise.resolve(mockResponse)
            });

            const result = await fetchFolders();

            expect(mockFetch).toHaveBeenCalledWith(
                expect.stringContaining('/api/sync/folders'),
                expect.objectContaining({
                    method: 'GET',
                    credentials: 'include'
                })
            );
            expect(result).toEqual(mockResponse);
        });

        it('should fetch folders with since parameter', async () => {
            const since = '2024-01-01T00:00:00Z';
            mockFetch.mockResolvedValue({
                ok: true,
                status: 200,
                json: () => Promise.resolve({ folders: [] })
            });

            await fetchFolders(since);

            expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining(`since=${encodeURIComponent(since)}`), expect.any(Object));
        });

        it('should throw SyncApiError on failure', async () => {
            mockFetch.mockResolvedValue({
                ok: false,
                status: 500,
                json: () => Promise.resolve({ error: 'Server error' })
            });

            await expect(fetchFolders()).rejects.toThrow(SyncApiError);
        });
    });

    describe('upsertFolder', () => {
        const payload = {
            id: 'folder-1',
            name: 'Test Folder',
            parentId: null
        };

        it('should create or update a folder', async () => {
            const mockResponse = {
                folder: { ...payload, version: 1 }
            };

            mockFetch.mockResolvedValue({
                ok: true,
                status: 200,
                json: () => Promise.resolve(mockResponse)
            });

            const result = await upsertFolder(payload);

            expect(mockFetch).toHaveBeenCalledWith(
                expect.stringContaining(`/api/sync/folders/${payload.id}`),
                expect.objectContaining({
                    method: 'PUT',
                    credentials: 'include',
                    body: JSON.stringify(payload)
                })
            );
            expect(result).toEqual(mockResponse);
        });

        it('should throw SyncApiError on failure', async () => {
            mockFetch.mockResolvedValue({
                ok: false,
                status: 400,
                json: () => Promise.resolve({ error: 'Invalid folder' })
            });

            await expect(upsertFolder(payload)).rejects.toThrow(SyncApiError);
        });
    });

    describe('deleteFolder', () => {
        it('should soft delete a folder', async () => {
            const mockResponse = { success: true };

            mockFetch.mockResolvedValue({
                ok: true,
                status: 200,
                json: () => Promise.resolve(mockResponse)
            });

            const result = await deleteFolder('folder-1');

            expect(mockFetch).toHaveBeenCalledWith(
                expect.stringContaining('/api/sync/folders/folder-1'),
                expect.objectContaining({
                    method: 'DELETE',
                    credentials: 'include'
                })
            );
            expect(result).toEqual(mockResponse);
        });

        it('should throw SyncApiError on failure', async () => {
            mockFetch.mockResolvedValue({
                ok: false,
                status: 404,
                json: () => Promise.resolve({ error: 'Not found' })
            });

            await expect(deleteFolder('folder-1')).rejects.toThrow(SyncApiError);
        });
    });

    describe('fetchSyncStatus', () => {
        it('should fetch sync status', async () => {
            const mockResponse = {
                lastSyncedAt: new Date().toISOString(),
                documentsCount: 10,
                foldersCount: 3
            };

            mockFetch.mockResolvedValue({
                ok: true,
                status: 200,
                json: () => Promise.resolve(mockResponse)
            });

            const result = await fetchSyncStatus();

            expect(mockFetch).toHaveBeenCalledWith(
                expect.stringContaining('/api/sync/status'),
                expect.objectContaining({
                    method: 'GET',
                    credentials: 'include'
                })
            );
            expect(result).toEqual(mockResponse);
        });

        it('should throw SyncApiError on failure', async () => {
            mockFetch.mockResolvedValue({
                ok: false,
                status: 401,
                json: () => Promise.resolve({ error: 'Unauthorized' })
            });

            await expect(fetchSyncStatus()).rejects.toThrow(SyncApiError);
        });
    });

    describe('syncApi object', () => {
        it('should export documents methods', () => {
            expect(syncApi.documents.fetch).toBe(fetchDocuments);
            expect(syncApi.documents.upsert).toBe(upsertDocument);
            expect(syncApi.documents.delete).toBe(deleteDocument);
        });

        it('should export folders methods', () => {
            expect(syncApi.folders.fetch).toBe(fetchFolders);
            expect(syncApi.folders.upsert).toBe(upsertFolder);
            expect(syncApi.folders.delete).toBe(deleteFolder);
        });

        it('should export status method', () => {
            expect(syncApi.status).toBe(fetchSyncStatus);
        });
    });

    describe('error handling edge cases', () => {
        it('should use message field if error field is not present', async () => {
            mockFetch.mockResolvedValue({
                ok: false,
                status: 400,
                json: () => Promise.resolve({ message: 'Bad request message' })
            });

            try {
                await fetchDocuments();
            } catch (error) {
                expect((error as SyncApiError).message).toBe('Bad request message');
            }
        });

        it('should use code field from error response', async () => {
            mockFetch.mockResolvedValue({
                ok: false,
                status: 400,
                json: () => Promise.resolve({ error: 'Invalid', code: 'VALIDATION_ERROR' })
            });

            try {
                await fetchDocuments();
            } catch (error) {
                expect((error as SyncApiError).code).toBe('VALIDATION_ERROR');
            }
        });

        it('should fallback to Request failed when no error or message', async () => {
            mockFetch.mockResolvedValue({
                ok: false,
                status: 500,
                json: () => Promise.resolve({})
            });

            try {
                await fetchDocuments();
            } catch (error) {
                expect((error as SyncApiError).message).toBe('Request failed');
            }
        });
    });
});
