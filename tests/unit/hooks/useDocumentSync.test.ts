import { useDocumentSync } from '@/hooks/useDocumentSync';
import type { Document } from '@/types';
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock useAuth
const mockUseAuth = vi.fn();
vi.mock('@/components/auth/AuthProvider', () => ({
    useAuth: () => mockUseAuth()
}));

// Mock sync service - must use vi.hoisted for proper hoisting
const mockSyncService = vi.hoisted(() => ({
    init: vi.fn(),
    destroy: vi.fn(),
    startAutoSync: vi.fn(),
    stopAutoSync: vi.fn(),
    initialSync: vi.fn(),
    queueDocumentSync: vi.fn(),
    queueDocumentDelete: vi.fn(),
    forceSyncNow: vi.fn(),
    isOnline: vi.fn(() => true)
}));
vi.mock('@/services/sync', () => ({
    syncService: mockSyncService
}));

// Mock sync store - must use vi.hoisted for proper hoisting
const mockSyncStore = vi.hoisted(() => ({
    syncState: 'idle' as 'idle' | 'syncing' | 'error',
    lastSyncedAt: null as string | null,
    getPendingCount: vi.fn(() => 0),
    getQueueItem: vi.fn()
}));
const mockUseSyncStore = vi.hoisted(() => {
    const fn = (selector: (state: typeof mockSyncStore) => unknown) => {
        if (typeof selector === 'function') {
            return selector(mockSyncStore);
        }
        return mockSyncStore;
    };
    fn.getState = () => mockSyncStore;
    return fn;
});
vi.mock('@/stores/syncStore', () => ({
    useSyncStore: mockUseSyncStore
}));

