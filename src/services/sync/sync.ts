/**
 * Main Sync Service
 * Orchestrates document synchronization with the cloud
 */

import { useDocumentStore } from '@/stores/documentStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useSyncStore } from '@/stores/syncStore';
import type { DocumentUpsertPayload, SyncDocument, SyncFolder, SyncQueueItem } from '@/types/sync';
import { SyncConflictError, syncApi } from './api';
import { conflictResolver } from './conflict';
import { syncQueue } from './queue';

const MAX_RETRIES = 3;
const RETRY_DELAYS = [1000, 5000, 15000]; // Exponential backoff
const AUTO_SYNC_INTERVAL = 30000; // 30 seconds
const DEFAULT_DEBOUNCE_DELAY = 2000; // 2 seconds (fallback)

/**
 * Get current debounce delay from settings
 */
function getDebounceDelay(): number {
    return useSettingsStore.getState().cloudSyncDebounceMs ?? DEFAULT_DEBOUNCE_DELAY;
}

/**
 * Check if cloud sync is enabled in settings
 */
function isSyncEnabled(): boolean {
    return useSettingsStore.getState().cloudSyncEnabled ?? true;
}

let autoSyncInterval: ReturnType<typeof setInterval> | null = null;
let debounceTimeout: ReturnType<typeof setTimeout> | null = null;
let isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

/**
 * Initialize the sync service
 */
export function initSyncService(): void {
    // Listen for online/offline events
    if (typeof window !== 'undefined') {
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Initialize online state
        isOnline = navigator.onLine;
        if (!isOnline) {
            useSyncStore.getState().setSyncState('offline');
        }
    }
}

/**
 * Cleanup the sync service
 */
export function destroySyncService(): void {
    stopAutoSync();

    if (typeof window !== 'undefined') {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
    }

    if (debounceTimeout) {
        clearTimeout(debounceTimeout);
        debounceTimeout = null;
    }
}

/**
 * Handle coming back online
 */
function handleOnline(): void {
    isOnline = true;
    const store = useSyncStore.getState();

    if (store.syncState === 'offline') {
        store.setSyncState('idle');
    }

    // Process any pending queue items
    processQueue();
}

/**
 * Handle going offline
 */
function handleOffline(): void {
    isOnline = false;
    useSyncStore.getState().setSyncState('offline');
}

/**
 * Start automatic sync at intervals
 */
export function startAutoSync(): void {
    if (autoSyncInterval) return;

    autoSyncInterval = setInterval(() => {
        if (isOnline) {
            syncAll();
        }
    }, AUTO_SYNC_INTERVAL);
}

/**
 * Stop automatic sync
 */
export function stopAutoSync(): void {
    if (autoSyncInterval) {
        clearInterval(autoSyncInterval);
        autoSyncInterval = null;
    }
}

/**
 * Perform initial sync (fetch all from server)
 */
export async function initialSync(): Promise<void> {
    // Check if sync on app open is enabled
    const settings = useSettingsStore.getState();
    if (!settings.cloudSyncEnabled || !settings.cloudSyncOnAppOpen) {
        return;
    }

    if (!isOnline) {
        useSyncStore.getState().setSyncState('offline');
        return;
    }

    const store = useSyncStore.getState();
    store.setSyncState('syncing');

    try {
        // Fetch all documents and folders from server
        const [docsResponse, foldersResponse] = await Promise.all([syncApi.documents.fetch(), syncApi.folders.fetch()]);

        // Update server data in store
        store.updateServerDocuments(docsResponse.documents);
        store.updateServerFolders(foldersResponse.folders);
        store.setLastSyncedAt(docsResponse.syncedAt);
        store.setSyncState('synced');
    } catch (error) {
        console.error('Initial sync failed:', error);
        store.setSyncError(error instanceof Error ? error.message : 'Initial sync failed');
    }
}

/**
 * Sync all changes (pull from server, push local changes)
 */
