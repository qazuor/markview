import { EditorContextMenu } from '@/components/editor/EditorContextMenu';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock react-i18next
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key
    })
}));

// Mock settings store
const mockZoomEditorIn = vi.fn();
const mockZoomEditorOut = vi.fn();
const mockResetEditorZoom = vi.fn();

vi.mock('@/stores/settingsStore', () => ({
    useSettingsStore: (selector: (state: unknown) => unknown) => {
        const state = {
            zoomEditorIn: mockZoomEditorIn,
            zoomEditorOut: mockZoomEditorOut,
            resetEditorZoom: mockResetEditorZoom,
            editorFontSize: 14
        };
        return selector(state);
    }
}));

// Mock the context menu UI components
vi.mock('@/components/ui', () => ({
    ContextMenu: ({ children }: { children: React.ReactNode }) => <div data-testid="context-menu">{children}</div>,
    ContextMenuTrigger: ({ children }: { children: React.ReactNode; asChild?: boolean }) => (
        <div data-testid="context-menu-trigger">{children}</div>
    ),
    ContextMenuContent: ({ children }: { children: React.ReactNode; className?: string }) => (
        <div data-testid="context-menu-content">{children}</div>
    ),
    ContextMenuItem: ({
        children,
        onClick,
        disabled
    }: {
        children: React.ReactNode;
        onClick?: () => void;
        disabled?: boolean;
    }) => (
        <button type="button" data-testid="context-menu-item" onClick={onClick} disabled={disabled}>
            {children}
        </button>
    ),
    ContextMenuSeparator: () => <hr data-testid="context-menu-separator" />,
    ContextMenuSub: ({ children }: { children: React.ReactNode }) => <div data-testid="context-menu-sub">{children}</div>,
    ContextMenuSubTrigger: ({ children }: { children: React.ReactNode }) => (
        <button type="button" data-testid="context-menu-sub-trigger">
            {children}
        </button>
    ),
    ContextMenuSubContent: ({ children }: { children: React.ReactNode; className?: string }) => (
        <div data-testid="context-menu-sub-content">{children}</div>
    ),
    ContextMenuShortcut: ({ children }: { children: React.ReactNode }) => <span data-testid="context-menu-shortcut">{children}</span>
}));

// Mock editor commands
vi.mock('@/components/editor/commands', () => ({
    toggleBold: vi.fn(() => true),
    toggleItalic: vi.fn(() => true),
    toggleStrikethrough: vi.fn(() => true),
    toggleInlineCode: vi.fn(() => true),
    setHeading1: vi.fn(() => true),
    setHeading2: vi.fn(() => true),
    setHeading3: vi.fn(() => true),
    toggleQuote: vi.fn(() => true),
    toggleBulletList: vi.fn(() => true),
    toggleNumberedList: vi.fn(() => true),
    toggleTaskList: vi.fn(() => true),
    insertLink: vi.fn(() => true),
    insertImage: vi.fn(() => true),
    insertCodeBlock: vi.fn(() => true),
    insertHorizontalRule: vi.fn(() => true)
}));

