import { useSettingsStore } from '@/stores/settingsStore';
import { cn } from '@/utils/cn';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { processCallouts } from './Callout';
import { processChecklists, toggleCheckboxInContent } from './Checklist';
import { processCodeBlocks } from './CodeBlock';
import { processMermaidBlocks } from './Mermaid';
import { PreviewLoading } from './PreviewLoading';
import { useMarkdown, usePreviewTheme } from './hooks';

interface PreviewProps {
    content: string;
    className?: string;
    onScroll?: (scrollPercent: number) => void;
    onScrollToReady?: (scrollTo: (percent: number) => void) => void;
    onContentChange?: (newContent: string) => void;
}

/**
 * Markdown preview component
 */
export function Preview({ content, className, onScroll, onScrollToReady, onContentChange }: PreviewProps) {
    const { themeClass, isDark } = usePreviewTheme();
    const { previewFontSize, fontFamily } = useSettingsStore();
    const { html, isLoading, error } = useMarkdown(content, {
        theme: isDark ? 'dark' : 'light',
        debounceMs: 300
    });

    const containerRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const contentRefForChecklist = useRef(content);

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

    // Handle scroll events
    const handleScroll = useCallback(() => {
        if (containerRef.current && onScroll) {
            const el = containerRef.current;
            const scrollHeight = el.scrollHeight - el.clientHeight;
            const percent = scrollHeight > 0 ? el.scrollTop / scrollHeight : 0;
            onScroll(percent);
        }
    }, [onScroll]);

    // Scroll to percent function
    const scrollToPercent = useCallback((percent: number) => {
        if (containerRef.current) {
            const el = containerRef.current;
            const scrollHeight = el.scrollHeight - el.clientHeight;
            el.scrollTop = scrollHeight * Math.max(0, Math.min(1, percent));
        }
    }, []);

    // Expose scrollToPercent to parent
    useEffect(() => {
        onScrollToReady?.(scrollToPercent);
    }, [scrollToPercent, onScrollToReady]);

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
        <div
            ref={containerRef}
            onScroll={handleScroll}
            className={cn('h-full overflow-auto', 'bg-white dark:bg-secondary-950', themeClass, isDark && 'dark', className)}
        >
            <div
                ref={contentRef}
                data-preview-content
                className={cn('preview-content prose max-w-none p-6', isDark && 'prose-invert')}
                style={contentStyle}
                // biome-ignore lint/security/noDangerouslySetInnerHtml: Content is sanitized by rehype-sanitize
                dangerouslySetInnerHTML={{ __html: html }}
            />
        </div>
    );
}
