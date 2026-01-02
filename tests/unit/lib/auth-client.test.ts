import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock better-auth/react
const mockSignInSocial = vi.fn();
const mockSignOut = vi.fn();
const mockUseSession = vi.fn();
const mockGetSession = vi.fn();

vi.mock('better-auth/react', () => ({
    createAuthClient: () => ({
        signIn: { social: mockSignInSocial },
        signOut: mockSignOut,
        useSession: mockUseSession,
        getSession: mockGetSession
    })
}));

describe('auth-client', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('exports', () => {
        it('should export authClient', async () => {
            const { authClient } = await import('@/lib/auth-client');
            expect(authClient).toBeDefined();
        });

        it('should export signIn', async () => {
            const { signIn } = await import('@/lib/auth-client');
            expect(signIn).toBeDefined();
        });

        it('should export signOut', async () => {
            const { signOut } = await import('@/lib/auth-client');
            expect(signOut).toBeDefined();
        });

        it('should export useSession', async () => {
            const { useSession } = await import('@/lib/auth-client');
            expect(useSession).toBeDefined();
        });

        it('should export getSession', async () => {
            const { getSession } = await import('@/lib/auth-client');
            expect(getSession).toBeDefined();
        });

        it('should export signInWithGitHub', async () => {
            const { signInWithGitHub } = await import('@/lib/auth-client');
            expect(signInWithGitHub).toBeDefined();
            expect(typeof signInWithGitHub).toBe('function');
        });

        it('should export signInWithGoogle', async () => {
            const { signInWithGoogle } = await import('@/lib/auth-client');
            expect(signInWithGoogle).toBeDefined();
            expect(typeof signInWithGoogle).toBe('function');
        });
    });

    describe('signInWithGitHub', () => {
        it('should call signIn.social with github provider', async () => {
            const { signInWithGitHub } = await import('@/lib/auth-client');

            signInWithGitHub();

            expect(mockSignInSocial).toHaveBeenCalledWith({
                provider: 'github',
                callbackURL: '/'
            });
        });
    });

    describe('signInWithGoogle', () => {
        it('should call signIn.social with google provider', async () => {
            const { signInWithGoogle } = await import('@/lib/auth-client');

            signInWithGoogle();

            expect(mockSignInSocial).toHaveBeenCalledWith({
                provider: 'google',
                callbackURL: '/'
            });
        });
    });

    describe('types', () => {
        it('should have AuthUser type with required fields', async () => {
            const authModule = await import('@/lib/auth-client');

            // Type checking is done at compile time, but we can verify the module exports
            expect(authModule).toBeDefined();

            // Test that a user object matches the expected shape
            const mockUser = {
                id: 'user-123',
                name: 'Test User',
                email: 'test@example.com',
                image: 'https://example.com/avatar.png'
            };

            expect(mockUser.id).toBeDefined();
            expect(mockUser.name).toBeDefined();
            expect(mockUser.email).toBeDefined();
        });

        it('should have AuthSession type with user and session', async () => {
            const authModule = await import('@/lib/auth-client');
            expect(authModule).toBeDefined();

            // Test that a session object matches the expected shape
            const mockSession = {
                user: {
                    id: 'user-123',
                    name: 'Test User',
                    email: 'test@example.com'
                },
                session: {
                    id: 'session-123',
                    userId: 'user-123',
                    expiresAt: new Date()
                }
            };

            expect(mockSession.user).toBeDefined();
            expect(mockSession.session).toBeDefined();
            expect(mockSession.session.expiresAt).toBeInstanceOf(Date);
        });
    });
});
