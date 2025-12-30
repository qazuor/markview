import '@/i18n';
import { AuthProvider } from '@/components/auth';
import { InstallPrompt, OfflineIndicator, UpdatePrompt } from '@/components/pwa';
import { SettingsSyncProvider } from '@/components/sync';
import type { ReactNode } from 'react';

interface ProvidersProps {
    children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
    return (
        <AuthProvider>
            <SettingsSyncProvider>
                {children}
                <InstallPrompt />
                <OfflineIndicator />
                <UpdatePrompt />
            </SettingsSyncProvider>
        </AuthProvider>
    );
}
