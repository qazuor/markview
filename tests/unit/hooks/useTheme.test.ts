import { useTheme } from '@/hooks/useTheme';
import { useSettingsStore } from '@/stores';
import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('useTheme', () => {
    beforeEach(() => {
        useSettingsStore.setState({ theme: 'light' });
        document.documentElement.className = '';
    });

    afterEach(() => {
        document.documentElement.className = '';
    });

    it('should initialize with light theme', () => {
        useSettingsStore.setState({ theme: 'light' });

        const { result } = renderHook(() => useTheme());

        expect(result.current.theme).toBe('light');
        expect(result.current.isDark).toBe(false);
        expect(document.documentElement.classList.contains('dark')).toBe(false);
    });

    it('should apply dark theme', () => {
        const { result } = renderHook(() => useTheme());

        act(() => {
            result.current.setTheme('dark');
        });

        expect(result.current.theme).toBe('dark');
        expect(result.current.isDark).toBe(true);
        expect(document.documentElement.classList.contains('dark')).toBe(true);
    });

    it('should switch from dark to light theme', () => {
        useSettingsStore.setState({ theme: 'dark' });

        const { result } = renderHook(() => useTheme());

        expect(document.documentElement.classList.contains('dark')).toBe(true);

        act(() => {
            result.current.setTheme('light');
        });

        expect(result.current.theme).toBe('light');
        expect(result.current.isDark).toBe(false);
        expect(document.documentElement.classList.contains('dark')).toBe(false);
    });

    it('should handle system theme preference', () => {
        const matchMediaMock = vi.fn().mockImplementation((query) => ({
            matches: query === '(prefers-color-scheme: dark)',
            media: query,
            onchange: null,
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
            addListener: vi.fn(),
            removeListener: vi.fn(),
            dispatchEvent: vi.fn()
        }));

        Object.defineProperty(window, 'matchMedia', {
            writable: true,
            value: matchMediaMock
        });

        const { result } = renderHook(() => useTheme());

        act(() => {
            result.current.setTheme('system');
        });

        expect(result.current.theme).toBe('system');
        expect(result.current.isDark).toBe(true);
    });

    it('should respond to system theme changes', () => {
        let mediaQueryListener: ((e: MediaQueryListEvent) => void) | null = null;

        const matchMediaMock = vi.fn().mockImplementation((query) => ({
            matches: false,
            media: query,
            onchange: null,
            addEventListener: vi.fn((event, listener) => {
                if (event === 'change') {
                    mediaQueryListener = listener;
                }
            }),
            removeEventListener: vi.fn(),
            addListener: vi.fn(),
            removeListener: vi.fn(),
            dispatchEvent: vi.fn()
        }));

        Object.defineProperty(window, 'matchMedia', {
            writable: true,
            value: matchMediaMock
        });

        const { result } = renderHook(() => useTheme());

        act(() => {
            result.current.setTheme('system');
        });

        expect(document.documentElement.classList.contains('dark')).toBe(false);

        // Simulate system theme change to dark
        if (mediaQueryListener) {
            act(() => {
                mediaQueryListener({ matches: true } as MediaQueryListEvent);
            });
        }

        expect(document.documentElement.classList.contains('dark')).toBe(true);
    });

    it('should cleanup media query listener on unmount', () => {
        const removeEventListenerSpy = vi.fn();
        const matchMediaMock = vi.fn().mockImplementation((query) => ({
            matches: false,
            media: query,
            onchange: null,
            addEventListener: vi.fn(),
            removeEventListener: removeEventListenerSpy,
            addListener: vi.fn(),
            removeListener: vi.fn(),
            dispatchEvent: vi.fn()
        }));

        Object.defineProperty(window, 'matchMedia', {
            writable: true,
            value: matchMediaMock
        });

        const { result, unmount } = renderHook(() => useTheme());

        act(() => {
            result.current.setTheme('system');
        });

        unmount();

        expect(removeEventListenerSpy).toHaveBeenCalledWith('change', expect.any(Function));
    });

    it('should not add listener for non-system themes', () => {
        const addEventListenerSpy = vi.fn();
        const matchMediaMock = vi.fn().mockImplementation((query) => ({
            matches: false,
            media: query,
            onchange: null,
            addEventListener: addEventListenerSpy,
            removeEventListener: vi.fn(),
            addListener: vi.fn(),
            removeListener: vi.fn(),
            dispatchEvent: vi.fn()
        }));

        Object.defineProperty(window, 'matchMedia', {
            writable: true,
            value: matchMediaMock
        });

        renderHook(() => useTheme());

        // Should not add listener for light theme
        expect(addEventListenerSpy).not.toHaveBeenCalled();
    });
});
