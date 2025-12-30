/**
 * Sync Store
 * Manages cloud sync state and operations
 */

import type { SyncConflict, SyncDocument, SyncFolder, SyncQueueItem, SyncState } from '@/types/sync';
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface SyncStoreState {
    // Sync state
    syncState: SyncState;
    lastSyncedAt: string | null;
    syncError: string | null;

    // Pending changes queue
    pendingQueue: SyncQueueItem[];
    isProcessingQueue: boolean;

    // Conflicts
    conflicts: SyncConflict[];
    activeConflict: SyncConflict | null;

    // Sync metadata
    serverDocuments: Map<string, SyncDocument>;
    serverFolders: Map<string, SyncFolder>;

    // Actions - State
    setSyncState: (state: SyncState) => void;
    setSyncError: (error: string | null) => void;
    setLastSyncedAt: (timestamp: string) => void;

    // Actions - Queue
    addToQueue: (item: Omit<SyncQueueItem, 'timestamp' | 'retries'>) => void;
    removeFromQueue: (id: string) => void;
    clearQueue: () => void;
    incrementRetries: (id: string) => void;
    setProcessingQueue: (processing: boolean) => void;
    getQueueItem: (id: string) => SyncQueueItem | undefined;

    // Actions - Conflicts
    addConflict: (conflict: SyncConflict) => void;
    resolveConflict: (documentId: string, resolution: 'local' | 'server' | 'both') => void;
    setActiveConflict: (conflict: SyncConflict | null) => void;
    clearConflicts: () => void;

    // Actions - Server data
    updateServerDocument: (doc: SyncDocument) => void;
    updateServerDocuments: (docs: SyncDocument[]) => void;
    removeServerDocument: (id: string) => void;
    updateServerFolder: (folder: SyncFolder) => void;
    updateServerFolders: (folders: SyncFolder[]) => void;
    removeServerFolder: (id: string) => void;
    clearServerData: () => void;

    // Getters
    hasPendingChanges: () => boolean;
    getPendingCount: () => number;
    getConflictCount: () => number;
}

