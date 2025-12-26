import { buildScrollMap, findEditorLine, findPreviewPosition, getScrollPercentage, setScrollPercentage } from '@/services/markdown';
import { useSettingsStore } from '@/stores/settingsStore';
import { useCallback, useEffect, useRef, useState } from 'react';

interface UseScrollSyncOptions {
    editorElement: HTMLElement | null;
    previewElement: HTMLElement | null;
    enabled?: boolean;
}

interface UseScrollSyncReturn {
    syncEditorToPreview: (line: number) => void;
    syncPreviewToEditor: () => number;
    isUserScrolling: boolean;
}

/**
 * Hook for bidirectional scroll synchronization
 */
export function useScrollSync(options: UseScrollSyncOptions): UseScrollSyncReturn {
    const { editorElement: _editorElement, previewElement, enabled = true } = options;

    const { syncScroll } = useSettingsStore();
    const isActive = enabled && syncScroll;

    const scrollMapRef = useRef<Map<number, number>>(new Map());
    const isUserScrollingRef = useRef(false);
    const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [isUserScrolling, setIsUserScrolling] = useState(false);

    // Rebuild scroll map when preview content changes
    const rebuildScrollMap = useCallback(() => {
        if (previewElement) {
            scrollMapRef.current = buildScrollMap(previewElement);
        }
    }, [previewElement]);

    // Sync editor scroll to preview
    const syncEditorToPreview = useCallback(
        (line: number) => {
            if (!isActive || !previewElement || isUserScrollingRef.current) return;

            const position = findPreviewPosition(line, scrollMapRef.current);
            previewElement.scrollTo({
                top: position,
                behavior: 'smooth'
            });
        },
        [isActive, previewElement]
    );

    // Sync preview scroll to editor (returns line number)
    const syncPreviewToEditor = useCallback((): number => {
        if (!previewElement) return 1;
        return findEditorLine(previewElement.scrollTop, scrollMapRef.current);
    }, [previewElement]);

    // Track user scrolling to prevent feedback loops
    const handleUserScroll = useCallback(() => {
        isUserScrollingRef.current = true;
        setIsUserScrolling(true);

        if (scrollTimeoutRef.current) {
            clearTimeout(scrollTimeoutRef.current);
        }

        scrollTimeoutRef.current = setTimeout(() => {
            isUserScrollingRef.current = false;
            setIsUserScrolling(false);
        }, 150);
    }, []);

    // Set up scroll listeners
    useEffect(() => {
        if (!isActive) return;

        const preview = previewElement;

        if (preview) {
            preview.addEventListener('scroll', handleUserScroll);
            rebuildScrollMap();
        }

        return () => {
            if (preview) {
                preview.removeEventListener('scroll', handleUserScroll);
            }
            if (scrollTimeoutRef.current) {
                clearTimeout(scrollTimeoutRef.current);
            }
        };
    }, [isActive, previewElement, handleUserScroll, rebuildScrollMap]);

    // Rebuild scroll map on content changes (observe mutations)
    useEffect(() => {
        if (!previewElement) return;

        const observer = new MutationObserver(() => {
            rebuildScrollMap();
        });

        observer.observe(previewElement, {
            childList: true,
            subtree: true
        });

        return () => {
            observer.disconnect();
        };
    }, [previewElement, rebuildScrollMap]);

    return {
        syncEditorToPreview,
        syncPreviewToEditor,
        isUserScrolling
    };
}

/**
 * Simple percentage-based scroll sync (fallback)
 */
export function usePercentageScrollSync(sourceElement: HTMLElement | null, targetElement: HTMLElement | null, enabled: boolean) {
    const isScrollingRef = useRef(false);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const syncScroll = useCallback(() => {
        if (!enabled || !sourceElement || !targetElement || isScrollingRef.current) return;

        const percentage = getScrollPercentage(sourceElement);
        setScrollPercentage(targetElement, percentage);
    }, [enabled, sourceElement, targetElement]);

    const handleScroll = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        isScrollingRef.current = true;
        syncScroll();

        timeoutRef.current = setTimeout(() => {
            isScrollingRef.current = false;
        }, 100);
    }, [syncScroll]);

    useEffect(() => {
        if (!enabled || !sourceElement) return;

        sourceElement.addEventListener('scroll', handleScroll);

        return () => {
            sourceElement.removeEventListener('scroll', handleScroll);
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [enabled, sourceElement, handleScroll]);
}
