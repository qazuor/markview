import { useCodeMirror } from '@/components/editor/hooks/useCodeMirror';
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock EditorView with a complete implementation
vi.mock('@codemirror/view', () => {
    const mockScrollDOM = {
        scrollTop: 0,
        scrollHeight: 1000,
        clientHeight: 500
    };

    const mockEditorView = {
        dispatch: vi.fn(),
        focus: vi.fn(),
        destroy: vi.fn(),
        scrollDOM: mockScrollDOM,
        state: {
            doc: {
                toString: () => 'test content',
                length: 12,
                lines: 5,
                lineAt: () => ({ number: 1, from: 0 }),
                line: (n: number) => ({ from: 0, to: 10, number: n })
            },
            selection: {
                main: { head: 0 }
            }
        },
        lineBlockAt: () => ({ top: 100 }),
        lineBlockAtHeight: () => ({ from: 0 })
    };

    return {
        EditorView: vi.fn().mockImplementation(() => mockEditorView),
        keymap: { of: vi.fn(() => []) },
        placeholder: vi.fn(() => [])
    };
});

// Mock EditorState
vi.mock('@codemirror/state', () => ({
    EditorState: {
        create: vi.fn(() => ({
            doc: {
                toString: () => 'test content',
                length: 12
            }
        }))
    },
    Compartment: vi.fn().mockImplementation(() => ({
        of: vi.fn((ext) => ext),
        reconfigure: vi.fn((ext) => ext)
    }))
}));

// Mock autocomplete
vi.mock('@codemirror/autocomplete', () => ({
    closeBrackets: vi.fn(() => [])
}));

// Mock search
vi.mock('@codemirror/search', () => ({
    highlightSelectionMatches: vi.fn(() => []),
    searchKeymap: []
}));

// Mock local extensions
vi.mock('@/components/editor/extensions', () => ({
    createActiveLineExtension: vi.fn(() => []),
    createBracketMatchingExtension: vi.fn(() => []),
    createEmptyLinter: vi.fn(() => []),
    createHistoryExtension: vi.fn(() => []),
    createLineNumbersExtension: vi.fn((enabled: boolean) => []),
    createMarkdownExtension: vi.fn(() => []),
    createMarkdownLinter: vi.fn(() => []),
    createMinimapExtension: vi.fn((enabled: boolean) => []),
    createWordWrapExtension: vi.fn((enabled: boolean) => [])
}));

// Mock keymap
vi.mock('@/components/editor/extensions/keymap', () => ({
    createDefaultKeymap: vi.fn(() => []),
    createMarkdownKeymap: vi.fn(() => [])
}));

// Mock themes
vi.mock('@/components/editor/themes', () => ({
    darkEditorTheme: [],
    lightEditorTheme: []
}));

