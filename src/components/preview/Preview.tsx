import { cn } from '@/utils/cn';
import { useCallback, useEffect, useRef } from 'react';
import { processCodeBlocks } from './CodeBlock';
import { PreviewLoading } from './PreviewLoading';
import { useMarkdown, usePreviewTheme } from './hooks';

interface PreviewProps {
    content: string;
    className?: string;
    onScroll?: (scrollTop: number) => void;
}

/**
 * Markdown preview component
 */
export function Preview({ content, className, onScroll }: PreviewProps) {
    const { themeClass, isDark } = usePreviewTheme();
    const { html, isLoading, error } = useMarkdown(content, {
        theme: isDark ? 'dark' : 'light',
        debounceMs: 300
    });

    const containerRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    // Process code blocks after render
    useEffect(() => {
        if (contentRef.current && html) {
            processCodeBlocks(contentRef.current);
        }
    }, [html]);

    // Handle scroll events
    const handleScroll = useCallback(() => {
        if (containerRef.current && onScroll) {
            onScroll(containerRef.current.scrollTop);
        }
    }, [onScroll]);

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
                className={cn('preview-content prose max-w-none p-6', isDark && 'prose-invert')}
                // biome-ignore lint/security/noDangerouslySetInnerHtml: Content is sanitized by rehype-sanitize
                dangerouslySetInnerHTML={{ __html: html }}
            />
        </div>
    );
}
