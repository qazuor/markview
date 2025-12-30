import { useDebouncedCallback } from '@/hooks/useDebounce';
import { useDocumentStore } from '@/stores/documentStore';
import { useCallback, useEffect, useRef } from 'react';

interface UseEditorSyncOptions {
    debounceMs?: number;
}

interface UseEditorSyncReturn {
    content: string;
    documentId: string | null;
    handleChange: (newContent: string) => void;
    handleCursorChange: (line: number, column: number) => void;
}

/**
 * Hook to sync editor content with document store
 */
export function useEditorSync(options: UseEditorSyncOptions = {}): UseEditorSyncReturn {
    const { debounceMs = 300 } = options;

    const activeDocumentId = useDocumentStore((s) => s.activeDocumentId);
    const documents = useDocumentStore((s) => s.documents);
    const updateContent = useDocumentStore((s) => s.updateContent);
    const updateCursor = useDocumentStore((s) => s.updateCursor);

    const activeDocument = activeDocumentId ? (documents.get(activeDocumentId) ?? null) : null;
    const content = activeDocument?.content ?? '';

    // Track pending content per document to avoid losing changes on tab switch
    const pendingContentMap = useRef<Map<string, string>>(new Map());
    const prevDocumentIdRef = useRef<string | null>(null);

    // Flush pending content when document changes
    useEffect(() => {
        const prevId = prevDocumentIdRef.current;

        // Save pending content from previous document immediately
        if (prevId && pendingContentMap.current.has(prevId)) {
            const pendingContent = pendingContentMap.current.get(prevId);
            if (pendingContent !== undefined) {
                updateContent(prevId, pendingContent);
                pendingContentMap.current.delete(prevId);
            }
        }

        prevDocumentIdRef.current = activeDocumentId;
    }, [activeDocumentId, updateContent]);

    // Debounced update to store
    const debouncedUpdate = useDebouncedCallback((documentId: string, newContent: string) => {
        updateContent(documentId, newContent);
        pendingContentMap.current.delete(documentId);
    }, debounceMs);

    const handleChange = useCallback(
        (newContent: string) => {
            if (!activeDocumentId) return;
            pendingContentMap.current.set(activeDocumentId, newContent);
            debouncedUpdate(activeDocumentId, newContent);
        },
        [activeDocumentId, debouncedUpdate]
    );

    const handleCursorChange = useCallback(
        (line: number, column: number) => {
            if (!activeDocumentId) return;
            updateCursor(activeDocumentId, line, column);
        },
        [activeDocumentId, updateCursor]
    );

    // Get pending content for current document, or fall back to stored content
    const currentPendingContent = activeDocumentId ? pendingContentMap.current.get(activeDocumentId) : undefined;

    // Debug: log when content changes from store
    const finalContent = currentPendingContent ?? content;
    const prevContentRef = useRef(finalContent);
    useEffect(() => {
        if (prevContentRef.current !== finalContent) {
            console.log('[useEditorSync] Content changed', {
                fromPending: !!currentPendingContent,
                contentLength: finalContent.length,
                storeContentLength: content.length
            });
            prevContentRef.current = finalContent;
        }
    }, [finalContent, currentPendingContent, content]);

    return {
        content: finalContent,
        documentId: activeDocumentId,
        handleChange,
        handleCursorChange
    };
}
