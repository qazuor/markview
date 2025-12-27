import { closeBrackets } from '@codemirror/autocomplete';
import { highlightSelectionMatches, searchKeymap } from '@codemirror/search';
import { Compartment, EditorState } from '@codemirror/state';
import { EditorView, keymap, placeholder } from '@codemirror/view';
import { useCallback, useEffect, useRef } from 'react';
import {
    createActiveLineExtension,
    createBracketMatchingExtension,
    createEmptyLinter,
    createHistoryExtension,
    createLineNumbersExtension,
    createMarkdownExtension,
    createMarkdownLinter,
    createMinimapExtension,
    createWordWrapExtension
} from '../extensions';
import { createDefaultKeymap, createMarkdownKeymap } from '../extensions/keymap';
import { darkEditorTheme, lightEditorTheme } from '../themes';

// Create font style extension (outside component to avoid re-creation)
function createFontExtension(size: number, family: string) {
    return EditorView.theme({
        '&': {
            fontSize: `${size}px`
        },
        '.cm-content': {
            fontFamily: `"${family}", ui-monospace, monospace`
        },
        '.cm-gutters': {
            fontSize: `${size}px`
        }
    });
}

export interface UseCodeMirrorOptions {
    initialContent?: string;
    onChange?: (content: string) => void;
    onCursorChange?: (line: number, column: number) => void;
    onScroll?: (scrollPercent: number) => void;
    theme?: 'light' | 'dark';
    lineNumbers?: boolean;
    wordWrap?: boolean;
    minimap?: boolean;
    fontSize?: number;
    fontFamily?: string;
    lintOnType?: boolean;
    placeholderText?: string;
}

export interface UseCodeMirrorReturn {
    editorRef: React.RefObject<HTMLDivElement | null>;
    view: EditorView | null;
    focus: () => void;
    getValue: () => string;
    setValue: (value: string) => void;
    scrollToPercent: (percent: number) => void;
    getScrollPercent: () => number;
}

