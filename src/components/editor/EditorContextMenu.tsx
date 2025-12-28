import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuSeparator,
    ContextMenuShortcut,
    ContextMenuSub,
    ContextMenuSubContent,
    ContextMenuSubTrigger,
    ContextMenuTrigger
} from '@/components/ui';
import type { EditorView } from '@codemirror/view';
import {
    Bold,
    ClipboardCopy,
    ClipboardPaste,
    Code,
    Heading1,
    Heading2,
    Heading3,
    Image,
    Italic,
    Link,
    List,
    ListOrdered,
    ListTodo,
    Minus,
    Quote,
    Scissors,
    SquareCheck,
    Strikethrough,
    Table
} from 'lucide-react';
import type React from 'react';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
    insertCodeBlock,
    insertHorizontalRule,
    insertImage,
    insertLink,
    setHeading1,
    setHeading2,
    setHeading3,
    toggleBold,
    toggleBulletList,
    toggleInlineCode,
    toggleItalic,
    toggleNumberedList,
    toggleQuote,
    toggleStrikethrough,
    toggleTaskList
} from './commands';

interface EditorContextMenuProps {
    children: React.ReactNode;
    editorView: EditorView | null;
}

/**
 * Context menu for editor with formatting and clipboard actions
 */
export function EditorContextMenu({ children, editorView }: EditorContextMenuProps) {
    const { t } = useTranslation();

    const executeCommand = useCallback(
        (command: (view: EditorView) => boolean) => {
            if (editorView) {
                command(editorView);
                editorView.focus();
            }
        },
        [editorView]
    );

    const handleCut = useCallback(async () => {
        if (!editorView) return;

        const selection = editorView.state.sliceDoc(editorView.state.selection.main.from, editorView.state.selection.main.to);

        if (selection) {
            await navigator.clipboard.writeText(selection);
            editorView.dispatch({
                changes: {
                    from: editorView.state.selection.main.from,
                    to: editorView.state.selection.main.to,
                    insert: ''
                }
            });
        }
        editorView.focus();
    }, [editorView]);

    const handleCopy = useCallback(async () => {
        if (!editorView) return;

        const selection = editorView.state.sliceDoc(editorView.state.selection.main.from, editorView.state.selection.main.to);

        if (selection) {
            await navigator.clipboard.writeText(selection);
        }
        editorView.focus();
    }, [editorView]);

    const handlePaste = useCallback(async () => {
        if (!editorView) return;

        try {
            const text = await navigator.clipboard.readText();
            editorView.dispatch({
                changes: {
                    from: editorView.state.selection.main.from,
                    to: editorView.state.selection.main.to,
                    insert: text
                }
            });
        } catch {
            // Clipboard access denied
        }
        editorView.focus();
    }, [editorView]);

    const handleSelectAll = useCallback(() => {
        if (!editorView) return;

        editorView.dispatch({
            selection: { anchor: 0, head: editorView.state.doc.length }
        });
        editorView.focus();
    }, [editorView]);

    const hasSelection = editorView ? editorView.state.selection.main.from !== editorView.state.selection.main.to : false;

    return (
        <ContextMenu>
            <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
            <ContextMenuContent className="w-56">
                {/* Clipboard actions */}
                <ContextMenuItem onClick={handleCut} disabled={!hasSelection}>
                    <Scissors className="mr-2 h-4 w-4" />
                    {t('contextMenu.cut')}
                    <ContextMenuShortcut>Ctrl+X</ContextMenuShortcut>
                </ContextMenuItem>

                <ContextMenuItem onClick={handleCopy} disabled={!hasSelection}>
                    <ClipboardCopy className="mr-2 h-4 w-4" />
                    {t('contextMenu.copy')}
                    <ContextMenuShortcut>Ctrl+C</ContextMenuShortcut>
                </ContextMenuItem>

                <ContextMenuItem onClick={handlePaste}>
                    <ClipboardPaste className="mr-2 h-4 w-4" />
                    {t('contextMenu.paste')}
                    <ContextMenuShortcut>Ctrl+V</ContextMenuShortcut>
                </ContextMenuItem>

                <ContextMenuItem onClick={handleSelectAll}>
                    <SquareCheck className="mr-2 h-4 w-4" />
                    {t('contextMenu.selectAll')}
                    <ContextMenuShortcut>Ctrl+A</ContextMenuShortcut>
                </ContextMenuItem>

                <ContextMenuSeparator />

                {/* Format Selection submenu */}
                <ContextMenuSub>
                    <ContextMenuSubTrigger>
                        <Bold className="mr-2 h-4 w-4" />
                        {t('contextMenu.formatSelection')}
                    </ContextMenuSubTrigger>
                    <ContextMenuSubContent className="w-48">
                        <ContextMenuItem onClick={() => executeCommand(toggleBold)}>
                            <Bold className="mr-2 h-4 w-4" />
                            {t('contextMenu.bold')}
                            <ContextMenuShortcut>Ctrl+B</ContextMenuShortcut>
                        </ContextMenuItem>

                        <ContextMenuItem onClick={() => executeCommand(toggleItalic)}>
                            <Italic className="mr-2 h-4 w-4" />
                            {t('contextMenu.italic')}
                            <ContextMenuShortcut>Ctrl+I</ContextMenuShortcut>
                        </ContextMenuItem>

                        <ContextMenuItem onClick={() => executeCommand(toggleStrikethrough)}>
                            <Strikethrough className="mr-2 h-4 w-4" />
                            {t('contextMenu.strikethrough')}
                            <ContextMenuShortcut>Ctrl+Shift+S</ContextMenuShortcut>
                        </ContextMenuItem>

                        <ContextMenuItem onClick={() => executeCommand(toggleInlineCode)}>
                            <Code className="mr-2 h-4 w-4" />
                            {t('contextMenu.code')}
                            <ContextMenuShortcut>Ctrl+`</ContextMenuShortcut>
                        </ContextMenuItem>

                        <ContextMenuSeparator />

                        <ContextMenuItem onClick={() => executeCommand(setHeading1)}>
                            <Heading1 className="mr-2 h-4 w-4" />
                            Heading 1<ContextMenuShortcut>Ctrl+1</ContextMenuShortcut>
                        </ContextMenuItem>

                        <ContextMenuItem onClick={() => executeCommand(setHeading2)}>
                            <Heading2 className="mr-2 h-4 w-4" />
                            Heading 2<ContextMenuShortcut>Ctrl+2</ContextMenuShortcut>
                        </ContextMenuItem>

                        <ContextMenuItem onClick={() => executeCommand(setHeading3)}>
                            <Heading3 className="mr-2 h-4 w-4" />
                            Heading 3<ContextMenuShortcut>Ctrl+3</ContextMenuShortcut>
                        </ContextMenuItem>

                        <ContextMenuSeparator />

                        <ContextMenuItem onClick={() => executeCommand(toggleQuote)}>
                            <Quote className="mr-2 h-4 w-4" />
                            {t('toolbar.quote')}
                            <ContextMenuShortcut>Ctrl+Shift+Q</ContextMenuShortcut>
                        </ContextMenuItem>

                        <ContextMenuItem onClick={() => executeCommand(toggleBulletList)}>
                            <List className="mr-2 h-4 w-4" />
                            {t('toolbar.bulletList')}
                            <ContextMenuShortcut>Ctrl+Shift+U</ContextMenuShortcut>
                        </ContextMenuItem>

                        <ContextMenuItem onClick={() => executeCommand(toggleNumberedList)}>
                            <ListOrdered className="mr-2 h-4 w-4" />
                            {t('toolbar.numberedList')}
                            <ContextMenuShortcut>Ctrl+Shift+O</ContextMenuShortcut>
                        </ContextMenuItem>

                        <ContextMenuItem onClick={() => executeCommand(toggleTaskList)}>
                            <ListTodo className="mr-2 h-4 w-4" />
                            {t('toolbar.taskList')}
                            <ContextMenuShortcut>Ctrl+Shift+T</ContextMenuShortcut>
                        </ContextMenuItem>
                    </ContextMenuSubContent>
                </ContextMenuSub>

                {/* Insert submenu */}
                <ContextMenuSub>
                    <ContextMenuSubTrigger>
                        <Table className="mr-2 h-4 w-4" />
                        {t('contextMenu.insert')}
                    </ContextMenuSubTrigger>
                    <ContextMenuSubContent className="w-48">
                        <ContextMenuItem onClick={() => executeCommand(insertLink)}>
                            <Link className="mr-2 h-4 w-4" />
                            {t('contextMenu.link')}
                            <ContextMenuShortcut>Ctrl+K</ContextMenuShortcut>
                        </ContextMenuItem>

                        <ContextMenuItem onClick={() => executeCommand(insertImage)}>
                            <Image className="mr-2 h-4 w-4" />
                            {t('contextMenu.image')}
                            <ContextMenuShortcut>Ctrl+Shift+I</ContextMenuShortcut>
                        </ContextMenuItem>

                        <ContextMenuSeparator />

                        <ContextMenuItem onClick={() => executeCommand(insertCodeBlock)}>
                            <Code className="mr-2 h-4 w-4" />
                            {t('toolbar.codeBlock')}
                            <ContextMenuShortcut>Ctrl+Shift+`</ContextMenuShortcut>
                        </ContextMenuItem>

                        <ContextMenuItem onClick={() => executeCommand(insertHorizontalRule)}>
                            <Minus className="mr-2 h-4 w-4" />
                            {t('contextMenu.horizontalRule')}
                        </ContextMenuItem>

                        <ContextMenuItem onClick={() => insertTable(editorView)}>
                            <Table className="mr-2 h-4 w-4" />
                            {t('contextMenu.table')}
                        </ContextMenuItem>
                    </ContextMenuSubContent>
                </ContextMenuSub>
            </ContextMenuContent>
        </ContextMenu>
    );
}

/**
 * Insert a basic markdown table
 */
function insertTable(view: EditorView | null) {
    if (!view) return;

    const table = `| Column 1 | Column 2 | Column 3 |
| -------- | -------- | -------- |
| Cell 1   | Cell 2   | Cell 3   |
| Cell 4   | Cell 5   | Cell 6   |
`;

    const { from, to } = view.state.selection.main;
    view.dispatch({
        changes: { from, to, insert: table },
        selection: { anchor: from + 2 }
    });
    view.focus();
}
