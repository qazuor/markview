import { createMockAccount } from '@test/helpers/db';
import { createMockUser } from '@test/helpers/server';
import type { Session, User } from 'better-auth';
import { Hono } from 'hono';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Use vi.hoisted to create mocks that can be used in vi.mock
const { mockDbQuery, mockDb, mockFetch } = vi.hoisted(() => {
    const mockDbQuery = {
        accounts: {
            findFirst: vi.fn()
        }
    };

    const mockDb = {
        query: mockDbQuery,
        update: vi.fn()
    };

    const mockFetch = vi.fn();

    return { mockDbQuery, mockDb, mockFetch };
});

// Mock fetch globally
global.fetch = mockFetch;

vi.mock('@/server/db', () => ({
    db: mockDb,
    accounts: { userId: 'userId', providerId: 'providerId' }
}));

// Import after mocking
import googleRoutes from '@/server/api/routes/google';

describe('google routes', () => {
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
        app.route('/api/google', googleRoutes);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('POST /api/google/proxy', () => {
        it('should proxy Google API requests', async () => {
            const mockAccount = createMockAccount({
                providerId: 'google',
                accessToken: 'google-token-123',
                accessTokenExpiresAt: new Date(Date.now() + 3600000)
            });
            mockDbQuery.accounts.findFirst.mockResolvedValue(mockAccount);

            mockFetch.mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({ files: [] })
            });

            const res = await app.request('/api/google/proxy', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    endpoint: '/drive/v3/files',
                    method: 'GET'
                })
            });
            const json = await res.json();

            expect(res.status).toBe(200);
            expect(json.data).toEqual({ files: [] });
        });

        it('should refresh expired token and make request', async () => {
            const mockAccount = createMockAccount({
                providerId: 'google',
                accessToken: 'expired-token',
                accessTokenExpiresAt: new Date(Date.now() - 1000),
                refreshToken: 'refresh-token-123'
            });
            mockDbQuery.accounts.findFirst.mockResolvedValue(mockAccount);

            mockDb.update.mockReturnValue({
                set: vi.fn().mockReturnValue({
                    where: vi.fn().mockResolvedValue(undefined)
                })
            });

            // First call: token refresh
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () =>
                    Promise.resolve({
                        access_token: 'new-token-123',
                        expires_in: 3600
                    })
            });

            // Second call: actual API request
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ files: [] })
            });

            const res = await app.request('/api/google/proxy', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    endpoint: '/drive/v3/files',
                    method: 'GET'
                })
            });
            const json = await res.json();

            expect(res.status).toBe(200);
            expect(json.data).toEqual({ files: [] });
        });

        it('should return 401 when token refresh fails', async () => {
            const mockAccount = createMockAccount({
                providerId: 'google',
                accessToken: 'expired-token',
                accessTokenExpiresAt: new Date(Date.now() - 1000),
                refreshToken: 'invalid-refresh-token'
            });
            mockDbQuery.accounts.findFirst.mockResolvedValue(mockAccount);

            vi.spyOn(console, 'error').mockImplementation(() => {});

            // Token refresh fails
            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 400,
                json: () => Promise.resolve({ error: 'invalid_grant' })
            });

            const res = await app.request('/api/google/proxy', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    endpoint: '/drive/v3/files',
                    method: 'GET'
                })
            });
            const json = await res.json();

            expect(res.status).toBe(401);
            expect(json.error).toBe('Google Drive not connected');
        });

        it('should return 401 when token expired and no refresh token', async () => {
            const mockAccount = createMockAccount({
                providerId: 'google',
                accessToken: 'expired-token',
                accessTokenExpiresAt: new Date(Date.now() - 1000),
                refreshToken: null
            });
            mockDbQuery.accounts.findFirst.mockResolvedValue(mockAccount);

            const res = await app.request('/api/google/proxy', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    endpoint: '/drive/v3/files',
                    method: 'GET'
                })
            });
            const json = await res.json();

            expect(res.status).toBe(401);
            expect(json.error).toBe('Google Drive not connected');
        });

        it('should return 401 when not connected', async () => {
            mockDbQuery.accounts.findFirst.mockResolvedValue(null);

            const res = await app.request('/api/google/proxy', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    endpoint: '/drive/v3/files',
                    method: 'GET'
                })
            });
            const json = await res.json();

            expect(res.status).toBe(401);
            expect(json.error).toBe('Google Drive not connected');
        });

        it('should handle file download with alt=media', async () => {
            const mockAccount = createMockAccount({
                providerId: 'google',
                accessToken: 'google-token-123',
                accessTokenExpiresAt: new Date(Date.now() + 3600000)
            });
            mockDbQuery.accounts.findFirst.mockResolvedValue(mockAccount);

            mockFetch.mockResolvedValue({
                ok: true,
                text: () => Promise.resolve('# File content')
            });

            const res = await app.request('/api/google/proxy', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    endpoint: '/drive/v3/files/file-id?alt=media',
                    method: 'GET'
                })
            });
            const json = await res.json();

            expect(res.status).toBe(200);
            expect(json.content).toBe('# File content');
        });

        it('should forward Google API errors', async () => {
            const mockAccount = createMockAccount({
                providerId: 'google',
                accessToken: 'google-token-123',
                accessTokenExpiresAt: new Date(Date.now() + 3600000)
            });
            mockDbQuery.accounts.findFirst.mockResolvedValue(mockAccount);

            mockFetch.mockResolvedValue({
                ok: false,
                status: 404,
                json: () => Promise.resolve({ error: { message: 'File not found' } })
            });

            const res = await app.request('/api/google/proxy', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    endpoint: '/drive/v3/files/nonexistent',
                    method: 'GET'
                })
            });
            const json = await res.json();

            expect(res.status).toBe(404);
            expect(json.error).toBe('File not found');
        });

        it('should handle network errors', async () => {
            const mockAccount = createMockAccount({
                providerId: 'google',
                accessToken: 'google-token-123',
                accessTokenExpiresAt: new Date(Date.now() + 3600000)
            });
            mockDbQuery.accounts.findFirst.mockResolvedValue(mockAccount);

            mockFetch.mockRejectedValue(new Error('Network error'));

            vi.spyOn(console, 'error').mockImplementation(() => {});

            const res = await app.request('/api/google/proxy', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    endpoint: '/drive/v3/files',
                    method: 'GET'
                })
            });
            const json = await res.json();

            expect(res.status).toBe(500);
            expect(json.error).toBe('Failed to connect to Google');
        });
    });

    describe('POST /api/google/files', () => {
        const mockAccount = {
            ...createMockAccount({
                providerId: 'google',
                accessToken: 'google-token-123',
                accessTokenExpiresAt: new Date(Date.now() + 3600000)
            })
        };

        it('should create a new file', async () => {
            mockDbQuery.accounts.findFirst.mockResolvedValue(mockAccount);

            mockFetch.mockResolvedValue({
                ok: true,
                json: () =>
                    Promise.resolve({
                        id: 'new-file-id',
                        name: 'document.md',
                        mimeType: 'text/markdown'
                    })
            });

            const res = await app.request('/api/google/files', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    operation: 'create',
                    name: 'document.md',
                    content: '# Hello World'
                })
            });
            const json = await res.json();

            expect(res.status).toBe(200);
            expect(json.success).toBe(true);
            expect(json.file.id).toBe('new-file-id');
        });

        it('should update an existing file', async () => {
            mockDbQuery.accounts.findFirst.mockResolvedValue(mockAccount);

            mockFetch.mockResolvedValue({
                ok: true,
                json: () =>
                    Promise.resolve({
                        id: 'file-id',
                        name: 'document.md',
                        modifiedTime: new Date().toISOString()
                    })
            });

            const res = await app.request('/api/google/files', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    operation: 'update',
                    fileId: 'file-id',
                    content: '# Updated content'
                })
            });
            const json = await res.json();

            expect(res.status).toBe(200);
            expect(json.success).toBe(true);
        });

        it('should delete a file (move to trash)', async () => {
            mockDbQuery.accounts.findFirst.mockResolvedValue(mockAccount);

            mockFetch.mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({ id: 'file-id', trashed: true })
            });

            const res = await app.request('/api/google/files', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    operation: 'delete',
                    fileId: 'file-id'
                })
            });
            const json = await res.json();

            expect(res.status).toBe(200);
            expect(json.success).toBe(true);
        });

        it('should rename a file', async () => {
            mockDbQuery.accounts.findFirst.mockResolvedValue(mockAccount);

            mockFetch.mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({ id: 'file-id', name: 'new-name.md' })
            });

            const res = await app.request('/api/google/files', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    operation: 'rename',
                    fileId: 'file-id',
                    name: 'new-name.md'
                })
            });
            const json = await res.json();

            expect(res.status).toBe(200);
            expect(json.success).toBe(true);
        });

        it('should move a file to a different folder', async () => {
            mockDbQuery.accounts.findFirst.mockResolvedValue(mockAccount);

            // First call: get current parents
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ parents: ['old-parent-id'] })
            });

            // Second call: move file
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () =>
                    Promise.resolve({
                        id: 'file-id',
                        parents: ['new-parent-id']
                    })
            });

            const res = await app.request('/api/google/files', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    operation: 'move',
                    fileId: 'file-id',
                    parentId: 'new-parent-id'
                })
            });
            const json = await res.json();

            expect(res.status).toBe(200);
            expect(json.success).toBe(true);
        });

        it('should return 400 for update without fileId', async () => {
            mockDbQuery.accounts.findFirst.mockResolvedValue(mockAccount);

            const res = await app.request('/api/google/files', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    operation: 'update',
                    content: '# Content'
                })
            });
            const json = await res.json();

            expect(res.status).toBe(400);
            expect(json.error).toBe('fileId required for update');
        });

        it('should return 400 for delete without fileId', async () => {
            mockDbQuery.accounts.findFirst.mockResolvedValue(mockAccount);

            const res = await app.request('/api/google/files', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    operation: 'delete'
                })
            });
            const json = await res.json();

            expect(res.status).toBe(400);
            expect(json.error).toBe('fileId required for delete');
        });

        it('should return 400 for rename without name', async () => {
            mockDbQuery.accounts.findFirst.mockResolvedValue(mockAccount);

            const res = await app.request('/api/google/files', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    operation: 'rename',
                    fileId: 'file-id'
                })
            });
            const json = await res.json();

            expect(res.status).toBe(400);
            expect(json.error).toBe('fileId and name required for rename');
        });

        it('should return 401 when not connected', async () => {
            mockDbQuery.accounts.findFirst.mockResolvedValue(null);

            const res = await app.request('/api/google/files', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    operation: 'create',
                    name: 'test.md'
                })
            });
            const json = await res.json();

            expect(res.status).toBe(401);
            expect(json.error).toBe('Google Drive not connected');
        });

        it('should handle network errors during file operations', async () => {
            mockDbQuery.accounts.findFirst.mockResolvedValue(mockAccount);

            mockFetch.mockRejectedValue(new Error('Network error'));

            vi.spyOn(console, 'error').mockImplementation(() => {});

            const res = await app.request('/api/google/files', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    operation: 'create',
                    name: 'test.md',
                    content: '# Test'
                })
            });
            const json = await res.json();

            expect(res.status).toBe(500);
            expect(json.error).toBe('File operation failed');
        });
    });

    describe('GET /api/google/quota', () => {
        it('should return storage quota', async () => {
            const mockAccount = createMockAccount({
                providerId: 'google',
                accessToken: 'google-token-123',
                accessTokenExpiresAt: new Date(Date.now() + 3600000)
            });
            mockDbQuery.accounts.findFirst.mockResolvedValue(mockAccount);

            mockFetch.mockResolvedValue({
                ok: true,
                json: () =>
                    Promise.resolve({
                        storageQuota: {
                            usage: '1000000',
                            limit: '15000000000',
                            usageInDrive: '500000',
                            usageInDriveTrash: '100000'
                        }
                    })
            });

            const res = await app.request('/api/google/quota');
            const json = await res.json();

            expect(res.status).toBe(200);
            expect(json.used).toBe(1000000);
            expect(json.limit).toBe(15000000000);
            expect(json.usedInDrive).toBe(500000);
            expect(json.usedInTrash).toBe(100000);
        });

        it('should return 401 when not connected', async () => {
            mockDbQuery.accounts.findFirst.mockResolvedValue(null);

            const res = await app.request('/api/google/quota');
            const json = await res.json();

            expect(res.status).toBe(401);
            expect(json.error).toBe('Google Drive not connected');
        });

        it('should handle network errors when getting quota', async () => {
            const mockAccount = createMockAccount({
                providerId: 'google',
                accessToken: 'google-token-123',
                accessTokenExpiresAt: new Date(Date.now() + 3600000)
            });
            mockDbQuery.accounts.findFirst.mockResolvedValue(mockAccount);

            mockFetch.mockRejectedValue(new Error('Network error'));

            vi.spyOn(console, 'error').mockImplementation(() => {});

            const res = await app.request('/api/google/quota');
            const json = await res.json();

            expect(res.status).toBe(500);
            expect(json.error).toBe('Failed to get quota');
        });
    });

    describe('GET /api/google/connection', () => {
        it('should return connected status with user info', async () => {
            const mockAccount = createMockAccount({
                providerId: 'google',
                accessToken: 'google-token-123',
                accessTokenExpiresAt: new Date(Date.now() + 3600000)
            });
            mockDbQuery.accounts.findFirst.mockResolvedValue(mockAccount);

            mockFetch.mockResolvedValue({
                ok: true,
                json: () =>
                    Promise.resolve({
                        email: 'user@gmail.com',
                        name: 'Test User',
                        picture: 'https://google.com/photo.jpg'
                    })
            });

            const res = await app.request('/api/google/connection');
            const json = await res.json();

            expect(res.status).toBe(200);
            expect(json.connected).toBe(true);
            expect(json.user.email).toBe('user@gmail.com');
        });

        it('should return not connected when no account', async () => {
            mockDbQuery.accounts.findFirst.mockResolvedValue(null);

            const res = await app.request('/api/google/connection');
            const json = await res.json();

            expect(res.status).toBe(200);
            expect(json.connected).toBe(false);
        });

        it('should return not connected when token is invalid', async () => {
            const mockAccount = createMockAccount({
                providerId: 'google',
                accessToken: 'expired-token',
                accessTokenExpiresAt: new Date(Date.now() + 3600000)
            });
            mockDbQuery.accounts.findFirst.mockResolvedValue(mockAccount);

            mockFetch.mockResolvedValue({
                ok: false,
                status: 401
            });

            const res = await app.request('/api/google/connection');
            const json = await res.json();

            expect(res.status).toBe(200);
            expect(json.connected).toBe(false);
            expect(json.error).toBe('Token invalid');
        });

        it('should handle network errors when checking connection', async () => {
            const mockAccount = createMockAccount({
                providerId: 'google',
                accessToken: 'google-token-123',
                accessTokenExpiresAt: new Date(Date.now() + 3600000)
            });
            mockDbQuery.accounts.findFirst.mockResolvedValue(mockAccount);

            mockFetch.mockRejectedValue(new Error('Network error'));

            const res = await app.request('/api/google/connection');
            const json = await res.json();

            expect(res.status).toBe(200);
            expect(json.connected).toBe(false);
            expect(json.error).toBe('Failed to verify');
        });
    });
});
