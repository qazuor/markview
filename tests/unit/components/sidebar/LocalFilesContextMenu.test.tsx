import { LocalFilesContextMenu } from '@/components/sidebar/LocalFilesContextMenu';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

// Mock react-i18next
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key
    })
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
    FilePlus: () => <span data-testid="icon-file-plus" />,
    Import: () => <span data-testid="icon-import" />
}));

// Mock UI components
vi.mock('@/components/ui', () => ({
    ContextMenu: ({ children }: { children: React.ReactNode }) => <div data-testid="context-menu">{children}</div>,
    ContextMenuTrigger: ({ children }: { children: React.ReactNode }) => <div data-testid="context-menu-trigger">{children}</div>,
    ContextMenuContent: ({ children }: { children: React.ReactNode }) => <div data-testid="context-menu-content">{children}</div>,
    ContextMenuItem: ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => (
        <button type="button" data-testid="context-menu-item" onClick={onClick}>
            {children}
        </button>
    )
}));

describe('LocalFilesContextMenu', () => {
    const defaultProps = {
        onNewDocument: vi.fn(),
        onImport: vi.fn()
    };

    describe('rendering', () => {
        it('should render context menu', () => {
            render(
                <LocalFilesContextMenu {...defaultProps}>
                    <div>File List</div>
                </LocalFilesContextMenu>
            );

            expect(screen.getByTestId('context-menu')).toBeInTheDocument();
        });

        it('should render children inside trigger', () => {
            render(
                <LocalFilesContextMenu {...defaultProps}>
                    <div>File List Content</div>
                </LocalFilesContextMenu>
            );

            expect(screen.getByText('File List Content')).toBeInTheDocument();
        });

        it('should render new document option', () => {
            render(
                <LocalFilesContextMenu {...defaultProps}>
                    <div>Children</div>
                </LocalFilesContextMenu>
            );

            expect(screen.getByText('contextMenu.newDocument')).toBeInTheDocument();
        });

        it('should render import option', () => {
            render(
                <LocalFilesContextMenu {...defaultProps}>
                    <div>Children</div>
                </LocalFilesContextMenu>
            );

            expect(screen.getByText('contextMenu.importFile')).toBeInTheDocument();
        });

        it('should render file plus icon', () => {
            render(
                <LocalFilesContextMenu {...defaultProps}>
                    <div>Children</div>
                </LocalFilesContextMenu>
            );

            expect(screen.getByTestId('icon-file-plus')).toBeInTheDocument();
        });

        it('should render import icon', () => {
            render(
                <LocalFilesContextMenu {...defaultProps}>
                    <div>Children</div>
                </LocalFilesContextMenu>
            );

            expect(screen.getByTestId('icon-import')).toBeInTheDocument();
        });
    });

    describe('interactions', () => {
        it('should call onNewDocument when new document is clicked', () => {
            const onNewDocument = vi.fn();

            render(
                <LocalFilesContextMenu {...defaultProps} onNewDocument={onNewDocument}>
                    <div>Children</div>
                </LocalFilesContextMenu>
            );

            const newDocButton = screen.getByText('contextMenu.newDocument');
            fireEvent.click(newDocButton);

            expect(onNewDocument).toHaveBeenCalledTimes(1);
        });

        it('should call onImport when import is clicked', () => {
            const onImport = vi.fn();

            render(
                <LocalFilesContextMenu {...defaultProps} onImport={onImport}>
                    <div>Children</div>
                </LocalFilesContextMenu>
            );

            const importButton = screen.getByText('contextMenu.importFile');
            fireEvent.click(importButton);

            expect(onImport).toHaveBeenCalledTimes(1);
        });
    });

    describe('menu items', () => {
        it('should have two menu items', () => {
            render(
                <LocalFilesContextMenu {...defaultProps}>
                    <div>Children</div>
                </LocalFilesContextMenu>
            );

            const menuItems = screen.getAllByTestId('context-menu-item');
            expect(menuItems).toHaveLength(2);
        });
    });
});
