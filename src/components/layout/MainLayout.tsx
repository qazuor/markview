import { Editor } from '@/components/editor';
import { Preview } from '@/components/preview';
import { SplitPane } from '@/components/ui';
import { useDocumentStore } from '@/stores/documentStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { cn } from '@/utils/cn';
import type { EditorView } from '@codemirror/view';
import { useCallback, useEffect, useRef, useState } from 'react';

interface MainLayoutProps {
    className?: string;
    onEditorViewReady?: (view: EditorView | null) => void;
}

// Breakpoint for responsive behavior
const MOBILE_BREAKPOINT = 768;

type ViewMode = 'split' | 'editor' | 'preview';

/**
 * Main content layout with editor and preview
 */
export function MainLayout({ className, onEditorViewReady }: MainLayoutProps) {
    const [viewMode, setViewMode] = useState<ViewMode>('split');
    const [isMobile, setIsMobile] = useState(false);
    const [splitSize, setSplitSize] = useState(50);

    const activeDocumentId = useDocumentStore((state) => state.activeDocumentId);
    const documents = useDocumentStore((state) => state.documents);
    const activeDocument = activeDocumentId ? (documents.get(activeDocumentId) ?? null) : null;
    const content = activeDocument?.content ?? '';

    // Sync scroll settings and functions
    const syncScroll = useSettingsStore((state) => state.syncScroll);
    const editorScrollToRef = useRef<((percent: number) => void) | null>(null);
    const previewScrollToRef = useRef<((percent: number) => void) | null>(null);
    const isScrollingRef = useRef<'editor' | 'preview' | null>(null);
    const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Handle editor scroll - sync to preview
    const handleEditorScroll = useCallback(
        (percent: number) => {
            if (!syncScroll || isScrollingRef.current === 'preview') return;
            isScrollingRef.current = 'editor';

            if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
            scrollTimeoutRef.current = setTimeout(() => {
                isScrollingRef.current = null;
            }, 100);

            previewScrollToRef.current?.(percent);
        },
        [syncScroll]
    );

    // Handle preview scroll - sync to editor
    const handlePreviewScroll = useCallback(
        (percent: number) => {
            if (!syncScroll || isScrollingRef.current === 'editor') return;
            isScrollingRef.current = 'preview';

            if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
            scrollTimeoutRef.current = setTimeout(() => {
                isScrollingRef.current = null;
            }, 100);

            editorScrollToRef.current?.(percent);
        },
        [syncScroll]
    );

    // Capture scroll functions from children
    const handleEditorScrollToReady = useCallback((scrollTo: (percent: number) => void) => {
        editorScrollToRef.current = scrollTo;
    }, []);

    const handlePreviewScrollToReady = useCallback((scrollTo: (percent: number) => void) => {
        previewScrollToRef.current = scrollTo;
    }, []);

    // Check for mobile viewport
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);

        return () => {
            window.removeEventListener('resize', checkMobile);
        };
    }, []);

    // Force tabs on mobile
    useEffect(() => {
        if (isMobile && viewMode === 'split') {
            setViewMode('editor');
        }
    }, [isMobile, viewMode]);

    const handleSplitResize = useCallback((size: number) => {
        setSplitSize(size);
        // Could save to localStorage here
    }, []);

    // Mobile tab view
    if (isMobile) {
        return (
            <div className={cn('flex h-full flex-col', className)}>
                {/* Tab buttons */}
                <div className="flex border-b border-secondary-200 dark:border-secondary-700">
                    <button
                        type="button"
                        onClick={() => setViewMode('editor')}
                        className={cn(
                            'flex-1 px-4 py-2 text-sm font-medium',
                            viewMode === 'editor'
                                ? 'border-b-2 border-primary-500 text-primary-600 dark:text-primary-400'
                                : 'text-secondary-500 hover:text-secondary-700 dark:text-secondary-400'
                        )}
                    >
                        Editor
                    </button>
                    <button
                        type="button"
                        onClick={() => setViewMode('preview')}
                        className={cn(
                            'flex-1 px-4 py-2 text-sm font-medium',
                            viewMode === 'preview'
                                ? 'border-b-2 border-primary-500 text-primary-600 dark:text-primary-400'
                                : 'text-secondary-500 hover:text-secondary-700 dark:text-secondary-400'
                        )}
                    >
                        Preview
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-hidden">
                    {viewMode === 'editor' ? (
                        <Editor className="h-full" onViewReady={onEditorViewReady} />
                    ) : (
                        <Preview content={content} className="h-full" />
                    )}
                </div>
            </div>
        );
    }

    // Desktop split view
    return (
        <div className={cn('h-full', className)}>
            <SplitPane
                left={
                    <Editor
                        className="h-full"
                        onViewReady={onEditorViewReady}
                        onScroll={handleEditorScroll}
                        onScrollToReady={handleEditorScrollToReady}
                    />
                }
                right={
                    <Preview
                        content={content}
                        className="h-full"
                        onScroll={handlePreviewScroll}
                        onScrollToReady={handlePreviewScrollToReady}
                    />
                }
                defaultSize={splitSize}
                minSize={20}
                maxSize={80}
                onResize={handleSplitResize}
            />
        </div>
    );
}
