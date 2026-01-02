import { useToolbarActions } from '@/components/toolbar/hooks/useToolbarActions';
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock editor commands
vi.mock('@/components/editor/commands', () => ({
    toggleBold: vi.fn(() => true),
    toggleItalic: vi.fn(() => true),
    toggleStrikethrough: vi.fn(() => true),
    setHeading1: vi.fn(() => true),
    setHeading2: vi.fn(() => true),
    setHeading3: vi.fn(() => true),
    setHeading4: vi.fn(() => true),
    setHeading5: vi.fn(() => true),
    setHeading6: vi.fn(() => true),
    insertLink: vi.fn(() => true),
    insertImage: vi.fn(() => true),
    toggleInlineCode: vi.fn(() => true),
    insertCodeBlock: vi.fn(() => true),
    toggleQuote: vi.fn(() => true),
    insertHorizontalRule: vi.fn(() => true),
    toggleBulletList: vi.fn(() => true),
    toggleNumberedList: vi.fn(() => true),
    toggleTaskList: vi.fn(() => true)
}));

// Import mocked commands for assertions
import {
    insertCodeBlock,
    insertHorizontalRule,
    insertImage,
    insertLink,
    setHeading1,
    setHeading2,
    toggleBold,
    toggleBulletList,
    toggleInlineCode,
    toggleItalic,
    toggleNumberedList,
    toggleQuote,
    toggleStrikethrough,
    toggleTaskList
} from '@/components/editor/commands';

