import { FileExplorer } from '@/components/sidebar/FileExplorer';
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
    AlertCircle: () => <span data-testid="icon-alert" />,
    File: () => <span data-testid="icon-file" />,
    FolderOpen: () => <span data-testid="icon-folder" />,
    GitBranch: () => <span data-testid="icon-github" />,
    HardDrive: () => <span data-testid="icon-gdrive" />,
    Loader2: () => <span data-testid="icon-loader" />,
    Plus: () => <span data-testid="icon-plus" />,
    Search: () => <span data-testid="icon-search" />,
    X: () => <span data-testid="icon-x" />
}));

// Mock document store
const mockDocuments = new Map([
    ['doc-1', { id: 'doc-1', name: 'Document 1.md', source: 'local', syncStatus: 'synced' }],
    ['doc-2', { id: 'doc-2', name: 'GitHub File.md', source: 'github', syncStatus: 'modified' }],
    ['doc-3', { id: 'doc-3', name: 'GDrive File.md', source: 'gdrive', syncStatus: 'syncing' }]
]);

const mockOpenDocument = vi.fn();
const mockCreateDocument = vi.fn(() => 'new-doc-id');
const mockCloseDocument = vi.fn();

vi.mock('@/stores/documentStore', () => ({
    useDocumentStore: () => ({
        documents: mockDocuments,
        activeDocumentId: 'doc-1',
        openDocument: mockOpenDocument,
        createDocument: mockCreateDocument,
        closeDocument: mockCloseDocument
    })
}));

// Mock UI store
const mockSetPendingRenameDocumentId = vi.fn();

vi.mock('@/stores/uiStore', () => ({
    useUIStore: (selector: (state: unknown) => unknown) => {
        const state = { setPendingRenameDocumentId: mockSetPendingRenameDocumentId };
        return selector(state);
    }
}));

// Mock hooks
const mockOpenFileDialog = vi.fn();

vi.mock('@/hooks', () => ({
    useFileImport: () => ({
        openFileDialog: mockOpenFileDialog
    })
}));

// Mock UI components
vi.mock('@/components/ui', () => ({
    IconButton: ({ onClick, label, icon }: { onClick?: () => void; label: string; icon: React.ReactNode }) => (
        <button type="button" onClick={onClick} aria-label={label}>
            {icon}
        </button>
    ),
    Tooltip: ({ children, content }: { children: React.ReactNode; content: string }) => <div title={content}>{children}</div>
}));

// Mock child components
vi.mock('@/components/tabs/EditableTabName', () => ({
    EditableTabName: ({ name, documentId }: { name: string; documentId: string }) => (
        <span data-testid={`editable-name-${documentId}`}>{name}</span>
    )
}));

vi.mock('@/components/sidebar/FileContextMenu', () => ({
    FileContextMenu: ({ children, documentId }: { children: React.ReactNode; documentId: string }) => (
        <div data-testid={`file-context-menu-${documentId}`}>{children}</div>
    )
}));

vi.mock('@/components/sidebar/LocalFilesContextMenu', () => ({
    LocalFilesContextMenu: ({
        children,
        onNewDocument,
        onImport
    }: {
        children: React.ReactNode;
        onNewDocument: () => void;
        onImport: () => void;
    }) => (
        <div data-testid="local-files-context-menu">
            <button type="button" data-testid="context-new" onClick={onNewDocument}>
                New
            </button>
            <button type="button" data-testid="context-import" onClick={onImport}>
                Import
            </button>
            {children}
        </div>
    )
}));

// Mock cn utility
vi.mock('@/utils/cn', () => ({
    cn: (...args: (string | boolean | undefined)[]) => args.filter(Boolean).join(' ')
}));

