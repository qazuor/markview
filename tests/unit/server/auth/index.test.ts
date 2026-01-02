import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Use vi.hoisted to create mocks before vi.mock
const { mockBetterAuth, mockDrizzleAdapter, mockDb } = vi.hoisted(() => {
    const mockAuth = {
        api: {
            getSession: vi.fn(),
            signOut: vi.fn()
        },
        handler: vi.fn()
    };

    const mockBetterAuth = vi.fn(() => mockAuth);

    const mockDrizzleAdapter = vi.fn(() => ({
        type: 'drizzle'
    }));

    const mockDb = {
        query: {},
        select: vi.fn(),
        insert: vi.fn()
    };

    return { mockBetterAuth, mockDrizzleAdapter, mockDb };
});

// Mock dependencies
vi.mock('better-auth', () => ({
    betterAuth: mockBetterAuth
}));

vi.mock('better-auth/adapters/drizzle', () => ({
    drizzleAdapter: mockDrizzleAdapter
}));

vi.mock('@/server/db', () => ({
    db: mockDb
}));

vi.mock('@/server/db/schema', () => ({
    users: { name: 'users' },
    sessions: { name: 'sessions' },
    accounts: { name: 'accounts' },
    verifications: { name: 'verifications' }
}));

describe('server/auth/index', () => {
    const originalEnv = { ...process.env };

    beforeEach(() => {
        vi.clearAllMocks();
        process.env.GITHUB_CLIENT_ID = 'test-github-id';
        process.env.GITHUB_CLIENT_SECRET = 'test-github-secret';
        process.env.GOOGLE_CLIENT_ID = 'test-google-id';
        process.env.GOOGLE_CLIENT_SECRET = 'test-google-secret';
        process.env.BETTER_AUTH_URL = 'http://localhost:5173';
        process.env.BETTER_AUTH_SECRET = 'test-secret';
    });

    afterEach(() => {
        process.env = { ...originalEnv };
        vi.restoreAllMocks();
    });

    describe('auth configuration', () => {
        it('should export auth instance', async () => {
            const { auth } = await import('@/server/auth');
            expect(auth).toBeDefined();
        });

        it('should configure drizzle adapter with correct schema', async () => {
            vi.resetModules();
            await import('@/server/auth');

            expect(mockDrizzleAdapter).toHaveBeenCalledWith(
                mockDb,
                expect.objectContaining({
                    provider: 'pg',
                    schema: expect.objectContaining({
                        user: expect.any(Object),
                        session: expect.any(Object),
                        account: expect.any(Object),
                        verification: expect.any(Object)
                    })
                })
            );
        });

        it('should configure email/password as disabled', async () => {
            vi.resetModules();
            await import('@/server/auth');

            expect(mockBetterAuth).toHaveBeenCalledWith(
                expect.objectContaining({
                    emailAndPassword: {
                        enabled: false
                    }
                })
            );
        });

        it('should configure GitHub OAuth provider', async () => {
            vi.resetModules();
            await import('@/server/auth');

            expect(mockBetterAuth).toHaveBeenCalledWith(
                expect.objectContaining({
                    socialProviders: expect.objectContaining({
                        github: expect.objectContaining({
                            clientId: 'test-github-id',
                            clientSecret: 'test-github-secret',
                            scope: ['user:email', 'repo']
                        })
                    })
                })
            );
        });

        it('should configure Google OAuth provider', async () => {
            vi.resetModules();
            await import('@/server/auth');

            expect(mockBetterAuth).toHaveBeenCalledWith(
                expect.objectContaining({
                    socialProviders: expect.objectContaining({
                        google: expect.objectContaining({
                            clientId: 'test-google-id',
                            clientSecret: 'test-google-secret',
                            accessType: 'offline',
                            prompt: 'consent'
                        })
                    })
                })
            );
        });

        it('should configure Google with Drive scopes', async () => {
            vi.resetModules();
            await import('@/server/auth');

            expect(mockBetterAuth).toHaveBeenCalledWith(
                expect.objectContaining({
                    socialProviders: expect.objectContaining({
                        google: expect.objectContaining({
                            scope: expect.arrayContaining([
                                'openid',
                                'email',
                                'profile',
                                'https://www.googleapis.com/auth/drive.file',
                                'https://www.googleapis.com/auth/drive.metadata.readonly'
                            ])
                        })
                    })
                })
            );
        });

        it('should configure session with 7-day expiry', async () => {
            vi.resetModules();
            await import('@/server/auth');

            expect(mockBetterAuth).toHaveBeenCalledWith(
                expect.objectContaining({
                    session: expect.objectContaining({
                        expiresIn: 60 * 60 * 24 * 7, // 7 days
                        updateAge: 60 * 60 * 24 // 24 hours
                    })
                })
            );
        });

        it('should configure cookie caching', async () => {
            vi.resetModules();
            await import('@/server/auth');

            expect(mockBetterAuth).toHaveBeenCalledWith(
                expect.objectContaining({
                    session: expect.objectContaining({
                        cookieCache: {
                            enabled: true,
                            maxAge: 60 * 5 // 5 minutes
                        }
                    })
                })
            );
        });

        it('should enable account linking for trusted providers', async () => {
            vi.resetModules();
            await import('@/server/auth');

            expect(mockBetterAuth).toHaveBeenCalledWith(
                expect.objectContaining({
                    account: {
                        accountLinking: {
                            enabled: true,
                            trustedProviders: ['github', 'google']
                        }
                    }
                })
            );
        });

        it('should use BETTER_AUTH_URL as base URL', async () => {
            vi.resetModules();
            await import('@/server/auth');

            expect(mockBetterAuth).toHaveBeenCalledWith(
                expect.objectContaining({
                    baseURL: 'http://localhost:5173'
                })
            );
        });

        it('should use BETTER_AUTH_SECRET for signing', async () => {
            vi.resetModules();
            await import('@/server/auth');

            expect(mockBetterAuth).toHaveBeenCalledWith(
                expect.objectContaining({
                    secret: 'test-secret'
                })
            );
        });

        it('should configure trusted origins', async () => {
            vi.resetModules();
            await import('@/server/auth');

            expect(mockBetterAuth).toHaveBeenCalledWith(
                expect.objectContaining({
                    trustedOrigins: expect.arrayContaining([
                        'http://localhost:5173',
                        'http://localhost:3000',
                        'https://qazuor-markview.vercel.app'
                    ])
                })
            );
        });
    });

    describe('default values', () => {
        it('should use empty strings for missing OAuth credentials', async () => {
            vi.resetModules();
            process.env.GITHUB_CLIENT_ID = undefined;
            process.env.GITHUB_CLIENT_SECRET = undefined;
            process.env.GOOGLE_CLIENT_ID = undefined;
            process.env.GOOGLE_CLIENT_SECRET = undefined;

            await import('@/server/auth');

            expect(mockBetterAuth).toHaveBeenCalledWith(
                expect.objectContaining({
                    socialProviders: expect.objectContaining({
                        github: expect.objectContaining({
                            clientId: '',
                            clientSecret: ''
                        }),
                        google: expect.objectContaining({
                            clientId: '',
                            clientSecret: ''
                        })
                    })
                })
            );
        });

        it('should use localhost as default base URL', async () => {
            vi.resetModules();
            process.env.BETTER_AUTH_URL = undefined;

            await import('@/server/auth');

            expect(mockBetterAuth).toHaveBeenCalledWith(
                expect.objectContaining({
                    baseURL: 'http://localhost:5173'
                })
            );
        });
    });

    describe('Auth type export', () => {
        it('should export Auth type', async () => {
            // Types are compile-time only, but we verify the module exports
            const authModule = await import('@/server/auth');
            expect(authModule.auth).toBeDefined();
        });
    });
});