describe('EditorContextMenu', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('rendering', () => {
        it('should render children in trigger', () => {
            render(
                <EditorContextMenu editorView={null}>
                    <div data-testid="editor-child">Editor Content</div>
                </EditorContextMenu>
            );

            expect(screen.getByTestId('editor-child')).toBeInTheDocument();
        });

        it('should render context menu structure', () => {
            render(
                <EditorContextMenu editorView={null}>
                    <div>Editor</div>
                </EditorContextMenu>
            );

            expect(screen.getByTestId('context-menu')).toBeInTheDocument();
            expect(screen.getByTestId('context-menu-trigger')).toBeInTheDocument();
            expect(screen.getByTestId('context-menu-content')).toBeInTheDocument();
        });

        it('should render clipboard actions', () => {
            render(
                <EditorContextMenu editorView={null}>
                    <div>Editor</div>
                </EditorContextMenu>
            );

            expect(screen.getByText('contextMenu.cut')).toBeInTheDocument();
            expect(screen.getByText('contextMenu.copy')).toBeInTheDocument();
            expect(screen.getByText('contextMenu.paste')).toBeInTheDocument();
            expect(screen.getByText('contextMenu.selectAll')).toBeInTheDocument();
        });

        it('should render format selection submenu', () => {
            render(
                <EditorContextMenu editorView={null}>
                    <div>Editor</div>
                </EditorContextMenu>
            );

            expect(screen.getByText('contextMenu.formatSelection')).toBeInTheDocument();
        });

        it('should render insert submenu', () => {
            render(
                <EditorContextMenu editorView={null}>
                    <div>Editor</div>
                </EditorContextMenu>
            );

            expect(screen.getByText('contextMenu.insert')).toBeInTheDocument();
        });

        it('should render zoom submenu with current font size', () => {
            render(
                <EditorContextMenu editorView={null}>
                    <div>Editor</div>
                </EditorContextMenu>
            );

            expect(screen.getByText(/zoom\.zoom.*14px/)).toBeInTheDocument();
        });
    });

    describe('format options', () => {
        it('should show bold option', () => {
            render(
                <EditorContextMenu editorView={null}>
                    <div>Editor</div>
                </EditorContextMenu>
            );

            expect(screen.getByText('contextMenu.bold')).toBeInTheDocument();
        });

        it('should show italic option', () => {
            render(
                <EditorContextMenu editorView={null}>
                    <div>Editor</div>
                </EditorContextMenu>
            );

            expect(screen.getByText('contextMenu.italic')).toBeInTheDocument();
        });

        it('should show strikethrough option', () => {
            render(
                <EditorContextMenu editorView={null}>
                    <div>Editor</div>
                </EditorContextMenu>
            );

            expect(screen.getByText('contextMenu.strikethrough')).toBeInTheDocument();
        });

        it('should show code option', () => {
            render(
                <EditorContextMenu editorView={null}>
                    <div>Editor</div>
                </EditorContextMenu>
            );

            expect(screen.getByText('contextMenu.code')).toBeInTheDocument();
        });

        it('should show heading options', () => {
            render(
                <EditorContextMenu editorView={null}>
                    <div>Editor</div>
                </EditorContextMenu>
            );

            expect(screen.getByText(/Heading 1/)).toBeInTheDocument();
            expect(screen.getByText(/Heading 2/)).toBeInTheDocument();
            expect(screen.getByText(/Heading 3/)).toBeInTheDocument();
        });

        it('should show list options', () => {
            render(
                <EditorContextMenu editorView={null}>
                    <div>Editor</div>
                </EditorContextMenu>
            );

            expect(screen.getByText('toolbar.bulletList')).toBeInTheDocument();
            expect(screen.getByText('toolbar.numberedList')).toBeInTheDocument();
            expect(screen.getByText('toolbar.taskList')).toBeInTheDocument();
        });
    });

    describe('insert options', () => {
        it('should show link option', () => {
            render(
                <EditorContextMenu editorView={null}>
                    <div>Editor</div>
                </EditorContextMenu>
            );

            expect(screen.getByText('contextMenu.link')).toBeInTheDocument();
        });

        it('should show image option', () => {
            render(
                <EditorContextMenu editorView={null}>
                    <div>Editor</div>
                </EditorContextMenu>
            );

            expect(screen.getByText('contextMenu.image')).toBeInTheDocument();
        });

        it('should show code block option', () => {
            render(
                <EditorContextMenu editorView={null}>
                    <div>Editor</div>
                </EditorContextMenu>
            );

            expect(screen.getByText('toolbar.codeBlock')).toBeInTheDocument();
        });

        it('should show horizontal rule option', () => {
            render(
                <EditorContextMenu editorView={null}>
                    <div>Editor</div>
                </EditorContextMenu>
            );

            expect(screen.getByText('contextMenu.horizontalRule')).toBeInTheDocument();
        });

        it('should show table option', () => {
            render(
                <EditorContextMenu editorView={null}>
                    <div>Editor</div>
                </EditorContextMenu>
            );

            expect(screen.getByText('contextMenu.table')).toBeInTheDocument();
        });
    });

    describe('zoom options', () => {
        it('should show zoom in option', () => {
            render(
                <EditorContextMenu editorView={null}>
                    <div>Editor</div>
                </EditorContextMenu>
            );

            expect(screen.getByText('zoom.zoomIn')).toBeInTheDocument();
        });

        it('should show zoom out option', () => {
            render(
                <EditorContextMenu editorView={null}>
                    <div>Editor</div>
                </EditorContextMenu>
            );

            expect(screen.getByText('zoom.zoomOut')).toBeInTheDocument();
        });

        it('should show reset zoom option', () => {
            render(
                <EditorContextMenu editorView={null}>
                    <div>Editor</div>
                </EditorContextMenu>
            );

            expect(screen.getByText('zoom.resetZoom')).toBeInTheDocument();
        });
    });

    describe('keyboard shortcuts', () => {
        it('should show Cut shortcut', () => {
            render(
                <EditorContextMenu editorView={null}>
                    <div>Editor</div>
                </EditorContextMenu>
            );

            expect(screen.getByText('Ctrl+X')).toBeInTheDocument();
        });

        it('should show Copy shortcut', () => {
            render(
                <EditorContextMenu editorView={null}>
                    <div>Editor</div>
                </EditorContextMenu>
            );

            expect(screen.getByText('Ctrl+C')).toBeInTheDocument();
        });

        it('should show Paste shortcut', () => {
            render(
                <EditorContextMenu editorView={null}>
                    <div>Editor</div>
                </EditorContextMenu>
            );

            expect(screen.getByText('Ctrl+V')).toBeInTheDocument();
        });

        it('should show Bold shortcut', () => {
            render(
                <EditorContextMenu editorView={null}>
                    <div>Editor</div>
                </EditorContextMenu>
            );

            expect(screen.getByText('Ctrl+B')).toBeInTheDocument();
        });
    });

    describe('disabled states', () => {
        it('should disable cut when no selection', () => {
            render(
                <EditorContextMenu editorView={null}>
                    <div>Editor</div>
                </EditorContextMenu>
            );

            // Find the cut button
            const cutButton = screen.getByText('contextMenu.cut').closest('button');
            expect(cutButton).toBeDisabled();
        });

        it('should disable copy when no selection', () => {
            render(
                <EditorContextMenu editorView={null}>
                    <div>Editor</div>
                </EditorContextMenu>
            );

            const copyButton = screen.getByText('contextMenu.copy').closest('button');
            expect(copyButton).toBeDisabled();
        });
    });
});
