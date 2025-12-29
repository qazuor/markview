import { useZoom } from '@/hooks/useZoom';
import { useSettingsStore } from '@/stores/settingsStore';
import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('useZoom', () => {
    beforeEach(() => {
        useSettingsStore.setState({
            editorFontSize: 14,
            previewFontSize: 16
        });
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe('Keyboard Shortcuts', () => {
        it('should zoom in with Ctrl+Plus', () => {
            const { result } = renderHook(() => useZoom());

            const initialSize = result.current.editorFontSize;

            const event = new KeyboardEvent('keydown', {
                key: '+',
                ctrlKey: true
            });

            act(() => {
                window.dispatchEvent(event);
            });

            expect(result.current.editorFontSize).toBeGreaterThan(initialSize);
        });

        it('should zoom in with Ctrl+Equal', () => {
            const { result } = renderHook(() => useZoom());

            const initialSize = result.current.editorFontSize;

            const event = new KeyboardEvent('keydown', {
                key: '=',
                ctrlKey: true
            });

            act(() => {
                window.dispatchEvent(event);
            });

            expect(result.current.editorFontSize).toBeGreaterThan(initialSize);
        });

        it('should zoom out with Ctrl+Minus', () => {
            const { result } = renderHook(() => useZoom());

            const initialSize = result.current.editorFontSize;

            const event = new KeyboardEvent('keydown', {
                key: '-',
                ctrlKey: true
            });

            act(() => {
                window.dispatchEvent(event);
            });

            expect(result.current.editorFontSize).toBeLessThan(initialSize);
        });

        it('should reset zoom with Ctrl+0', () => {
            const { result } = renderHook(() => useZoom());

            // First zoom in
            act(() => {
                result.current.zoomIn();
                result.current.zoomIn();
            });

            // Then reset
            const event = new KeyboardEvent('keydown', {
                key: '0',
                ctrlKey: true
            });

            act(() => {
                window.dispatchEvent(event);
            });

            expect(result.current.editorFontSize).toBe(14);
            expect(result.current.previewFontSize).toBe(16);
        });

        it('should work with Cmd key on Mac', () => {
            const { result } = renderHook(() => useZoom());

            const initialSize = result.current.editorFontSize;

            const event = new KeyboardEvent('keydown', {
                key: '+',
                metaKey: true
            });

            act(() => {
                window.dispatchEvent(event);
            });

            expect(result.current.editorFontSize).toBeGreaterThan(initialSize);
        });

        it('should not zoom without Ctrl/Cmd key', () => {
            const { result } = renderHook(() => useZoom());

            const initialSize = result.current.editorFontSize;

            const event = new KeyboardEvent('keydown', {
                key: '+'
            });

            act(() => {
                window.dispatchEvent(event);
            });

            expect(result.current.editorFontSize).toBe(initialSize);
        });

        it('should not respond to other keys with Ctrl', () => {
            const { result } = renderHook(() => useZoom());

            const initialSize = result.current.editorFontSize;

            const event = new KeyboardEvent('keydown', {
                key: 'a',
                ctrlKey: true
            });

            act(() => {
                window.dispatchEvent(event);
            });

            expect(result.current.editorFontSize).toBe(initialSize);
        });

        it('should disable keyboard shortcuts when option is false', () => {
            const { result } = renderHook(() => useZoom({ enableKeyboard: false }));

            const initialSize = result.current.editorFontSize;

            const event = new KeyboardEvent('keydown', {
                key: '+',
                ctrlKey: true
            });

            act(() => {
                window.dispatchEvent(event);
            });

            expect(result.current.editorFontSize).toBe(initialSize);
        });
    });

    describe('Mouse Wheel Zoom', () => {
        it('should zoom in with Ctrl+Wheel Up', () => {
            const { result } = renderHook(() => useZoom());

            const initialSize = result.current.editorFontSize;

            const event = new WheelEvent('wheel', {
                deltaY: -100,
                ctrlKey: true
            });

            act(() => {
                document.dispatchEvent(event);
            });

            expect(result.current.editorFontSize).toBeGreaterThan(initialSize);
        });

        it('should zoom out with Ctrl+Wheel Down', () => {
            const { result } = renderHook(() => useZoom());

            const initialSize = result.current.editorFontSize;

            const event = new WheelEvent('wheel', {
                deltaY: 100,
                ctrlKey: true
            });

            act(() => {
                document.dispatchEvent(event);
            });

            expect(result.current.editorFontSize).toBeLessThan(initialSize);
        });

        it('should not zoom without Ctrl key', () => {
            const { result } = renderHook(() => useZoom());

            const initialSize = result.current.editorFontSize;

            const event = new WheelEvent('wheel', {
                deltaY: -100
            });

            act(() => {
                document.dispatchEvent(event);
            });

            expect(result.current.editorFontSize).toBe(initialSize);
        });

        it('should work with Cmd key on Mac', () => {
            const { result } = renderHook(() => useZoom());

            const initialSize = result.current.editorFontSize;

            const event = new WheelEvent('wheel', {
                deltaY: -100,
                metaKey: true
            });

            act(() => {
                document.dispatchEvent(event);
            });

            expect(result.current.editorFontSize).toBeGreaterThan(initialSize);
        });

        it('should disable wheel zoom when option is false', () => {
            const { result } = renderHook(() => useZoom({ enableWheel: false }));

            const initialSize = result.current.editorFontSize;

            const event = new WheelEvent('wheel', {
                deltaY: -100,
                ctrlKey: true
            });

            act(() => {
                document.dispatchEvent(event);
            });

            expect(result.current.editorFontSize).toBe(initialSize);
        });
    });

    describe('Return Values', () => {
        it('should provide zoom functions', () => {
            const { result } = renderHook(() => useZoom());

            expect(typeof result.current.zoomIn).toBe('function');
            expect(typeof result.current.zoomOut).toBe('function');
            expect(typeof result.current.resetZoom).toBe('function');
        });

        it('should provide getZoomPercentage function', () => {
            const { result } = renderHook(() => useZoom());

            expect(typeof result.current.getZoomPercentage).toBe('function');
            expect(result.current.getZoomPercentage()).toBe(100);
        });

        it('should provide current font sizes', () => {
            const { result } = renderHook(() => useZoom());

            expect(result.current.editorFontSize).toBe(14);
            expect(result.current.previewFontSize).toBe(16);
        });

        it('should update font sizes when zooming', () => {
            const { result } = renderHook(() => useZoom());

            act(() => {
                result.current.zoomIn();
            });

            expect(result.current.editorFontSize).toBeGreaterThan(14);
            expect(result.current.previewFontSize).toBeGreaterThan(16);
        });
    });

    describe('Cleanup', () => {
        it('should cleanup keyboard listeners on unmount', () => {
            const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

            const { unmount } = renderHook(() => useZoom());

            unmount();

            expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));

            removeEventListenerSpy.mockRestore();
        });

        it('should cleanup wheel listeners on unmount', () => {
            const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');

            const { unmount } = renderHook(() => useZoom());

            unmount();

            expect(removeEventListenerSpy).toHaveBeenCalledWith('wheel', expect.any(Function));

            removeEventListenerSpy.mockRestore();
        });
    });
});
