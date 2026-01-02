import { Providers } from '@/app/Providers';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

// Mock i18n
vi.mock('@/i18n', () => ({}));

// Mock AuthProvider
vi.mock('@/components/auth', () => ({
    AuthProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="auth-provider">{children}</div>
}));

// Mock PWA components
vi.mock('@/components/pwa', () => ({
    InstallPrompt: () => <div data-testid="install-prompt" />,
    OfflineIndicator: () => <div data-testid="offline-indicator" />,
    UpdatePrompt: () => <div data-testid="update-prompt" />
}));

// Mock sync components
vi.mock('@/components/sync', () => ({
    DocumentSyncWatcher: () => <div data-testid="document-sync-watcher" />,
    SettingsSyncProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="settings-sync-provider">{children}</div>,
    SyncConflictModal: () => <div data-testid="sync-conflict-modal" />
}));

describe('Providers', () => {
    describe('rendering', () => {
        it('should render children', () => {
            render(
                <Providers>
                    <div data-testid="child-content">Child Content</div>
                </Providers>
            );

            expect(screen.getByTestId('child-content')).toBeInTheDocument();
            expect(screen.getByText('Child Content')).toBeInTheDocument();
        });

        it('should wrap children with AuthProvider', () => {
            render(
                <Providers>
                    <div>Child</div>
                </Providers>
            );

            expect(screen.getByTestId('auth-provider')).toBeInTheDocument();
        });

        it('should wrap children with SettingsSyncProvider', () => {
            render(
                <Providers>
                    <div>Child</div>
                </Providers>
            );

            expect(screen.getByTestId('settings-sync-provider')).toBeInTheDocument();
        });
    });

    describe('PWA components', () => {
        it('should render InstallPrompt', () => {
            render(
                <Providers>
                    <div>Child</div>
                </Providers>
            );

            expect(screen.getByTestId('install-prompt')).toBeInTheDocument();
        });

        it('should render OfflineIndicator', () => {
            render(
                <Providers>
                    <div>Child</div>
                </Providers>
            );

            expect(screen.getByTestId('offline-indicator')).toBeInTheDocument();
        });

        it('should render UpdatePrompt', () => {
            render(
                <Providers>
                    <div>Child</div>
                </Providers>
            );

            expect(screen.getByTestId('update-prompt')).toBeInTheDocument();
        });
    });

    describe('sync components', () => {
        it('should render DocumentSyncWatcher', () => {
            render(
                <Providers>
                    <div>Child</div>
                </Providers>
            );

            expect(screen.getByTestId('document-sync-watcher')).toBeInTheDocument();
        });

        it('should render SyncConflictModal', () => {
            render(
                <Providers>
                    <div>Child</div>
                </Providers>
            );

            expect(screen.getByTestId('sync-conflict-modal')).toBeInTheDocument();
        });
    });

    describe('provider hierarchy', () => {
        it('should have AuthProvider as outer provider', () => {
            render(
                <Providers>
                    <div data-testid="child">Child</div>
                </Providers>
            );

            const authProvider = screen.getByTestId('auth-provider');
            const settingsProvider = screen.getByTestId('settings-sync-provider');

            expect(authProvider).toContainElement(settingsProvider);
        });

        it('should have SettingsSyncProvider wrapping children', () => {
            render(
                <Providers>
                    <div data-testid="child">Child</div>
                </Providers>
            );

            const settingsProvider = screen.getByTestId('settings-sync-provider');
            const child = screen.getByTestId('child');

            expect(settingsProvider).toContainElement(child);
        });
    });
});
