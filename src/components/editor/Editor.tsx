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

    const { editorRef, view, setValue, focus, scrollToPercent, scrollToLine } = useCodeMirror({
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

    // Store content in ref to avoid triggering effect on every content change
    const contentRef = useRef(content);
    contentRef.current = content;

    // Store setValue in ref
    const setValueRef = useRef(setValue);
    setValueRef.current = setValue;

    // Track previous documentId to detect document switches
    const prevDocumentIdRef = useRef<string | null>(null);

    // Sync content when document changes (user switches to a different document)
    useEffect(() => {
        if (documentId && documentId !== prevDocumentIdRef.current) {
            setValueRef.current(contentRef.current);
            prevDocumentIdRef.current = documentId;
        }
    }, [documentId]);

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
