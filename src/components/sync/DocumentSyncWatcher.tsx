/**
 * Document Sync Watcher
 * Watches for document changes, queues them for sync, and handles cross-tab sync
 */

import { useAuth } from '@/components/auth/AuthProvider';
import { syncService } from '@/services/sync';
import { useDocumentStore } from '@/stores/documentStore';
import { useSyncStore } from '@/stores/syncStore';
import type { Document } from '@/types';
import { useCallback, useEffect, useRef } from 'react';

interface DocumentSyncMessage {
    type: 'document-updated' | 'document-deleted' | 'server-sync-complete';
    documentId: string;
    document?: Document;
    syncVersion?: number;
    updatedAt?: string;
}

/**
 * Watches document store for changes, queues them for cloud sync,
 * and handles cross-tab synchronization via BroadcastChannel.
 */
export function DocumentSyncWatcher() {
    const { isAuthenticated } = useAuth();
    const documents = useDocumentStore((s) => s.documents);

    // Track previous document state to detect actual changes
    // Using a ref that persists across renders
    const previousContentRef = useRef<Map<string, string>>(new Map());
    const isFirstRenderRef = useRef(true);
    const channelRef = useRef<BroadcastChannel | null>(null);

    // Handle messages from other tabs
    const handleBroadcastMessage = useCallback((message: DocumentSyncMessage) => {
        console.log('[DocumentSyncWatcher] Received broadcast message:', message.type, message.documentId);

        if (message.type === 'document-updated' && message.document) {
            const existingDoc = useDocumentStore.getState().documents.get(message.documentId);

            // Check if we should update (newer or doesn't exist)
            const shouldUpdate = !existingDoc || new Date(message.document.updatedAt) > new Date(existingDoc.updatedAt);
            console.log('[DocumentSyncWatcher] Should update document:', shouldUpdate);

            if (shouldUpdate) {
                useDocumentStore.setState((state) => {
                    const newDocs = new Map(state.documents);
                    newDocs.set(message.documentId, message.document as Document);
                    return { documents: newDocs };
                });
                // Update our tracking so we don't re-sync this change
                previousContentRef.current.set(message.documentId, message.document.content);
                console.log('[DocumentSyncWatcher] Document updated from broadcast:', message.documentId);
            }
        } else if (message.type === 'server-sync-complete' && message.syncVersion) {
            console.log('[DocumentSyncWatcher] Server sync complete, updating syncVersion:', message.syncVersion);
            useDocumentStore.setState((state) => {
                const newDocs = new Map(state.documents);
                const doc = newDocs.get(message.documentId);
                if (doc) {
                    newDocs.set(message.documentId, {
                        ...doc,
                        syncVersion: message.syncVersion,
                        syncedAt: message.updatedAt ? new Date(message.updatedAt) : new Date()
                    });
                }
                return { documents: newDocs };
            });
        } else if (message.type === 'document-deleted') {
            console.log('[DocumentSyncWatcher] Deleting document from broadcast:', message.documentId);
            useDocumentStore.setState((state) => {
                const newDocs = new Map(state.documents);
                newDocs.delete(message.documentId);
                return { documents: newDocs };
            });
            previousContentRef.current.delete(message.documentId);
        }
    }, []);

    // Initialize BroadcastChannel
    useEffect(() => {
        if (typeof BroadcastChannel === 'undefined') {
            console.log('[DocumentSyncWatcher] BroadcastChannel not supported');
            return;
        }

        console.log('[DocumentSyncWatcher] Initializing BroadcastChannel');
        const channel = new BroadcastChannel('markview-document-sync');
        channelRef.current = channel;
        channel.onmessage = (event: MessageEvent<DocumentSyncMessage>) => {
            console.log('[DocumentSyncWatcher] onmessage event received');
            handleBroadcastMessage(event.data);
        };

        return () => {
            console.log('[DocumentSyncWatcher] Closing BroadcastChannel');
            channel.close();
            channelRef.current = null;
        };
    }, [handleBroadcastMessage]);

    // Watch for document changes and queue for sync
    // Note: We deliberately don't include serverDocuments as a dependency
    // because we don't want to re-run when server data updates
    useEffect(() => {
        if (!isAuthenticated) {
            previousContentRef.current.clear();
            isFirstRenderRef.current = true;
            return;
        }

        // On first render, just capture current state without syncing
        if (isFirstRenderRef.current) {
            isFirstRenderRef.current = false;
            for (const [id, doc] of documents) {
                previousContentRef.current.set(id, doc.content);
            }
            console.log('[DocumentSyncWatcher] Initialized with', documents.size, 'documents');
            return;
        }

        // Detect changes
        for (const [id, doc] of documents) {
            const prevContent = previousContentRef.current.get(id);

            // Only sync if content actually changed
            if (prevContent === doc.content) {
                continue;
            }

            // Get syncVersion from server cache (accessed outside of deps to avoid re-renders)
            const currentServerDocuments = useSyncStore.getState().serverDocuments;
            const serverDoc = currentServerDocuments.get(id);
            const syncVersion = serverDoc?.syncVersion ?? doc.syncVersion ?? 0;

            console.log(`[DocumentSyncWatcher] Queueing document ${id}, syncVersion: ${syncVersion}`);

            syncService.queueDocumentSync({
                id: doc.id,
                name: doc.name,
                content: doc.content,
                folderId: doc.folderId ?? null,
                isManuallyNamed: doc.isManuallyNamed,
                cursor: doc.cursor,
                scroll: doc.scroll,
                syncVersion
            });

            // Broadcast to other tabs
            channelRef.current?.postMessage({
                type: 'document-updated',
                documentId: id,
                document: doc
            });

            // Update tracking
            previousContentRef.current.set(id, doc.content);
        }

        // Handle deletions
        for (const [id] of previousContentRef.current) {
            if (!documents.has(id)) {
                console.log(`[DocumentSyncWatcher] Queueing document deletion: ${id}`);
                syncService.queueDocumentDelete(id);
                channelRef.current?.postMessage({ type: 'document-deleted', documentId: id });
                previousContentRef.current.delete(id);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [documents, isAuthenticated]);

    return null;
}
