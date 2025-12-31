import { TabContextMenu } from '@/components/tabs/TabContextMenu';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock react-i18next
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key
    })
}));

// Mock context menu UI components
vi.mock('@/components/ui', () => ({
    ContextMenu: ({ children }: { children: React.ReactNode }) => <div data-testid="context-menu">{children}</div>,
    ContextMenuTrigger: ({ children }: { children: React.ReactNode; asChild?: boolean }) => (
        <div data-testid="context-menu-trigger">{children}</div>
    ),
    ContextMenuContent: ({ children }: { children: React.ReactNode }) => <div data-testid="context-menu-content">{children}</div>,
    ContextMenuItem: ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => (
        <button type="button" data-testid="context-menu-item" onClick={onClick}>
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
    ContextMenuSubContent: ({ children }: { children: React.ReactNode }) => <div data-testid="context-menu-sub-content">{children}</div>,
    ContextMenuShortcut: ({ children }: { children: React.ReactNode }) => <span data-testid="context-menu-shortcut">{children}</span>
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
    Copy: () => <span data-testid="icon-copy" />,
    Download: () => <span data-testid="icon-download" />,
    FileCode: () => <span data-testid="icon-file-code" />,
    FileImage: () => <span data-testid="icon-file-image" />,
    FileText: () => <span data-testid="icon-file-text" />,
    Pencil: () => <span data-testid="icon-pencil" />,
    X: () => <span data-testid="icon-x" />,
    XCircle: () => <span data-testid="icon-x-circle" />
}));

// Mock document store
const { mockGetDocument, mockRenameDocument, mockCreateDocument, mockUpdateContent, mockDocumentStore } = vi.hoisted(() => {
    const mockGetDocument = vi.fn();
    const mockRenameDocument = vi.fn();
    const mockCreateDocument = vi.fn();
    const mockUpdateContent = vi.fn();

    const state = {
        getDocument: mockGetDocument,
        renameDocument: mockRenameDocument,
        createDocument: mockCreateDocument,
        documents: new Map([['new-doc', { id: 'new-doc', name: 'New Document', content: '' }]])
    };

    const mockDocumentStore = vi.fn((selector?: (state: unknown) => unknown) => {
        // Handle both with and without selector
        if (typeof selector === 'function') {
            return selector(state);
        }
        return state;
    });

    (mockDocumentStore as unknown as { getState: () => unknown }).getState = () => ({
        updateContent: mockUpdateContent
    });

    return { mockGetDocument, mockRenameDocument, mockCreateDocument, mockUpdateContent, mockDocumentStore };
});

vi.mock('@/stores/documentStore', () => ({
    useDocumentStore: mockDocumentStore
}));

describe('TabContextMenu', () => {
    const mockOnClose = vi.fn();
    const mockOnCloseOthers = vi.fn();
    const mockOnCloseAll = vi.fn();
    const mockOnCloseSynced = vi.fn();

    const defaultProps = {
        tabId: 'tab-1',
        onClose: mockOnClose,
        onCloseOthers: mockOnCloseOthers,
        onCloseAll: mockOnCloseAll,
        onCloseSynced: mockOnCloseSynced
    };

    beforeEach(() => {
        vi.clearAllMocks();
        mockGetDocument.mockReturnValue({ id: 'tab-1', name: 'Test Document', content: '# Test' });
        mockCreateDocument.mockReturnValue('new-doc');
    });

    describe('rendering', () => {
        it('should render context menu', () => {
            render(
                <TabContextMenu {...defaultProps}>
                    <div data-testid="tab-trigger">Tab</div>
                </TabContextMenu>
            );

            expect(screen.getByTestId('context-menu')).toBeInTheDocument();
        });

        it('should render children as trigger', () => {
            render(
                <TabContextMenu {...defaultProps}>
                    <div data-testid="tab-trigger">Tab</div>
                </TabContextMenu>
            );

            expect(screen.getByTestId('tab-trigger')).toBeInTheDocument();
        });

        it('should show close tab option', () => {
            render(
                <TabContextMenu {...defaultProps}>
                    <div>Tab</div>
                </TabContextMenu>
            );

            expect(screen.getByText('contextMenu.closeTab')).toBeInTheDocument();
        });

        it('should show close other tabs option', () => {
            render(
                <TabContextMenu {...defaultProps}>
                    <div>Tab</div>
                </TabContextMenu>
            );

            expect(screen.getByText('contextMenu.closeOtherTabs')).toBeInTheDocument();
        });

        it('should show close all tabs option', () => {
            render(
                <TabContextMenu {...defaultProps}>
                    <div>Tab</div>
                </TabContextMenu>
            );

            expect(screen.getByText('contextMenu.closeAllTabs')).toBeInTheDocument();
        });

        it('should show close synced tabs option', () => {
            render(
                <TabContextMenu {...defaultProps}>
                    <div>Tab</div>
                </TabContextMenu>
            );

            expect(screen.getByText('contextMenu.closeSyncedTabs')).toBeInTheDocument();
        });

        it('should show rename option', () => {
            render(
                <TabContextMenu {...defaultProps}>
                    <div>Tab</div>
                </TabContextMenu>
            );

            expect(screen.getByText('common.rename')).toBeInTheDocument();
        });

        it('should show duplicate option', () => {
            render(
                <TabContextMenu {...defaultProps}>
                    <div>Tab</div>
                </TabContextMenu>
            );

            expect(screen.getByText('common.duplicate')).toBeInTheDocument();
        });

        it('should show export submenu', () => {
            render(
                <TabContextMenu {...defaultProps}>
                    <div>Tab</div>
                </TabContextMenu>
            );

            expect(screen.getByText('contextMenu.exportAs')).toBeInTheDocument();
        });

        it('should show keyboard shortcuts', () => {
            render(
                <TabContextMenu {...defaultProps}>
                    <div>Tab</div>
                </TabContextMenu>
            );

            expect(screen.getByText('Ctrl+W')).toBeInTheDocument();
            expect(screen.getByText('F2')).toBeInTheDocument();
        });
    });

    describe('close actions', () => {
        it('should call onClose when Close Tab is clicked', () => {
            render(
                <TabContextMenu {...defaultProps}>
                    <div>Tab</div>
                </TabContextMenu>
            );

            fireEvent.click(screen.getByText('contextMenu.closeTab'));

            expect(mockOnClose).toHaveBeenCalled();
        });

        it('should call onCloseOthers when Close Other Tabs is clicked', () => {
            render(
                <TabContextMenu {...defaultProps}>
                    <div>Tab</div>
                </TabContextMenu>
            );

            fireEvent.click(screen.getByText('contextMenu.closeOtherTabs'));

            expect(mockOnCloseOthers).toHaveBeenCalled();
        });

        it('should call onCloseAll when Close All Tabs is clicked', () => {
            render(
                <TabContextMenu {...defaultProps}>
                    <div>Tab</div>
                </TabContextMenu>
            );

            fireEvent.click(screen.getByText('contextMenu.closeAllTabs'));

            expect(mockOnCloseAll).toHaveBeenCalled();
        });

        it('should call onCloseSynced when Close Synced Tabs is clicked', () => {
            render(
                <TabContextMenu {...defaultProps}>
                    <div>Tab</div>
                </TabContextMenu>
            );

            fireEvent.click(screen.getByText('contextMenu.closeSyncedTabs'));

            expect(mockOnCloseSynced).toHaveBeenCalled();
        });
    });

    describe('rename', () => {
        it('should get document when rename is clicked', () => {
            vi.spyOn(window, 'prompt').mockReturnValue('New Name');

            render(
                <TabContextMenu {...defaultProps}>
                    <div>Tab</div>
                </TabContextMenu>
            );

            fireEvent.click(screen.getByText('common.rename'));

            expect(mockGetDocument).toHaveBeenCalledWith('tab-1');
        });

        it('should call renameDocument with new name', () => {
            vi.spyOn(window, 'prompt').mockReturnValue('New Name');

            render(
                <TabContextMenu {...defaultProps}>
                    <div>Tab</div>
                </TabContextMenu>
            );

            fireEvent.click(screen.getByText('common.rename'));

            expect(mockRenameDocument).toHaveBeenCalledWith('tab-1', 'New Name', true);
        });

        it('should not rename if prompt is cancelled', () => {
            vi.spyOn(window, 'prompt').mockReturnValue(null);

            render(
                <TabContextMenu {...defaultProps}>
                    <div>Tab</div>
                </TabContextMenu>
            );

            fireEvent.click(screen.getByText('common.rename'));

            expect(mockRenameDocument).not.toHaveBeenCalled();
        });

        it('should not rename if name is empty', () => {
            vi.spyOn(window, 'prompt').mockReturnValue('   ');

            render(
                <TabContextMenu {...defaultProps}>
                    <div>Tab</div>
                </TabContextMenu>
            );

            fireEvent.click(screen.getByText('common.rename'));

            expect(mockRenameDocument).not.toHaveBeenCalled();
        });
    });

    describe('duplicate', () => {
        it('should create new document when duplicate is clicked', () => {
            render(
                <TabContextMenu {...defaultProps}>
                    <div>Tab</div>
                </TabContextMenu>
            );

            fireEvent.click(screen.getByText('common.duplicate'));

            expect(mockCreateDocument).toHaveBeenCalled();
        });

        it('should rename duplicate with (copy) suffix', () => {
            render(
                <TabContextMenu {...defaultProps}>
                    <div>Tab</div>
                </TabContextMenu>
            );

            fireEvent.click(screen.getByText('common.duplicate'));

            expect(mockRenameDocument).toHaveBeenCalledWith('new-doc', 'Test Document (copy)', true);
        });

        it('should copy content to duplicate', () => {
            render(
                <TabContextMenu {...defaultProps}>
                    <div>Tab</div>
                </TabContextMenu>
            );

            fireEvent.click(screen.getByText('common.duplicate'));

            expect(mockUpdateContent).toHaveBeenCalledWith('new-doc', '# Test');
        });
    });

    describe('export options', () => {
        it('should show markdown export option', () => {
            render(
                <TabContextMenu {...defaultProps}>
                    <div>Tab</div>
                </TabContextMenu>
            );

            expect(screen.getByText('export.markdown')).toBeInTheDocument();
        });

        it('should show html export option', () => {
            render(
                <TabContextMenu {...defaultProps}>
                    <div>Tab</div>
                </TabContextMenu>
            );

            expect(screen.getByText('export.html')).toBeInTheDocument();
        });

        it('should show plain text export option', () => {
            render(
                <TabContextMenu {...defaultProps}>
                    <div>Tab</div>
                </TabContextMenu>
            );

            expect(screen.getByText('contextMenu.plainText')).toBeInTheDocument();
        });
    });

    describe('separators', () => {
        it('should render separators', () => {
            render(
                <TabContextMenu {...defaultProps}>
                    <div>Tab</div>
                </TabContextMenu>
            );

            const separators = screen.getAllByTestId('context-menu-separator');
            expect(separators.length).toBeGreaterThan(0);
        });
    });
});
