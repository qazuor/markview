import { useDocumentSync, useSettingsSync } from '@/hooks';
import type { ReactNode } from 'react';

interface SettingsSyncProviderProps {
    children: ReactNode;
}

/**
 * Provider component that enables automatic synchronization.
 * This component initializes:
 * - Settings sync: fetch/push user preferences
 * - Document sync: sync documents to cloud storage
 *
 * Must be placed inside AuthProvider.
 */
export function SettingsSyncProvider({ children }: SettingsSyncProviderProps) {
    // Initialize settings sync
    useSettingsSync({ autoSync: true, debounceMs: 2000 });

    // Initialize document sync
    useDocumentSync({ autoSync: true });

    return <>{children}</>;
}
