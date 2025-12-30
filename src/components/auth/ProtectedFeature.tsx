import type { AuthRequiredFeature } from '@/hooks/useAuthMode';
import { LogIn } from 'lucide-react';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from './AuthProvider';
import { LoginModal } from './LoginModal';

interface ProtectedFeatureProps {
    /** Feature that requires authentication */
    feature: AuthRequiredFeature;
    /** Content to show when authenticated */
    children: ReactNode;
    /** Optional custom fallback for guests */
    fallback?: ReactNode;
    /** Optional title for the sign-in prompt */
    title?: string;
    /** Optional description for the sign-in prompt */
    description?: string;
    /** Whether to show a compact version */
    compact?: boolean;
}

/**
 * Wrapper component for features that require authentication.
 * Shows a sign-in prompt when the user is not authenticated.
 */
export function ProtectedFeature({ feature, children, fallback, title, description, compact = false }: ProtectedFeatureProps) {
    const { t } = useTranslation();
    const { isAuthenticated, isLoading } = useAuth();
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

    // Show loading state
    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-4">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
            </div>
        );
    }

    // If authenticated, show the protected content
    if (isAuthenticated) {
        return <>{children}</>;
    }

    // If custom fallback provided, use it
    if (fallback) {
        return <>{fallback}</>;
    }

    // Get feature-specific messages
    const featureMessages = getFeatureMessages(feature, t);
    const displayTitle = title || featureMessages.title;
    const displayDescription = description || featureMessages.description;

    // Compact version (for inline use)
    if (compact) {
        return (
            <>
                <button
                    type="button"
                    onClick={() => setIsLoginModalOpen(true)}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-text-muted hover:bg-bg-secondary hover:text-text-primary transition-colors"
                >
                    <LogIn className="h-4 w-4" />
                    <span>{t('auth.sign_in_to_use', { feature: displayTitle })}</span>
                </button>
                <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
            </>
        );
    }

    // Full version (for section placeholders)
    return (
        <>
            <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-border-primary bg-bg-secondary p-6 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-500/10">
                    <LogIn className="h-6 w-6 text-primary-500" />
                </div>
                <div className="space-y-1">
                    <h3 className="font-medium text-text-primary">{displayTitle}</h3>
                    <p className="text-sm text-text-muted">{displayDescription}</p>
                </div>
                <button
                    type="button"
                    onClick={() => setIsLoginModalOpen(true)}
                    className="rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-white hover:bg-primary-600 transition-colors"
                >
                    {t('auth.sign_in')}
                </button>
            </div>
            <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
        </>
    );
}

/**
 * Get feature-specific messages for the sign-in prompt
 */
function getFeatureMessages(feature: AuthRequiredFeature, t: (key: string) => string): { title: string; description: string } {
    const messages: Record<AuthRequiredFeature, { title: string; description: string }> = {
        'cloud-sync': {
            title: t('features.cloud_sync.title'),
            description: t('features.cloud_sync.description')
        },
        'github-integration': {
            title: t('features.github.title'),
            description: t('features.github.description')
        },
        'google-drive': {
            title: t('features.google_drive.title'),
            description: t('features.google_drive.description')
        },
        'settings-sync': {
            title: t('features.settings_sync.title'),
            description: t('features.settings_sync.description')
        },
        'shared-documents': {
            title: t('features.shared_documents.title'),
            description: t('features.shared_documents.description')
        }
    };

    return messages[feature];
}