export function useCodeMirror(options: UseCodeMirrorOptions = {}): UseCodeMirrorReturn {
    const {
        initialContent = '',
        onChange,
        onCursorChange,
        onScroll,
        theme = 'light',
        lineNumbers = true,
        wordWrap = true,
        minimap = false,
        fontSize = 14,
        fontFamily = 'JetBrains Mono',
        lintOnType = true,
        placeholderText = 'Start writing Markdown...'
    } = options;

    const editorRef = useRef<HTMLDivElement>(null);
    const viewRef = useRef<EditorView | null>(null);
    const themeCompartment = useRef(new Compartment());
    const lineNumbersCompartment = useRef(new Compartment());
    const wordWrapCompartment = useRef(new Compartment());
    const minimapCompartment = useRef(new Compartment());
    const fontCompartment = useRef(new Compartment());
    const lintCompartment = useRef(new Compartment());

    // Store callbacks in refs to avoid re-creating the editor
    const onChangeRef = useRef(onChange);
    const onCursorChangeRef = useRef(onCursorChange);
    const onScrollRef = useRef(onScroll);
    onChangeRef.current = onChange;
    onCursorChangeRef.current = onCursorChange;
    onScrollRef.current = onScroll;

    // Store initial values in refs
    const initialContentRef = useRef(initialContent);
    const initialThemeRef = useRef(theme);
    const initialLineNumbersRef = useRef(lineNumbers);
    const initialWordWrapRef = useRef(wordWrap);
    const initialMinimapRef = useRef(minimap);
    const initialFontSizeRef = useRef(fontSize);
    const initialFontFamilyRef = useRef(fontFamily);
    const initialLintOnTypeRef = useRef(lintOnType);
    const initialPlaceholderRef = useRef(placeholderText);

    // Initialize editor - only runs once
    useEffect(() => {
        if (!editorRef.current || viewRef.current) return;

        const updateListener = EditorView.updateListener.of((update) => {
            if (update.docChanged && onChangeRef.current) {
                onChangeRef.current(update.state.doc.toString());
            }

            if (update.selectionSet && onCursorChangeRef.current) {
                const pos = update.state.selection.main.head;
                const line = update.state.doc.lineAt(pos);
                onCursorChangeRef.current(line.number, pos - line.from + 1);
            }
        });

        // Scroll event handler
        const scrollHandler = EditorView.domEventHandlers({
            scroll: (_event, view) => {
                if (onScrollRef.current) {
                    const scroller = view.scrollDOM;
                    const scrollHeight = scroller.scrollHeight - scroller.clientHeight;
                    const percent = scrollHeight > 0 ? scroller.scrollTop / scrollHeight : 0;
                    onScrollRef.current(percent);
                }
                return false;
            }
        });

        const state = EditorState.create({
            doc: initialContentRef.current,
            extensions: [
                // Theme (compartmentalized for switching)
                themeCompartment.current.of(initialThemeRef.current === 'dark' ? darkEditorTheme : lightEditorTheme),

                // Editor configuration (compartmentalized)
                lineNumbersCompartment.current.of(createLineNumbersExtension(initialLineNumbersRef.current)),
                wordWrapCompartment.current.of(createWordWrapExtension(initialWordWrapRef.current)),
                minimapCompartment.current.of(createMinimapExtension(initialMinimapRef.current)),
                fontCompartment.current.of(createFontExtension(initialFontSizeRef.current, initialFontFamilyRef.current)),
                lintCompartment.current.of(initialLintOnTypeRef.current ? createMarkdownLinter() : createEmptyLinter()),

                // Core extensions
                createMarkdownExtension(),
                createActiveLineExtension(),
                createBracketMatchingExtension(),
                createHistoryExtension(),
                closeBrackets(),
                highlightSelectionMatches(),

                // Keymaps
                createMarkdownKeymap(),
                createDefaultKeymap(),
                keymap.of(searchKeymap),

                // Placeholder
                placeholder(initialPlaceholderRef.current),

                // Update listener
                updateListener,

                // Scroll handler
                scrollHandler
            ]
        });

        const view = new EditorView({
            state,
            parent: editorRef.current
        });

        viewRef.current = view;

        return () => {
            view.destroy();
            viewRef.current = null;
        };
    }, []);

    // Update theme when it changes
    useEffect(() => {
        if (!viewRef.current) return;

        viewRef.current.dispatch({
            effects: themeCompartment.current.reconfigure(theme === 'dark' ? darkEditorTheme : lightEditorTheme)
        });
    }, [theme]);

    // Update line numbers when setting changes
    useEffect(() => {
        if (!viewRef.current) return;

        viewRef.current.dispatch({
            effects: lineNumbersCompartment.current.reconfigure(createLineNumbersExtension(lineNumbers))
        });
    }, [lineNumbers]);

    // Update word wrap when setting changes
    useEffect(() => {
        if (!viewRef.current) return;

        viewRef.current.dispatch({
            effects: wordWrapCompartment.current.reconfigure(createWordWrapExtension(wordWrap))
        });
    }, [wordWrap]);

    // Update minimap when setting changes
    useEffect(() => {
        if (!viewRef.current) return;

        viewRef.current.dispatch({
            effects: minimapCompartment.current.reconfigure(createMinimapExtension(minimap))
        });
    }, [minimap]);

    // Update font settings when they change
    useEffect(() => {
        if (!viewRef.current) return;

        viewRef.current.dispatch({
            effects: fontCompartment.current.reconfigure(createFontExtension(fontSize, fontFamily))
        });
    }, [fontSize, fontFamily]);

    // Update linting when setting changes
    useEffect(() => {
        if (!viewRef.current) return;

        viewRef.current.dispatch({
            effects: lintCompartment.current.reconfigure(lintOnType ? createMarkdownLinter() : createEmptyLinter())
        });
    }, [lintOnType]);

    const focus = useCallback(() => {
        viewRef.current?.focus();
    }, []);

    const getValue = useCallback(() => {
        return viewRef.current?.state.doc.toString() ?? '';
    }, []);

    const setValue = useCallback((value: string) => {
        if (!viewRef.current) return;

        viewRef.current.dispatch({
            changes: {
                from: 0,
                to: viewRef.current.state.doc.length,
                insert: value
            }
        });
    }, []);

    const scrollToPercent = useCallback((percent: number) => {
        if (!viewRef.current) return;

        const scroller = viewRef.current.scrollDOM;
        const scrollHeight = scroller.scrollHeight - scroller.clientHeight;
        scroller.scrollTop = scrollHeight * Math.max(0, Math.min(1, percent));
    }, []);

    const getScrollPercent = useCallback(() => {
        if (!viewRef.current) return 0;

        const scroller = viewRef.current.scrollDOM;
        const scrollHeight = scroller.scrollHeight - scroller.clientHeight;
        return scrollHeight > 0 ? scroller.scrollTop / scrollHeight : 0;
    }, []);

    return {
        editorRef,
        view: viewRef.current,
        focus,
        getValue,
        setValue,
        scrollToPercent,
        getScrollPercent
    };
}
