import { useSettingsSync } from '@/hooks/useSettingsSync';
import type { ReactNode } from 'react';

interface SettingsSyncProviderProps {
    children: ReactNode;
}

/**
 * Provider component that enables automatic settings synchronization.
 * This component uses the useSettingsSync hook to:
 * - Fetch settings from server on login
 * - Push settings changes to server (debounced)
 * - Handle online/offline transitions
 *
 * Must be placed inside AuthProvider.
 */
export function SettingsSyncProvider({ children }: SettingsSyncProviderProps) {
    // Initialize settings sync - this will:
    // 1. Fetch settings on login
    // 2. Auto-sync changes when authenticated
    // 3. Handle offline/online transitions
    useSettingsSync({ autoSync: true, debounceMs: 2000 });

    return <>{children}</>;
}
