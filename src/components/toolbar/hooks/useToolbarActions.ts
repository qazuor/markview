import {
    insertCodeBlock,
    insertHorizontalRule,
    insertImage,
    insertLink,
    setHeading1,
    setHeading2,
    setHeading3,
    setHeading4,
    setHeading5,
    setHeading6,
    toggleBold,
    toggleBulletList,
    toggleInlineCode,
    toggleItalic,
    toggleNumberedList,
    toggleQuote,
    toggleStrikethrough,
    toggleTaskList
} from '@/components/editor/commands';
import type { EditorView } from '@codemirror/view';
import { useCallback } from 'react';

interface UseToolbarActionsOptions {
    editorView: EditorView | null;
}

/**
 * Hook providing toolbar action functions
 */
export function useToolbarActions({ editorView }: UseToolbarActionsOptions) {
    const executeCommand = useCallback(
        (command: (view: EditorView) => boolean) => {
            if (editorView) {
                command(editorView);
                editorView.focus();
            }
        },
        [editorView]
    );

    const handleFormat = useCallback(
        (format: string) => {
            if (!editorView) return;

            switch (format) {
                case 'bold':
                    executeCommand(toggleBold);
                    break;
                case 'italic':
                    executeCommand(toggleItalic);
                    break;
                case 'strikethrough':
                    executeCommand(toggleStrikethrough);
                    break;
                default:
                    break;
            }
        },
        [editorView, executeCommand]
    );

    const handleHeading = useCallback(
        (level: number) => {
            if (!editorView) return;

            const headingCommands = [
                null, // 0 = paragraph (remove heading)
                setHeading1,
                setHeading2,
                setHeading3,
                setHeading4,
                setHeading5,
                setHeading6
            ];

            const command = headingCommands[level];
            if (command) {
                executeCommand(command);
            } else if (level === 0) {
                // Remove heading - replace # prefix with nothing
                const line = editorView.state.doc.lineAt(editorView.state.selection.main.head);
                const match = line.text.match(/^#{1,6}\s*/);
                if (match) {
                    editorView.dispatch({
                        changes: {
                            from: line.from,
                            to: line.from + match[0].length,
                            insert: ''
                        }
                    });
                    editorView.focus();
                }
            }
        },
        [editorView, executeCommand]
    );

    const handleInsert = useCallback(
        (type: string) => {
            if (!editorView) return;

            switch (type) {
                case 'link':
                    executeCommand(insertLink);
                    break;
                case 'image':
                    executeCommand(insertImage);
                    break;
                case 'inlineCode':
                    executeCommand(toggleInlineCode);
                    break;
                case 'codeBlock':
                    executeCommand(insertCodeBlock);
                    break;
                case 'blockquote':
                    executeCommand(toggleQuote);
                    break;
                case 'hr':
                    executeCommand(insertHorizontalRule);
                    break;
                default:
                    break;
            }
        },
        [editorView, executeCommand]
    );

    const handleList = useCallback(
        (type: string) => {
            if (!editorView) return;

            switch (type) {
                case 'bulletList':
                    executeCommand(toggleBulletList);
                    break;
                case 'numberedList':
                    executeCommand(toggleNumberedList);
                    break;
                case 'taskList':
                    executeCommand(toggleTaskList);
                    break;
                default:
                    break;
            }
        },
        [editorView, executeCommand]
    );

    return {
        handleFormat,
        handleHeading,
        handleInsert,
        handleList,
        isDisabled: !editorView
    };
}
