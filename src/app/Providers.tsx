import '@/i18n';
import { InstallPrompt, OfflineIndicator, UpdatePrompt } from '@/components/pwa';
import type { ReactNode } from 'react';

interface ProvidersProps {
    children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
    return (
        <>
            {children}
            <InstallPrompt />
            <OfflineIndicator />
            <UpdatePrompt />
        </>
    );
}
