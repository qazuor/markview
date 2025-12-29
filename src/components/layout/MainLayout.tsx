import { Editor } from '@/components/editor';
import { Preview } from '@/components/preview';
import { SplitPane, Tooltip } from '@/components/ui';
import { useDocumentStore } from '@/stores/documentStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useUIStore } from '@/stores/uiStore';
import { cn } from '@/utils/cn';
import type { EditorView } from '@codemirror/view';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface MainLayoutProps {
    className?: string;
    onEditorViewReady?: (view: EditorView | null) => void;
}

// Breakpoint for responsive behavior
const MOBILE_BREAKPOINT = 768;

/**
 * Main content layout with editor and preview
 */
export function MainLayout({ className, onEditorViewReady }: MainLayoutProps) {
    const { t } = useTranslation();
    const [isMobile, setIsMobile] = useState(false);
    const [splitSize, setSplitSize] = useState(50);

    // View mode from store
    const viewMode = useUIStore((state) => state.viewMode);
    const setViewMode = useUIStore((state) => state.setViewMode);

    // Toggle functions for collapse buttons
    const expandEditor = useCallback(() => setViewMode('editor'), [setViewMode]);
    const expandPreview = useCallback(() => setViewMode('preview'), [setViewMode]);
    const showSplit = useCallback(() => setViewMode('split'), [setViewMode]);

    const activeDocumentId = useDocumentStore((state) => state.activeDocumentId);
    const documents = useDocumentStore((state) => state.documents);
    const updateContent = useDocumentStore((state) => state.updateContent);
    const activeDocument = activeDocumentId ? (documents.get(activeDocumentId) ?? null) : null;
    const content = activeDocument?.content ?? '';

    // Handle content change from preview (e.g., interactive checkboxes)
    const handleContentChange = useCallback(
        (newContent: string) => {
            if (activeDocumentId) {
                updateContent(activeDocumentId, newContent);
            }
        },
        [activeDocumentId, updateContent]
    );

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
    }, [isMobile, viewMode, setViewMode]);

    const handleSplitResize = useCallback((size: number) => {
        setSplitSize(size);
    }, []);

    // Track scroll position for mobile tab sync
    const lastScrollPercentRef = useRef<number>(0);
    const pendingScrollRef = useRef<boolean>(false);

    // Save scroll position when scrolling
    const handleMobileEditorScroll = useCallback(
        (percent: number) => {
            lastScrollPercentRef.current = percent;
            handleEditorScroll(percent);
        },
        [handleEditorScroll]
    );

    const handleMobilePreviewScroll = useCallback(
        (percent: number) => {
            lastScrollPercentRef.current = percent;
            handlePreviewScroll(percent);
        },
        [handlePreviewScroll]
    );

    // Handle tab change - mark that we need to restore scroll
    const handleTabChange = useCallback(
        (newMode: 'editor' | 'preview') => {
            if (syncScroll && isMobile) {
                pendingScrollRef.current = true;
            }
            setViewMode(newMode);
        },
        [syncScroll, isMobile, setViewMode]
    );

    // When editor's scrollTo is ready, restore scroll if pending
    const handleMobileEditorScrollToReady = useCallback(
        (scrollTo: (percent: number) => void) => {
            editorScrollToRef.current = scrollTo;
            if (pendingScrollRef.current && syncScroll) {
                const targetPercent = lastScrollPercentRef.current;
                setTimeout(() => {
                    scrollTo(targetPercent);
                    pendingScrollRef.current = false;
                }, 100);
            }
        },
        [syncScroll]
    );

    // When preview's scrollTo is ready, restore scroll if pending
    const handleMobilePreviewScrollToReady = useCallback(
        (scrollTo: (percent: number) => void) => {
            previewScrollToRef.current = scrollTo;
            if (pendingScrollRef.current && syncScroll) {
                const targetPercent = lastScrollPercentRef.current;
                setTimeout(() => {
                    scrollTo(targetPercent);
                    pendingScrollRef.current = false;
                }, 100);
            }
        },
        [syncScroll]
    );

    // Mobile tab view
    if (isMobile) {
        return (
            <div className={cn('flex h-full flex-col', className)}>
                {/* Tab buttons - larger for touch */}
                <div className="flex border-b border-border bg-bg-secondary">
                    <button
                        type="button"
                        onClick={() => handleTabChange('editor')}
                        className={cn(
                            'flex-1 px-4 py-3 text-base font-medium',
                            'transition-colors touch-manipulation',
                            'active:bg-bg-tertiary',
                            viewMode === 'editor'
                                ? 'border-b-2 border-primary-500 text-primary-600 dark:text-primary-400 bg-bg-tertiary/50'
                                : 'text-text-secondary hover:text-text-primary hover:bg-bg-tertiary/30'
                        )}
                    >
                        {t('layout.editor')}
                    </button>
                    <button
                        type="button"
                        onClick={() => handleTabChange('preview')}
                        className={cn(
                            'flex-1 px-4 py-3 text-base font-medium',
                            'transition-colors touch-manipulation',
                            'active:bg-bg-tertiary',
                            viewMode === 'preview'
                                ? 'border-b-2 border-primary-500 text-primary-600 dark:text-primary-400 bg-bg-tertiary/50'
                                : 'text-text-secondary hover:text-text-primary hover:bg-bg-tertiary/30'
                        )}
                    >
                        {t('layout.preview')}
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-hidden">
                    {viewMode === 'editor' ? (
                        <Editor
                            className="h-full"
                            onViewReady={onEditorViewReady}
                            onScroll={handleMobileEditorScroll}
                            onScrollToReady={handleMobileEditorScrollToReady}
                        />
                    ) : (
                        <Preview
                            content={content}
                            className="h-full"
                            onContentChange={handleContentChange}
                            onScroll={handleMobilePreviewScroll}
                            onScrollToReady={handleMobilePreviewScrollToReady}
                        />
                    )}
                </div>
            </div>
        );
    }

    // Collapse button component - highly visible colored background
    const CollapseButton = ({
        direction,
        onClick,
        tooltip,
        icon: Icon
    }: {
        direction: 'left' | 'right';
        onClick: () => void;
        tooltip: string;
        icon: typeof ChevronLeft;
    }) => (
        <Tooltip content={tooltip}>
            <button
                type="button"
                onClick={onClick}
                style={{
                    height: '1.9rem',
                    right: direction === 'left' ? '0.2rem' : undefined,
                    left: direction === 'right' ? '0.2rem' : undefined
                }}
                className={cn(
                    'absolute top-1 z-10',
                    'w-7 flex items-center justify-center',
                    'bg-primary-500 border-2 border-primary-600 rounded-md shadow-lg',
                    'text-white',
                    'hover:bg-primary-700 hover:border-primary-800 hover:shadow-xl',
                    'focus:bg-primary-600 focus:border-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-400',
                    'transition-colors duration-200'
                )}
            >
                <Icon className="h-5 w-5" />
            </button>
        </Tooltip>
    );

    // Desktop: Editor only view - button on right edge, icon points left to indicate "restore preview"
    if (!isMobile && viewMode === 'editor') {
        return (
            <div className={cn('h-full w-full min-w-0 overflow-hidden relative', className)}>
                <div data-tour="editor" className="h-full">
                    <Editor
                        className="h-full"
                        onViewReady={onEditorViewReady}
                        onScroll={handleEditorScroll}
                        onScrollToReady={handleEditorScrollToReady}
                    />
                </div>
                <CollapseButton direction="left" onClick={showSplit} tooltip={t('layout.showPreview')} icon={ChevronLeft} />
            </div>
        );
    }

    // Desktop: Preview only view - button on left edge, icon points right to indicate "restore editor"
    if (!isMobile && viewMode === 'preview') {
        return (
            <div className={cn('h-full w-full min-w-0 overflow-hidden relative', className)}>
                <div data-tour="preview" className="h-full">
                    <Preview
                        content={content}
                        className="h-full"
                        onScroll={handlePreviewScroll}
                        onScrollToReady={handlePreviewScrollToReady}
                        onContentChange={handleContentChange}
                    />
                </div>
                <CollapseButton direction="right" onClick={showSplit} tooltip={t('layout.showEditor')} icon={ChevronRight} />
            </div>
        );
    }

    // Desktop split view
    return (
        <div className={cn('h-full w-full min-w-0 overflow-hidden', className)}>
            <SplitPane
                left={
                    <div className="relative h-full">
                        <div data-tour="editor" className="h-full">
                            <Editor
                                className="h-full"
                                onViewReady={onEditorViewReady}
                                onScroll={handleEditorScroll}
                                onScrollToReady={handleEditorScrollToReady}
                            />
                        </div>
                        <CollapseButton direction="left" onClick={expandPreview} tooltip={t('layout.hideEditor')} icon={ChevronLeft} />
                    </div>
                }
                right={
                    <div className="relative h-full">
                        <div data-tour="preview" className="h-full">
                            <Preview
                                content={content}
                                className="h-full"
                                onScroll={handlePreviewScroll}
                                onScrollToReady={handlePreviewScrollToReady}
                                onContentChange={handleContentChange}
                            />
                        </div>
                        <CollapseButton direction="right" onClick={expandEditor} tooltip={t('layout.hidePreview')} icon={ChevronRight} />
                    </div>
                }
                defaultSize={splitSize}
                minSize={20}
                maxSize={80}
                onResize={handleSplitResize}
            />
        </div>
    );
}
