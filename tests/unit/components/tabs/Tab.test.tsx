import { Tab } from '@/components/tabs/Tab';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock react-i18next
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key
    })
}));

// Mock EditableTabName
vi.mock('@/components/tabs/EditableTabName', () => ({
    EditableTabName: ({ name }: { name: string }) => <span data-testid="tab-name">{name}</span>
}));

// Mock TabContextMenu
vi.mock('@/components/tabs/TabContextMenu', () => ({
    TabContextMenu: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}));

describe('Tab', () => {
    const defaultProps = {
        id: 'doc-1',
        name: 'Test Document',
        isActive: false,
        syncStatus: 'synced' as const,
        onClick: vi.fn(),
        onClose: vi.fn(),
        onMiddleClick: vi.fn(),
        onCloseOthers: vi.fn(),
        onCloseAll: vi.fn(),
        onCloseSynced: vi.fn()
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('rendering', () => {
        it('should render tab name', () => {
            render(<Tab {...defaultProps} />);

            expect(screen.getByTestId('tab-name')).toHaveTextContent('Test Document');
        });

        it('should render with role="tab"', () => {
            render(<Tab {...defaultProps} />);

            expect(screen.getByRole('tab')).toBeInTheDocument();
        });

        it('should render close button', () => {
            render(<Tab {...defaultProps} />);

            expect(screen.getByRole('button', { name: 'Close Test Document' })).toBeInTheDocument();
        });

        it('should have data-tab-id attribute', () => {
            render(<Tab {...defaultProps} />);

            expect(screen.getByRole('tab')).toHaveAttribute('data-tab-id', 'doc-1');
        });
    });

    describe('active state', () => {
        it('should have aria-selected=true when active', () => {
            render(<Tab {...defaultProps} isActive={true} />);

            expect(screen.getByRole('tab')).toHaveAttribute('aria-selected', 'true');
        });

        it('should have aria-selected=false when inactive', () => {
            render(<Tab {...defaultProps} isActive={false} />);

            expect(screen.getByRole('tab')).toHaveAttribute('aria-selected', 'false');
        });

        it('should have tabIndex=0 when active', () => {
            render(<Tab {...defaultProps} isActive={true} />);

            expect(screen.getByRole('tab')).toHaveAttribute('tabIndex', '0');
        });

        it('should have tabIndex=-1 when inactive', () => {
            render(<Tab {...defaultProps} isActive={false} />);

            expect(screen.getByRole('tab')).toHaveAttribute('tabIndex', '-1');
        });
    });

    describe('click handlers', () => {
        it('should call onClick when tab is clicked', () => {
            const onClick = vi.fn();
            render(<Tab {...defaultProps} onClick={onClick} />);

            fireEvent.click(screen.getByRole('tab'));

            expect(onClick).toHaveBeenCalled();
        });

        it('should call onClose when close button is clicked', () => {
            const onClose = vi.fn();
            render(<Tab {...defaultProps} onClose={onClose} />);

            fireEvent.click(screen.getByRole('button', { name: 'Close Test Document' }));

            expect(onClose).toHaveBeenCalled();
        });

        it('should stop propagation when close button is clicked', () => {
            const onClick = vi.fn();
            const onClose = vi.fn();
            render(<Tab {...defaultProps} onClick={onClick} onClose={onClose} />);

            fireEvent.click(screen.getByRole('button', { name: 'Close Test Document' }));

            expect(onClose).toHaveBeenCalled();
            expect(onClick).not.toHaveBeenCalled();
        });

        it('should call onMiddleClick on middle mouse button', () => {
            const onMiddleClick = vi.fn();
            render(<Tab {...defaultProps} onMiddleClick={onMiddleClick} />);

            const tab = screen.getByRole('tab');
            // Simulate auxclick (middle click) using native event
            const event = new MouseEvent('auxclick', { button: 1, bubbles: true });
            tab.dispatchEvent(event);

            expect(onMiddleClick).toHaveBeenCalled();
        });
    });

    describe('keyboard navigation', () => {
        it('should call onClick on Enter key', () => {
            const onClick = vi.fn();
            render(<Tab {...defaultProps} onClick={onClick} />);

            fireEvent.keyDown(screen.getByRole('tab'), { key: 'Enter' });

            expect(onClick).toHaveBeenCalled();
        });

        it('should call onClick on Space key', () => {
            const onClick = vi.fn();
            render(<Tab {...defaultProps} onClick={onClick} />);

            fireEvent.keyDown(screen.getByRole('tab'), { key: ' ' });

            expect(onClick).toHaveBeenCalled();
        });
    });

    describe('sync status indicator', () => {
        it('should show synced status with green color', () => {
            const { container } = render(<Tab {...defaultProps} syncStatus="synced" />);

            const indicator = container.querySelector('[style*="background-color"]');
            expect(indicator).toHaveStyle({ backgroundColor: 'rgb(34, 197, 94)' }); // green-500
        });

        it('should show modified status with orange color', () => {
            const { container } = render(<Tab {...defaultProps} syncStatus="modified" />);

            const indicator = container.querySelector('[style*="background-color"]');
            expect(indicator).toHaveStyle({ backgroundColor: 'rgb(249, 115, 22)' }); // orange-500
        });

        it('should show syncing status with blue color and animation', () => {
            const { container } = render(<Tab {...defaultProps} syncStatus="syncing" />);

            const indicator = container.querySelector('.animate-pulse');
            expect(indicator).toBeInTheDocument();
            expect(indicator).toHaveStyle({ backgroundColor: 'rgb(59, 130, 246)' }); // blue-500
        });

        it('should show error status with red color', () => {
            const { container } = render(<Tab {...defaultProps} syncStatus="error" />);

            const indicator = container.querySelector('[style*="background-color"]');
            expect(indicator).toHaveStyle({ backgroundColor: 'rgb(239, 68, 68)' }); // red-500
        });

        it('should have status tooltip', () => {
            const { container } = render(<Tab {...defaultProps} syncStatus="synced" />);

            const indicator = container.querySelector('[title="syncStatus.synced"]');
            expect(indicator).toBeInTheDocument();
        });
    });

    describe('styling', () => {
        it('should have active styles when active', () => {
            render(<Tab {...defaultProps} isActive={true} />);

            const tab = screen.getByRole('tab');
            expect(tab).toHaveClass('bg-white');
        });

        it('should have inactive styles when inactive', () => {
            render(<Tab {...defaultProps} isActive={false} />);

            const tab = screen.getByRole('tab');
            expect(tab).toHaveClass('bg-slate-100');
        });
    });
});
