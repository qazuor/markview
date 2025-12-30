import '@/i18n';
import { AuthProvider } from '@/components/auth';
import { InstallPrompt, OfflineIndicator, UpdatePrompt } from '@/components/pwa';
import { DocumentSyncWatcher, SettingsSyncProvider, SyncConflictModal } from '@/components/sync';
import type { ReactNode } from 'react';

interface ProvidersProps {
    children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
    return (
        <AuthProvider>
            <SettingsSyncProvider>
                {children}
                <DocumentSyncWatcher />
                <InstallPrompt />
                <OfflineIndicator />
                <UpdatePrompt />
                <SyncConflictModal />
            </SettingsSyncProvider>
        </AuthProvider>
    );
}
