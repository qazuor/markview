import { useSession } from '@/lib/auth-client';
import { syncApi } from '@/services/sync/api';
import { sseService } from '@/services/sync/sse';
import { useDocumentStore } from '@/stores/documentStore';
import { useSessionSyncStore } from '@/stores/sessionSyncStore';
import type { SSEDocumentDeletedEvent, SSEDocumentUpdatedEvent, SSESessionUpdatedEvent } from '@/types/sse';
import { useCallback, useEffect, useRef } from 'react';

// Debounce timeout for session updates
const SESSION_UPDATE_DEBOUNCE_MS = 500;

// Retry configuration
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY_MS = 2000;

/**
 * Hook that manages SSE connection and handles real-time sync across devices
 */
export function useSSESync() {
    const { data: session, isPending } = useSession();
    const isAuthenticated = !!session?.user && !isPending;

    // Document store - get functions directly to avoid stale closures
    const addSyncedDocument = useDocumentStore((s) => s.addSyncedDocument);
    const closeDocument = useDocumentStore((s) => s.closeDocument);

    // Session sync store
    const setIsSyncing = useSessionSyncStore((s) => s.setIsSyncing);
    const setSyncError = useSessionSyncStore((s) => s.setSyncError);

    // Refs for debouncing and tracking
    const sessionUpdateTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
    const lastSessionUpdate = useRef<{ openIds: string[]; activeId: string | null }>({
        openIds: [],
        activeId: null
    });
    const isAuthenticatedRef = useRef(isAuthenticated);

    // Keep auth ref up to date
    useEffect(() => {
        isAuthenticatedRef.current = isAuthenticated;
    }, [isAuthenticated]);

    // ========================================================================
    // Session State Sync
    // ========================================================================

    /**
     * Update session state on the server
     */
    const syncSessionState = useCallback(async () => {
        if (!isAuthenticatedRef.current) return;

        // Always get fresh state from stores
        const documents = useDocumentStore.getState().documents;
        const activeDocumentId = useDocumentStore.getState().activeDocumentId;

        const openDocumentIds = Array.from(documents.keys());
        const currentActiveId = activeDocumentId;

        // Check if anything actually changed
        const lastIds = lastSessionUpdate.current.openIds;
        const lastActiveId = lastSessionUpdate.current.activeId;

        const idsChanged =
            openDocumentIds.length !== lastIds.length ||
            openDocumentIds.some((id) => !lastIds.includes(id)) ||
            lastIds.some((id) => !openDocumentIds.includes(id));

        const activeChanged = currentActiveId !== lastActiveId;

        if (!idsChanged && !activeChanged) {
            return;
        }

        // Update last known state
        lastSessionUpdate.current = {
            openIds: [...openDocumentIds],
            activeId: currentActiveId
        };

        try {
            await syncApi.session.update({
                openDocumentIds,
                activeDocumentId: currentActiveId
            });
            console.log('[SSESync] Session state synced:', { openDocumentIds, activeDocumentId: currentActiveId });
        } catch (error) {
            console.error('[SSESync] Failed to update session state:', error);
        }
    }, []);

    /**
     * Debounced session state sync
     */
    const debouncedSyncSessionState = useCallback(() => {
        if (sessionUpdateTimeout.current) {
            clearTimeout(sessionUpdateTimeout.current);
        }
        sessionUpdateTimeout.current = setTimeout(syncSessionState, SESSION_UPDATE_DEBOUNCE_MS);
    }, [syncSessionState]);

    // ========================================================================
    // Document Sync Functions
    // ========================================================================

    /**
     * Fetch a specific document from server and update local store
     */
    const fetchAndUpdateDocument = useCallback(
        async (documentId: string, retryCount = 0): Promise<boolean> => {
            try {
                const response = await syncApi.documents.fetch();
                const serverDoc = response.documents.find((d) => d.id === documentId);

                if (serverDoc && !serverDoc.deletedAt) {
                    console.log('[SSESync] Updating document from server:', documentId, 'version:', serverDoc.syncVersion);
                    addSyncedDocument({
                        id: serverDoc.id,
                        name: serverDoc.name,
                        content: serverDoc.content,
                        folderId: serverDoc.folderId,
                        syncVersion: serverDoc.syncVersion,
                        syncedAt: serverDoc.syncedAt ? new Date(serverDoc.syncedAt) : null,
                        createdAt: new Date(serverDoc.createdAt),
                        updatedAt: new Date(serverDoc.updatedAt)
                    });
                    return true;
                }

                if (serverDoc?.deletedAt) {
                    console.log('[SSESync] Document was deleted on server:', documentId);
                    return true;
                }

                console.warn('[SSESync] Document not found on server:', documentId);
                return false;
            } catch (error) {
                console.error('[SSESync] Failed to fetch document:', documentId, error);

                // Retry logic
                if (retryCount < MAX_RETRY_ATTEMPTS) {
                    console.log(`[SSESync] Retrying fetch for ${documentId} (attempt ${retryCount + 1}/${MAX_RETRY_ATTEMPTS})`);
                    await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
                    return fetchAndUpdateDocument(documentId, retryCount + 1);
                }

                setSyncError(`Failed to sync document after ${MAX_RETRY_ATTEMPTS} attempts`);
                return false;
            }
        },
        [addSyncedDocument, setSyncError]
    );

    /**
     * Load missing documents from server by their IDs
     */
    const loadMissingDocuments = useCallback(
        async (documentIds: string[]) => {
            // Get fresh documents state
            const currentDocs = useDocumentStore.getState().documents;
            const missingDocIds = documentIds.filter((docId) => !currentDocs.has(docId));

            if (missingDocIds.length === 0) {
                console.log('[SSESync] All documents already present locally');
                return;
            }

            console.log('[SSESync] Missing documents to fetch:', missingDocIds);

            setIsSyncing(true);
            try {
                const response = await syncApi.documents.fetch();

                for (const docId of missingDocIds) {
                    const serverDoc = response.documents.find((d) => d.id === docId);

                    if (serverDoc && !serverDoc.deletedAt) {
                        console.log('[SSESync] Adding synced document:', docId);
                        addSyncedDocument({
                            id: serverDoc.id,
                            name: serverDoc.name,
                            content: serverDoc.content,
                            folderId: serverDoc.folderId,
                            syncVersion: serverDoc.syncVersion,
                            syncedAt: serverDoc.syncedAt ? new Date(serverDoc.syncedAt) : null,
                            createdAt: new Date(serverDoc.createdAt),
                            updatedAt: new Date(serverDoc.updatedAt)
                        });
                    }
                }
            } catch (error) {
                console.error('[SSESync] Failed to fetch documents:', error);
                setSyncError('Failed to fetch documents from server');
            } finally {
                setIsSyncing(false);
            }
        },
        [addSyncedDocument, setIsSyncing, setSyncError]
    );

    // ========================================================================
    // SSE Event Handlers
    // ========================================================================

    /**
     * Handle document updated event from another device
     * This is the CRITICAL handler that syncs document changes
     */
    const handleDocumentUpdated = useCallback(
        async (data: SSEDocumentUpdatedEvent) => {
            // Ignore our own changes
            if (data.originDeviceId === sseService.getDeviceId()) {
                console.log('[SSESync] Ignoring own document update:', data.documentId);
                return;
            }

            console.log('[SSESync] Document updated on another device:', data.documentId, 'version:', data.syncVersion);

            // Get fresh documents state
            const currentDocs = useDocumentStore.getState().documents;
            const localDoc = currentDocs.get(data.documentId);

            if (!localDoc) {
                // Document doesn't exist locally - it's a new document from another device
                console.log('[SSESync] New document from another device, fetching:', data.documentId);
                setIsSyncing(true);
                await fetchAndUpdateDocument(data.documentId);
                setIsSyncing(false);
                return;
            }

            // Document exists locally - check if we need to update
            const localVersion = localDoc.syncVersion ?? 0;

            if (data.syncVersion > localVersion) {
                console.log('[SSESync] Server has newer version, updating:', data.documentId, `(${localVersion} -> ${data.syncVersion})`);
                setIsSyncing(true);
                await fetchAndUpdateDocument(data.documentId);
                setIsSyncing(false);
            } else {
                console.log(
                    '[SSESync] Local version is current:',
                    data.documentId,
                    `(local: ${localVersion}, server: ${data.syncVersion})`
                );
            }
        },
        [fetchAndUpdateDocument, setIsSyncing]
    );

    /**
     * Handle document deleted event from another device
     */
    const handleDocumentDeleted = useCallback(
        (data: SSEDocumentDeletedEvent) => {
            if (data.originDeviceId === sseService.getDeviceId()) {
                return;
            }

            console.log('[SSESync] Document deleted on another device:', data.documentId);

            // Close the document locally if it's open
            const currentDocs = useDocumentStore.getState().documents;
            if (currentDocs.has(data.documentId)) {
                closeDocument(data.documentId);
            }
        },
        [closeDocument]
    );

    /**
     * Handle session updated event from another device
     */
    const handleSessionUpdated = useCallback(
        async (data: SSESessionUpdatedEvent) => {
            if (data.originDeviceId === sseService.getDeviceId()) {
                return;
            }

            console.log('[SSESync] Session updated on another device:', data);

            // Load any missing documents
            await loadMissingDocuments(data.openDocumentIds);
        },
        [loadMissingDocuments]
    );

    // ========================================================================
    // Connection Management
    // ========================================================================

    // Refs for handlers to avoid recreating useEffect
    const handleDocumentUpdatedRef = useRef(handleDocumentUpdated);
    const handleDocumentDeletedRef = useRef(handleDocumentDeleted);
    const handleSessionUpdatedRef = useRef(handleSessionUpdated);
    const loadMissingDocumentsRef = useRef(loadMissingDocuments);

    // Keep refs up to date
    useEffect(() => {
        handleDocumentUpdatedRef.current = handleDocumentUpdated;
    }, [handleDocumentUpdated]);

    useEffect(() => {
        handleDocumentDeletedRef.current = handleDocumentDeleted;
    }, [handleDocumentDeleted]);

    useEffect(() => {
        handleSessionUpdatedRef.current = handleSessionUpdated;
    }, [handleSessionUpdated]);

    useEffect(() => {
        loadMissingDocumentsRef.current = loadMissingDocuments;
    }, [loadMissingDocuments]);

    // Connect/disconnect based on auth state
    useEffect(() => {
        if (!isAuthenticated) {
            sseService.disconnect();
            return;
        }

        // Connect to SSE
        sseService.connect();

        // Subscribe to state changes
        const unsubState = sseService.onStateChange((state) => {
            useSessionSyncStore.getState().setConnectionState(state);

            if (state === 'connected') {
                useSessionSyncStore.getState().setConnectionId(sseService.getConnectionId());

                // Fetch initial session state and documents when connected
                syncApi.session
                    .fetch()
                    .then(async (serverSession) => {
                        console.log('[SSESync] Fetched initial session state:', serverSession);
                        lastSessionUpdate.current = {
                            openIds: serverSession.openDocumentIds,
                            activeId: serverSession.activeDocumentId
                        };

                        // Load any missing documents from the initial session state
                        if (serverSession.openDocumentIds.length > 0) {
                            await loadMissingDocumentsRef.current(serverSession.openDocumentIds);
                        }
                    })
                    .catch((error) => {
                        console.error('[SSESync] Failed to fetch initial session state:', error);
                    });
            } else {
                useSessionSyncStore.getState().setConnectionId(null);
            }
        });

        // Subscribe to SSE events
        const unsubConnected = sseService.onEvent('connected', () => {
            console.log('[SSESync] Connected to SSE');
        });

        const unsubHeartbeat = sseService.onEvent('heartbeat', () => {
            useSessionSyncStore.getState().updateHeartbeat();
        });

        const unsubDocUpdated = sseService.onEvent('document:updated', (data) => {
            handleDocumentUpdatedRef.current(data);
        });

        const unsubDocDeleted = sseService.onEvent('document:deleted', (data) => {
            handleDocumentDeletedRef.current(data);
        });

        const unsubSessionUpdated = sseService.onEvent('session:updated', (data) => {
            handleSessionUpdatedRef.current(data);
        });

        return () => {
            unsubState();
            unsubConnected();
            unsubHeartbeat();
            unsubDocUpdated();
            unsubDocDeleted();
            unsubSessionUpdated();
            sseService.disconnect();

            if (sessionUpdateTimeout.current) {
                clearTimeout(sessionUpdateTimeout.current);
            }
        };
    }, [isAuthenticated]);

    // Sync session state when documents change
    const prevStateRef = useRef<{ size: number; activeId: string | null }>({ size: 0, activeId: null });

    useEffect(() => {
        if (!isAuthenticated) return;

        // Subscribe to document store changes
        const unsubscribe = useDocumentStore.subscribe((state) => {
            const currentSize = state.documents.size;
            const currentActiveId = state.activeDocumentId;

            // Only trigger if size or activeId actually changed
            if (currentSize !== prevStateRef.current.size || currentActiveId !== prevStateRef.current.activeId) {
                prevStateRef.current = { size: currentSize, activeId: currentActiveId };
                debouncedSyncSessionState();
            }
        });

        return unsubscribe;
    }, [isAuthenticated, debouncedSyncSessionState]);

    // ========================================================================
    // Return Values
    // ========================================================================

    return {
        isConnected: useSessionSyncStore((s) => s.connectionState === 'connected'),
        connectionState: useSessionSyncStore((s) => s.connectionState),
        isSyncing: useSessionSyncStore((s) => s.isSyncing),
        syncError: useSessionSyncStore((s) => s.lastSyncError),
        deviceId: sseService.getDeviceId()
    };
}
