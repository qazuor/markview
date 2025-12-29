import { buildScrollMap, findEditorLine, findPreviewPosition } from '@/services/markdown';
import { useSettingsStore } from '@/stores/settingsStore';
import { cn } from '@/utils/cn';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { processCallouts } from './Callout';
import { processChecklists, toggleCheckboxInContent } from './Checklist';
import { processCodeBlocks } from './CodeBlock';
import { processMermaidBlocks } from './Mermaid';
import { PreviewLoading } from './PreviewLoading';
import { PreviewContextMenu } from './context-menus';
import { useMarkdown, usePreviewTheme } from './hooks';

interface PreviewProps {
    content: string;
    className?: string;
    onScroll?: (scrollPercent: number) => void;
    onScrollToReady?: (scrollTo: (percent: number) => void) => void;
    onContentChange?: (newContent: string) => void;
    /** Called when scroll changes, with the estimated source line number */
    onScrollLine?: (line: number) => void;
    /** Called when scrollToLine function is ready */
    onScrollToLineReady?: (scrollToLine: (line: number) => void) => void;
}

/**
 * Markdown preview component
 */
export function Preview({
    content,
    className,
    onScroll,
    onScrollToReady,
    onContentChange,
    onScrollLine,
    onScrollToLineReady
}: PreviewProps) {
    const { themeClass, isDark } = usePreviewTheme();
    const { previewFontSize, fontFamily } = useSettingsStore();
    const { html, isLoading, error } = useMarkdown(content, {
        theme: isDark ? 'dark' : 'light',
        debounceMs: 300
    });

    const containerRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const contentRefForChecklist = useRef(content);
    const scrollMapRef = useRef<Map<number, number>>(new Map());

    // Keep content ref updated for checklist handler
    useEffect(() => {
        contentRefForChecklist.current = content;
    }, [content]);

    // Handle checkbox toggle in task lists
    const handleChecklistToggle = useCallback(
        (taskIndex: number, checked: boolean) => {
            if (!onContentChange) return;
            const newContent = toggleCheckboxInContent(contentRefForChecklist.current, taskIndex, checked);
            onContentChange(newContent);
        },
        [onContentChange]
    );

    // Process code blocks, mermaid diagrams, callouts, and checklists after render
    useEffect(() => {
        if (contentRef.current && html) {
            processCallouts(contentRef.current);
            processCodeBlocks(contentRef.current);
            processMermaidBlocks(contentRef.current, isDark);
            processChecklists(contentRef.current, handleChecklistToggle);
        }
    }, [html, isDark, handleChecklistToggle]);

    // Rebuild scroll map when content changes
    useEffect(() => {
        if (contentRef.current && html && !isLoading) {
            // Small delay to ensure DOM is fully rendered
            const timer = setTimeout(() => {
                if (contentRef.current) {
                    scrollMapRef.current = buildScrollMap(contentRef.current);
                }
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [html, isLoading]);

    // Handle scroll events
    const handleScroll = useCallback(() => {
        if (!containerRef.current) return;

        const el = containerRef.current;
        const scrollHeight = el.scrollHeight - el.clientHeight;

        // Report scroll percent
        if (onScroll) {
            const percent = scrollHeight > 0 ? el.scrollTop / scrollHeight : 0;
            onScroll(percent);
        }

        // Report estimated source line
        if (onScrollLine && scrollMapRef.current.size > 0) {
            const line = findEditorLine(el.scrollTop, scrollMapRef.current);
            onScrollLine(line);
        }
    }, [onScroll, onScrollLine]);

    // Scroll to percent function
    const scrollToPercent = useCallback((percent: number) => {
        if (containerRef.current) {
            const el = containerRef.current;
            const scrollHeight = el.scrollHeight - el.clientHeight;
            el.scrollTop = scrollHeight * Math.max(0, Math.min(1, percent));
        }
    }, []);

    // Scroll to line function using scroll map
    const scrollToLine = useCallback((line: number) => {
        if (!containerRef.current || scrollMapRef.current.size === 0) return;

        const position = findPreviewPosition(line, scrollMapRef.current);
        containerRef.current.scrollTop = position;
    }, []);

    // Expose scrollToPercent to parent - only when container is ready
    useEffect(() => {
        if (containerRef.current && html && !isLoading) {
            onScrollToReady?.(scrollToPercent);
        }
    }, [scrollToPercent, onScrollToReady, html, isLoading]);

    // Expose scrollToLine to parent - only when container and scroll map are ready
    useEffect(() => {
        if (containerRef.current && html && !isLoading && scrollMapRef.current.size > 0) {
            onScrollToLineReady?.(scrollToLine);
        }
    }, [scrollToLine, onScrollToLineReady, html, isLoading]);

    // Font styles for preview content
    const contentStyle = useMemo(
        () => ({
            fontSize: `${previewFontSize}px`,
            fontFamily: `"${fontFamily}", ui-sans-serif, system-ui, sans-serif`
        }),
        [previewFontSize, fontFamily]
    );

    // Show loading state only for slow renders
    if (isLoading && !html) {
        return <PreviewLoading className={className} />;
    }

    // Show error state
    if (error) {
        return (
            <div className={cn('p-6 text-red-500', className)}>
                <p className="font-medium">Error rendering Markdown</p>
                <p className="text-sm">{error.message}</p>
            </div>
        );
    }

    // Empty state
    if (!content) {
        return (
            <div className={cn('flex items-center justify-center p-6 text-secondary-400', className)}>
                <p>Start writing to see the preview...</p>
            </div>
        );
    }

    return (
        <PreviewContextMenu containerRef={contentRef}>
            <section
                ref={containerRef}
                onScroll={handleScroll}
                aria-label="Markdown preview"
                aria-busy={isLoading}
                className={cn(
                    'h-full overflow-auto relative',
                    'bg-white dark:bg-secondary-950',
                    themeClass,
                    isDark && 'dark',
                    isLoading && 'cursor-wait',
                    className
                )}
            >
                {/* Loading overlay with spinner */}
                {isLoading && (
                    <output
                        className="absolute inset-0 z-10 flex items-center justify-center bg-white/50 dark:bg-secondary-950/50 backdrop-blur-[1px]"
                        aria-live="polite"
                    >
                        <div
                            className="h-8 w-8 animate-spin rounded-full border-4 border-secondary-300 border-t-primary-500"
                            aria-hidden="true"
                        />
                        <span className="sr-only">Loading preview...</span>
                    </output>
                )}
                <div
                    ref={contentRef}
                    data-preview-content
                    className={cn('preview-content prose max-w-none p-6', isDark && 'prose-invert', isLoading && 'opacity-50')}
                    style={contentStyle}
                    // biome-ignore lint/security/noDangerouslySetInnerHtml: Content is sanitized by rehype-sanitize
                    dangerouslySetInnerHTML={{ __html: html }}
                />
            </section>
        </PreviewContextMenu>
    );
}
