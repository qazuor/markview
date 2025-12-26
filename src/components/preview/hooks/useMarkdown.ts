import { type SyntaxTheme, renderMarkdown } from '@/services/markdown';
import { useCallback, useEffect, useRef, useState } from 'react';

interface UseMarkdownOptions {
    debounceMs?: number;
    theme?: SyntaxTheme;
}

interface UseMarkdownReturn {
    html: string;
    isLoading: boolean;
    error: Error | null;
}

/**
 * Hook to process Markdown and return HTML
 */
export function useMarkdown(markdown: string, options: UseMarkdownOptions = {}): UseMarkdownReturn {
    const { debounceMs = 300, theme = 'light' } = options;

    const [html, setHtml] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const abortRef = useRef<AbortController | null>(null);

    const processMarkdown = useCallback(async (content: string, syntaxTheme: SyntaxTheme) => {
        // Cancel previous processing
        if (abortRef.current) {
            abortRef.current.abort();
        }

        abortRef.current = new AbortController();

        try {
            setIsLoading(true);
            setError(null);

            const result = await renderMarkdown(content, syntaxTheme);

            // Check if aborted
            if (!abortRef.current.signal.aborted) {
                setHtml(result);
            }
        } catch (err) {
            if (!abortRef.current?.signal.aborted) {
                setError(err instanceof Error ? err : new Error('Failed to process Markdown'));
            }
        } finally {
            if (!abortRef.current?.signal.aborted) {
                setIsLoading(false);
            }
        }
    }, []);

    useEffect(() => {
        // Clear previous timeout
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        // Immediate render for first load or empty content
        if (markdown === '' || html === '') {
            processMarkdown(markdown, theme);
            return;
        }

        // Debounced render for content changes
        timeoutRef.current = setTimeout(() => {
            processMarkdown(markdown, theme);
        }, debounceMs);

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [markdown, theme, debounceMs, processMarkdown, html]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (abortRef.current) {
                abortRef.current.abort();
            }
        };
    }, []);

    return { html, isLoading, error };
}
