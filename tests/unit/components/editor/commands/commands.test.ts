import { toggleBold } from '@/components/editor/commands/bold';
import { insertCodeBlock, toggleInlineCode } from '@/components/editor/commands/code';
import { setHeading1, setHeading2, setHeading3 } from '@/components/editor/commands/heading';
import { insertHorizontalRule } from '@/components/editor/commands/horizontalRule';
import { insertImage } from '@/components/editor/commands/image';
import { toggleItalic } from '@/components/editor/commands/italic';
import { insertLink } from '@/components/editor/commands/link';
import { toggleBulletList, toggleNumberedList, toggleTaskList } from '@/components/editor/commands/list';
import { toggleQuote } from '@/components/editor/commands/quote';
import { toggleStrikethrough } from '@/components/editor/commands/strikethrough';
import { describe, expect, it, vi } from 'vitest';

// Mock wrapSelection
vi.mock('@/components/editor/utils/selection', () => ({
    wrapSelection: vi.fn(),
    getSelectedText: vi.fn((view) => {
        const { from, to } = view.state.selection.main;
        return view.state.sliceDoc(from, to);
    }),
    toggleLinePrefix: vi.fn(),
    setHeadingLevel: vi.fn()
}));

// Helper to create mock EditorView
function createMockView(doc: string, from: number, to: number = from) {
    const mockDispatch = vi.fn();

    const lines = doc.split('\n');
    const lineStartPositions: number[] = [0];
    for (let i = 0; i < lines.length - 1; i++) {
        lineStartPositions.push(lineStartPositions[i] + lines[i].length + 1);
    }

    return {
        view: {
            state: {
                selection: {
                    main: { from, to, anchor: from, head: to }
                },
                sliceDoc: (start: number, end: number) => doc.slice(start, end),
                doc: {
                    lineAt: (pos: number) => {
                        let lineNum = 1;
                        let lineStart = 0;
                        for (let i = 0; i < lineStartPositions.length; i++) {
                            if (pos >= lineStartPositions[i]) {
                                lineNum = i + 1;
                                lineStart = lineStartPositions[i];
                            }
                        }
                        const lineEnd = lineNum < lines.length ? lineStartPositions[lineNum] - 1 : doc.length;
                        return {
                            from: lineStart,
                            to: lineEnd,
                            text: lines[lineNum - 1],
                            number: lineNum
                        };
                    }
                }
            },
            dispatch: mockDispatch
        } as never,
        dispatch: mockDispatch
    };
}

