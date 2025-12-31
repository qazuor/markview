import { useAuthMode } from '@/hooks/useAuthMode';
import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

// Mock the auth provider
const mockUseAuth = vi.fn();
vi.mock('@/components/auth/AuthProvider', () => ({
    useAuth: () => mockUseAuth()
}));

describe('useAuthMode', () => {
    describe('guest mode', () => {
        beforeEach(() => {
            mockUseAuth.mockReturnValue({
                user: null,
                isLoading: false,
                isAuthenticated: false
            });
        });

        it('should return guest mode when not authenticated', () => {
            const { result } = renderHook(() => useAuthMode());

            expect(result.current.mode).toBe('guest');
            expect(result.current.isGuest).toBe(true);
            expect(result.current.isAuthenticated).toBe(false);
        });

        it('should return null user in guest mode', () => {
            const { result } = renderHook(() => useAuthMode());

            expect(result.current.user).toBeNull();
        });

        it('should return guest storage prefix', () => {
            const { result } = renderHook(() => useAuthMode());

            expect(result.current.getStoragePrefix()).toBe('markview:guest:');
        });
    });

    describe('authenticated mode', () => {
        beforeEach(() => {
            mockUseAuth.mockReturnValue({
                user: {
                    id: 'user-123',
                    name: 'Test User',
                    email: 'test@example.com',
                    image: 'https://example.com/avatar.png'
                },
                isLoading: false,
                isAuthenticated: true
            });
        });

        it('should return authenticated mode when logged in', () => {
            const { result } = renderHook(() => useAuthMode());

            expect(result.current.mode).toBe('authenticated');
            expect(result.current.isGuest).toBe(false);
            expect(result.current.isAuthenticated).toBe(true);
        });

        it('should return user info when authenticated', () => {
            const { result } = renderHook(() => useAuthMode());

            expect(result.current.user).toEqual({
                id: 'user-123',
                name: 'Test User',
                email: 'test@example.com',
                image: 'https://example.com/avatar.png'
            });
        });

        it('should return user storage prefix', () => {
            const { result } = renderHook(() => useAuthMode());

            expect(result.current.getStoragePrefix()).toBe('markview:user:user-123:');
        });
    });

    describe('loading state', () => {
        it('should return isLoading when auth is loading', () => {
            mockUseAuth.mockReturnValue({
                user: null,
                isLoading: true,
                isAuthenticated: false
            });

            const { result } = renderHook(() => useAuthMode());

            expect(result.current.isLoading).toBe(true);
        });

        it('should return isLoading false when auth is done', () => {
            mockUseAuth.mockReturnValue({
                user: null,
                isLoading: false,
                isAuthenticated: false
            });

            const { result } = renderHook(() => useAuthMode());

            expect(result.current.isLoading).toBe(false);
        });
    });

    describe('requiresAuth', () => {
        beforeEach(() => {
            mockUseAuth.mockReturnValue({
                user: null,
                isLoading: false,
                isAuthenticated: false
            });
        });

        it('should return true for cloud-sync', () => {
            const { result } = renderHook(() => useAuthMode());

            expect(result.current.requiresAuth('cloud-sync')).toBe(true);
        });

        it('should return true for github-integration', () => {
            const { result } = renderHook(() => useAuthMode());

            expect(result.current.requiresAuth('github-integration')).toBe(true);
        });

        it('should return true for google-drive', () => {
            const { result } = renderHook(() => useAuthMode());

            expect(result.current.requiresAuth('google-drive')).toBe(true);
        });

        it('should return true for settings-sync', () => {
            const { result } = renderHook(() => useAuthMode());

            expect(result.current.requiresAuth('settings-sync')).toBe(true);
        });

        it('should return true for shared-documents', () => {
            const { result } = renderHook(() => useAuthMode());

            expect(result.current.requiresAuth('shared-documents')).toBe(true);
        });
    });

    describe('user info handling', () => {
        it('should handle missing name', () => {
            mockUseAuth.mockReturnValue({
                user: {
                    id: 'user-123',
                    name: null,
                    email: 'test@example.com',
                    image: null
                },
                isLoading: false,
                isAuthenticated: true
            });

            const { result } = renderHook(() => useAuthMode());

            expect(result.current.user?.name).toBe('User');
        });

        it('should handle missing email', () => {
            mockUseAuth.mockReturnValue({
                user: {
                    id: 'user-123',
                    name: 'Test',
                    email: null,
                    image: null
                },
                isLoading: false,
                isAuthenticated: true
            });

            const { result } = renderHook(() => useAuthMode());

            expect(result.current.user?.email).toBe('');
        });

        it('should handle missing image', () => {
            mockUseAuth.mockReturnValue({
                user: {
                    id: 'user-123',
                    name: 'Test',
                    email: 'test@example.com',
                    image: null
                },
                isLoading: false,
                isAuthenticated: true
            });

            const { result } = renderHook(() => useAuthMode());

            expect(result.current.user?.image).toBeUndefined();
        });
    });
});
