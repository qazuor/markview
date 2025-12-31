import {
    destroySyncService,
    forceSyncNow,
    initSyncService,
    initialSync,
    isOnlineStatus,
    processQueue,
    queueDocumentDelete,
    queueDocumentSync,
    queueFolderDelete,
    queueFolderSync,
    resolveConflict,
    startAutoSync,
    stopAutoSync,
    syncAll,
    syncService
} from '@/services/sync/sync';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock stores
const mockSyncStore = vi.hoisted(() => ({
    syncState: 'idle' as string,
    lastSyncedAt: null as string | null,
    pendingQueue: [] as Array<{ id: string; type: string; operation: string; timestamp: number; retries: number; data: unknown }>,
    isProcessingQueue: false,
    serverDocuments: new Map(),
    serverFolders: new Map(),
    conflicts: [],
    activeConflict: null,
    setSyncState: vi.fn(),
    setSyncError: vi.fn(),
    setLastSyncedAt: vi.fn(),
    setProcessingQueue: vi.fn(),
    addToQueue: vi.fn(),
    removeFromQueue: vi.fn(),
    incrementRetries: vi.fn(),
    updateServerDocuments: vi.fn(),
    updateServerFolders: vi.fn(),
    updateServerDocument: vi.fn(),
    updateServerFolder: vi.fn(),
    removeServerDocument: vi.fn(),
    removeServerFolder: vi.fn(),
    addConflict: vi.fn(),
    setActiveConflict: vi.fn(),
    resolveConflict: vi.fn()
}));

const mockSettingsStore = vi.hoisted(() => ({
    cloudSyncEnabled: true,
    cloudSyncOnAppOpen: true,
    cloudSyncDebounceMs: 2000
}));

const mockDocumentStore = vi.hoisted(() => ({
    documents: new Map()
}));

vi.mock('@/stores/syncStore', () => ({
    useSyncStore: {
        getState: () => mockSyncStore
    }
}));

vi.mock('@/stores/settingsStore', () => ({
    useSettingsStore: {
        getState: () => mockSettingsStore
    }
}));

vi.mock('@/stores/documentStore', () => ({
    useDocumentStore: {
        getState: () => mockDocumentStore
    }
}));

// Mock sync API
const mockSyncApi = vi.hoisted(() => ({
    documents: {
        fetch: vi.fn(),
        upsert: vi.fn(),
        delete: vi.fn()
    },
    folders: {
        fetch: vi.fn(),
        upsert: vi.fn(),
        delete: vi.fn()
    },
    status: vi.fn()
}));

vi.mock('@/services/sync/api', () => ({
    syncApi: mockSyncApi,
    SyncConflictError: class SyncConflictError extends Error {
        constructor(
            message: string,
            public serverVersion: number,
            public serverDocument: unknown
        ) {
            super(message);
            this.name = 'SyncConflictError';
        }
    }
}));

// Mock sync queue
const mockSyncQueue = vi.hoisted(() => ({
    add: vi.fn(),
    remove: vi.fn(),
    update: vi.fn(),
    getAll: vi.fn().mockResolvedValue([])
}));

vi.mock('@/services/sync/queue', () => ({
    syncQueue: mockSyncQueue
}));

// Mock conflict resolver
const mockConflictResolver = vi.hoisted(() => ({
    create: vi.fn(),
    resolveWithLocal: vi.fn(),
    resolveWithServer: vi.fn()
}));

vi.mock('@/services/sync/conflict', () => ({
    conflictResolver: mockConflictResolver
}));

