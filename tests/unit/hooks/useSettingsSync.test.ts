import { useSettingsSync } from '@/hooks/useSettingsSync';
import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock useAuth
const mockUseAuth = vi.fn();
vi.mock('@/components/auth/AuthProvider', () => ({
    useAuth: () => mockUseAuth()
}));

// Mock settings store
const mockSettingsStore = {
    syncStatus: 'idle' as const,
    lastSyncedAt: null as string | null,
    syncError: null as string | null,
    pendingChanges: false,
    setSyncStatus: vi.fn(),
    setSyncError: vi.fn(),
    markSynced: vi.fn(),
    mergeServerSettings: vi.fn(),
    getSettingsForSync: vi.fn()
};
vi.mock('@/stores/settingsStore', () => ({
    useSettingsStore: () => mockSettingsStore
}));

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('useSettingsSync', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers();
        mockUseAuth.mockReturnValue({ isAuthenticated: false });
        mockSettingsStore.syncStatus = 'idle';
        mockSettingsStore.lastSyncedAt = null;
        mockSettingsStore.syncError = null;
        mockSettingsStore.pendingChanges = false;
        Object.defineProperty(navigator, 'onLine', { value: true, configurable: true });
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    describe('initial state', () => {
        it('should return initial state from store', () => {
            const { result } = renderHook(() => useSettingsSync());

            expect(result.current.syncStatus).toBe('idle');
            expect(result.current.lastSyncedAt).toBeNull();
            expect(result.current.syncError).toBeNull();
            expect(result.current.pendingChanges).toBe(false);
        });

        it('should expose fetchSettings and pushSettings methods', () => {
            const { result } = renderHook(() => useSettingsSync());

            expect(typeof result.current.fetchSettings).toBe('function');
            expect(typeof result.current.pushSettings).toBe('function');
        });
    });

    describe('fetchSettings', () => {
        it('should not fetch if not authenticated', async () => {
            mockUseAuth.mockReturnValue({ isAuthenticated: false });

            const { result } = renderHook(() => useSettingsSync());

            await act(async () => {
                await result.current.fetchSettings();
            });

            expect(mockFetch).not.toHaveBeenCalled();
        });

        it('should fetch settings when authenticated', async () => {
            mockUseAuth.mockReturnValue({ isAuthenticated: true });
            mockFetch.mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({ settings: { theme: 'dark' } })
            });

            const { result } = renderHook(() => useSettingsSync());

            await act(async () => {
                await result.current.fetchSettings();
            });

            expect(mockFetch).toHaveBeenCalledWith(
                '/api/user/settings',
                expect.objectContaining({
                    method: 'GET',
                    credentials: 'include'
                })
            );
        });

        it('should set sync status to syncing during fetch', async () => {
            mockUseAuth.mockReturnValue({ isAuthenticated: true });
            mockFetch.mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({ settings: {} })
            });

            const { result } = renderHook(() => useSettingsSync());

            await act(async () => {
                await result.current.fetchSettings();
            });

            expect(mockSettingsStore.setSyncStatus).toHaveBeenCalledWith('syncing');
        });

        it('should merge settings and mark synced on success', async () => {
            mockUseAuth.mockReturnValue({ isAuthenticated: true });
            const settings = { theme: 'dark', fontSize: 16 };
            mockFetch.mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({ settings })
            });

            const { result } = renderHook(() => useSettingsSync());

            await act(async () => {
                await result.current.fetchSettings();
            });

            expect(mockSettingsStore.mergeServerSettings).toHaveBeenCalledWith(settings);
            expect(mockSettingsStore.markSynced).toHaveBeenCalled();
        });

        it('should set idle on 401 response', async () => {
            mockUseAuth.mockReturnValue({ isAuthenticated: true });
            mockFetch.mockResolvedValue({ ok: false, status: 401 });

            const { result } = renderHook(() => useSettingsSync());

            await act(async () => {
                await result.current.fetchSettings();
            });

            expect(mockSettingsStore.setSyncStatus).toHaveBeenCalledWith('idle');
        });

        it('should set error on fetch failure', async () => {
            mockUseAuth.mockReturnValue({ isAuthenticated: true });
            mockFetch.mockResolvedValue({ ok: false, status: 500 });

            const { result } = renderHook(() => useSettingsSync());

            await act(async () => {
                await result.current.fetchSettings();
            });

            expect(mockSettingsStore.setSyncError).toHaveBeenCalledWith(expect.stringContaining('Failed to fetch settings'));
        });

        it('should set offline status when offline', async () => {
            mockUseAuth.mockReturnValue({ isAuthenticated: true });
            Object.defineProperty(navigator, 'onLine', { value: false, configurable: true });
            mockFetch.mockRejectedValue(new Error('Network error'));

            const { result } = renderHook(() => useSettingsSync());

            await act(async () => {
                await result.current.fetchSettings();
            });

            expect(mockSettingsStore.setSyncStatus).toHaveBeenCalledWith('offline');
        });
    });

    describe('pushSettings', () => {
        it('should not push if not authenticated', async () => {
            mockUseAuth.mockReturnValue({ isAuthenticated: false });

            const { result } = renderHook(() => useSettingsSync());

            await act(async () => {
                await result.current.pushSettings();
            });

            expect(mockFetch).not.toHaveBeenCalled();
        });

        it('should push settings with PUT request', async () => {
            mockUseAuth.mockReturnValue({ isAuthenticated: true });
            const settings = { theme: 'light' };
            mockSettingsStore.getSettingsForSync.mockReturnValue(settings);
            mockFetch.mockResolvedValue({ ok: true });

            const { result } = renderHook(() => useSettingsSync());

            await act(async () => {
                await result.current.pushSettings();
            });

            expect(mockFetch).toHaveBeenCalledWith(
                '/api/user/settings',
                expect.objectContaining({
                    method: 'PUT',
                    credentials: 'include',
                    body: JSON.stringify({ settings })
                })
            );
        });

        it('should mark synced on success', async () => {
            mockUseAuth.mockReturnValue({ isAuthenticated: true });
            mockSettingsStore.getSettingsForSync.mockReturnValue({});
            mockFetch.mockResolvedValue({ ok: true });

            const { result } = renderHook(() => useSettingsSync());

            await act(async () => {
                await result.current.pushSettings();
            });

            expect(mockSettingsStore.markSynced).toHaveBeenCalled();
        });

        it('should set idle on 401 response', async () => {
            mockUseAuth.mockReturnValue({ isAuthenticated: true });
            mockSettingsStore.getSettingsForSync.mockReturnValue({});
            mockFetch.mockResolvedValue({ ok: false, status: 401 });

            const { result } = renderHook(() => useSettingsSync());

            await act(async () => {
                await result.current.pushSettings();
            });

            expect(mockSettingsStore.setSyncStatus).toHaveBeenCalledWith('idle');
        });

        it('should set error on push failure', async () => {
            mockUseAuth.mockReturnValue({ isAuthenticated: true });
            mockSettingsStore.getSettingsForSync.mockReturnValue({});
            mockFetch.mockResolvedValue({ ok: false, status: 500 });

            const { result } = renderHook(() => useSettingsSync());

            await act(async () => {
                await result.current.pushSettings();
            });

            expect(mockSettingsStore.setSyncError).toHaveBeenCalledWith(expect.stringContaining('Failed to save settings'));
        });
    });

    describe('auto-sync on login', () => {
        it('should fetch settings when user becomes authenticated', async () => {
            mockFetch.mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({ settings: {} })
            });

            const { rerender } = renderHook(() => useSettingsSync());

            // Initially not authenticated
            mockUseAuth.mockReturnValue({ isAuthenticated: false });
            rerender();

            // Now authenticated
            mockUseAuth.mockReturnValue({ isAuthenticated: true });
            rerender();

            await act(async () => {
                await vi.runAllTimersAsync();
            });

            expect(mockFetch).toHaveBeenCalled();
        });
    });

    describe('auto-sync with pending changes', () => {
        it('should debounce sync when pending changes exist', async () => {
            mockUseAuth.mockReturnValue({ isAuthenticated: true });
            mockSettingsStore.pendingChanges = true;
            mockSettingsStore.getSettingsForSync.mockReturnValue({});
            mockFetch.mockResolvedValue({ ok: true });

            renderHook(() => useSettingsSync({ autoSync: true, debounceMs: 1000 }));

            // Fast forward debounce time
            await act(async () => {
                await vi.advanceTimersByTimeAsync(1000);
            });

            expect(mockFetch).toHaveBeenCalledWith('/api/user/settings', expect.objectContaining({ method: 'PUT' }));
        });

        it('should not auto-sync if autoSync is disabled', async () => {
            mockUseAuth.mockReturnValue({ isAuthenticated: true });
            mockSettingsStore.pendingChanges = true;

            renderHook(() => useSettingsSync({ autoSync: false }));

            await act(async () => {
                await vi.advanceTimersByTimeAsync(5000);
            });

            expect(mockFetch).not.toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ method: 'PUT' }));
        });
    });

    describe('online/offline handling', () => {
        it('should handle online event when offline with pending changes', async () => {
            mockUseAuth.mockReturnValue({ isAuthenticated: true });
            mockSettingsStore.syncStatus = 'offline';
            mockSettingsStore.pendingChanges = true;
            mockSettingsStore.getSettingsForSync.mockReturnValue({});
            mockFetch.mockResolvedValue({ ok: true });

            renderHook(() => useSettingsSync());

            // Simulate coming online
            act(() => {
                window.dispatchEvent(new Event('online'));
            });

            // The fetch should be triggered by the online handler
            expect(mockSettingsStore.setSyncStatus).toHaveBeenCalledWith('syncing');
        });

        it('should set idle when coming online without pending changes', async () => {
            mockUseAuth.mockReturnValue({ isAuthenticated: true });
            mockSettingsStore.syncStatus = 'offline';
            mockSettingsStore.pendingChanges = false;

            renderHook(() => useSettingsSync());

            await act(async () => {
                window.dispatchEvent(new Event('online'));
            });

            expect(mockSettingsStore.setSyncStatus).toHaveBeenCalledWith('idle');
        });

        it('should set offline status when going offline during sync', async () => {
            mockUseAuth.mockReturnValue({ isAuthenticated: true });
            mockSettingsStore.syncStatus = 'syncing';

            renderHook(() => useSettingsSync());

            await act(async () => {
                window.dispatchEvent(new Event('offline'));
            });

            expect(mockSettingsStore.setSyncStatus).toHaveBeenCalledWith('offline');
        });
    });
});