export async function syncAll(): Promise<void> {
    if (!isSyncEnabled()) return;

    if (!isOnline) {
        useSyncStore.getState().setSyncState('offline');
        return;
    }

    const store = useSyncStore.getState();
    store.setSyncState('syncing');

    try {
        // Pull changes from server (delta sync)
        const since = store.lastSyncedAt ?? undefined;
        const [docsResponse, foldersResponse] = await Promise.all([syncApi.documents.fetch(since), syncApi.folders.fetch(since)]);

        // Update server data
        store.updateServerDocuments(docsResponse.documents);
        store.updateServerFolders(foldersResponse.folders);
        store.setLastSyncedAt(docsResponse.syncedAt);

        // Process pending queue
        await processQueue();

        store.setSyncState('synced');
    } catch (error) {
        console.error('Sync failed:', error);
        store.setSyncError(error instanceof Error ? error.message : 'Sync failed');
    }
}

/**
 * Process the pending sync queue
 */
export async function processQueue(): Promise<void> {
    const store = useSyncStore.getState();

    console.log('[Sync] processQueue called', {
        isOnline,
        isProcessingQueue: store.isProcessingQueue,
        pendingQueueLength: store.pendingQueue.length
    });

    if (!isOnline) {
        console.log('[Sync] Skipping processQueue: offline');
        return;
    }

    if (store.isProcessingQueue) {
        console.log('[Sync] Skipping processQueue: already processing');
        return;
    }

    // Use in-memory queue as source of truth (same as status bar)
    const items = [...store.pendingQueue];
    console.log('[Sync] Items from in-memory queue:', items.length);

    // Nothing to process
    if (items.length === 0) {
        store.setSyncState('synced');
        return;
    }

    store.setProcessingQueue(true);
    store.setSyncState('syncing');

    try {
        for (const item of items) {
            console.log('[Sync] Processing item:', item.id, item.type, item.operation);

            if (item.retries >= MAX_RETRIES) {
                // Too many retries, remove from queue and log error
                console.error(`Queue item ${item.id} failed after ${MAX_RETRIES} retries`);
                await syncQueue.remove(item.id);
                store.removeFromQueue(item.id);
                continue;
            }

            try {
                await processQueueItem(item);
                console.log('[Sync] Item processed successfully:', item.id);

                // Only remove if the item hasn't been updated while we were processing
                // Check by comparing timestamps - if different, a new version was queued
                const currentItem = useSyncStore.getState().pendingQueue.find((q) => q.id === item.id && q.type === item.type);
                if (!currentItem || currentItem.timestamp === item.timestamp) {
                    await syncQueue.remove(item.id);
                    store.removeFromQueue(item.id);
                    console.log('[Sync] Item removed from queue:', item.id);
                } else {
                    console.log('[Sync] Item was updated while processing, keeping in queue for next sync:', item.id);
                    // The item was updated, it will be processed in the next cycle
                    // Schedule another processQueue to handle the updated item
                    debouncedSync();
                }
            } catch (error) {
                console.error('[Sync] Error processing item:', item.id, error);
                if (error instanceof SyncConflictError) {
                    // Handle conflict
                    await handleConflict(item, error);
                } else {
                    // Increment retries and retry later
                    const updatedItem = { ...item, retries: item.retries + 1 };
                    await syncQueue.update(updatedItem);
                    store.incrementRetries(item.id);

                    // Schedule retry with exponential backoff
                    const delay = RETRY_DELAYS[Math.min(item.retries, RETRY_DELAYS.length - 1)];
                    setTimeout(() => processQueue(), delay);
                }
            }
        }

        // Update last synced timestamp
        store.setLastSyncedAt(new Date().toISOString());
        store.setSyncState('synced');
        console.log('[Sync] Queue processed successfully');
    } catch (error) {
        console.error('Queue processing failed:', error);
        store.setSyncError(error instanceof Error ? error.message : 'Sync failed');
    } finally {
        store.setProcessingQueue(false);
    }
}

/**
 * Process a single queue item and update local store with server response
 */
