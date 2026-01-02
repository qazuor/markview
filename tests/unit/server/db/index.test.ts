import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock the environment variable before any imports
const originalEnv = process.env.DATABASE_URL;

describe('server/db/index', () => {
    beforeEach(() => {
        vi.resetModules();
    });

    afterEach(() => {
        process.env.DATABASE_URL = originalEnv;
        vi.restoreAllMocks();
    });

    describe('when DATABASE_URL is not set', () => {
        it('should throw an error', async () => {
            process.env.DATABASE_URL = undefined;

            await expect(async () => {
                await import('@/server/db');
            }).rejects.toThrow();
        });
    });

    describe('when DATABASE_URL is set', () => {
        beforeEach(() => {
            process.env.DATABASE_URL = 'postgres://test:test@localhost:5432/test';

            // Mock neon and drizzle
            vi.doMock('@neondatabase/serverless', () => ({
                neon: vi.fn(() => vi.fn())
            }));

            vi.doMock('drizzle-orm/neon-http', () => ({
                drizzle: vi.fn(() => ({
                    query: {},
                    select: vi.fn(),
                    insert: vi.fn(),
                    update: vi.fn(),
                    delete: vi.fn()
                }))
            }));
        });

        it('should export db client', async () => {
            const { db } = await import('@/server/db');
            expect(db).toBeDefined();
        });

        it('should export schema tables', async () => {
            const dbModule = await import('@/server/db');

            expect(dbModule.users).toBeDefined();
            expect(dbModule.sessions).toBeDefined();
            expect(dbModule.accounts).toBeDefined();
            expect(dbModule.verifications).toBeDefined();
            expect(dbModule.folders).toBeDefined();
            expect(dbModule.documents).toBeDefined();
            expect(dbModule.userSettings).toBeDefined();
        });

        it('should export schema relations', async () => {
            const dbModule = await import('@/server/db');

            expect(dbModule.usersRelations).toBeDefined();
            expect(dbModule.sessionsRelations).toBeDefined();
            expect(dbModule.accountsRelations).toBeDefined();
            expect(dbModule.foldersRelations).toBeDefined();
            expect(dbModule.documentsRelations).toBeDefined();
            expect(dbModule.userSettingsRelations).toBeDefined();
        });

        it('should export types', async () => {
            // Types are compile-time only, but we can verify the module exports correctly
            const dbModule = await import('@/server/db');
            expect(dbModule).toBeDefined();
        });
    });

    describe('Database type', () => {
        beforeEach(() => {
            process.env.DATABASE_URL = 'postgres://test:test@localhost:5432/test';

            vi.doMock('@neondatabase/serverless', () => ({
                neon: vi.fn(() => vi.fn())
            }));

            vi.doMock('drizzle-orm/neon-http', () => ({
                drizzle: vi.fn(() => ({
                    query: {},
                    select: vi.fn()
                }))
            }));
        });

        it('should export Database type', async () => {
            // Type check at compile time - just verify module loads
            const dbModule = await import('@/server/db');
            expect(dbModule.db).toBeDefined();
        });
    });
});