describe('FileExplorer', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('rendering', () => {
        it('should render explorer header', () => {
            render(<FileExplorer />);

            expect(screen.getByText('sidebar.explorer')).toBeInTheDocument();
        });

        it('should render new file button', () => {
            render(<FileExplorer />);

            expect(screen.getByLabelText('common.new')).toBeInTheDocument();
        });

        it('should render search filter input', () => {
            render(<FileExplorer />);

            expect(screen.getByPlaceholderText('fileExplorer.filterPlaceholder')).toBeInTheDocument();
        });

        it('should render local files section header', () => {
            render(<FileExplorer />);

            expect(screen.getByText('fileExplorer.localFiles')).toBeInTheDocument();
        });

        it('should render all documents', () => {
            render(<FileExplorer />);

            expect(screen.getByText('Document 1.md')).toBeInTheDocument();
            expect(screen.getByText('GitHub File.md')).toBeInTheDocument();
            expect(screen.getByText('GDrive File.md')).toBeInTheDocument();
        });

        it('should apply custom className', () => {
            const { container } = render(<FileExplorer className="custom-class" />);

            expect(container.firstChild).toHaveClass('custom-class');
        });
    });

    describe('file filtering', () => {
        it('should filter documents by name', () => {
            render(<FileExplorer />);

            const filterInput = screen.getByPlaceholderText('fileExplorer.filterPlaceholder');
            fireEvent.change(filterInput, { target: { value: 'GitHub' } });

            expect(screen.getByText('GitHub File.md')).toBeInTheDocument();
            expect(screen.queryByText('Document 1.md')).not.toBeInTheDocument();
            expect(screen.queryByText('GDrive File.md')).not.toBeInTheDocument();
        });

        it('should be case insensitive', () => {
            render(<FileExplorer />);

            const filterInput = screen.getByPlaceholderText('fileExplorer.filterPlaceholder');
            fireEvent.change(filterInput, { target: { value: 'github' } });

            expect(screen.getByText('GitHub File.md')).toBeInTheDocument();
        });

        it('should show no matching files message when filter has no matches', () => {
            render(<FileExplorer />);

            const filterInput = screen.getByPlaceholderText('fileExplorer.filterPlaceholder');
            fireEvent.change(filterInput, { target: { value: 'nonexistent' } });

            expect(screen.getByText('fileExplorer.noMatchingFiles')).toBeInTheDocument();
        });

        it('should show all documents when filter is cleared', () => {
            render(<FileExplorer />);

            const filterInput = screen.getByPlaceholderText('fileExplorer.filterPlaceholder');
            fireEvent.change(filterInput, { target: { value: 'GitHub' } });
            fireEvent.change(filterInput, { target: { value: '' } });

            expect(screen.getByText('Document 1.md')).toBeInTheDocument();
            expect(screen.getByText('GitHub File.md')).toBeInTheDocument();
            expect(screen.getByText('GDrive File.md')).toBeInTheDocument();
        });
    });

    describe('document interactions', () => {
        it('should open document when clicked', () => {
            render(<FileExplorer />);

            const docItem = screen.getByText('GitHub File.md').closest('div[class*="cursor-pointer"]');
            if (docItem) {
                fireEvent.click(docItem);
            }

            expect(mockOpenDocument).toHaveBeenCalledWith('doc-2');
        });

        it('should create new document when new button is clicked', () => {
            render(<FileExplorer />);

            fireEvent.click(screen.getByLabelText('common.new'));

            expect(mockCreateDocument).toHaveBeenCalled();
            expect(mockSetPendingRenameDocumentId).toHaveBeenCalledWith('new-doc-id');
        });
    });

    describe('context menu', () => {
        it('should render LocalFilesContextMenu', () => {
            render(<FileExplorer />);

            expect(screen.getByTestId('local-files-context-menu')).toBeInTheDocument();
        });

        it('should call createDocument from context menu new action', () => {
            render(<FileExplorer />);

            fireEvent.click(screen.getByTestId('context-new'));

            expect(mockCreateDocument).toHaveBeenCalled();
        });

        it('should call openFileDialog from context menu import action', () => {
            render(<FileExplorer />);

            fireEvent.click(screen.getByTestId('context-import'));

            expect(mockOpenFileDialog).toHaveBeenCalled();
        });
    });

    describe('file context menus', () => {
        it('should wrap each document in FileContextMenu', () => {
            render(<FileExplorer />);

            expect(screen.getByTestId('file-context-menu-doc-1')).toBeInTheDocument();
            expect(screen.getByTestId('file-context-menu-doc-2')).toBeInTheDocument();
            expect(screen.getByTestId('file-context-menu-doc-3')).toBeInTheDocument();
        });
    });

    describe('editable names', () => {
        it('should render EditableTabName for each document', () => {
            render(<FileExplorer />);

            expect(screen.getByTestId('editable-name-doc-1')).toBeInTheDocument();
            expect(screen.getByTestId('editable-name-doc-2')).toBeInTheDocument();
            expect(screen.getByTestId('editable-name-doc-3')).toBeInTheDocument();
        });
    });

    describe('source icons', () => {
        it('should render correct icon for local source', () => {
            render(<FileExplorer />);

            // The file icon is used for local files
            expect(screen.getAllByTestId('icon-file').length).toBeGreaterThan(0);
        });

        it('should render correct icon for github source', () => {
            render(<FileExplorer />);

            expect(screen.getByTestId('icon-github')).toBeInTheDocument();
        });

        it('should render correct icon for gdrive source', () => {
            render(<FileExplorer />);

            expect(screen.getByTestId('icon-gdrive')).toBeInTheDocument();
        });
    });

    describe('sync status', () => {
        it('should render syncing indicator for syncing documents', () => {
            render(<FileExplorer />);

            expect(screen.getByTestId('icon-loader')).toBeInTheDocument();
        });
    });
});

describe('FileExplorer empty state', () => {
    it('should show no files message when filtered list is empty', () => {
        render(<FileExplorer />);

        // Filter to get no results
        const filterInput = screen.getByPlaceholderText('fileExplorer.filterPlaceholder');
        fireEvent.change(filterInput, { target: { value: 'zzzznonexistent' } });

        expect(screen.getByText('fileExplorer.noMatchingFiles')).toBeInTheDocument();
    });
});
