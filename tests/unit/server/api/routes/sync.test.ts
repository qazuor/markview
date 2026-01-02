import { createMockDocument, createMockFolder } from '@test/helpers/db';
import { createMockUser } from '@test/helpers/server';
import type { Session, User } from 'better-auth';
import { Hono } from 'hono';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Use vi.hoisted to create mocks that can be used in vi.mock
const { mockDbQuery, mockDb } = vi.hoisted(() => {
    const mockDbQuery = {
        documents: {
            findMany: vi.fn(),
            findFirst: vi.fn()
        },
        folders: {
            findMany: vi.fn(),
            findFirst: vi.fn()
        }
    };

    const mockDb = {
        query: mockDbQuery,
        insert: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        select: vi.fn()
    };

    return { mockDbQuery, mockDb };
});

vi.mock('@/server/db', () => ({
    db: mockDb,
    documents: { id: 'id', userId: 'userId', deletedAt: 'deletedAt', syncVersion: 'syncVersion', updatedAt: 'updatedAt' },
    folders: { id: 'id', userId: 'userId', deletedAt: 'deletedAt', updatedAt: 'updatedAt' }
}));

// Import after mocking
import syncRoutes from '@/server/api/routes/sync';

describe('sync routes', () => {
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
        app.route('/api/sync', syncRoutes);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('GET /api/sync/documents', () => {
        it('should return all documents for user', async () => {
            const mockDocs = [createMockDocument({ id: 'doc-1', name: 'Doc 1' }), createMockDocument({ id: 'doc-2', name: 'Doc 2' })];
            mockDbQuery.documents.findMany.mockResolvedValue(mockDocs);

            const res = await app.request('/api/sync/documents');
            const json = await res.json();

            expect(res.status).toBe(200);
            expect(json.documents).toHaveLength(2);
            expect(json.syncedAt).toBeDefined();
        });

        it('should support incremental sync with since parameter', async () => {
            mockDbQuery.documents.findMany.mockResolvedValue([]);

            const res = await app.request('/api/sync/documents?since=2024-01-01T00:00:00Z');
            const json = await res.json();

            expect(res.status).toBe(200);
            expect(json.documents).toEqual([]);
        });

        it('should return 401 when not authenticated', async () => {
            const noAuthApp = new Hono<{ Variables: Variables }>();
            noAuthApp.use('*', async (c, next) => {
                c.set('user', null);
                c.set('session', null);
                await next();
            });
            noAuthApp.route('/api/sync', syncRoutes);

            const res = await noAuthApp.request('/api/sync/documents');

            expect(res.status).toBe(401);
        });
    });

    describe('PUT /api/sync/documents/:id', () => {
        it('should create new document', async () => {
            mockDbQuery.documents.findFirst.mockResolvedValue(null);
            const newDoc = createMockDocument({ id: 'new-doc', syncVersion: 1 });
            mockDb.insert.mockReturnValue({
                values: vi.fn().mockReturnValue({
                    returning: vi.fn().mockResolvedValue([newDoc])
                })
            });

            const res = await app.request('/api/sync/documents/new-doc', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: 'new-doc',
                    name: 'New Document',
                    content: '# Hello'
                })
            });
            const json = await res.json();

            expect(res.status).toBe(201);
            expect(json.document).toBeDefined();
        });

        it('should update existing document', async () => {
            const existingDoc = createMockDocument({ id: 'existing-doc', syncVersion: 1 });
            mockDbQuery.documents.findFirst.mockResolvedValue(existingDoc);
            const updatedDoc = { ...existingDoc, name: 'Updated', syncVersion: 2 };
            mockDb.update.mockReturnValue({
                set: vi.fn().mockReturnValue({
                    where: vi.fn().mockReturnValue({
                        returning: vi.fn().mockResolvedValue([updatedDoc])
                    })
                })
            });

            const res = await app.request('/api/sync/documents/existing-doc', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: 'existing-doc',
                    name: 'Updated',
                    content: '# Updated content',
                    syncVersion: 1
                })
            });
            const json = await res.json();

            expect(res.status).toBe(200);
            expect(json.document.name).toBe('Updated');
        });

        it('should return 409 on version conflict', async () => {
            const existingDoc = createMockDocument({ id: 'conflict-doc', syncVersion: 5 });
            mockDbQuery.documents.findFirst.mockResolvedValue(existingDoc);

            const res = await app.request('/api/sync/documents/conflict-doc', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: 'conflict-doc',
                    name: 'Old version',
                    content: '# Stale',
                    syncVersion: 3
                })
            });
            const json = await res.json();

            expect(res.status).toBe(409);
            expect(json.error).toBe('Conflict');
            expect(json.serverVersion).toBe(5);
        });

        it('should validate document schema', async () => {
            const res = await app.request('/api/sync/documents/test', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: 'test'
                    // Missing required 'name' and 'content'
                })
            });

            expect(res.status).toBe(400);
        });
    });

    describe('DELETE /api/sync/documents/:id', () => {
        it('should soft delete document', async () => {
            const deletedDoc = createMockDocument({ id: 'delete-doc', deletedAt: new Date() });
            mockDb.update.mockReturnValue({
                set: vi.fn().mockReturnValue({
                    where: vi.fn().mockReturnValue({
                        returning: vi.fn().mockResolvedValue([deletedDoc])
                    })
                })
            });
            mockDb.select.mockReturnValue({
                from: vi.fn().mockReturnValue({
                    where: vi.fn().mockReturnValue({
                        limit: vi.fn().mockResolvedValue([{ v: 1 }])
                    })
                })
            });

            const res = await app.request('/api/sync/documents/delete-doc', {
                method: 'DELETE'
            });
            const json = await res.json();

            expect(res.status).toBe(200);
            expect(json.success).toBe(true);
        });

        it('should return 404 when document not found', async () => {
            mockDb.update.mockReturnValue({
                set: vi.fn().mockReturnValue({
                    where: vi.fn().mockReturnValue({
                        returning: vi.fn().mockResolvedValue([])
                    })
                })
            });
            mockDb.select.mockReturnValue({
                from: vi.fn().mockReturnValue({
                    where: vi.fn().mockReturnValue({
                        limit: vi.fn().mockResolvedValue([])
                    })
                })
            });

            const res = await app.request('/api/sync/documents/not-found', {
                method: 'DELETE'
            });
            const json = await res.json();

            expect(res.status).toBe(404);
            expect(json.error).toBe('Document not found');
        });
    });

    describe('GET /api/sync/folders', () => {
        it('should return all folders for user', async () => {
            const mockFolders = [
                createMockFolder({ id: 'folder-1', name: 'Folder 1' }),
                createMockFolder({ id: 'folder-2', name: 'Folder 2' })
            ];
            mockDbQuery.folders.findMany.mockResolvedValue(mockFolders);

            const res = await app.request('/api/sync/folders');
            const json = await res.json();

            expect(res.status).toBe(200);
            expect(json.folders).toHaveLength(2);
            expect(json.syncedAt).toBeDefined();
        });

        it('should support incremental sync with since parameter', async () => {
            mockDbQuery.folders.findMany.mockResolvedValue([]);

            const res = await app.request('/api/sync/folders?since=2024-01-01T00:00:00Z');

            expect(res.status).toBe(200);
        });
    });

    describe('PUT /api/sync/folders/:id', () => {
        it('should create new folder', async () => {
            mockDbQuery.folders.findFirst.mockResolvedValue(null);
            const newFolder = createMockFolder({ id: 'new-folder' });
            mockDb.insert.mockReturnValue({
                values: vi.fn().mockReturnValue({
                    returning: vi.fn().mockResolvedValue([newFolder])
                })
            });

            const res = await app.request('/api/sync/folders/new-folder', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: 'new-folder',
                    name: 'New Folder'
                })
            });
            const json = await res.json();

            expect(res.status).toBe(201);
            expect(json.folder).toBeDefined();
        });

        it('should update existing folder', async () => {
            const existingFolder = createMockFolder({ id: 'existing-folder' });
            mockDbQuery.folders.findFirst.mockResolvedValue(existingFolder);
            const updatedFolder = { ...existingFolder, name: 'Updated Folder' };
            mockDb.update.mockReturnValue({
                set: vi.fn().mockReturnValue({
                    where: vi.fn().mockReturnValue({
                        returning: vi.fn().mockResolvedValue([updatedFolder])
                    })
                })
            });

            const res = await app.request('/api/sync/folders/existing-folder', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: 'existing-folder',
                    name: 'Updated Folder'
                })
            });
            const json = await res.json();

            expect(res.status).toBe(200);
            expect(json.folder.name).toBe('Updated Folder');
        });
    });

    describe('DELETE /api/sync/folders/:id', () => {
        it('should soft delete folder', async () => {
            const deletedFolder = createMockFolder({ id: 'delete-folder', deletedAt: new Date() });
            mockDb.update.mockReturnValue({
                set: vi.fn().mockReturnValue({
                    where: vi.fn().mockReturnValue({
                        returning: vi.fn().mockResolvedValue([deletedFolder])
                    })
                })
            });

            const res = await app.request('/api/sync/folders/delete-folder', {
                method: 'DELETE'
            });
            const json = await res.json();

            expect(res.status).toBe(200);
            expect(json.success).toBe(true);
        });

        it('should return 404 when folder not found', async () => {
            mockDb.update.mockReturnValue({
                set: vi.fn().mockReturnValue({
                    where: vi.fn().mockReturnValue({
                        returning: vi.fn().mockResolvedValue([])
                    })
                })
            });

            const res = await app.request('/api/sync/folders/not-found', {
                method: 'DELETE'
            });
            const json = await res.json();

            expect(res.status).toBe(404);
            expect(json.error).toBe('Folder not found');
        });
    });

    describe('GET /api/sync/status', () => {
        it('should return sync status counts', async () => {
            mockDb.select.mockReturnValue({
                from: vi.fn().mockReturnValue({
                    where: vi.fn().mockResolvedValue([{ count: 5 }])
                })
            });

            const res = await app.request('/api/sync/status');
            const json = await res.json();

            expect(res.status).toBe(200);
            expect(json.documentsCount).toBeDefined();
            expect(json.foldersCount).toBeDefined();
            expect(json.timestamp).toBeDefined();
        });
    });
});