async function processQueueItem(item: SyncQueueItem): Promise<void> {
    const syncStore = useSyncStore.getState();

    switch (item.operation) {
        case 'upsert': {
            if (item.type === 'document') {
                const payload = item.data as DocumentUpsertPayload;

                // IMPORTANT: Get the latest syncVersion from cache, not from the queued item
                // This prevents false conflicts when typing quickly (multiple syncs queued)
                const cachedDoc = syncStore.serverDocuments.get(payload.id);
                const latestSyncVersion = cachedDoc?.syncVersion ?? payload.syncVersion ?? 0;

                const updatedPayload: DocumentUpsertPayload = {
                    ...payload,
                    syncVersion: latestSyncVersion
                };

                console.log('[Sync] Sending document with syncVersion:', latestSyncVersion);
                const response = await syncApi.documents.upsert(updatedPayload);
                // Update server documents cache with the response
                syncStore.updateServerDocument(response.document);
                // Broadcast the updated document to sync between tabs
                broadcastDocumentUpdate(response.document);
            } else {
                const response = await syncApi.folders.upsert(item.data as SyncFolder);
                syncStore.updateServerFolder(response.folder);
            }
            break;
        }

        case 'delete': {
            if (item.type === 'document') {
                await syncApi.documents.delete(item.data.id);
                syncStore.removeServerDocument(item.data.id);
            } else {
                await syncApi.folders.delete(item.data.id);
                syncStore.removeServerFolder(item.data.id);
            }
            break;
        }
    }
}

// BroadcastChannel for cross-tab sync
let broadcastChannel: BroadcastChannel | null = null;

function getBroadcastChannel(): BroadcastChannel | null {
    if (typeof BroadcastChannel === 'undefined') return null;
    if (!broadcastChannel) {
        broadcastChannel = new BroadcastChannel('markview-document-sync');
    }
    return broadcastChannel;
}

function broadcastDocumentUpdate(document: SyncDocument): void {
    const channel = getBroadcastChannel();
    if (channel) {
        channel.postMessage({
            type: 'server-sync-complete',
            documentId: document.id,
            syncVersion: document.syncVersion,
            updatedAt: document.updatedAt
        });
    }
}

/**
 * Handle a sync conflict
 */
async function handleConflict(item: SyncQueueItem, error: SyncConflictError): Promise<void> {
    const syncStore = useSyncStore.getState();
    const documentStore = useDocumentStore.getState();

    // Get the full local document from the document store
    const localDoc = documentStore.documents.get(item.id);
    const queueData = item.data as DocumentUpsertPayload;

    // Build a proper SyncDocument from local data
    const localSyncDocument: SyncDocument = {
        id: item.id,
        userId: error.serverDocument.userId, // Use server's userId
        name: queueData.name,
        content: queueData.content,
        folderId: queueData.folderId ?? null,
        isManuallyNamed: queueData.isManuallyNamed ?? false,
        cursor: queueData.cursor ?? null,
        scroll: queueData.scroll ?? null,
        syncVersion: queueData.syncVersion ?? 0,
        createdAt: localDoc ? localDoc.createdAt.toISOString() : new Date().toISOString(),
        updatedAt: localDoc ? localDoc.updatedAt.toISOString() : new Date().toISOString(),
        syncedAt: localDoc?.syncedAt?.toISOString() ?? null,
        deletedAt: null
    };

    console.log('[Sync] Conflict detected for document:', item.id);

    // Create conflict object
    const conflict = conflictResolver.create(localSyncDocument, error.serverDocument);

    // Add to conflicts list
    syncStore.addConflict(conflict);

    // Set as active conflict to show modal
    syncStore.setActiveConflict(conflict);

    // Remove from queue (will be re-added after resolution)
    await syncQueue.remove(item.id);
    syncStore.removeFromQueue(item.id);
}

/**
 * Queue a document for sync
 */