describe('Sync Service', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers();

        // Reset store state
        mockSyncStore.syncState = 'idle';
        mockSyncStore.lastSyncedAt = null;
        mockSyncStore.pendingQueue = [];
        mockSyncStore.isProcessingQueue = false;
        mockSyncStore.serverDocuments = new Map();
        mockSyncStore.serverFolders = new Map();

        // Reset settings
        mockSettingsStore.cloudSyncEnabled = true;
        mockSettingsStore.cloudSyncOnAppOpen = true;
        mockSettingsStore.cloudSyncDebounceMs = 2000;

        // Reset API mocks
        mockSyncApi.documents.fetch.mockResolvedValue({ documents: [], syncedAt: new Date().toISOString() });
        mockSyncApi.folders.fetch.mockResolvedValue({ folders: [], syncedAt: new Date().toISOString() });
    });

    afterEach(() => {
        vi.useRealTimers();
        destroySyncService();
    });

    describe('initSyncService', () => {
        it('should initialize without error', () => {
            expect(() => initSyncService()).not.toThrow();
        });

        it('should set offline state when navigator is offline', () => {
            Object.defineProperty(navigator, 'onLine', { value: false, configurable: true });

            initSyncService();

            expect(mockSyncStore.setSyncState).toHaveBeenCalledWith('offline');

            Object.defineProperty(navigator, 'onLine', { value: true, configurable: true });
        });
    });

    describe('destroySyncService', () => {
        it('should cleanup without error', () => {
            initSyncService();
            expect(() => destroySyncService()).not.toThrow();
        });

        it('should stop auto sync', () => {
            startAutoSync();
            destroySyncService();
            // Auto sync interval should be cleared
        });
    });

    describe('startAutoSync', () => {
        it('should start auto sync interval', () => {
            startAutoSync();

            // Advance timer to trigger sync
            vi.advanceTimersByTime(30000);

            expect(mockSyncStore.setSyncState).toHaveBeenCalled();
        });

        it('should not start multiple intervals', () => {
            startAutoSync();
            startAutoSync(); // Should not create another interval

            vi.advanceTimersByTime(30000);
            // Should only sync once
        });
    });

    describe('stopAutoSync', () => {
        it('should stop auto sync', () => {
            startAutoSync();
            stopAutoSync();

            vi.advanceTimersByTime(60000);
            // Should not trigger sync after stop
        });
    });

    describe('initialSync', () => {
        it('should perform initial sync when enabled', async () => {
            await initialSync();

            expect(mockSyncStore.setSyncState).toHaveBeenCalledWith('syncing');
            expect(mockSyncApi.documents.fetch).toHaveBeenCalled();
            expect(mockSyncApi.folders.fetch).toHaveBeenCalled();
        });

        it('should skip when cloud sync is disabled', async () => {
            mockSettingsStore.cloudSyncEnabled = false;

            await initialSync();

            expect(mockSyncApi.documents.fetch).not.toHaveBeenCalled();
        });

        it('should skip when sync on app open is disabled', async () => {
            mockSettingsStore.cloudSyncOnAppOpen = false;

            await initialSync();

            expect(mockSyncApi.documents.fetch).not.toHaveBeenCalled();
        });

        it('should handle API errors', async () => {
            mockSyncApi.documents.fetch.mockRejectedValue(new Error('Network error'));

            await initialSync();

            expect(mockSyncStore.setSyncError).toHaveBeenCalledWith('Network error');
        });
    });

    describe('syncAll', () => {
        it('should sync all documents and folders', async () => {
            await syncAll();

            expect(mockSyncStore.setSyncState).toHaveBeenCalledWith('syncing');
            expect(mockSyncApi.documents.fetch).toHaveBeenCalled();
            expect(mockSyncApi.folders.fetch).toHaveBeenCalled();
        });

        it('should use delta sync when lastSyncedAt is set', async () => {
            mockSyncStore.lastSyncedAt = '2024-01-01T00:00:00Z';

            await syncAll();

            expect(mockSyncApi.documents.fetch).toHaveBeenCalledWith('2024-01-01T00:00:00Z');
        });

        it('should skip when sync is disabled', async () => {
            mockSettingsStore.cloudSyncEnabled = false;

            await syncAll();

            expect(mockSyncApi.documents.fetch).not.toHaveBeenCalled();
        });

        it('should handle errors gracefully', async () => {
            mockSyncApi.documents.fetch.mockRejectedValue(new Error('Sync error'));

            await syncAll();

            expect(mockSyncStore.setSyncError).toHaveBeenCalledWith('Sync error');
        });
    });

    describe('processQueue', () => {
        it('should process pending queue items', async () => {
            mockSyncStore.pendingQueue = [
                {
                    id: 'doc-1',
                    type: 'document',
                    operation: 'upsert',
                    data: { id: 'doc-1', name: 'Test', content: '# Test' },
                    timestamp: Date.now(),
                    retries: 0
                }
            ];

            mockSyncApi.documents.upsert.mockResolvedValue({
                document: { id: 'doc-1', name: 'Test', syncVersion: 1 }
            });

            await processQueue();

            expect(mockSyncStore.setProcessingQueue).toHaveBeenCalledWith(true);
            expect(mockSyncApi.documents.upsert).toHaveBeenCalled();
        });

        it('should skip when already processing', async () => {
            mockSyncStore.isProcessingQueue = true;
            mockSyncStore.pendingQueue = [
                { id: 'doc-1', type: 'document', operation: 'upsert', data: {}, timestamp: Date.now(), retries: 0 }
            ];

            await processQueue();

            expect(mockSyncApi.documents.upsert).not.toHaveBeenCalled();
        });

        it('should skip when queue is empty', async () => {
            mockSyncStore.pendingQueue = [];

            await processQueue();

            expect(mockSyncStore.setSyncState).toHaveBeenCalledWith('synced');
            expect(mockSyncStore.setProcessingQueue).not.toHaveBeenCalled();
        });

        it('should skip items that exceeded max retries', async () => {
            mockSyncStore.pendingQueue = [
                {
                    id: 'doc-1',
                    type: 'document',
                    operation: 'upsert',
                    data: { id: 'doc-1' },
                    timestamp: Date.now(),
                    retries: 3
                }
            ];

            await processQueue();

            expect(mockSyncQueue.remove).toHaveBeenCalledWith('doc-1');
        });

        it('should handle delete operations', async () => {
            mockSyncStore.pendingQueue = [
                {
                    id: 'doc-1',
                    type: 'document',
                    operation: 'delete',
                    data: { id: 'doc-1' },
                    timestamp: Date.now(),
                    retries: 0
                }
            ];

            await processQueue();

            expect(mockSyncApi.documents.delete).toHaveBeenCalledWith('doc-1');
        });

        it('should handle folder operations', async () => {
            mockSyncStore.pendingQueue = [
                {
                    id: 'folder-1',
                    type: 'folder',
                    operation: 'upsert',
                    data: { id: 'folder-1', name: 'Test Folder' },
                    timestamp: Date.now(),
                    retries: 0
                }
            ];

            mockSyncApi.folders.upsert.mockResolvedValue({
                folder: { id: 'folder-1', name: 'Test Folder' }
            });

            await processQueue();

            expect(mockSyncApi.folders.upsert).toHaveBeenCalled();
        });
    });

    describe('queueDocumentSync', () => {
        it('should add document to queue', async () => {
            const document = { id: 'doc-1', name: 'Test', content: '# Test' };

            await queueDocumentSync(document);

            expect(mockSyncStore.addToQueue).toHaveBeenCalled();
            expect(mockSyncQueue.add).toHaveBeenCalled();
        });

        it('should skip when sync is disabled', async () => {
            mockSettingsStore.cloudSyncEnabled = false;

            await queueDocumentSync({ id: 'doc-1', name: 'Test', content: '' });

            expect(mockSyncStore.addToQueue).not.toHaveBeenCalled();
        });

        it('should debounce sync', async () => {
            await queueDocumentSync({ id: 'doc-1', name: 'Test', content: '' });

            // Queue should be added immediately, but sync should be debounced
            expect(mockSyncStore.addToQueue).toHaveBeenCalled();
        });
    });

    describe('queueDocumentDelete', () => {
        it('should add delete to queue', async () => {
            await queueDocumentDelete('doc-1');

            expect(mockSyncStore.addToQueue).toHaveBeenCalledWith(
                expect.objectContaining({
                    id: 'doc-1',
                    type: 'document',
                    operation: 'delete'
                })
            );
        });

        it('should skip when sync is disabled', async () => {
            mockSettingsStore.cloudSyncEnabled = false;

            await queueDocumentDelete('doc-1');

            expect(mockSyncStore.addToQueue).not.toHaveBeenCalled();
        });
    });

    describe('queueFolderSync', () => {
        it('should add folder to queue', () => {
            const folder = {
                id: 'folder-1',
                name: 'Test Folder',
                userId: 'user-1',
                parentId: null,
                color: null,
                sortOrder: 0,
                createdAt: '',
                updatedAt: '',
                deletedAt: null
            };

            queueFolderSync(folder);

            expect(mockSyncStore.addToQueue).toHaveBeenCalledWith(
                expect.objectContaining({
                    id: 'folder-1',
                    type: 'folder',
                    operation: 'upsert'
                })
            );
        });

        it('should skip when sync is disabled', () => {
            mockSettingsStore.cloudSyncEnabled = false;

            queueFolderSync({
                id: 'folder-1',
                name: 'Test',
                userId: '',
                parentId: null,
                color: null,
                sortOrder: 0,
                createdAt: '',
                updatedAt: '',
                deletedAt: null
            });

            expect(mockSyncStore.addToQueue).not.toHaveBeenCalled();
        });
    });

    describe('queueFolderDelete', () => {
        it('should add folder delete to queue', () => {
            queueFolderDelete('folder-1');

            expect(mockSyncStore.addToQueue).toHaveBeenCalledWith(
                expect.objectContaining({
                    id: 'folder-1',
                    type: 'folder',
                    operation: 'delete'
                })
            );
        });

        it('should skip when sync is disabled', () => {
            mockSettingsStore.cloudSyncEnabled = false;

            queueFolderDelete('folder-1');

            expect(mockSyncStore.addToQueue).not.toHaveBeenCalled();
        });
    });

    describe('resolveConflict', () => {
        const localDoc = {
            id: 'doc-1',
            userId: 'user-1',
            name: 'Local',
            content: 'Local content',
            folderId: null,
            isManuallyNamed: false,
            cursor: null,
            scroll: null,
            syncVersion: 1,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            syncedAt: null,
            deletedAt: null
        };

        const serverDoc = {
            ...localDoc,
            name: 'Server',
            content: 'Server content',
            syncVersion: 2
        };

        it('should resolve with local version', async () => {
            mockConflictResolver.resolveWithLocal.mockReturnValue({
                resolvedDocument: { ...localDoc, syncVersion: 3 }
            });

            await resolveConflict('doc-1', 'local', localDoc, serverDoc);

            expect(mockConflictResolver.resolveWithLocal).toHaveBeenCalled();
            expect(mockSyncStore.resolveConflict).toHaveBeenCalledWith('doc-1', 'local');
        });

        it('should resolve with server version', async () => {
            mockConflictResolver.resolveWithServer.mockReturnValue({
                resolvedDocument: serverDoc
            });

            await resolveConflict('doc-1', 'server', localDoc, serverDoc);

            expect(mockConflictResolver.resolveWithServer).toHaveBeenCalled();
            expect(mockSyncStore.updateServerDocument).toHaveBeenCalled();
        });

        it('should resolve with both versions', async () => {
            await resolveConflict('doc-1', 'both', localDoc, serverDoc);

            expect(mockSyncStore.updateServerDocument).toHaveBeenCalledWith(serverDoc);
            expect(mockSyncStore.resolveConflict).toHaveBeenCalledWith('doc-1', 'both');
        });
    });

    describe('forceSyncNow', () => {
        it('should sync immediately', () => {
            forceSyncNow();

            expect(mockSyncStore.setSyncState).toHaveBeenCalledWith('syncing');
        });

        it('should clear pending debounce', async () => {
            await queueDocumentSync({ id: 'doc-1', name: 'Test', content: '' });

            forceSyncNow();

            // Debounce should be cleared and sync should start immediately
            expect(mockSyncStore.setSyncState).toHaveBeenCalledWith('syncing');
        });
    });

    describe('isOnlineStatus', () => {
        it('should return online status', () => {
            const status = isOnlineStatus();

            expect(typeof status).toBe('boolean');
        });
    });

    describe('syncService export', () => {
        it('should export all functions', () => {
            expect(syncService.init).toBe(initSyncService);
            expect(syncService.destroy).toBe(destroySyncService);
            expect(syncService.startAutoSync).toBe(startAutoSync);
            expect(syncService.stopAutoSync).toBe(stopAutoSync);
            expect(syncService.initialSync).toBe(initialSync);
            expect(syncService.syncAll).toBe(syncAll);
            expect(syncService.processQueue).toBe(processQueue);
            expect(syncService.queueDocumentSync).toBe(queueDocumentSync);
            expect(syncService.queueDocumentDelete).toBe(queueDocumentDelete);
            expect(syncService.queueFolderSync).toBe(queueFolderSync);
            expect(syncService.queueFolderDelete).toBe(queueFolderDelete);
            expect(syncService.resolveConflict).toBe(resolveConflict);
            expect(syncService.forceSyncNow).toBe(forceSyncNow);
            expect(syncService.isOnline).toBe(isOnlineStatus);
        });
    });

    describe('online/offline handling', () => {
        it('should handle going offline', () => {
            initSyncService();

            window.dispatchEvent(new Event('offline'));

            expect(mockSyncStore.setSyncState).toHaveBeenCalledWith('offline');
        });

        it('should handle coming online', () => {
            initSyncService();
            mockSyncStore.syncState = 'offline';

            window.dispatchEvent(new Event('online'));

            expect(mockSyncStore.setSyncState).toHaveBeenCalledWith('idle');
        });
    });
});
