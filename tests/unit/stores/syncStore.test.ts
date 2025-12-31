import { useSyncStore } from '@/stores/syncStore';
import type { SyncConflict, SyncDocument, SyncFolder, SyncQueueItem } from '@/types/sync';
import { act } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('syncStore', () => {
    beforeEach(() => {
        localStorage.clear();
        act(() => {
            useSyncStore.setState({
                syncState: 'idle',
                lastSyncedAt: null,
                syncError: null,
                pendingQueue: [],
                isProcessingQueue: false,
                conflicts: [],
                activeConflict: null,
                serverDocuments: new Map(),
                serverFolders: new Map()
            });
        });
    });

    afterEach(() => {
        localStorage.clear();
    });

    describe('initial state', () => {
        it('should have correct initial values', () => {
            const state = useSyncStore.getState();

            expect(state.syncState).toBe('idle');
            expect(state.lastSyncedAt).toBeNull();
            expect(state.syncError).toBeNull();
            expect(state.pendingQueue).toEqual([]);
            expect(state.isProcessingQueue).toBe(false);
            expect(state.conflicts).toEqual([]);
            expect(state.activeConflict).toBeNull();
            expect(state.serverDocuments.size).toBe(0);
            expect(state.serverFolders.size).toBe(0);
        });
    });

    describe('setSyncState', () => {
        it('should update sync state', () => {
            act(() => {
                useSyncStore.getState().setSyncState('syncing');
            });

            expect(useSyncStore.getState().syncState).toBe('syncing');
        });

        it('should clear error when state is not error', () => {
            act(() => {
                useSyncStore.setState({ syncError: 'Some error' });
                useSyncStore.getState().setSyncState('idle');
            });

            expect(useSyncStore.getState().syncError).toBeNull();
        });

        it('should keep error when state is error', () => {
            act(() => {
                useSyncStore.setState({ syncError: 'Some error' });
                useSyncStore.getState().setSyncState('error');
            });

            expect(useSyncStore.getState().syncError).toBe('Some error');
        });
    });

    describe('setSyncError', () => {
        it('should set error message', () => {
            act(() => {
                useSyncStore.getState().setSyncError('Network error');
            });

            expect(useSyncStore.getState().syncError).toBe('Network error');
            expect(useSyncStore.getState().syncState).toBe('error');
        });

        it('should clear error when null', () => {
            act(() => {
                useSyncStore.setState({ syncError: 'Some error', syncState: 'error' });
                useSyncStore.getState().setSyncError(null);
            });

            expect(useSyncStore.getState().syncError).toBeNull();
        });
    });

    describe('setLastSyncedAt', () => {
        it('should update last synced timestamp', () => {
            const timestamp = '2024-01-15T10:00:00Z';

            act(() => {
                useSyncStore.getState().setLastSyncedAt(timestamp);
            });

            expect(useSyncStore.getState().lastSyncedAt).toBe(timestamp);
        });
    });

    describe('queue actions', () => {
        const mockQueueItem: Omit<SyncQueueItem, 'timestamp' | 'retries'> = {
            id: 'doc-1',
            type: 'document',
            operation: 'upsert',
            data: { id: 'doc-1' }
        };

        describe('addToQueue', () => {
            it('should add item to queue', () => {
                act(() => {
                    useSyncStore.getState().addToQueue(mockQueueItem);
                });

                const queue = useSyncStore.getState().pendingQueue;
                expect(queue).toHaveLength(1);
                expect(queue[0]?.id).toBe('doc-1');
                expect(queue[0]?.retries).toBe(0);
                expect(queue[0]?.timestamp).toBeDefined();
            });

            it('should replace existing item with same id and type', () => {
                act(() => {
                    useSyncStore.getState().addToQueue(mockQueueItem);
                    useSyncStore.getState().addToQueue({
                        ...mockQueueItem,
                        data: { id: 'doc-1-updated' }
                    });
                });

                const queue = useSyncStore.getState().pendingQueue;
                expect(queue).toHaveLength(1);
                expect(queue[0]?.data).toEqual({ id: 'doc-1-updated' });
            });

            it('should add different items separately', () => {
                act(() => {
                    useSyncStore.getState().addToQueue(mockQueueItem);
                    useSyncStore.getState().addToQueue({ ...mockQueueItem, id: 'doc-2' });
                });

                expect(useSyncStore.getState().pendingQueue).toHaveLength(2);
            });
        });

        describe('removeFromQueue', () => {
            it('should remove item from queue', () => {
                act(() => {
                    useSyncStore.getState().addToQueue(mockQueueItem);
                    useSyncStore.getState().removeFromQueue('doc-1');
                });

                expect(useSyncStore.getState().pendingQueue).toHaveLength(0);
            });

            it('should handle non-existent id', () => {
                act(() => {
                    useSyncStore.getState().addToQueue(mockQueueItem);
                    useSyncStore.getState().removeFromQueue('non-existent');
                });

                expect(useSyncStore.getState().pendingQueue).toHaveLength(1);
            });
        });

        describe('clearQueue', () => {
            it('should clear all queue items', () => {
                act(() => {
                    useSyncStore.getState().addToQueue(mockQueueItem);
                    useSyncStore.getState().addToQueue({ ...mockQueueItem, id: 'doc-2' });
                    useSyncStore.getState().clearQueue();
                });

                expect(useSyncStore.getState().pendingQueue).toHaveLength(0);
            });
        });

        describe('incrementRetries', () => {
            it('should increment retry count', () => {
                act(() => {
                    useSyncStore.getState().addToQueue(mockQueueItem);
                    useSyncStore.getState().incrementRetries('doc-1');
                });

                expect(useSyncStore.getState().pendingQueue[0]?.retries).toBe(1);
            });

            it('should increment multiple times', () => {
                act(() => {
                    useSyncStore.getState().addToQueue(mockQueueItem);
                    useSyncStore.getState().incrementRetries('doc-1');
                    useSyncStore.getState().incrementRetries('doc-1');
                    useSyncStore.getState().incrementRetries('doc-1');
                });

                expect(useSyncStore.getState().pendingQueue[0]?.retries).toBe(3);
            });
        });

        describe('setProcessingQueue', () => {
            it('should set processing state', () => {
                act(() => {
                    useSyncStore.getState().setProcessingQueue(true);
                });

                expect(useSyncStore.getState().isProcessingQueue).toBe(true);
            });
        });

        describe('getQueueItem', () => {
            it('should return item by id', () => {
                act(() => {
                    useSyncStore.getState().addToQueue(mockQueueItem);
                });

                const item = useSyncStore.getState().getQueueItem('doc-1');
                expect(item?.id).toBe('doc-1');
            });

            it('should return undefined for non-existent id', () => {
                const item = useSyncStore.getState().getQueueItem('non-existent');
                expect(item).toBeUndefined();
            });
        });
    });

    describe('conflict actions', () => {
        const mockDocLocal: SyncDocument = {
            id: 'doc-1',
            userId: 'user-1',
            name: 'Test',
            content: 'local',
            folderId: null,
            isManuallyNamed: false,
            cursor: null,
            scroll: null,
            syncVersion: 1,
            createdAt: '2024-01-15T09:00:00Z',
            updatedAt: '2024-01-15T09:00:00Z',
            syncedAt: null,
            deletedAt: null
        };
        const mockConflict: SyncConflict = {
            documentId: 'doc-1',
            localDocument: mockDocLocal,
            serverDocument: { ...mockDocLocal, content: 'server', updatedAt: '2024-01-15T10:00:00Z' }
        };

        describe('addConflict', () => {
            it('should add conflict', () => {
                act(() => {
                    useSyncStore.getState().addConflict(mockConflict);
                });

                expect(useSyncStore.getState().conflicts).toHaveLength(1);
                expect(useSyncStore.getState().conflicts[0]?.documentId).toBe('doc-1');
            });

            it('should replace existing conflict for same document', () => {
                const updatedConflict = {
                    ...mockConflict,
                    localDocument: { ...mockDocLocal, content: 'updated local', updatedAt: '2024-01-15T12:00:00Z' }
                };

                act(() => {
                    useSyncStore.getState().addConflict(mockConflict);
                    useSyncStore.getState().addConflict(updatedConflict);
                });

                const conflicts = useSyncStore.getState().conflicts;
                expect(conflicts).toHaveLength(1);
                expect(conflicts[0]?.localDocument.content).toBe('updated local');
            });
        });

        describe('resolveConflict', () => {
            it('should resolve conflict with local version', () => {
                vi.useFakeTimers();
                vi.setSystemTime(new Date('2024-01-15T12:00:00Z'));

                act(() => {
                    useSyncStore.getState().addConflict(mockConflict);
                    useSyncStore.getState().resolveConflict('doc-1', 'local');
                });

                const conflict = useSyncStore.getState().conflicts[0];
                expect(conflict?.resolution).toBe('local');
                expect(conflict?.resolvedAt).toBe('2024-01-15T12:00:00.000Z');

                vi.useRealTimers();
            });

            it('should clear active conflict if resolved', () => {
                act(() => {
                    useSyncStore.getState().addConflict(mockConflict);
                    useSyncStore.getState().setActiveConflict(mockConflict);
                    useSyncStore.getState().resolveConflict('doc-1', 'server');
                });

                expect(useSyncStore.getState().activeConflict).toBeNull();
            });
        });

        describe('setActiveConflict', () => {
            it('should set active conflict', () => {
                act(() => {
                    useSyncStore.getState().setActiveConflict(mockConflict);
                });

                expect(useSyncStore.getState().activeConflict).toEqual(mockConflict);
            });

            it('should clear active conflict', () => {
                act(() => {
                    useSyncStore.getState().setActiveConflict(mockConflict);
                    useSyncStore.getState().setActiveConflict(null);
                });

                expect(useSyncStore.getState().activeConflict).toBeNull();
            });
        });

        describe('clearConflicts', () => {
            it('should clear all conflicts and active conflict', () => {
                act(() => {
                    useSyncStore.getState().addConflict(mockConflict);
                    useSyncStore.getState().setActiveConflict(mockConflict);
                    useSyncStore.getState().clearConflicts();
                });

                expect(useSyncStore.getState().conflicts).toHaveLength(0);
                expect(useSyncStore.getState().activeConflict).toBeNull();
            });
        });
    });

    describe('server data actions', () => {
        const mockDocument: SyncDocument = {
            id: 'doc-1',
            userId: 'user-1',
            name: 'Test Doc',
            content: 'Content',
            folderId: null,
            isManuallyNamed: false,
            cursor: null,
            scroll: null,
            syncVersion: 1,
            createdAt: '2024-01-15T10:00:00Z',
            updatedAt: '2024-01-15T10:00:00Z',
            syncedAt: null,
            deletedAt: null
        };

        const mockFolder: SyncFolder = {
            id: 'folder-1',
            userId: 'user-1',
            name: 'Test Folder',
            parentId: null,
            color: null,
            sortOrder: 0,
            createdAt: '2024-01-15T10:00:00Z',
            updatedAt: '2024-01-15T10:00:00Z',
            deletedAt: null
        };

        describe('updateServerDocument', () => {
            it('should add document to server documents', () => {
                act(() => {
                    useSyncStore.getState().updateServerDocument(mockDocument);
                });

                const docs = useSyncStore.getState().serverDocuments;
                expect(docs.size).toBe(1);
                expect(docs.get('doc-1')).toEqual(mockDocument);
            });

            it('should update existing document', () => {
                const updated = { ...mockDocument, content: 'Updated' };

                act(() => {
                    useSyncStore.getState().updateServerDocument(mockDocument);
                    useSyncStore.getState().updateServerDocument(updated);
                });

                const docs = useSyncStore.getState().serverDocuments;
                expect(docs.size).toBe(1);
                expect(docs.get('doc-1')?.content).toBe('Updated');
            });
        });

        describe('updateServerDocuments', () => {
            it('should add multiple documents', () => {
                const docs = [mockDocument, { ...mockDocument, id: 'doc-2', name: 'Doc 2' }];

                act(() => {
                    useSyncStore.getState().updateServerDocuments(docs);
                });

                expect(useSyncStore.getState().serverDocuments.size).toBe(2);
            });

            it('should remove deleted documents', () => {
                const deletedDoc = { ...mockDocument, deletedAt: '2024-01-15T12:00:00Z' };

                act(() => {
                    useSyncStore.getState().updateServerDocument(mockDocument);
                    useSyncStore.getState().updateServerDocuments([deletedDoc]);
                });

                expect(useSyncStore.getState().serverDocuments.size).toBe(0);
            });
        });

        describe('removeServerDocument', () => {
            it('should remove document by id', () => {
                act(() => {
                    useSyncStore.getState().updateServerDocument(mockDocument);
                    useSyncStore.getState().removeServerDocument('doc-1');
                });

                expect(useSyncStore.getState().serverDocuments.size).toBe(0);
            });
        });

        describe('updateServerFolder', () => {
            it('should add folder to server folders', () => {
                act(() => {
                    useSyncStore.getState().updateServerFolder(mockFolder);
                });

                const folders = useSyncStore.getState().serverFolders;
                expect(folders.size).toBe(1);
                expect(folders.get('folder-1')).toEqual(mockFolder);
            });
        });

        describe('updateServerFolders', () => {
            it('should add multiple folders', () => {
                const folders = [mockFolder, { ...mockFolder, id: 'folder-2', name: 'Folder 2' }];

                act(() => {
                    useSyncStore.getState().updateServerFolders(folders);
                });

                expect(useSyncStore.getState().serverFolders.size).toBe(2);
            });

            it('should remove deleted folders', () => {
                const deletedFolder = { ...mockFolder, deletedAt: '2024-01-15T12:00:00Z' };

                act(() => {
                    useSyncStore.getState().updateServerFolder(mockFolder);
                    useSyncStore.getState().updateServerFolders([deletedFolder]);
                });

                expect(useSyncStore.getState().serverFolders.size).toBe(0);
            });
        });

        describe('removeServerFolder', () => {
            it('should remove folder by id', () => {
                act(() => {
                    useSyncStore.getState().updateServerFolder(mockFolder);
                    useSyncStore.getState().removeServerFolder('folder-1');
                });

                expect(useSyncStore.getState().serverFolders.size).toBe(0);
            });
        });

        describe('clearServerData', () => {
            it('should clear all server documents and folders', () => {
                act(() => {
                    useSyncStore.getState().updateServerDocument(mockDocument);
                    useSyncStore.getState().updateServerFolder(mockFolder);
                    useSyncStore.getState().clearServerData();
                });

                expect(useSyncStore.getState().serverDocuments.size).toBe(0);
                expect(useSyncStore.getState().serverFolders.size).toBe(0);
            });
        });
    });

    describe('getters', () => {
        describe('hasPendingChanges', () => {
            it('should return false when queue is empty', () => {
                expect(useSyncStore.getState().hasPendingChanges()).toBe(false);
            });

            it('should return true when queue has items', () => {
                act(() => {
                    useSyncStore.getState().addToQueue({
                        id: 'doc-1',
                        type: 'document',
                        operation: 'upsert',
                        data: { id: 'doc-1' }
                    });
                });

                expect(useSyncStore.getState().hasPendingChanges()).toBe(true);
            });
        });

        describe('getPendingCount', () => {
            it('should return 0 when queue is empty', () => {
                expect(useSyncStore.getState().getPendingCount()).toBe(0);
            });

            it('should return correct count', () => {
                act(() => {
                    useSyncStore.getState().addToQueue({
                        id: 'doc-1',
                        type: 'document',
                        operation: 'upsert',
                        data: { id: 'doc-1' }
                    });
                    useSyncStore.getState().addToQueue({
                        id: 'doc-2',
                        type: 'folder',
                        operation: 'upsert',
                        data: { id: 'doc-2' }
                    });
                });

                expect(useSyncStore.getState().getPendingCount()).toBe(2);
            });
        });

        describe('getConflictCount', () => {
            it('should return 0 when no conflicts', () => {
                expect(useSyncStore.getState().getConflictCount()).toBe(0);
            });

            it('should count only unresolved conflicts', () => {
                const mockDocForConflict: SyncDocument = {
                    id: 'doc-1',
                    userId: 'user-1',
                    name: 'Test',
                    content: 'local',
                    folderId: null,
                    isManuallyNamed: false,
                    cursor: null,
                    scroll: null,
                    syncVersion: 1,
                    createdAt: '2024-01-15T09:00:00Z',
                    updatedAt: '2024-01-15T09:00:00Z',
                    syncedAt: null,
                    deletedAt: null
                };
                const conflict1: SyncConflict = {
                    documentId: 'doc-1',
                    localDocument: mockDocForConflict,
                    serverDocument: { ...mockDocForConflict, content: 'server', updatedAt: '2024-01-15T10:00:00Z' }
                };
                const conflict2: SyncConflict = {
                    ...conflict1,
                    documentId: 'doc-2',
                    resolution: 'local',
                    resolvedAt: '2024-01-15T12:00:00Z'
                };

                act(() => {
                    useSyncStore.getState().addConflict(conflict1);
                    useSyncStore.setState((state) => ({
                        conflicts: [...state.conflicts, conflict2]
                    }));
                });

                expect(useSyncStore.getState().getConflictCount()).toBe(1);
            });
        });
    });
});
