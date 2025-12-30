import { useSettingsStore } from '@/stores/settingsStore';
import { cn } from '@/utils/cn';
import type { EditorView } from '@codemirror/view';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { EditorContextMenu } from './EditorContextMenu';
import { useCodeMirror } from './hooks/useCodeMirror';
import { useEditorSync } from './hooks/useEditorSync';
import { useEditorTheme } from './hooks/useEditorTheme';

interface EditorProps {
    className?: string;
    onViewReady?: (view: EditorView | null) => void;
    onScroll?: (scrollPercent: number) => void;
    onScrollToReady?: (scrollTo: (percent: number) => void) => void;
    /** Called when scroll changes, with the first visible line number */
    onScrollLine?: (line: number) => void;
    /** Called when scrollToLine function is ready */
    onScrollToLineReady?: (scrollToLine: (line: number) => void) => void;
}

export function Editor({ className, onViewReady, onScroll, onScrollToReady, onScrollLine, onScrollToLineReady }: EditorProps) {
    const { t } = useTranslation();
    const theme = useEditorTheme();
    const { lineNumbers, wordWrap, minimap, editorFontSize, fontFamily, lintOnType } = useSettingsStore();
    const { content, documentId, handleChange, handleCursorChange } = useEditorSync();

    const { editorRef, view, setValue, getValue, focus, scrollToPercent, scrollToLine } = useCodeMirror({
        initialContent: content,
        onChange: handleChange,
        onCursorChange: handleCursorChange,
        onScroll,
        onScrollLine,
        theme,
        lineNumbers,
        wordWrap,
        minimap,
        fontSize: editorFontSize,
        fontFamily,
        lintOnType
    });

    // Notify parent when view is ready
    useEffect(() => {
        onViewReady?.(view);
    }, [view, onViewReady]);

    // Expose scrollToPercent to parent
    useEffect(() => {
        onScrollToReady?.(scrollToPercent);
    }, [scrollToPercent, onScrollToReady]);

    // Expose scrollToLine to parent
    useEffect(() => {
        onScrollToLineReady?.(scrollToLine);
    }, [scrollToLine, onScrollToLineReady]);

    // Store setValue and getValue in refs
    const setValueRef = useRef(setValue);
    const getValueRef = useRef(getValue);
    setValueRef.current = setValue;
    getValueRef.current = getValue;

    // Track previous documentId to detect document switches
    const prevDocumentIdRef = useRef<string | null>(null);

    // Track if we're currently updating to avoid loops
    const isUpdatingRef = useRef(false);

    // Sync content when document changes (user switches to a different document)
    useEffect(() => {
        if (documentId && documentId !== prevDocumentIdRef.current) {
            isUpdatingRef.current = true;
            setValueRef.current(content);
            prevDocumentIdRef.current = documentId;
            // Reset flag after a tick
            setTimeout(() => {
                isUpdatingRef.current = false;
            }, 0);
        }
    }, [documentId, content]);

    // Sync content when it changes externally (e.g., from cross-tab sync)
    // This effect detects when the store content differs from editor content
    useEffect(() => {
        // Skip if we're currently updating or if editor isn't ready
        if (isUpdatingRef.current || !documentId) return;

        const editorContent = getValueRef.current();

        // Only update if content actually differs (external change)
        if (content !== editorContent) {
            console.log('[Editor] External content change detected, updating editor');
            isUpdatingRef.current = true;
            setValueRef.current(content);
            // Reset flag after a tick
            setTimeout(() => {
                isUpdatingRef.current = false;
            }, 0);
        }
    }, [content, documentId]);

    // Focus editor when document is available
    useEffect(() => {
        if (documentId) {
            focus();
        }
    }, [documentId, focus]);

    return (
        <EditorContextMenu editorView={view}>
            <section
                aria-label={t('aria.markdownEditor')}
                className={cn(
                    'h-full w-full min-w-0 overflow-hidden',
                    'bg-white dark:bg-secondary-900',
                    'border-r border-secondary-200 dark:border-secondary-700',
                    className
                )}
            >
                <div
                    ref={editorRef as React.RefObject<HTMLDivElement>}
                    className="h-full w-full [&_.cm-editor]:h-full [&_.cm-editor]:overflow-hidden [&_.cm-scroller]:overflow-auto"
                />
            </section>
        </EditorContextMenu>
    );
}
