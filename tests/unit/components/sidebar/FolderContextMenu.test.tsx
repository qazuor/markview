import { FolderContextMenu } from '@/components/sidebar/FolderContextMenu';
import type { Folder } from '@/stores/folderStore';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock react-i18next
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key
    })
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
    Circle: () => <span data-testid="icon-circle" />,
    FilePlus: () => <span data-testid="icon-file-plus" />,
    FolderPlus: () => <span data-testid="icon-folder-plus" />,
    Palette: () => <span data-testid="icon-palette" />,
    Pencil: () => <span data-testid="icon-pencil" />,
    Smile: () => <span data-testid="icon-smile" />,
    Trash2: () => <span data-testid="icon-trash" />
}));

// Mock NewFolderModal
vi.mock('@/components/sidebar/NewFolderModal', () => ({
    getIconComponent: () => () => <span data-testid="custom-icon" />
}));

// Mock UI components
vi.mock('@/components/ui', () => ({
    ContextMenu: ({ children }: { children: React.ReactNode }) => <div data-testid="context-menu">{children}</div>,
    ContextMenuTrigger: ({ children }: { children: React.ReactNode }) => <div data-testid="context-menu-trigger">{children}</div>,
    ContextMenuContent: ({ children }: { children: React.ReactNode }) => <div data-testid="context-menu-content">{children}</div>,
    ContextMenuItem: ({
        children,
        onClick,
        variant
    }: {
        children: React.ReactNode;
        onClick?: () => void;
        variant?: string;
    }) => (
        <button type="button" data-testid="context-menu-item" data-variant={variant} onClick={onClick}>
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
    ContextMenuSubContent: ({ children }: { children: React.ReactNode }) => <div data-testid="context-menu-sub-content">{children}</div>
}));

// Mock folder store
const mockUpdateFolder = vi.fn();
const mockDeleteFolder = vi.fn();

vi.mock('@/stores/folderStore', () => ({
    FOLDER_COLORS: [
        { name: 'red', value: '#ef4444' },
        { name: 'blue', value: '#3b82f6' }
    ],
    FOLDER_ICONS: ['folder', 'star', 'archive'],
    useFolderStore: (selector?: (state: unknown) => unknown) => {
        const state = {
            updateFolder: mockUpdateFolder,
            deleteFolder: mockDeleteFolder
        };
        if (selector) {
            return selector(state);
        }
        return state;
    }
}));

// Mock document store
const mockCreateDocument = vi.fn().mockReturnValue('new-doc-id');
const mockMoveToFolder = vi.fn();
const mockGetDocumentsByFolder = vi.fn().mockReturnValue([]);

vi.mock('@/stores/documentStore', () => ({
    useDocumentStore: (selector?: (state: unknown) => unknown) => {
        const state = {
            createDocument: mockCreateDocument,
            moveToFolder: mockMoveToFolder,
            getDocumentsByFolder: mockGetDocumentsByFolder
        };
        if (selector) {
            return selector(state);
        }
        return state;
    }
}));

// Mock UI store
const mockSetPendingRenameDocumentId = vi.fn();
const mockOpenNewFolderModal = vi.fn();

vi.mock('@/stores/uiStore', () => ({
    useUIStore: (selector?: (state: unknown) => unknown) => {
        const state = {
            setPendingRenameDocumentId: mockSetPendingRenameDocumentId,
            openNewFolderModal: mockOpenNewFolderModal
        };
        if (selector) {
            return selector(state);
        }
        return state;
    }
}));

describe('FolderContextMenu', () => {
    const mockFolder: Folder = {
        id: 'folder-1',
        name: 'Test Folder',
        parentId: null,
        color: null,
        icon: null,
        sortOrder: 0,
        createdAt: new Date(),
        updatedAt: new Date()
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('rendering', () => {
        it('should render context menu', () => {
            render(
                <FolderContextMenu folder={mockFolder}>
                    <div>Child</div>
                </FolderContextMenu>
            );

            expect(screen.getByTestId('context-menu')).toBeInTheDocument();
        });

        it('should render children in trigger', () => {
            render(
                <FolderContextMenu folder={mockFolder}>
                    <div data-testid="child">Child Content</div>
                </FolderContextMenu>
            );

            expect(screen.getByTestId('child')).toBeInTheDocument();
        });

        it('should render new file option', () => {
            render(
                <FolderContextMenu folder={mockFolder}>
                    <div>Child</div>
                </FolderContextMenu>
            );

            expect(screen.getByText('contextMenu.newFile')).toBeInTheDocument();
        });

        it('should render new folder option', () => {
            render(
                <FolderContextMenu folder={mockFolder}>
                    <div>Child</div>
                </FolderContextMenu>
            );

            expect(screen.getByText('fileExplorer.folder.new')).toBeInTheDocument();
        });

        it('should render rename option', () => {
            render(
                <FolderContextMenu folder={mockFolder}>
                    <div>Child</div>
                </FolderContextMenu>
            );

            expect(screen.getByText('common.rename')).toBeInTheDocument();
        });

        it('should render color submenu', () => {
            render(
                <FolderContextMenu folder={mockFolder}>
                    <div>Child</div>
                </FolderContextMenu>
            );

            expect(screen.getByText('fileExplorer.folder.color')).toBeInTheDocument();
        });

        it('should render icon submenu', () => {
            render(
                <FolderContextMenu folder={mockFolder}>
                    <div>Child</div>
                </FolderContextMenu>
            );

            expect(screen.getByText('fileExplorer.folder.icon')).toBeInTheDocument();
        });

        it('should render delete option', () => {
            render(
                <FolderContextMenu folder={mockFolder}>
                    <div>Child</div>
                </FolderContextMenu>
            );

            expect(screen.getByText('common.delete')).toBeInTheDocument();
        });

        it('should render delete option with danger variant', () => {
            render(
                <FolderContextMenu folder={mockFolder}>
                    <div>Child</div>
                </FolderContextMenu>
            );

            const deleteButton = screen.getByText('common.delete').closest('button');
            expect(deleteButton).toHaveAttribute('data-variant', 'danger');
        });

        it('should render separators', () => {
            render(
                <FolderContextMenu folder={mockFolder}>
                    <div>Child</div>
                </FolderContextMenu>
            );

            const separators = screen.getAllByTestId('context-menu-separator');
            expect(separators.length).toBeGreaterThan(0);
        });
    });

    describe('new file action', () => {
        it('should create new document in folder', () => {
            render(
                <FolderContextMenu folder={mockFolder}>
                    <div>Child</div>
                </FolderContextMenu>
            );

            const newFileButton = screen.getByText('contextMenu.newFile');
            fireEvent.click(newFileButton);

            expect(mockCreateDocument).toHaveBeenCalled();
            expect(mockMoveToFolder).toHaveBeenCalledWith('new-doc-id', 'folder-1');
            expect(mockSetPendingRenameDocumentId).toHaveBeenCalledWith('new-doc-id');
        });
    });

    describe('new folder action', () => {
        it('should open new folder modal with parent id', () => {
            render(
                <FolderContextMenu folder={mockFolder}>
                    <div>Child</div>
                </FolderContextMenu>
            );

            const newFolderButton = screen.getByText('fileExplorer.folder.new');
            fireEvent.click(newFolderButton);

            expect(mockOpenNewFolderModal).toHaveBeenCalledWith('folder-1');
        });
    });

    describe('rename action', () => {
        it('should call prompt and update folder name', () => {
            const promptMock = vi.fn().mockReturnValue('New Name');
            vi.stubGlobal('prompt', promptMock);

            render(
                <FolderContextMenu folder={mockFolder}>
                    <div>Child</div>
                </FolderContextMenu>
            );

            const renameButton = screen.getByText('common.rename');
            fireEvent.click(renameButton);

            expect(promptMock).toHaveBeenCalledWith('contextMenu.enterNewName', 'Test Folder');
            expect(mockUpdateFolder).toHaveBeenCalledWith('folder-1', { name: 'New Name' });

            vi.unstubAllGlobals();
        });

        it('should not update if prompt is cancelled', () => {
            const promptMock = vi.fn().mockReturnValue(null);
            vi.stubGlobal('prompt', promptMock);

            render(
                <FolderContextMenu folder={mockFolder}>
                    <div>Child</div>
                </FolderContextMenu>
            );

            const renameButton = screen.getByText('common.rename');
            fireEvent.click(renameButton);

            expect(mockUpdateFolder).not.toHaveBeenCalled();

            vi.unstubAllGlobals();
        });

        it('should not update if prompt is empty', () => {
            const promptMock = vi.fn().mockReturnValue('   ');
            vi.stubGlobal('prompt', promptMock);

            render(
                <FolderContextMenu folder={mockFolder}>
                    <div>Child</div>
                </FolderContextMenu>
            );

            const renameButton = screen.getByText('common.rename');
            fireEvent.click(renameButton);

            expect(mockUpdateFolder).not.toHaveBeenCalled();

            vi.unstubAllGlobals();
        });
    });

    describe('delete action', () => {
        it('should confirm and delete folder', () => {
            const confirmMock = vi.fn().mockReturnValue(true);
            vi.stubGlobal('confirm', confirmMock);

            render(
                <FolderContextMenu folder={mockFolder}>
                    <div>Child</div>
                </FolderContextMenu>
            );

            const deleteButton = screen.getByText('common.delete');
            fireEvent.click(deleteButton);

            expect(confirmMock).toHaveBeenCalled();
            expect(mockDeleteFolder).toHaveBeenCalledWith('folder-1');

            vi.unstubAllGlobals();
        });

        it('should not delete if confirmation is cancelled', () => {
            const confirmMock = vi.fn().mockReturnValue(false);
            vi.stubGlobal('confirm', confirmMock);

            render(
                <FolderContextMenu folder={mockFolder}>
                    <div>Child</div>
                </FolderContextMenu>
            );

            const deleteButton = screen.getByText('common.delete');
            fireEvent.click(deleteButton);

            expect(mockDeleteFolder).not.toHaveBeenCalled();

            vi.unstubAllGlobals();
        });

        it('should move documents to root before deleting folder', () => {
            mockGetDocumentsByFolder.mockReturnValue([{ id: 'doc-1' }, { id: 'doc-2' }]);
            const confirmMock = vi.fn().mockReturnValue(true);
            vi.stubGlobal('confirm', confirmMock);

            render(
                <FolderContextMenu folder={mockFolder}>
                    <div>Child</div>
                </FolderContextMenu>
            );

            const deleteButton = screen.getByText('common.delete');
            fireEvent.click(deleteButton);

            expect(mockMoveToFolder).toHaveBeenCalledWith('doc-1', null);
            expect(mockMoveToFolder).toHaveBeenCalledWith('doc-2', null);
            expect(mockDeleteFolder).toHaveBeenCalledWith('folder-1');

            vi.unstubAllGlobals();
        });
    });
});
