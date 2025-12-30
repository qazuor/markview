/**
 * useDocumentSync hook
 * Manages document synchronization with the cloud
 */

import { useAuth } from '@/components/auth/AuthProvider';
import { syncService } from '@/services/sync';
import { useSyncStore } from '@/stores/syncStore';
import type { Document } from '@/types';
import { useCallback, useEffect, useRef } from 'react';

interface UseDocumentSyncOptions {
    autoSync?: boolean;
}

export function useDocumentSync(options: UseDocumentSyncOptions = {}) {
    const { autoSync = true } = options;

    const { isAuthenticated } = useAuth();
    const syncState = useSyncStore((s) => s.syncState);
    const lastSyncedAt = useSyncStore((s) => s.lastSyncedAt);
    const pendingCount = useSyncStore((s) => s.getPendingCount());

    const previousAuthRef = useRef(isAuthenticated);
    const initialSyncDoneRef = useRef(false);

    // Initialize sync service on mount
    useEffect(() => {
        syncService.init();

        return () => {
            syncService.destroy();
        };
    }, []);

    // Start/stop auto sync based on authentication
    useEffect(() => {
        if (isAuthenticated && autoSync) {
            syncService.startAutoSync();
        } else {
            syncService.stopAutoSync();
        }

        return () => {
            syncService.stopAutoSync();
        };
    }, [isAuthenticated, autoSync]);

    // Initial sync when user logs in
    useEffect(() => {
        if (isAuthenticated && !previousAuthRef.current && !initialSyncDoneRef.current) {
            // User just logged in
            initialSyncDoneRef.current = true;
            syncService.initialSync();
        }

        previousAuthRef.current = isAuthenticated;
    }, [isAuthenticated]);

    // Queue document changes for sync
    const queueDocumentChange = useCallback(
        (document: Document) => {
            if (!isAuthenticated) return;

            syncService.queueDocumentSync({
                id: document.id,
                name: document.name,
                content: document.content,
                folderId: document.folderId ?? null,
                isManuallyNamed: document.isManuallyNamed,
                cursor: document.cursor,
                scroll: document.scroll,
                syncVersion: document.syncVersion ?? 0
            });
        },
        [isAuthenticated]
    );

    // Queue document deletion
    const queueDocumentDelete = useCallback(
        (documentId: string) => {
            if (!isAuthenticated) return;

            syncService.queueDocumentDelete(documentId);
        },
        [isAuthenticated]
    );

    // Manual sync
    const syncNow = useCallback(async () => {
        if (!isAuthenticated) return;

        await syncService.forceSyncNow();
    }, [isAuthenticated]);

    // Check if a document needs sync
    const needsSync = useCallback((documentId: string) => {
        const queueItem = useSyncStore.getState().getQueueItem(documentId);
        return queueItem !== undefined;
    }, []);

    return {
        // State
        syncState,
        lastSyncedAt,
        pendingCount,
        isOnline: syncService.isOnline(),

        // Actions
        queueDocumentChange,
        queueDocumentDelete,
        syncNow,
        needsSync,

        // Checks
        isAuthenticated,
        canSync: isAuthenticated && syncService.isOnline()
    };
}
