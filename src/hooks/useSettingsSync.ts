import { useAuth } from '@/components/auth/AuthProvider';
import { useSettingsStore } from '@/stores/settingsStore';
import type { Settings } from '@/types/settings';
import { useCallback, useEffect, useRef } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || '';
const SYNC_DEBOUNCE_MS = 2000;

interface UseSettingsSyncOptions {
    /** Enable auto-sync when settings change */
    autoSync?: boolean;
    /** Debounce time for syncing changes (ms) */
    debounceMs?: number;
}

interface UseSettingsSyncReturn {
    /** Manually fetch settings from server */
    fetchSettings: () => Promise<void>;
    /** Manually push settings to server */
    pushSettings: () => Promise<void>;
    /** Current sync status */
    syncStatus: 'idle' | 'syncing' | 'synced' | 'error' | 'offline';
    /** Last sync timestamp */
    lastSyncedAt: string | null;
    /** Sync error message */
    syncError: string | null;
    /** Whether there are pending changes to sync */
    pendingChanges: boolean;
}

export function useSettingsSync(options: UseSettingsSyncOptions = {}): UseSettingsSyncReturn {
    const { autoSync = true, debounceMs = SYNC_DEBOUNCE_MS } = options;

    const { isAuthenticated } = useAuth();
    const {
        syncStatus,
        lastSyncedAt,
        syncError,
        pendingChanges,
        setSyncStatus,
        setSyncError,
        markSynced,
        mergeServerSettings,
        getSettingsForSync
    } = useSettingsStore();

    const syncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isMountedRef = useRef(true);

    // Fetch settings from server
    const fetchSettings = useCallback(async () => {
        if (!isAuthenticated) return;

        setSyncStatus('syncing');

        try {
            const response = await fetch(`${API_BASE}/api/user/settings`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                if (response.status === 401) {
                    // Not authenticated, skip sync
                    setSyncStatus('idle');
                    return;
                }
                throw new Error(`Failed to fetch settings: ${response.status}`);
            }

            const data = await response.json();

            if (isMountedRef.current && data.settings) {
                mergeServerSettings(data.settings as Partial<Settings>);
                markSynced();
            }
        } catch (error) {
            if (isMountedRef.current) {
                const message = error instanceof Error ? error.message : 'Failed to sync settings';
                setSyncError(message);

                // Check if offline
                if (!navigator.onLine) {
                    setSyncStatus('offline');
                }
            }
        }
    }, [isAuthenticated, setSyncStatus, setSyncError, mergeServerSettings, markSynced]);

    // Push settings to server
    const pushSettings = useCallback(async () => {
        if (!isAuthenticated) return;

        setSyncStatus('syncing');

        try {
            const settings = getSettingsForSync();

            const response = await fetch(`${API_BASE}/api/user/settings`, {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ settings })
            });

            if (!response.ok) {
                if (response.status === 401) {
                    setSyncStatus('idle');
                    return;
                }
                throw new Error(`Failed to save settings: ${response.status}`);
            }

            if (isMountedRef.current) {
                markSynced();
            }
        } catch (error) {
            if (isMountedRef.current) {
                const message = error instanceof Error ? error.message : 'Failed to save settings';
                setSyncError(message);

                if (!navigator.onLine) {
                    setSyncStatus('offline');
                }
            }
        }
    }, [isAuthenticated, setSyncStatus, setSyncError, getSettingsForSync, markSynced]);

    // Fetch settings on login
    useEffect(() => {
        if (isAuthenticated) {
            fetchSettings();
        }
    }, [isAuthenticated, fetchSettings]);

    // Auto-sync when settings change (debounced)
    useEffect(() => {
        if (!autoSync || !isAuthenticated || !pendingChanges) return;

        // Clear existing timeout
        if (syncTimeoutRef.current) {
            clearTimeout(syncTimeoutRef.current);
        }

        // Set new timeout for debounced sync
        syncTimeoutRef.current = setTimeout(() => {
            pushSettings();
        }, debounceMs);

        return () => {
            if (syncTimeoutRef.current) {
                clearTimeout(syncTimeoutRef.current);
            }
        };
    }, [autoSync, isAuthenticated, pendingChanges, debounceMs, pushSettings]);

    // Handle online/offline status
    useEffect(() => {
        const handleOnline = () => {
            if (syncStatus === 'offline' && pendingChanges) {
                pushSettings();
            } else if (syncStatus === 'offline') {
                setSyncStatus('idle');
            }
        };

        const handleOffline = () => {
            if (syncStatus === 'syncing') {
                setSyncStatus('offline');
            }
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [syncStatus, pendingChanges, pushSettings, setSyncStatus]);

    // Cleanup on unmount
    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
            if (syncTimeoutRef.current) {
                clearTimeout(syncTimeoutRef.current);
            }
        };
    }, []);

    return {
        fetchSettings,
        pushSettings,
        syncStatus,
        lastSyncedAt,
        syncError,
        pendingChanges
    };
}