describe('Editor Commands', () => {
    describe('toggleInlineCode', () => {
        it('should return true', () => {
            const { view } = createMockView('hello', 0, 5);
            const result = toggleInlineCode(view);
            expect(result).toBe(true);
        });
    });

    describe('insertCodeBlock', () => {
        it('should insert empty code block', () => {
            const { view, dispatch } = createMockView('', 0, 0);
            const result = insertCodeBlock(view);

            expect(result).toBe(true);
            expect(dispatch).toHaveBeenCalledWith({
                changes: { from: 0, to: 0, insert: '```language\n\n```' },
                selection: { anchor: 3, head: 11 }
            });
        });

        it('should wrap selected text in code block', () => {
            const { view, dispatch } = createMockView('console.log("hi")', 0, 17);
            const result = insertCodeBlock(view);

            expect(result).toBe(true);
            expect(dispatch).toHaveBeenCalledWith({
                changes: { from: 0, to: 17, insert: '```\nconsole.log("hi")\n```' },
                selection: { anchor: 25, head: 25 }
            });
        });
    });

    describe('heading commands', () => {
        it('setHeading1 should return true', () => {
            const { view } = createMockView('hello', 0, 0);
            expect(setHeading1(view)).toBe(true);
        });

        it('setHeading2 should return true', () => {
            const { view } = createMockView('hello', 0, 0);
            expect(setHeading2(view)).toBe(true);
        });

        it('setHeading3 should return true', () => {
            const { view } = createMockView('hello', 0, 0);
            expect(setHeading3(view)).toBe(true);
        });
    });

    describe('insertLink', () => {
        it('should insert link with placeholder text', () => {
            const { view, dispatch } = createMockView('', 0, 0);
            const result = insertLink(view);

            expect(result).toBe(true);
            expect(dispatch).toHaveBeenCalledWith({
                changes: { from: 0, to: 0, insert: '[link text](url)' },
                selection: { anchor: 12, head: 15 }
            });
        });

        it('should use selected text as link text', () => {
            const { view, dispatch } = createMockView('click here', 0, 10);
            const result = insertLink(view);

            expect(result).toBe(true);
            expect(dispatch).toHaveBeenCalledWith({
                changes: { from: 0, to: 10, insert: '[click here](url)' },
                selection: { anchor: 13, head: 16 }
            });
        });
    });

    describe('list commands', () => {
        it('toggleBulletList should return true', () => {
            const { view } = createMockView('item', 0, 0);
            expect(toggleBulletList(view)).toBe(true);
        });

        it('toggleNumberedList should return true', () => {
            const { view } = createMockView('item', 0, 0);
            expect(toggleNumberedList(view)).toBe(true);
        });

        it('toggleTaskList should return true', () => {
            const { view } = createMockView('item', 0, 0);
            expect(toggleTaskList(view)).toBe(true);
        });
    });

    describe('toggleBold', () => {
        it('should return true', () => {
            const { view } = createMockView('hello', 0, 5);
            const result = toggleBold(view);
            expect(result).toBe(true);
        });

        it('should call wrapSelection with correct parameters', async () => {
            const { wrapSelection } = await import('@/components/editor/utils/selection');
            const { view } = createMockView('hello', 0, 5);
            toggleBold(view);
            expect(wrapSelection).toHaveBeenCalledWith(view, '**', '**', 'bold text');
        });
    });

    describe('toggleItalic', () => {
        it('should return true', () => {
            const { view } = createMockView('hello', 0, 5);
            const result = toggleItalic(view);
            expect(result).toBe(true);
        });

        it('should call wrapSelection with correct parameters', async () => {
            const { wrapSelection } = await import('@/components/editor/utils/selection');
            const { view } = createMockView('hello', 0, 5);
            toggleItalic(view);
            expect(wrapSelection).toHaveBeenCalledWith(view, '*', '*', 'italic text');
        });
    });

    describe('toggleStrikethrough', () => {
        it('should return true', () => {
            const { view } = createMockView('hello', 0, 5);
            const result = toggleStrikethrough(view);
            expect(result).toBe(true);
        });

        it('should call wrapSelection with correct parameters', async () => {
            const { wrapSelection } = await import('@/components/editor/utils/selection');
            const { view } = createMockView('hello', 0, 5);
            toggleStrikethrough(view);
            expect(wrapSelection).toHaveBeenCalledWith(view, '~~', '~~', 'strikethrough text');
        });
    });

    describe('toggleQuote', () => {
        it('should return true', () => {
            const { view } = createMockView('hello', 0, 0);
            const result = toggleQuote(view);
            expect(result).toBe(true);
        });

        it('should call toggleLinePrefix with correct parameters', async () => {
            const { toggleLinePrefix } = await import('@/components/editor/utils/selection');
            const { view } = createMockView('hello', 0, 0);
            toggleQuote(view);
            expect(toggleLinePrefix).toHaveBeenCalledWith(view, '> ');
        });
    });

    describe('insertHorizontalRule', () => {
        it('should return true', () => {
            const { view } = createMockView('hello', 0, 0);
            const result = insertHorizontalRule(view);
            expect(result).toBe(true);
        });

        it('should insert horizontal rule at cursor', () => {
            const { view, dispatch } = createMockView('', 0, 0);
            insertHorizontalRule(view);

            expect(dispatch).toHaveBeenCalledWith({
                changes: { from: 0, insert: '\n---\n\n' },
                selection: { anchor: 6 }
            });
        });

        it('should add prefix newline when not at start of line', () => {
            const { view, dispatch } = createMockView('hello', 5, 5);
            insertHorizontalRule(view);

            expect(dispatch).toHaveBeenCalledWith({
                changes: { from: 5, insert: '\n\n---\n\n' },
                selection: { anchor: 12 }
            });
        });
    });

    describe('insertImage', () => {
        it('should return true', () => {
            const { view } = createMockView('', 0, 0);
            const result = insertImage(view);
            expect(result).toBe(true);
        });

        it('should insert image with default alt text', () => {
            const { view, dispatch } = createMockView('', 0, 0);
            insertImage(view);

            expect(dispatch).toHaveBeenCalledWith({
                changes: { from: 0, to: 0, insert: '![alt text](image-url)' },
                selection: { anchor: 12, head: 21 }
            });
        });

        it('should use selected text as alt text', () => {
            const { view, dispatch } = createMockView('my image', 0, 8);
            insertImage(view);

            // anchor = from + altText.length + 4 = 0 + 8 + 4 = 12
            // head = anchor + imageUrl.length = 12 + 9 = 21
            expect(dispatch).toHaveBeenCalledWith({
                changes: { from: 0, to: 8, insert: '![my image](image-url)' },
                selection: { anchor: 12, head: 21 }
            });
        });
    });
});