export const useSyncStore = create<SyncStoreState>()(
    devtools(
        persist(
            (set, get) => ({
                // Initial state
                syncState: 'idle',
                lastSyncedAt: null,
                syncError: null,
                pendingQueue: [],
                isProcessingQueue: false,
                conflicts: [],
                activeConflict: null,
                serverDocuments: new Map(),
                serverFolders: new Map(),

                // State actions
                setSyncState: (syncState) => set({ syncState, syncError: syncState === 'error' ? get().syncError : null }),

                setSyncError: (syncError) => set({ syncError, syncState: syncError ? 'error' : get().syncState }),

                setLastSyncedAt: (lastSyncedAt) => set({ lastSyncedAt }),

                // Queue actions
                addToQueue: (item) => {
                    set((state) => {
                        // Check if item already exists, update if so
                        const existingIndex = state.pendingQueue.findIndex((q) => q.id === item.id && q.type === item.type);

                        const newItem: SyncQueueItem = {
                            ...item,
                            timestamp: Date.now(),
                            retries: 0
                        };

                        if (existingIndex >= 0) {
                            const newQueue = [...state.pendingQueue];
                            newQueue[existingIndex] = newItem;
                            return { pendingQueue: newQueue };
                        }

                        return { pendingQueue: [...state.pendingQueue, newItem] };
                    });
                },

                removeFromQueue: (id) => {
                    set((state) => ({
                        pendingQueue: state.pendingQueue.filter((item) => item.id !== id)
                    }));
                },

                clearQueue: () => set({ pendingQueue: [] }),

                incrementRetries: (id) => {
                    set((state) => ({
                        pendingQueue: state.pendingQueue.map((item) => (item.id === id ? { ...item, retries: item.retries + 1 } : item))
                    }));
                },

                setProcessingQueue: (isProcessingQueue) => set({ isProcessingQueue }),

                getQueueItem: (id) => get().pendingQueue.find((item) => item.id === id),

                // Conflict actions
                addConflict: (conflict) => {
                    set((state) => {
                        // Replace existing conflict for same document
                        const filtered = state.conflicts.filter((c) => c.documentId !== conflict.documentId);
                        return { conflicts: [...filtered, conflict] };
                    });
                },

                resolveConflict: (documentId, resolution) => {
                    set((state) => ({
                        conflicts: state.conflicts.map((c) =>
                            c.documentId === documentId
                                ? {
                                      ...c,
                                      resolution,
                                      resolvedAt: new Date().toISOString()
                                  }
                                : c
                        ),
                        activeConflict: state.activeConflict?.documentId === documentId ? null : state.activeConflict
                    }));
                },

                setActiveConflict: (activeConflict) => set({ activeConflict }),

                clearConflicts: () => set({ conflicts: [], activeConflict: null }),

                // Server data actions
                updateServerDocument: (doc) => {
                    set((state) => {
                        const newDocs = new Map(state.serverDocuments);
                        newDocs.set(doc.id, doc);
                        return { serverDocuments: newDocs };
                    });
                },

                updateServerDocuments: (docs) => {
                    set((state) => {
                        const newDocs = new Map(state.serverDocuments);
                        for (const doc of docs) {
                            if (doc.deletedAt) {
                                newDocs.delete(doc.id);
                            } else {
                                newDocs.set(doc.id, doc);
                            }
                        }
                        return { serverDocuments: newDocs };
                    });
                },

                removeServerDocument: (id) => {
                    set((state) => {
                        const newDocs = new Map(state.serverDocuments);
                        newDocs.delete(id);
                        return { serverDocuments: newDocs };
                    });
                },

                updateServerFolder: (folder) => {
                    set((state) => {
                        const newFolders = new Map(state.serverFolders);
                        newFolders.set(folder.id, folder);
                        return { serverFolders: newFolders };
                    });
                },

                updateServerFolders: (folders) => {
                    set((state) => {
                        const newFolders = new Map(state.serverFolders);
                        for (const folder of folders) {
                            if (folder.deletedAt) {
                                newFolders.delete(folder.id);
                            } else {
                                newFolders.set(folder.id, folder);
                            }
                        }
                        return { serverFolders: newFolders };
                    });
                },

                removeServerFolder: (id) => {
                    set((state) => {
                        const newFolders = new Map(state.serverFolders);
                        newFolders.delete(id);
                        return { serverFolders: newFolders };
                    });
                },

                clearServerData: () =>
                    set({
                        serverDocuments: new Map(),
                        serverFolders: new Map()
                    }),

                // Getters
                hasPendingChanges: () => get().pendingQueue.length > 0,
                getPendingCount: () => get().pendingQueue.length,
                getConflictCount: () => get().conflicts.filter((c) => !c.resolvedAt).length
            }),
            {
                name: 'markview:sync',
                partialize: (state) => ({
                    lastSyncedAt: state.lastSyncedAt,
                    pendingQueue: state.pendingQueue,
                    serverDocuments: Array.from(state.serverDocuments.entries()),
                    serverFolders: Array.from(state.serverFolders.entries())
                }),
                merge: (persisted, current) => {
                    const persistedState = persisted as {
                        lastSyncedAt?: string | null;
                        pendingQueue?: SyncQueueItem[];
                        serverDocuments?: [string, SyncDocument][];
                        serverFolders?: [string, SyncFolder][];
                    };

                    return {
                        ...current,
                        lastSyncedAt: persistedState.lastSyncedAt ?? null,
                        pendingQueue: persistedState.pendingQueue ?? [],
                        serverDocuments: new Map(persistedState.serverDocuments ?? []),
                        serverFolders: new Map(persistedState.serverFolders ?? [])
                    };
                }
            }
        ),
        { name: 'SyncStore' }
    )
);
