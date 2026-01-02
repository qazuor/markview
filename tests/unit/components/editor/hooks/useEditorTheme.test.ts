import { useEditorTheme } from '@/components/editor/hooks/useEditorTheme';
import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock settings store with hoisted mock
const { mockUseSettingsStore } = vi.hoisted(() => ({
    mockUseSettingsStore: vi.fn()
}));

vi.mock('@/stores/settingsStore', () => ({
    useSettingsStore: () => mockUseSettingsStore()
}));

describe('useEditorTheme', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('explicit themes', () => {
        it('should return light when theme is light', () => {
            mockUseSettingsStore.mockReturnValue({ theme: 'light' });

            const { result } = renderHook(() => useEditorTheme());

            expect(result.current).toBe('light');
        });

        it('should return dark when theme is dark', () => {
            mockUseSettingsStore.mockReturnValue({ theme: 'dark' });

            const { result } = renderHook(() => useEditorTheme());

            expect(result.current).toBe('dark');
        });
    });

    describe('system theme', () => {
        it('should return light when system prefers light', () => {
            mockUseSettingsStore.mockReturnValue({ theme: 'system' });

            // Mock matchMedia for light preference
            Object.defineProperty(window, 'matchMedia', {
                writable: true,
                value: vi.fn().mockImplementation((query) => ({
                    matches: query === '(prefers-color-scheme: light)',
                    media: query,
                    onchange: null,
                    addListener: vi.fn(),
                    removeListener: vi.fn(),
                    addEventListener: vi.fn(),
                    removeEventListener: vi.fn(),
                    dispatchEvent: vi.fn()
                }))
            });

            const { result } = renderHook(() => useEditorTheme());

            expect(result.current).toBe('light');
        });

        it('should return dark when system prefers dark', () => {
            mockUseSettingsStore.mockReturnValue({ theme: 'system' });

            // Mock matchMedia for dark preference
            Object.defineProperty(window, 'matchMedia', {
                writable: true,
                value: vi.fn().mockImplementation((query) => ({
                    matches: query === '(prefers-color-scheme: dark)',
                    media: query,
                    onchange: null,
                    addListener: vi.fn(),
                    removeListener: vi.fn(),
                    addEventListener: vi.fn(),
                    removeEventListener: vi.fn(),
                    dispatchEvent: vi.fn()
                }))
            });

            const { result } = renderHook(() => useEditorTheme());

            expect(result.current).toBe('dark');
        });
    });

    describe('memoization', () => {
        it('should return same value when theme does not change', () => {
            mockUseSettingsStore.mockReturnValue({ theme: 'dark' });

            const { result, rerender } = renderHook(() => useEditorTheme());

            const firstResult = result.current;
            rerender();

            expect(result.current).toBe(firstResult);
        });
    });
});
