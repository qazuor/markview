import type { Session, User } from 'better-auth';
import { Hono } from 'hono';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Use vi.hoisted to create mocks that can be used in vi.mock
const { mockDbQuery, mockDb } = vi.hoisted(() => {
    const mockDbQuery = {
        userSettings: {
            findFirst: vi.fn()
        }
    };

    const mockDb = {
        query: mockDbQuery,
        insert: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        delete: vi.fn().mockReturnThis(),
        values: vi.fn().mockReturnThis(),
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        returning: vi.fn()
    };

    return { mockDbQuery, mockDb };
});

vi.mock('@/server/db', () => ({
    db: mockDb,
    userSettings: { userId: 'userId' }
}));

// Import after mocking
import userRoutes from '@/server/api/routes/user';
import { createMockUser } from '@test/helpers/server';

describe('user routes', () => {
    type Variables = {
        user: User | null;
        session: Session | null;
    };

    let app: Hono<{ Variables: Variables }>;
    let mockUser: User;

    beforeEach(() => {
        vi.clearAllMocks();
        mockUser = createMockUser({ id: 'test-user-123', name: 'Test User', email: 'test@example.com' });

        // Create a test app that sets the user in context
        app = new Hono<{ Variables: Variables }>();
        app.use('*', async (c, next) => {
            c.set('user', mockUser);
            c.set('session', null);
            await next();
        });
        app.route('/api/user', userRoutes);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('GET /api/user/me', () => {
        it('should return current user info', async () => {
            const res = await app.request('/api/user/me');
            const json = await res.json();

            expect(res.status).toBe(200);
            expect(json).toEqual({
                user: {
                    id: 'test-user-123',
                    name: 'Test User',
                    email: 'test@example.com',
                    image: mockUser.image
                }
            });
        });

        it('should return 401 when not authenticated', async () => {
            // Create app without user
            const noAuthApp = new Hono<{ Variables: Variables }>();
            noAuthApp.use('*', async (c, next) => {
                c.set('user', null);
                c.set('session', null);
                await next();
            });
            noAuthApp.route('/api/user', userRoutes);

            const res = await noAuthApp.request('/api/user/me');

            expect(res.status).toBe(401);
        });
    });

    describe('GET /api/user/settings', () => {
        it('should return user settings when they exist', async () => {
            mockDbQuery.userSettings.findFirst.mockResolvedValue({
                id: 'settings-1',
                userId: 'test-user-123',
                settings: { theme: 'dark', fontSize: 14 }
            });

            const res = await app.request('/api/user/settings');
            const json = await res.json();

            expect(res.status).toBe(200);
            expect(json).toEqual({
                settings: { theme: 'dark', fontSize: 14 }
            });
        });

        it('should return empty settings when none exist', async () => {
            mockDbQuery.userSettings.findFirst.mockResolvedValue(null);

            const res = await app.request('/api/user/settings');
            const json = await res.json();

            expect(res.status).toBe(200);
            expect(json).toEqual({ settings: {} });
        });
    });

    describe('PUT /api/user/settings', () => {
        it('should create new settings when none exist', async () => {
            mockDbQuery.userSettings.findFirst.mockResolvedValue(null);
            mockDb.insert.mockReturnValue({
                values: vi.fn().mockResolvedValue(undefined)
            });

            const res = await app.request('/api/user/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ settings: { theme: 'light' } })
            });
            const json = await res.json();

            expect(res.status).toBe(201);
            expect(json).toEqual({ settings: { theme: 'light' } });
        });

        it('should merge settings when they exist', async () => {
            mockDbQuery.userSettings.findFirst.mockResolvedValue({
                id: 'settings-1',
                userId: 'test-user-123',
                settings: { theme: 'dark', fontSize: 14 }
            });
            mockDb.update.mockReturnValue({
                set: vi.fn().mockReturnValue({
                    where: vi.fn().mockResolvedValue(undefined)
                })
            });

            const res = await app.request('/api/user/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ settings: { fontSize: 16 } })
            });
            const json = await res.json();

            expect(res.status).toBe(200);
            expect(json).toEqual({
                settings: { theme: 'dark', fontSize: 16 }
            });
        });

        it('should validate settings schema', async () => {
            const res = await app.request('/api/user/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ invalid: 'data' })
            });

            expect(res.status).toBe(400);
        });
    });

    describe('DELETE /api/user/settings', () => {
        it('should delete settings and return empty object', async () => {
            mockDb.delete.mockReturnValue({
                where: vi.fn().mockResolvedValue(undefined)
            });

            const res = await app.request('/api/user/settings', {
                method: 'DELETE'
            });
            const json = await res.json();

            expect(res.status).toBe(200);
            expect(json).toEqual({ success: true, settings: {} });
        });
    });
});