describe('useCodeMirror', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('initialization', () => {
        it('should return editorRef', () => {
            const { result } = renderHook(() => useCodeMirror());

            expect(result.current.editorRef).toBeDefined();
            expect(result.current.editorRef.current).toBeNull();
        });

        it('should return focus function', () => {
            const { result } = renderHook(() => useCodeMirror());

            expect(typeof result.current.focus).toBe('function');
        });

        it('should return getValue function', () => {
            const { result } = renderHook(() => useCodeMirror());

            expect(typeof result.current.getValue).toBe('function');
        });

        it('should return setValue function', () => {
            const { result } = renderHook(() => useCodeMirror());

            expect(typeof result.current.setValue).toBe('function');
        });

        it('should return scrollToPercent function', () => {
            const { result } = renderHook(() => useCodeMirror());

            expect(typeof result.current.scrollToPercent).toBe('function');
        });

        it('should return getScrollPercent function', () => {
            const { result } = renderHook(() => useCodeMirror());

            expect(typeof result.current.getScrollPercent).toBe('function');
        });

        it('should return scrollToLine function', () => {
            const { result } = renderHook(() => useCodeMirror());

            expect(typeof result.current.scrollToLine).toBe('function');
        });

        it('should return getFirstVisibleLine function', () => {
            const { result } = renderHook(() => useCodeMirror());

            expect(typeof result.current.getFirstVisibleLine).toBe('function');
        });
    });

    describe('options', () => {
        it('should accept initialContent option', () => {
            const { result } = renderHook(() => useCodeMirror({ initialContent: '# Hello World' }));

            expect(result.current.editorRef).toBeDefined();
        });

        it('should accept theme option', () => {
            const { result } = renderHook(() => useCodeMirror({ theme: 'dark' }));

            expect(result.current.editorRef).toBeDefined();
        });

        it('should accept lineNumbers option', () => {
            const { result } = renderHook(() => useCodeMirror({ lineNumbers: false }));

            expect(result.current.editorRef).toBeDefined();
        });

        it('should accept wordWrap option', () => {
            const { result } = renderHook(() => useCodeMirror({ wordWrap: false }));

            expect(result.current.editorRef).toBeDefined();
        });

        it('should accept minimap option', () => {
            const { result } = renderHook(() => useCodeMirror({ minimap: true }));

            expect(result.current.editorRef).toBeDefined();
        });

        it('should accept fontSize option', () => {
            const { result } = renderHook(() => useCodeMirror({ fontSize: 16 }));

            expect(result.current.editorRef).toBeDefined();
        });

        it('should accept fontFamily option', () => {
            const { result } = renderHook(() => useCodeMirror({ fontFamily: 'Fira Code' }));

            expect(result.current.editorRef).toBeDefined();
        });

        it('should accept lintOnType option', () => {
            const { result } = renderHook(() => useCodeMirror({ lintOnType: false }));

            expect(result.current.editorRef).toBeDefined();
        });

        it('should accept placeholderText option', () => {
            const { result } = renderHook(() => useCodeMirror({ placeholderText: 'Type something...' }));

            expect(result.current.editorRef).toBeDefined();
        });

        it('should accept onChange callback', () => {
            const onChange = vi.fn();
            const { result } = renderHook(() => useCodeMirror({ onChange }));

            expect(result.current.editorRef).toBeDefined();
        });

        it('should accept onCursorChange callback', () => {
            const onCursorChange = vi.fn();
            const { result } = renderHook(() => useCodeMirror({ onCursorChange }));

            expect(result.current.editorRef).toBeDefined();
        });

        it('should accept onScroll callback', () => {
            const onScroll = vi.fn();
            const { result } = renderHook(() => useCodeMirror({ onScroll }));

            expect(result.current.editorRef).toBeDefined();
        });

        it('should accept onScrollLine callback', () => {
            const onScrollLine = vi.fn();
            const { result } = renderHook(() => useCodeMirror({ onScrollLine }));

            expect(result.current.editorRef).toBeDefined();
        });
    });

    describe('default values', () => {
        it('should use light theme by default', () => {
            const { result } = renderHook(() => useCodeMirror());

            expect(result.current.editorRef).toBeDefined();
        });

        it('should enable line numbers by default', () => {
            const { result } = renderHook(() => useCodeMirror());

            expect(result.current.editorRef).toBeDefined();
        });

        it('should enable word wrap by default', () => {
            const { result } = renderHook(() => useCodeMirror());

            expect(result.current.editorRef).toBeDefined();
        });

        it('should disable minimap by default', () => {
            const { result } = renderHook(() => useCodeMirror());

            expect(result.current.editorRef).toBeDefined();
        });

        it('should use 14px font size by default', () => {
            const { result } = renderHook(() => useCodeMirror());

            expect(result.current.editorRef).toBeDefined();
        });

        it('should use JetBrains Mono font by default', () => {
            const { result } = renderHook(() => useCodeMirror());

            expect(result.current.editorRef).toBeDefined();
        });

        it('should enable lintOnType by default', () => {
            const { result } = renderHook(() => useCodeMirror());

            expect(result.current.editorRef).toBeDefined();
        });
    });

    describe('return interface', () => {
        it('should return the correct interface shape', () => {
            const { result } = renderHook(() => useCodeMirror());

            expect(result.current).toHaveProperty('editorRef');
            expect(result.current).toHaveProperty('view');
            expect(result.current).toHaveProperty('focus');
            expect(result.current).toHaveProperty('getValue');
            expect(result.current).toHaveProperty('setValue');
            expect(result.current).toHaveProperty('scrollToPercent');
            expect(result.current).toHaveProperty('getScrollPercent');
            expect(result.current).toHaveProperty('scrollToLine');
            expect(result.current).toHaveProperty('getFirstVisibleLine');
        });

        it('should have view as null initially when no DOM element', () => {
            const { result } = renderHook(() => useCodeMirror());

            expect(result.current.view).toBeNull();
        });
    });

    describe('method behaviors without view', () => {
        it('should handle focus when view is null', () => {
            const { result } = renderHook(() => useCodeMirror());

            expect(() => {
                act(() => {
                    result.current.focus();
                });
            }).not.toThrow();
        });

        it('should return empty string from getValue when view is null', () => {
            const { result } = renderHook(() => useCodeMirror());

            const value = result.current.getValue();
            expect(value).toBe('');
        });

        it('should handle setValue when view is null', () => {
            const { result } = renderHook(() => useCodeMirror());

            expect(() => {
                act(() => {
                    result.current.setValue('new content');
                });
            }).not.toThrow();
        });

        it('should handle scrollToPercent when view is null', () => {
            const { result } = renderHook(() => useCodeMirror());

            expect(() => {
                act(() => {
                    result.current.scrollToPercent(0.5);
                });
            }).not.toThrow();
        });

        it('should return 0 from getScrollPercent when view is null', () => {
            const { result } = renderHook(() => useCodeMirror());

            const percent = result.current.getScrollPercent();
            expect(percent).toBe(0);
        });

        it('should handle scrollToLine when view is null', () => {
            const { result } = renderHook(() => useCodeMirror());

            expect(() => {
                act(() => {
                    result.current.scrollToLine(5);
                });
            }).not.toThrow();
        });

        it('should return 1 from getFirstVisibleLine when view is null', () => {
            const { result } = renderHook(() => useCodeMirror());

            const line = result.current.getFirstVisibleLine();
            expect(line).toBe(1);
        });
    });

    describe('rerendering', () => {
        it('should maintain stable function references', () => {
            const { result, rerender } = renderHook(() => useCodeMirror());

            const initialFocus = result.current.focus;
            const initialGetValue = result.current.getValue;
            const initialSetValue = result.current.setValue;

            rerender();

            expect(result.current.focus).toBe(initialFocus);
            expect(result.current.getValue).toBe(initialGetValue);
            expect(result.current.setValue).toBe(initialSetValue);
        });

        it('should maintain editorRef across rerenders', () => {
            const { result, rerender } = renderHook(() => useCodeMirror());

            const initialRef = result.current.editorRef;

            rerender();

            expect(result.current.editorRef).toBe(initialRef);
        });
    });

    describe('option changes', () => {
        it('should handle theme change', () => {
            const { result, rerender } = renderHook(({ theme }) => useCodeMirror({ theme }), { initialProps: { theme: 'light' as const } });

            expect(result.current.editorRef).toBeDefined();

            rerender({ theme: 'dark' as const });

            expect(result.current.editorRef).toBeDefined();
        });

        it('should handle lineNumbers change', () => {
            const { result, rerender } = renderHook(({ lineNumbers }) => useCodeMirror({ lineNumbers }), {
                initialProps: { lineNumbers: true }
            });

            rerender({ lineNumbers: false });

            expect(result.current.editorRef).toBeDefined();
        });

        it('should handle wordWrap change', () => {
            const { result, rerender } = renderHook(({ wordWrap }) => useCodeMirror({ wordWrap }), { initialProps: { wordWrap: true } });

            rerender({ wordWrap: false });

            expect(result.current.editorRef).toBeDefined();
        });

        it('should handle minimap change', () => {
            const { result, rerender } = renderHook(({ minimap }) => useCodeMirror({ minimap }), { initialProps: { minimap: false } });

            rerender({ minimap: true });

            expect(result.current.editorRef).toBeDefined();
        });

        it('should handle fontSize change', () => {
            const { result, rerender } = renderHook(({ fontSize }) => useCodeMirror({ fontSize }), { initialProps: { fontSize: 14 } });

            rerender({ fontSize: 16 });

            expect(result.current.editorRef).toBeDefined();
        });

        it('should handle fontFamily change', () => {
            const { result, rerender } = renderHook(({ fontFamily }) => useCodeMirror({ fontFamily }), {
                initialProps: { fontFamily: 'JetBrains Mono' }
            });

            rerender({ fontFamily: 'Fira Code' });

            expect(result.current.editorRef).toBeDefined();
        });

        it('should handle lintOnType change', () => {
            const { result, rerender } = renderHook(({ lintOnType }) => useCodeMirror({ lintOnType }), {
                initialProps: { lintOnType: true }
            });

            rerender({ lintOnType: false });

            expect(result.current.editorRef).toBeDefined();
        });
    });
});