describe('useDocumentSync', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockUseAuth.mockReturnValue({ isAuthenticated: false });
        mockSyncService.isOnline.mockReturnValue(true);
    });

    describe('initialization', () => {
        it('should initialize sync service on mount', () => {
            renderHook(() => useDocumentSync());

            expect(mockSyncService.init).toHaveBeenCalled();
        });

        it('should destroy sync service on unmount', () => {
            const { unmount } = renderHook(() => useDocumentSync());

            unmount();

            expect(mockSyncService.destroy).toHaveBeenCalled();
        });
    });

    describe('auto sync based on auth', () => {
        it('should start auto sync when authenticated and autoSync enabled', () => {
            mockUseAuth.mockReturnValue({ isAuthenticated: true });

            renderHook(() => useDocumentSync({ autoSync: true }));

            expect(mockSyncService.startAutoSync).toHaveBeenCalled();
        });

        it('should not start auto sync when not authenticated', () => {
            mockUseAuth.mockReturnValue({ isAuthenticated: false });

            renderHook(() => useDocumentSync({ autoSync: true }));

            expect(mockSyncService.startAutoSync).not.toHaveBeenCalled();
        });

        it('should stop auto sync when autoSync disabled', () => {
            mockUseAuth.mockReturnValue({ isAuthenticated: true });

            renderHook(() => useDocumentSync({ autoSync: false }));

            expect(mockSyncService.stopAutoSync).toHaveBeenCalled();
        });

        it('should stop auto sync on unmount', () => {
            mockUseAuth.mockReturnValue({ isAuthenticated: true });

            const { unmount } = renderHook(() => useDocumentSync({ autoSync: true }));
            unmount();

            expect(mockSyncService.stopAutoSync).toHaveBeenCalled();
        });
    });

    describe('initial sync on login', () => {
        it('should trigger initial sync when user logs in', () => {
            const { rerender } = renderHook(() => useDocumentSync());

            // Start not authenticated
            mockUseAuth.mockReturnValue({ isAuthenticated: false });
            rerender();

            // Now authenticated
            mockUseAuth.mockReturnValue({ isAuthenticated: true });
            rerender();

            expect(mockSyncService.initialSync).toHaveBeenCalled();
        });

        it('should not trigger initial sync if already authenticated', () => {
            mockUseAuth.mockReturnValue({ isAuthenticated: true });

            renderHook(() => useDocumentSync());

            // initialSync should NOT be called because user was already authenticated
            expect(mockSyncService.initialSync).not.toHaveBeenCalled();
        });
    });

    describe('state', () => {
        it('should return sync state from store', () => {
            const { result } = renderHook(() => useDocumentSync());

            expect(result.current.syncState).toBe('idle');
        });

        it('should return lastSyncedAt from store', () => {
            mockSyncStore.lastSyncedAt = '2024-01-01T00:00:00Z';

            const { result } = renderHook(() => useDocumentSync());

            expect(result.current.lastSyncedAt).toBe('2024-01-01T00:00:00Z');
        });

        it('should return pending count from store', () => {
            mockSyncStore.getPendingCount.mockReturnValue(5);

            const { result } = renderHook(() => useDocumentSync());

            expect(result.current.pendingCount).toBe(5);
        });

        it('should return online status', () => {
            mockSyncService.isOnline.mockReturnValue(true);

            const { result } = renderHook(() => useDocumentSync());

            expect(result.current.isOnline).toBe(true);
        });

        it('should return authentication status', () => {
            mockUseAuth.mockReturnValue({ isAuthenticated: true });

            const { result } = renderHook(() => useDocumentSync());

            expect(result.current.isAuthenticated).toBe(true);
        });

        it('should compute canSync correctly', () => {
            mockUseAuth.mockReturnValue({ isAuthenticated: true });
            mockSyncService.isOnline.mockReturnValue(true);

            const { result } = renderHook(() => useDocumentSync());

            expect(result.current.canSync).toBe(true);
        });

        it('should return canSync false when not authenticated', () => {
            mockUseAuth.mockReturnValue({ isAuthenticated: false });
            mockSyncService.isOnline.mockReturnValue(true);

            const { result } = renderHook(() => useDocumentSync());

            expect(result.current.canSync).toBe(false);
        });

        it('should return canSync false when offline', () => {
            mockUseAuth.mockReturnValue({ isAuthenticated: true });
            mockSyncService.isOnline.mockReturnValue(false);

            const { result } = renderHook(() => useDocumentSync());

            expect(result.current.canSync).toBe(false);
        });
    });

    describe('queueDocumentChange', () => {
        const createDocument = (): Document => ({
            id: 'doc-1',
            name: 'test.md',
            content: '# Test',
            source: 'local',
            syncStatus: 'synced',
            createdAt: '2024-01-01T00:00:00Z',
            modifiedAt: '2024-01-01T00:00:00Z',
            isManuallyNamed: false,
            cursor: { line: 1, col: 1 },
            scroll: { x: 0, y: 0 }
        });

        it('should queue document for sync when authenticated', () => {
            mockUseAuth.mockReturnValue({ isAuthenticated: true });
            const document = createDocument();

            const { result } = renderHook(() => useDocumentSync());

            act(() => {
                result.current.queueDocumentChange(document);
            });

            expect(mockSyncService.queueDocumentSync).toHaveBeenCalledWith({
                id: 'doc-1',
                name: 'test.md',
                content: '# Test',
                folderId: null,
                isManuallyNamed: false,
                cursor: { line: 1, col: 1 },
                scroll: { x: 0, y: 0 },
                syncVersion: 0
            });
        });

        it('should not queue document when not authenticated', () => {
            mockUseAuth.mockReturnValue({ isAuthenticated: false });
            const document = createDocument();

            const { result } = renderHook(() => useDocumentSync());

            act(() => {
                result.current.queueDocumentChange(document);
            });

            expect(mockSyncService.queueDocumentSync).not.toHaveBeenCalled();
        });

        it('should include folderId if present', () => {
            mockUseAuth.mockReturnValue({ isAuthenticated: true });
            const document = { ...createDocument(), folderId: 'folder-1' };

            const { result } = renderHook(() => useDocumentSync());

            act(() => {
                result.current.queueDocumentChange(document);
            });

            expect(mockSyncService.queueDocumentSync).toHaveBeenCalledWith(expect.objectContaining({ folderId: 'folder-1' }));
        });

        it('should include syncVersion if present', () => {
            mockUseAuth.mockReturnValue({ isAuthenticated: true });
            const document = { ...createDocument(), syncVersion: 5 };

            const { result } = renderHook(() => useDocumentSync());

            act(() => {
                result.current.queueDocumentChange(document);
            });

            expect(mockSyncService.queueDocumentSync).toHaveBeenCalledWith(expect.objectContaining({ syncVersion: 5 }));
        });
    });

    describe('queueDocumentDelete', () => {
        it('should queue document deletion when authenticated', () => {
            mockUseAuth.mockReturnValue({ isAuthenticated: true });

            const { result } = renderHook(() => useDocumentSync());

            act(() => {
                result.current.queueDocumentDelete('doc-1');
            });

            expect(mockSyncService.queueDocumentDelete).toHaveBeenCalledWith('doc-1');
        });

        it('should not queue deletion when not authenticated', () => {
            mockUseAuth.mockReturnValue({ isAuthenticated: false });

            const { result } = renderHook(() => useDocumentSync());

            act(() => {
                result.current.queueDocumentDelete('doc-1');
            });

            expect(mockSyncService.queueDocumentDelete).not.toHaveBeenCalled();
        });
    });

    describe('syncNow', () => {
        it('should force sync when authenticated', async () => {
            mockUseAuth.mockReturnValue({ isAuthenticated: true });
            mockSyncService.forceSyncNow.mockResolvedValue(undefined);

            const { result } = renderHook(() => useDocumentSync());

            await act(async () => {
                await result.current.syncNow();
            });

            expect(mockSyncService.forceSyncNow).toHaveBeenCalled();
        });

        it('should not sync when not authenticated', async () => {
            mockUseAuth.mockReturnValue({ isAuthenticated: false });

            const { result } = renderHook(() => useDocumentSync());

            await act(async () => {
                await result.current.syncNow();
            });

            expect(mockSyncService.forceSyncNow).not.toHaveBeenCalled();
        });
    });

    describe('needsSync', () => {
        it('should return true if document is in queue', () => {
            mockSyncStore.getQueueItem.mockReturnValue({ id: 'doc-1' });

            const { result } = renderHook(() => useDocumentSync());

            const needsSync = result.current.needsSync('doc-1');

            expect(needsSync).toBe(true);
        });

        it('should return false if document is not in queue', () => {
            mockSyncStore.getQueueItem.mockReturnValue(undefined);

            const { result } = renderHook(() => useDocumentSync());

            const needsSync = result.current.needsSync('doc-2');

            expect(needsSync).toBe(false);
        });
    });
});
