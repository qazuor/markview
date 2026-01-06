import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock react-i18next
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key
    })
}));

// Mock UI components
vi.mock('@/components/ui', () => ({
    Modal: ({
        children,
        isOpen,
        title
    }: {
        children: React.ReactNode;
        isOpen: boolean;
        title: string;
        onClose: () => void;
    }) =>
        isOpen ? (
            <div data-testid="modal" data-title={title}>
                {children}
            </div>
        ) : null,
    ModalFooter: ({ children }: { children: React.ReactNode }) => <div data-testid="modal-footer">{children}</div>,
    Button: ({
        children,
        onClick,
        disabled
    }: {
        children: React.ReactNode;
        onClick?: () => void;
        disabled?: boolean;
        variant?: string;
    }) => (
        <button type="button" onClick={onClick} disabled={disabled}>
            {children}
        </button>
    )
}));

// Mock folder store
const mockCreateFolder = vi.fn().mockReturnValue('new-folder-id');

vi.mock('@/stores/folderStore', () => ({
    FOLDER_COLORS: [
        { name: 'red', value: '#ef4444' },
        { name: 'blue', value: '#3b82f6' },
        { name: 'green', value: '#22c55e' }
    ],
    FOLDER_ICONS: ['folder', 'star', 'archive', 'book'],
    useFolderStore: (selector?: (state: unknown) => unknown) => {
        const state = {
            createFolder: mockCreateFolder
        };
        if (selector) {
            return selector(state);
        }
        return state;
    }
}));

// Mock UI store
const mockCloseModal = vi.fn();
let mockActiveModal: string | null = 'new-folder';
let mockNewFolderParentId: string | null = null;

vi.mock('@/stores/uiStore', () => ({
    useUIStore: (selector?: (state: unknown) => unknown) => {
        const state = {
            activeModal: mockActiveModal,
            newFolderParentId: mockNewFolderParentId,
            closeModal: mockCloseModal
        };
        if (selector) {
            return selector(state);
        }
        return state;
    }
}));

// Import after mocks
import { NewFolderModal, getIconComponent } from '@/components/sidebar/NewFolderModal';

describe('NewFolderModal', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockActiveModal = 'new-folder';
        mockNewFolderParentId = null;
    });

    describe('getIconComponent', () => {
        it('should return a component for folder icon', () => {
            const Icon = getIconComponent('folder');
            expect(Icon).toBeDefined();
            // React components can be functions or objects (forwardRef)
            expect(['function', 'object'].includes(typeof Icon)).toBe(true);
        });

        it('should return a component for star icon', () => {
            const Icon = getIconComponent('star');
            expect(Icon).toBeDefined();
        });

        it('should return Folder for unknown icon', () => {
            const Icon = getIconComponent('unknown-icon');
            expect(Icon).toBeDefined();
        });
    });

    describe('rendering', () => {
        it('should render modal when activeModal is new-folder', () => {
            render(<NewFolderModal />);

            expect(screen.getByTestId('modal')).toBeInTheDocument();
        });

        it('should not render modal when activeModal is different', () => {
            mockActiveModal = 'settings';

            render(<NewFolderModal />);

            expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
        });

        it('should render modal with correct title', () => {
            render(<NewFolderModal />);

            expect(screen.getByTestId('modal')).toHaveAttribute('data-title', 'fileExplorer.folder.new');
        });

        it('should render name input', () => {
            render(<NewFolderModal />);

            expect(screen.getByPlaceholderText('fileExplorer.folder.namePlaceholder')).toBeInTheDocument();
        });

        it('should render color picker label', () => {
            render(<NewFolderModal />);

            expect(screen.getByText('fileExplorer.folder.color')).toBeInTheDocument();
        });

        it('should render icon picker label', () => {
            render(<NewFolderModal />);

            expect(screen.getByText('fileExplorer.folder.icon')).toBeInTheDocument();
        });

        it('should render cancel button', () => {
            render(<NewFolderModal />);

            expect(screen.getByText('common.cancel')).toBeInTheDocument();
        });

        it('should render create button', () => {
            render(<NewFolderModal />);

            expect(screen.getByText('common.create')).toBeInTheDocument();
        });
    });

    describe('form submission', () => {
        it('should create folder with name only', () => {
            render(<NewFolderModal />);

            const input = screen.getByPlaceholderText('fileExplorer.folder.namePlaceholder');
            fireEvent.change(input, { target: { value: 'My Folder' } });

            const createButton = screen.getByText('common.create');
            fireEvent.click(createButton);

            expect(mockCreateFolder).toHaveBeenCalledWith({
                name: 'My Folder',
                parentId: null,
                color: null,
                icon: null
            });
            expect(mockCloseModal).toHaveBeenCalled();
        });

        it('should create folder with parent id', () => {
            mockNewFolderParentId = 'parent-folder-id';

            render(<NewFolderModal />);

            const input = screen.getByPlaceholderText('fileExplorer.folder.namePlaceholder');
            fireEvent.change(input, { target: { value: 'Subfolder' } });

            const createButton = screen.getByText('common.create');
            fireEvent.click(createButton);

            expect(mockCreateFolder).toHaveBeenCalledWith({
                name: 'Subfolder',
                parentId: 'parent-folder-id',
                color: null,
                icon: null
            });
        });

        it('should not create folder with empty name', () => {
            render(<NewFolderModal />);

            const createButton = screen.getByText('common.create');
            fireEvent.click(createButton);

            expect(mockCreateFolder).not.toHaveBeenCalled();
        });

        it('should not create folder with whitespace-only name', () => {
            render(<NewFolderModal />);

            const input = screen.getByPlaceholderText('fileExplorer.folder.namePlaceholder');
            fireEvent.change(input, { target: { value: '   ' } });

            const createButton = screen.getByText('common.create');
            fireEvent.click(createButton);

            expect(mockCreateFolder).not.toHaveBeenCalled();
        });

        it('should trim folder name', () => {
            render(<NewFolderModal />);

            const input = screen.getByPlaceholderText('fileExplorer.folder.namePlaceholder');
            fireEvent.change(input, { target: { value: '  My Folder  ' } });

            const createButton = screen.getByText('common.create');
            fireEvent.click(createButton);

            expect(mockCreateFolder).toHaveBeenCalledWith(
                expect.objectContaining({
                    name: 'My Folder'
                })
            );
        });
    });

    describe('cancel button', () => {
        it('should close modal on cancel', () => {
            render(<NewFolderModal />);

            const cancelButton = screen.getByText('common.cancel');
            fireEvent.click(cancelButton);

            expect(mockCloseModal).toHaveBeenCalled();
        });
    });

    describe('initial state', () => {
        it('should start with empty input', () => {
            render(<NewFolderModal />);

            const input = screen.getByPlaceholderText('fileExplorer.folder.namePlaceholder');
            expect(input).toHaveValue('');
        });
    });
});
