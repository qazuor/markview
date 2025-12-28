import { useSettingsStore } from '@/stores/settingsStore';
import { useCallback, useEffect } from 'react';

interface UseZoomOptions {
    /**
     * Enable keyboard shortcuts (Ctrl+/-, Ctrl+0)
     * @default true
     */
    enableKeyboard?: boolean;
    /**
     * Enable Ctrl+Mouse Wheel zoom
     * @default true
     */
    enableWheel?: boolean;
    /**
     * Target element for wheel events. If not provided, uses document
     */
    targetRef?: React.RefObject<HTMLElement>;
}

/**
 * Hook for handling zoom keyboard shortcuts and mouse wheel
 */
export function useZoom(options: UseZoomOptions = {}) {
    const { enableKeyboard = true, enableWheel = true, targetRef } = options;

    const zoomIn = useSettingsStore((s) => s.zoomIn);
    const zoomOut = useSettingsStore((s) => s.zoomOut);
    const resetZoom = useSettingsStore((s) => s.resetZoom);
    const getZoomPercentage = useSettingsStore((s) => s.getZoomPercentage);
    const editorFontSize = useSettingsStore((s) => s.editorFontSize);
    const previewFontSize = useSettingsStore((s) => s.previewFontSize);

    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
            // Check for Ctrl (or Cmd on Mac)
            if (!e.ctrlKey && !e.metaKey) return;

            // Prevent default browser zoom behavior
            if (e.key === '+' || e.key === '=' || e.key === '-' || e.key === '0') {
                e.preventDefault();

                if (e.key === '+' || e.key === '=') {
                    zoomIn();
                } else if (e.key === '-') {
                    zoomOut();
                } else if (e.key === '0') {
                    resetZoom();
                }
            }
        },
        [zoomIn, zoomOut, resetZoom]
    );

    const handleWheel = useCallback(
        (e: WheelEvent) => {
            // Only zoom when Ctrl is held
            if (!e.ctrlKey && !e.metaKey) return;

            e.preventDefault();

            if (e.deltaY < 0) {
                zoomIn();
            } else if (e.deltaY > 0) {
                zoomOut();
            }
        },
        [zoomIn, zoomOut]
    );

    // Keyboard shortcuts
    useEffect(() => {
        if (!enableKeyboard) return;

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [enableKeyboard, handleKeyDown]);

    // Mouse wheel zoom
    useEffect(() => {
        if (!enableWheel) return;

        const target = targetRef?.current || document;

        target.addEventListener('wheel', handleWheel as EventListener, { passive: false });
        return () => target.removeEventListener('wheel', handleWheel as EventListener);
    }, [enableWheel, targetRef, handleWheel]);

    return {
        zoomIn,
        zoomOut,
        resetZoom,
        getZoomPercentage,
        editorFontSize,
        previewFontSize
    };
}
