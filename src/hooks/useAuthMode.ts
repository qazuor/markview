import { useAuth } from '@/components/auth/AuthProvider';
import { useCallback, useMemo } from 'react';

export type AuthMode = 'guest' | 'authenticated';

interface UseAuthModeReturn {
    /** Current auth mode */
    mode: AuthMode;
    /** Whether user is in guest mode */
    isGuest: boolean;
    /** Whether user is authenticated */
    isAuthenticated: boolean;
    /** Whether auth state is still loading */
    isLoading: boolean;
    /** User info (null if guest) */
    user: {
        id: string;
        name: string;
        email: string;
        image?: string;
    } | null;
    /** Check if a feature requires auth */
    requiresAuth: (feature: AuthRequiredFeature) => boolean;
    /** Get storage key prefix based on auth mode */
    getStoragePrefix: () => string;
}

/** Features that require authentication */
export type AuthRequiredFeature = 'cloud-sync' | 'github-integration' | 'google-drive' | 'settings-sync' | 'shared-documents';

const AUTH_REQUIRED_FEATURES: Set<AuthRequiredFeature> = new Set([
    'cloud-sync',
    'github-integration',
    'google-drive',
    'settings-sync',
    'shared-documents'
]);

/**
 * Hook to manage guest vs authenticated mode
 *
 * In guest mode:
 * - Documents are stored locally only
 * - Settings are stored locally only
 * - Cloud integrations are disabled
 * - User can use all editor features
 *
 * In authenticated mode:
 * - Documents can sync to cloud
 * - Settings sync across devices
 * - GitHub/Google integrations available
 */
export function useAuthMode(): UseAuthModeReturn {
    const { user, isLoading, isAuthenticated } = useAuth();

    const mode: AuthMode = useMemo(() => {
        return isAuthenticated ? 'authenticated' : 'guest';
    }, [isAuthenticated]);

    const isGuest = mode === 'guest';

    const userInfo = useMemo(() => {
        if (!user) return null;
        return {
            id: user.id,
            name: user.name || 'User',
            email: user.email || '',
            image: user.image || undefined
        };
    }, [user]);

    const requiresAuth = useCallback((feature: AuthRequiredFeature): boolean => {
        return AUTH_REQUIRED_FEATURES.has(feature);
    }, []);

    const getStoragePrefix = useCallback((): string => {
        if (isAuthenticated && user?.id) {
            return `markview:user:${user.id}:`;
        }
        return 'markview:guest:';
    }, [isAuthenticated, user?.id]);

    return {
        mode,
        isGuest,
        isAuthenticated,
        isLoading,
        user: userInfo,
        requiresAuth,
        getStoragePrefix
    };
}

/**
 * Helper component props for features that require auth
 */
export interface AuthRequiredProps {
    /** Feature that requires auth */
    feature: AuthRequiredFeature;
    /** Content to show when authenticated */
    children: React.ReactNode;
    /** Optional fallback for guests (defaults to sign-in prompt) */
    fallback?: React.ReactNode;
}