describe('useToolbarActions', () => {
    const mockFocus = vi.fn();
    const mockDispatch = vi.fn();
    let mockEditorView: {
        focus: typeof mockFocus;
        dispatch: typeof mockDispatch;
        state: {
            selection: { main: { from: number; to: number; head: number } };
            doc: { lineAt: (pos: number) => { from: number; text: string } };
        };
    };

    beforeEach(() => {
        vi.clearAllMocks();
        mockEditorView = {
            focus: mockFocus,
            dispatch: mockDispatch,
            state: {
                selection: { main: { from: 0, to: 0, head: 0 } },
                doc: {
                    lineAt: () => ({ from: 0, text: '## Heading' })
                }
            }
        };
    });

    describe('isDisabled', () => {
        it('should be true when editorView is null', () => {
            const { result } = renderHook(() => useToolbarActions({ editorView: null }));

            expect(result.current.isDisabled).toBe(true);
        });

        it('should be false when editorView is provided', () => {
            const { result } = renderHook(() => useToolbarActions({ editorView: mockEditorView as never }));

            expect(result.current.isDisabled).toBe(false);
        });
    });

    describe('handleFormat', () => {
        it('should call toggleBold for bold format', () => {
            const { result } = renderHook(() => useToolbarActions({ editorView: mockEditorView as never }));

            act(() => {
                result.current.handleFormat('bold');
            });

            expect(toggleBold).toHaveBeenCalled();
            expect(mockFocus).toHaveBeenCalled();
        });

        it('should call toggleItalic for italic format', () => {
            const { result } = renderHook(() => useToolbarActions({ editorView: mockEditorView as never }));

            act(() => {
                result.current.handleFormat('italic');
            });

            expect(toggleItalic).toHaveBeenCalled();
        });

        it('should call toggleStrikethrough for strikethrough format', () => {
            const { result } = renderHook(() => useToolbarActions({ editorView: mockEditorView as never }));

            act(() => {
                result.current.handleFormat('strikethrough');
            });

            expect(toggleStrikethrough).toHaveBeenCalled();
        });

        it('should not call any command for unknown format', () => {
            const { result } = renderHook(() => useToolbarActions({ editorView: mockEditorView as never }));

            act(() => {
                result.current.handleFormat('unknown');
            });

            expect(toggleBold).not.toHaveBeenCalled();
            expect(toggleItalic).not.toHaveBeenCalled();
        });

        it('should not execute when editorView is null', () => {
            const { result } = renderHook(() => useToolbarActions({ editorView: null }));

            act(() => {
                result.current.handleFormat('bold');
            });

            expect(toggleBold).not.toHaveBeenCalled();
        });
    });

    describe('handleHeading', () => {
        it('should call setHeading1 for level 1', () => {
            const { result } = renderHook(() => useToolbarActions({ editorView: mockEditorView as never }));

            act(() => {
                result.current.handleHeading(1);
            });

            expect(setHeading1).toHaveBeenCalled();
        });

        it('should call setHeading2 for level 2', () => {
            const { result } = renderHook(() => useToolbarActions({ editorView: mockEditorView as never }));

            act(() => {
                result.current.handleHeading(2);
            });

            expect(setHeading2).toHaveBeenCalled();
        });

        it('should remove heading for level 0', () => {
            const { result } = renderHook(() => useToolbarActions({ editorView: mockEditorView as never }));

            act(() => {
                result.current.handleHeading(0);
            });

            expect(mockDispatch).toHaveBeenCalled();
            expect(mockFocus).toHaveBeenCalled();
        });

        it('should not execute when editorView is null', () => {
            const { result } = renderHook(() => useToolbarActions({ editorView: null }));

            act(() => {
                result.current.handleHeading(1);
            });

            expect(setHeading1).not.toHaveBeenCalled();
        });
    });

    describe('handleInsert', () => {
        it('should call insertLink for link type', () => {
            const { result } = renderHook(() => useToolbarActions({ editorView: mockEditorView as never }));

            act(() => {
                result.current.handleInsert('link');
            });

            expect(insertLink).toHaveBeenCalled();
        });

        it('should call insertImage for image type', () => {
            const { result } = renderHook(() => useToolbarActions({ editorView: mockEditorView as never }));

            act(() => {
                result.current.handleInsert('image');
            });

            expect(insertImage).toHaveBeenCalled();
        });

        it('should call toggleInlineCode for inlineCode type', () => {
            const { result } = renderHook(() => useToolbarActions({ editorView: mockEditorView as never }));

            act(() => {
                result.current.handleInsert('inlineCode');
            });

            expect(toggleInlineCode).toHaveBeenCalled();
        });

        it('should call insertCodeBlock for codeBlock type', () => {
            const { result } = renderHook(() => useToolbarActions({ editorView: mockEditorView as never }));

            act(() => {
                result.current.handleInsert('codeBlock');
            });

            expect(insertCodeBlock).toHaveBeenCalled();
        });

        it('should call toggleQuote for blockquote type', () => {
            const { result } = renderHook(() => useToolbarActions({ editorView: mockEditorView as never }));

            act(() => {
                result.current.handleInsert('blockquote');
            });

            expect(toggleQuote).toHaveBeenCalled();
        });

        it('should call insertHorizontalRule for hr type', () => {
            const { result } = renderHook(() => useToolbarActions({ editorView: mockEditorView as never }));

            act(() => {
                result.current.handleInsert('hr');
            });

            expect(insertHorizontalRule).toHaveBeenCalled();
        });
    });

    describe('handleList', () => {
        it('should call toggleBulletList for bulletList type', () => {
            const { result } = renderHook(() => useToolbarActions({ editorView: mockEditorView as never }));

            act(() => {
                result.current.handleList('bulletList');
            });

            expect(toggleBulletList).toHaveBeenCalled();
        });

        it('should call toggleNumberedList for numberedList type', () => {
            const { result } = renderHook(() => useToolbarActions({ editorView: mockEditorView as never }));

            act(() => {
                result.current.handleList('numberedList');
            });

            expect(toggleNumberedList).toHaveBeenCalled();
        });

        it('should call toggleTaskList for taskList type', () => {
            const { result } = renderHook(() => useToolbarActions({ editorView: mockEditorView as never }));

            act(() => {
                result.current.handleList('taskList');
            });

            expect(toggleTaskList).toHaveBeenCalled();
        });
    });

    describe('handleEmojiInsert', () => {
        it('should insert emoji at cursor position', () => {
            const { result } = renderHook(() => useToolbarActions({ editorView: mockEditorView as never }));

            act(() => {
                result.current.handleEmojiInsert('😀');
            });

            expect(mockDispatch).toHaveBeenCalledWith({
                changes: { from: 0, to: 0, insert: '😀' },
                selection: { anchor: 2 }
            });
            expect(mockFocus).toHaveBeenCalled();
        });

        it('should not insert when editorView is null', () => {
            const { result } = renderHook(() => useToolbarActions({ editorView: null }));

            act(() => {
                result.current.handleEmojiInsert('😀');
            });

            expect(mockDispatch).not.toHaveBeenCalled();
        });
    });

    describe('return values', () => {
        it('should return all handler functions', () => {
            const { result } = renderHook(() => useToolbarActions({ editorView: mockEditorView as never }));

            expect(typeof result.current.handleFormat).toBe('function');
            expect(typeof result.current.handleHeading).toBe('function');
            expect(typeof result.current.handleInsert).toBe('function');
            expect(typeof result.current.handleList).toBe('function');
            expect(typeof result.current.handleEmojiInsert).toBe('function');
        });
    });
});
