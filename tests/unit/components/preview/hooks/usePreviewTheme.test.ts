import { usePreviewTheme } from '@/components/preview/hooks/usePreviewTheme';
import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock settings store with hoisted mock
const { mockUseSettingsStore } = vi.hoisted(() => ({
    mockUseSettingsStore: vi.fn()
}));

vi.mock('@/stores/settingsStore', () => ({
    useSettingsStore: () => mockUseSettingsStore()
}));

describe('usePreviewTheme', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('themeClass', () => {
        it('should return preview-github for github style', () => {
            mockUseSettingsStore.mockReturnValue({ previewStyle: 'github', theme: 'light' });

            const { result } = renderHook(() => usePreviewTheme());

            expect(result.current.themeClass).toBe('preview-github');
        });

        it('should return preview-gitlab for gitlab style', () => {
            mockUseSettingsStore.mockReturnValue({ previewStyle: 'gitlab', theme: 'light' });

            const { result } = renderHook(() => usePreviewTheme());

            expect(result.current.themeClass).toBe('preview-gitlab');
        });

        it('should return preview-notion for notion style', () => {
            mockUseSettingsStore.mockReturnValue({ previewStyle: 'notion', theme: 'light' });

            const { result } = renderHook(() => usePreviewTheme());

            expect(result.current.themeClass).toBe('preview-notion');
        });

        it('should return preview-obsidian for obsidian style', () => {
            mockUseSettingsStore.mockReturnValue({ previewStyle: 'obsidian', theme: 'light' });

            const { result } = renderHook(() => usePreviewTheme());

            expect(result.current.themeClass).toBe('preview-obsidian');
        });

        it('should return preview-stackoverflow for stackoverflow style', () => {
            mockUseSettingsStore.mockReturnValue({ previewStyle: 'stackoverflow', theme: 'light' });

            const { result } = renderHook(() => usePreviewTheme());

            expect(result.current.themeClass).toBe('preview-stackoverflow');
        });

        it('should return preview-devto for devto style', () => {
            mockUseSettingsStore.mockReturnValue({ previewStyle: 'devto', theme: 'light' });

            const { result } = renderHook(() => usePreviewTheme());

            expect(result.current.themeClass).toBe('preview-devto');
        });

        it('should default to preview-github for unknown style', () => {
            mockUseSettingsStore.mockReturnValue({ previewStyle: 'unknown', theme: 'light' });

            const { result } = renderHook(() => usePreviewTheme());

            expect(result.current.themeClass).toBe('preview-github');
        });
    });

    describe('isDark', () => {
        it('should return false for light theme', () => {
            mockUseSettingsStore.mockReturnValue({ previewStyle: 'github', theme: 'light' });

            const { result } = renderHook(() => usePreviewTheme());

            expect(result.current.isDark).toBe(false);
        });

        it('should return true for dark theme', () => {
            mockUseSettingsStore.mockReturnValue({ previewStyle: 'github', theme: 'dark' });

            const { result } = renderHook(() => usePreviewTheme());

            expect(result.current.isDark).toBe(true);
        });

        it('should detect system dark preference', () => {
            mockUseSettingsStore.mockReturnValue({ previewStyle: 'github', theme: 'system' });

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

            const { result } = renderHook(() => usePreviewTheme());

            expect(result.current.isDark).toBe(true);
        });

        it('should detect system light preference', () => {
            mockUseSettingsStore.mockReturnValue({ previewStyle: 'github', theme: 'system' });

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

            const { result } = renderHook(() => usePreviewTheme());

            expect(result.current.isDark).toBe(false);
        });
    });

    describe('memoization', () => {
        it('should return same themeClass reference when previewStyle unchanged', () => {
            mockUseSettingsStore.mockReturnValue({ previewStyle: 'github', theme: 'light' });

            const { result, rerender } = renderHook(() => usePreviewTheme());

            const firstThemeClass = result.current.themeClass;
            rerender();

            expect(result.current.themeClass).toBe(firstThemeClass);
        });
    });

    describe('return type', () => {
        it('should return object with themeClass and isDark', () => {
            mockUseSettingsStore.mockReturnValue({ previewStyle: 'github', theme: 'light' });

            const { result } = renderHook(() => usePreviewTheme());

            expect(result.current).toHaveProperty('themeClass');
            expect(result.current).toHaveProperty('isDark');
        });

        it('should return themeClass as string', () => {
            mockUseSettingsStore.mockReturnValue({ previewStyle: 'github', theme: 'light' });

            const { result } = renderHook(() => usePreviewTheme());

            expect(typeof result.current.themeClass).toBe('string');
        });

        it('should return isDark as boolean', () => {
            mockUseSettingsStore.mockReturnValue({ previewStyle: 'github', theme: 'light' });

            const { result } = renderHook(() => usePreviewTheme());

            expect(typeof result.current.isDark).toBe('boolean');
        });
    });
});
