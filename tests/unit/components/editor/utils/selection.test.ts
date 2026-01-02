import {
    getCurrentLine,
    getSelectedText,
    insertAtCursor,
    replaceSelection,
    setHeadingLevel,
    toggleLinePrefix,
    wrapSelection
} from '@/components/editor/utils/selection';
import { describe, expect, it, vi } from 'vitest';

// Helper to create mock EditorView
function createMockView(doc: string, from: number, to: number = from) {
    const mockDispatch = vi.fn();

    const lines = doc.split('\n');
    const lineStartPositions: number[] = [0];
    for (let i = 0; i < lines.length - 1; i++) {
        lineStartPositions.push(lineStartPositions[i] + lines[i].length + 1);
    }

    const mockView = {
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
                },
                line: (num: number) => {
                    const lineStart = lineStartPositions[num - 1];
                    const lineEnd = num < lines.length ? lineStartPositions[num] - 1 : doc.length;
                    return {
                        from: lineStart,
                        to: lineEnd,
                        text: lines[num - 1],
                        number: num
                    };
                }
            }
        },
        dispatch: mockDispatch
    };

    return { view: mockView as never, dispatch: mockDispatch };
}

describe('selection utilities', () => {
    describe('getSelectedText', () => {
        it('should return empty string when no selection', () => {
            const { view } = createMockView('hello world', 5, 5);
            expect(getSelectedText(view)).toBe('');
        });

        it('should return selected text', () => {
            const { view } = createMockView('hello world', 0, 5);
            expect(getSelectedText(view)).toBe('hello');
        });

        it('should return middle selection', () => {
            const { view } = createMockView('hello world', 6, 11);
            expect(getSelectedText(view)).toBe('world');
        });
    });

    describe('replaceSelection', () => {
        it('should replace selection with text', () => {
            const { view, dispatch } = createMockView('hello world', 0, 5);
            replaceSelection(view, 'hi');

            expect(dispatch).toHaveBeenCalledWith({
                changes: { from: 0, to: 5, insert: 'hi' },
                selection: { anchor: 2 }
            });
        });

        it('should insert at cursor when no selection', () => {
            const { view, dispatch } = createMockView('hello world', 5, 5);
            replaceSelection(view, '!');

            expect(dispatch).toHaveBeenCalledWith({
                changes: { from: 5, to: 5, insert: '!' },
                selection: { anchor: 6 }
            });
        });
    });

    describe('wrapSelection', () => {
        it('should wrap selection with prefix and suffix', () => {
            const { view, dispatch } = createMockView('hello world', 0, 5);
            wrapSelection(view, '**', '**');

            expect(dispatch).toHaveBeenCalledWith({
                changes: [
                    { from: 0, insert: '**' },
                    { from: 5, insert: '**' }
                ],
                selection: { anchor: 2, head: 7 }
            });
        });

        it('should insert placeholder when no selection', () => {
            const { view, dispatch } = createMockView('hello world', 5, 5);
            wrapSelection(view, '**', '**', 'bold text');

            expect(dispatch).toHaveBeenCalledWith({
                changes: { from: 5, to: 5, insert: '**bold text**' },
                selection: { anchor: 7, head: 16 }
            });
        });

        it('should unwrap if already wrapped', () => {
            const { view, dispatch } = createMockView('**hello** world', 2, 7);
            wrapSelection(view, '**', '**');

            expect(dispatch).toHaveBeenCalledWith({
                changes: [
                    { from: 0, to: 2, insert: '' },
                    { from: 7, to: 9, insert: '' }
                ],
                selection: { anchor: 0, head: 5 }
            });
        });
    });

    describe('insertAtCursor', () => {
        it('should insert text at cursor', () => {
            const { view, dispatch } = createMockView('hello world', 5, 5);
            insertAtCursor(view, '!');

            expect(dispatch).toHaveBeenCalledWith({
                changes: { from: 5, insert: '!' },
                selection: { anchor: 6 }
            });
        });

        it('should insert multi-character text', () => {
            const { view, dispatch } = createMockView('hello world', 0, 0);
            insertAtCursor(view, '# ');

            expect(dispatch).toHaveBeenCalledWith({
                changes: { from: 0, insert: '# ' },
                selection: { anchor: 2 }
            });
        });
    });

    describe('getCurrentLine', () => {
        it('should return first line info', () => {
            const { view } = createMockView('hello\nworld', 2, 2);
            const line = getCurrentLine(view.state);

            expect(line.from).toBe(0);
            expect(line.to).toBe(5);
            expect(line.text).toBe('hello');
        });

        it('should return second line info', () => {
            const { view } = createMockView('hello\nworld', 8, 8);
            const line = getCurrentLine(view.state);

            expect(line.from).toBe(6);
            expect(line.text).toBe('world');
        });
    });

    describe('toggleLinePrefix', () => {
        it('should add prefix to line', () => {
            const { view, dispatch } = createMockView('hello', 0, 0);
            toggleLinePrefix(view, '> ');

            expect(dispatch).toHaveBeenCalledWith({
                changes: [{ from: 0, insert: '> ' }]
            });
        });

        it('should remove prefix if already prefixed', () => {
            const { view, dispatch } = createMockView('> hello', 0, 0);
            toggleLinePrefix(view, '> ');

            expect(dispatch).toHaveBeenCalledWith({
                changes: [{ from: 0, to: 2, insert: '' }]
            });
        });

        it('should add prefix to multiple lines', () => {
            const { view, dispatch } = createMockView('hello\nworld', 0, 11);
            toggleLinePrefix(view, '- ');

            expect(dispatch).toHaveBeenCalledWith({
                changes: [
                    { from: 0, insert: '- ' },
                    { from: 6, insert: '- ' }
                ]
            });
        });
    });

    describe('setHeadingLevel', () => {
        it('should add heading to plain line', () => {
            const { view, dispatch } = createMockView('hello', 0, 0);
            setHeadingLevel(view, 1);

            expect(dispatch).toHaveBeenCalledWith({
                changes: { from: 0, insert: '# ' }
            });
        });

        it('should add H2 heading', () => {
            const { view, dispatch } = createMockView('hello', 0, 0);
            setHeadingLevel(view, 2);

            expect(dispatch).toHaveBeenCalledWith({
                changes: { from: 0, insert: '## ' }
            });
        });

        it('should replace existing heading', () => {
            const { view, dispatch } = createMockView('# hello', 2, 2);
            setHeadingLevel(view, 2);

            expect(dispatch).toHaveBeenCalledWith({
                changes: { from: 0, to: 2, insert: '## ' }
            });
        });

        it('should change H2 to H3', () => {
            const { view, dispatch } = createMockView('## hello', 3, 3);
            setHeadingLevel(view, 3);

            expect(dispatch).toHaveBeenCalledWith({
                changes: { from: 0, to: 3, insert: '### ' }
            });
        });
    });
});
