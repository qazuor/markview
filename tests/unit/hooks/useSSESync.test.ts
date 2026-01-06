import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock the auth client
vi.mock('@/lib/auth-client', () => ({
    useSession: vi.fn(() => ({ data: null, isPending: false }))
}));

// Mock SSE service
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockSseService: any = {
    connect: vi.fn(),
    disconnect: vi.fn(),
    getDeviceId: vi.fn(() => 'test-device-id'),
    onStateChange: vi.fn(() => vi.fn()),
    onEvent: vi.fn(() => vi.fn()),
    getConnectionId: vi.fn(() => null)
};

vi.mock('@/services/sync/sse', () => ({
    sseService: mockSseService
}));

// Mock sync API
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockSyncApi: any = {
    documents: {
        fetch: vi.fn(() => Promise.resolve({ documents: [] }))
    },
    folders: {
        fetch: vi.fn(() => Promise.resolve({ folders: [] }))
    },
    session: {
        fetch: vi.fn(() => Promise.resolve({ openDocumentIds: [], activeDocumentId: null })),
        update: vi.fn(() => Promise.resolve())
    }
};

vi.mock('@/services/sync/api', () => ({
    syncApi: mockSyncApi
}));

// Mock document store
const mockDocumentStore = {
    documents: new Map(),
    activeDocumentId: null,
    addSyncedDocument: vi.fn(),
    closeDocument: vi.fn()
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockUseDocumentStore: any = vi.fn((selector) => {
    if (typeof selector === 'function') {
        return selector(mockDocumentStore);
    }
    return mockDocumentStore;
});
// Add subscribe method to the hook itself (Zustand pattern)
mockUseDocumentStore.subscribe = vi.fn(() => vi.fn());
mockUseDocumentStore.getState = vi.fn(() => mockDocumentStore);

vi.mock('@/stores/documentStore', () => ({
    useDocumentStore: mockUseDocumentStore
}));

// Mock folder store
const mockFolderStore = {
    addSyncedFolder: vi.fn(),
    deleteFolder: vi.fn()
};

vi.mock('@/stores/folderStore', () => ({
    useFolderStore: vi.fn((selector) => {
        if (typeof selector === 'function') {
            return selector(mockFolderStore);
        }
        return mockFolderStore;
    })
}));

// Mock session sync store
const mockSessionSyncStore = {
    connectionState: 'disconnected',
    isSyncing: false,
    lastSyncError: null,
    setConnectionState: vi.fn(),
    setConnectionId: vi.fn(),
    setIsSyncing: vi.fn(),
    setSyncError: vi.fn(),
    updateHeartbeat: vi.fn()
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockUseSessionSyncStore: any = vi.fn((selector) => {
    if (typeof selector === 'function') {
        return selector(mockSessionSyncStore);
    }
    return mockSessionSyncStore;
});
mockUseSessionSyncStore.getState = vi.fn(() => mockSessionSyncStore);

vi.mock('@/stores/sessionSyncStore', () => ({
    useSessionSyncStore: mockUseSessionSyncStore
}));

describe('useSSESync', () => {
    let useSSESync: typeof import('@/hooks/useSSESync').useSSESync;
    let useSession: typeof import('@/lib/auth-client').useSession;

    beforeEach(async () => {
        vi.clearAllMocks();

        // Reset mocks
        mockDocumentStore.documents = new Map();
        mockDocumentStore.activeDocumentId = null;
        mockSessionSyncStore.connectionState = 'disconnected';
        mockSessionSyncStore.isSyncing = false;
        mockSessionSyncStore.lastSyncError = null;

        // Import fresh module
        const module = await import('@/hooks/useSSESync');
        useSSESync = module.useSSESync;

        const authModule = await import('@/lib/auth-client');
        useSession = authModule.useSession as typeof useSession;
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe('when not authenticated', () => {
        it('should not connect to SSE', () => {
            vi.mocked(useSession).mockReturnValue({ data: null, isPending: false } as never);

            renderHook(() => useSSESync());

            expect(mockSseService.connect).not.toHaveBeenCalled();
            expect(mockSseService.disconnect).toHaveBeenCalled();
        });

        it('should return disconnected state', () => {
            vi.mocked(useSession).mockReturnValue({ data: null, isPending: false } as never);

            const { result } = renderHook(() => useSSESync());

            expect(result.current.isConnected).toBe(false);
            expect(result.current.connectionState).toBe('disconnected');
        });
    });

    describe('when authenticated', () => {
        beforeEach(() => {
            vi.mocked(useSession).mockReturnValue({
                data: { user: { id: 'user-1' } },
                isPending: false
            } as never);
        });

        it('should connect to SSE', () => {
            renderHook(() => useSSESync());

            expect(mockSseService.connect).toHaveBeenCalled();
        });

        it('should subscribe to SSE events', () => {
            renderHook(() => useSSESync());

            expect(mockSseService.onEvent).toHaveBeenCalledWith('connected', expect.any(Function));
            expect(mockSseService.onEvent).toHaveBeenCalledWith('heartbeat', expect.any(Function));
            expect(mockSseService.onEvent).toHaveBeenCalledWith('document:updated', expect.any(Function));
            expect(mockSseService.onEvent).toHaveBeenCalledWith('document:deleted', expect.any(Function));
            expect(mockSseService.onEvent).toHaveBeenCalledWith('session:updated', expect.any(Function));
            expect(mockSseService.onEvent).toHaveBeenCalledWith('folder:updated', expect.any(Function));
            expect(mockSseService.onEvent).toHaveBeenCalledWith('folder:deleted', expect.any(Function));
        });

        it('should subscribe to state changes', () => {
            renderHook(() => useSSESync());

            expect(mockSseService.onStateChange).toHaveBeenCalled();
        });

        it('should disconnect on unmount', () => {
            const { unmount } = renderHook(() => useSSESync());

            unmount();

            expect(mockSseService.disconnect).toHaveBeenCalled();
        });

        it('should return device ID', () => {
            const { result } = renderHook(() => useSSESync());

            expect(result.current.deviceId).toBe('test-device-id');
        });
    });

    describe('auth state changes', () => {
        it('should disconnect when logging out', () => {
            vi.mocked(useSession).mockReturnValue({
                data: { user: { id: 'user-1' } },
                isPending: false
            } as never);

            const { rerender } = renderHook(() => useSSESync());

            // Simulate logout
            vi.mocked(useSession).mockReturnValue({ data: null, isPending: false } as never);
            rerender();

            expect(mockSseService.disconnect).toHaveBeenCalled();
        });
    });

    describe('document sync', () => {
        beforeEach(() => {
            vi.mocked(useSession).mockReturnValue({
                data: { user: { id: 'user-1' } },
                isPending: false
            } as never);
        });

        it('should add synced document when fetched from server', async () => {
            const serverDoc = {
                id: 'doc-1',
                name: 'Test',
                content: 'Content',
                folderId: null,
                syncVersion: 1,
                syncedAt: null,
                createdAt: '2024-01-15T10:00:00Z',
                updatedAt: '2024-01-15T10:00:00Z',
                deletedAt: null
            };

            mockSyncApi.documents.fetch.mockResolvedValueOnce({ documents: [serverDoc] });
            mockSyncApi.session.fetch.mockResolvedValueOnce({ openDocumentIds: ['doc-1'], activeDocumentId: null });

            // Capture the state change callback
            let stateChangeCallback: ((state: string) => void) | undefined;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            mockSseService.onStateChange.mockImplementation((callback: any) => {
                stateChangeCallback = callback;
                return vi.fn();
            });

            renderHook(() => useSSESync());

            // Simulate connected state
            if (stateChangeCallback) {
                stateChangeCallback('connected');
            }

            await waitFor(() => {
                expect(mockSyncApi.documents.fetch).toHaveBeenCalled();
            });
        });
    });

    describe('folder sync', () => {
        beforeEach(() => {
            vi.mocked(useSession).mockReturnValue({
                data: { user: { id: 'user-1' } },
                isPending: false
            } as never);
        });

        it('should fetch folders on connect', async () => {
            // Capture the state change callback
            let stateChangeCallback: ((state: string) => void) | undefined;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            mockSseService.onStateChange.mockImplementation((callback: any) => {
                stateChangeCallback = callback;
                return vi.fn();
            });

            renderHook(() => useSSESync());

            // Simulate connected state
            if (stateChangeCallback) {
                stateChangeCallback('connected');
            }

            await waitFor(() => {
                expect(mockSyncApi.folders.fetch).toHaveBeenCalled();
            });
        });

        it('should add synced folders from server', async () => {
            const serverFolder = {
                id: 'folder-1',
                name: 'Test Folder',
                parentId: null,
                color: '#ff0000',
                icon: 'star',
                sortOrder: 0,
                createdAt: '2024-01-15T10:00:00Z',
                updatedAt: '2024-01-15T10:00:00Z',
                deletedAt: null
            };

            mockSyncApi.folders.fetch.mockResolvedValueOnce({ folders: [serverFolder] });

            // Capture the state change callback
            let stateChangeCallback: ((state: string) => void) | undefined;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            mockSseService.onStateChange.mockImplementation((callback: any) => {
                stateChangeCallback = callback;
                return vi.fn();
            });

            renderHook(() => useSSESync());

            // Simulate connected state
            if (stateChangeCallback) {
                stateChangeCallback('connected');
            }

            await waitFor(() => {
                expect(mockFolderStore.addSyncedFolder).toHaveBeenCalled();
            });
        });
    });

    describe('return values', () => {
        it('should return correct initial values', () => {
            vi.mocked(useSession).mockReturnValue({ data: null, isPending: false } as never);

            const { result } = renderHook(() => useSSESync());

            expect(result.current).toHaveProperty('isConnected');
            expect(result.current).toHaveProperty('connectionState');
            expect(result.current).toHaveProperty('isSyncing');
            expect(result.current).toHaveProperty('syncError');
            expect(result.current).toHaveProperty('deviceId');
        });
    });
});