export async function queueDocumentSync(document: DocumentUpsertPayload): Promise<void> {
    if (!isSyncEnabled()) return;

    const store = useSyncStore.getState();

    const item: SyncQueueItem = {
        id: document.id,
        type: 'document',
        operation: 'upsert',
        data: document,
        timestamp: Date.now(),
        retries: 0
    };

    console.log('[Sync] queueDocumentSync:', document.id);

    store.addToQueue(item);
    await syncQueue.add(item);

    // Debounce sync to batch rapid changes
    debouncedSync();
}

/**
 * Queue a document deletion for sync
 */
export async function queueDocumentDelete(id: string): Promise<void> {
    if (!isSyncEnabled()) return;

    const store = useSyncStore.getState();

    const item: SyncQueueItem = {
        id,
        type: 'document',
        operation: 'delete',
        data: { id },
        timestamp: Date.now(),
        retries: 0
    };

    console.log('[Sync] queueDocumentDelete:', id);

    store.addToQueue(item);
    await syncQueue.add(item);

    // Process immediately for deletes
    processQueue();
}

/**
 * Queue a folder for sync
 */
export function queueFolderSync(folder: SyncFolder): void {
    if (!isSyncEnabled()) return;

    const store = useSyncStore.getState();

    const item: SyncQueueItem = {
        id: folder.id,
        type: 'folder',
        operation: 'upsert',
        data: folder,
        timestamp: Date.now(),
        retries: 0
    };

    store.addToQueue(item);
    syncQueue.add(item);

    debouncedSync();
}

/**
 * Queue a folder deletion for sync
 */
export function queueFolderDelete(id: string): void {
    if (!isSyncEnabled()) return;

    const store = useSyncStore.getState();

    const item: SyncQueueItem = {
        id,
        type: 'folder',
        operation: 'delete',
        data: { id },
        timestamp: Date.now(),
        retries: 0
    };

    store.addToQueue(item);
    syncQueue.add(item);

    processQueue();
}

/**
 * Debounced sync to batch rapid changes
 */
function debouncedSync(): void {
    if (!isSyncEnabled()) return;

    if (debounceTimeout) {
        clearTimeout(debounceTimeout);
    }

    debounceTimeout = setTimeout(() => {
        debounceTimeout = null;
        processQueue();
    }, getDebounceDelay());
}

/**
 * Resolve a conflict with the specified resolution strategy
 */
export async function resolveConflict(
    documentId: string,
    resolution: 'local' | 'server' | 'both',
    localDocument: SyncDocument,
    serverDocument: SyncDocument
): Promise<SyncDocument> {
    const store = useSyncStore.getState();

    let result: SyncDocument;

    switch (resolution) {
        case 'local': {
            // Push local version with incremented version
            const localResolution = conflictResolver.resolveWithLocal(localDocument, serverDocument);
            result = localResolution.resolvedDocument;
            queueDocumentSync(result);
            break;
        }

        case 'server': {
            // Accept server version
            const serverResolution = conflictResolver.resolveWithServer(serverDocument);
            result = serverResolution.resolvedDocument;
            store.updateServerDocument(result);
            break;
        }

        case 'both': {
            // Keep server version as main, local becomes a copy
            result = serverDocument;
            store.updateServerDocument(result);
            // Caller should create a copy of local document
            break;
        }
    }

    // Mark conflict as resolved
    store.resolveConflict(documentId, resolution);

    return result;
}

/**
 * Force sync now (bypass debounce)
 */
export function forceSyncNow(): void {
    if (debounceTimeout) {
        clearTimeout(debounceTimeout);
        debounceTimeout = null;
    }
    syncAll();
}

/**
 * Get current online status
 */
export function isOnlineStatus(): boolean {
    return isOnline;
}

export const syncService = {
    init: initSyncService,
    destroy: destroySyncService,
    startAutoSync,
    stopAutoSync,
    initialSync,
    syncAll,
    processQueue,
    queueDocumentSync,
    queueDocumentDelete,
    queueFolderSync,
    queueFolderDelete,
    resolveConflict,
    forceSyncNow,
    isOnline: isOnlineStatus
};
