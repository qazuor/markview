import { createAuthClient } from 'better-auth/react';

// Create auth client for frontend
export const authClient = createAuthClient({
    baseURL: import.meta.env.VITE_API_URL || ''
});

// Export hooks and methods
export const { signIn, signOut, useSession, getSession } = authClient;

// Helper to sign in with GitHub
export const signInWithGitHub = () => {
    return signIn.social({
        provider: 'github',
        callbackURL: '/'
    });
};

// Helper to sign in with Google
export const signInWithGoogle = () => {
    return signIn.social({
        provider: 'google',
        callbackURL: '/'
    });
};

// Type for session user
export interface AuthUser {
    id: string;
    name: string;
    email: string;
    image?: string | null;
}

// Type for session
export interface AuthSession {
    user: AuthUser;
    session: {
        id: string;
        userId: string;
        expiresAt: Date;
    };
}
