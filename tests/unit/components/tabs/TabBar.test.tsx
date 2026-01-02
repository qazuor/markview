import { TabBar } from '@/components/tabs/TabBar';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
    ChevronLeft: () => <span data-testid="icon-chevron-left" />,
    ChevronRight: () => <span data-testid="icon-chevron-right" />,
    Plus: () => <span data-testid="icon-plus" />
}));

// Mock UI components
vi.mock('@/components/ui', () => ({
    IconButton: ({ onClick, label, icon }: { onClick?: () => void; label: string; icon: React.ReactNode }) => (
        <button type="button" onClick={onClick} aria-label={label}>
            {icon}
        </button>
    )
}));

// Mock Tab component
vi.mock('@/components/tabs/Tab', () => ({
    Tab: ({
        id,
        name,
        isActive,
        onClick,
        onClose,
        onMiddleClick
    }: {
        id: string;
        name: string;
        isActive: boolean;
        onClick: () => void;
        onClose: (e: React.MouseEvent) => void;
        onMiddleClick: (e: React.MouseEvent) => void;
        onCloseOthers: () => void;
        onCloseAll: () => void;
        onCloseSynced: () => void;
        syncStatus?: string;
    }) => (
        <div
            role="tab"
            tabIndex={0}
            data-testid={`tab-${id}`}
            data-active={isActive}
            onClick={onClick}
            onAuxClick={onMiddleClick}
            onKeyDown={() => {}}
        >
            <span>{name}</span>
            <button type="button" data-testid={`close-${id}`} onClick={onClose}>
                Close
            </button>
        </div>
    )
}));

// Mock CloseConfirmModal
vi.mock('@/components/tabs/CloseConfirmModal', () => ({
    CloseConfirmModal: ({
        isOpen,
        fileName,
        onAction
    }: {
        isOpen: boolean;
        fileName: string;
        onAction: (action: 'save' | 'discard' | 'cancel') => void;
    }) =>
        isOpen ? (
            <div data-testid="close-confirm-modal">
                <span>Confirm close: {fileName}</span>
                <button type="button" onClick={() => onAction('save')}>
                    Save
                </button>
                <button type="button" onClick={() => onAction('discard')}>
                    Discard
                </button>
                <button type="button" onClick={() => onAction('cancel')}>
                    Cancel
                </button>
            </div>
        ) : null
}));

// Mock useTabs hook
const mockSelectTab = vi.fn();
const mockCloseTab = vi.fn();
const mockForceCloseTab = vi.fn();
const mockAddTab = vi.fn();
const mockCloseOtherTabs = vi.fn();
const mockCloseAllTabs = vi.fn();
const mockCloseSyncedTabs = vi.fn();

vi.mock('@/components/tabs/hooks/useTabs', () => ({
    useTabs: () => ({
        tabs: [
            { id: 'tab-1', name: 'Document 1.md', syncStatus: 'local' },
            { id: 'tab-2', name: 'Document 2.md', syncStatus: 'synced' }
        ],
        activeTab: 'tab-1',
        selectTab: mockSelectTab,
        closeTab: mockCloseTab,
        forceCloseTab: mockForceCloseTab,
        addTab: mockAddTab,
        tabCount: 2,
        closeOtherTabs: mockCloseOtherTabs,
        closeAllTabs: mockCloseAllTabs,
        closeSyncedTabs: mockCloseSyncedTabs
    })
}));

// Mock cn utility
vi.mock('@/utils/cn', () => ({
    cn: (...args: (string | boolean | undefined)[]) => args.filter(Boolean).join(' ')
}));

describe('TabBar', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockCloseTab.mockReturnValue({ requiresConfirmation: false });
    });

    describe('rendering', () => {
        it('should render tablist', () => {
            render(<TabBar />);

            expect(screen.getByRole('tablist')).toBeInTheDocument();
        });

        it('should render all tabs', () => {
            render(<TabBar />);

            expect(screen.getByTestId('tab-tab-1')).toBeInTheDocument();
            expect(screen.getByTestId('tab-tab-2')).toBeInTheDocument();
        });

        it('should show active state on active tab', () => {
            render(<TabBar />);

            expect(screen.getByTestId('tab-tab-1')).toHaveAttribute('data-active', 'true');
            expect(screen.getByTestId('tab-tab-2')).toHaveAttribute('data-active', 'false');
        });

        it('should render add tab button', () => {
            render(<TabBar />);

            expect(screen.getByLabelText('New document')).toBeInTheDocument();
        });

        it('should apply custom className', () => {
            render(<TabBar className="custom-class" />);

            expect(screen.getByRole('tablist')).toHaveClass('custom-class');
        });
    });

    describe('tab selection', () => {
        it('should call selectTab when tab is clicked', () => {
            render(<TabBar />);

            fireEvent.click(screen.getByTestId('tab-tab-2'));

            expect(mockSelectTab).toHaveBeenCalledWith('tab-2');
        });
    });

    describe('tab closing', () => {
        it('should call closeTab when close button is clicked', () => {
            render(<TabBar />);

            fireEvent.click(screen.getByTestId('close-tab-1'));

            expect(mockCloseTab).toHaveBeenCalledWith('tab-1');
        });

        it('should show confirmation modal for unsaved changes', () => {
            mockCloseTab.mockReturnValue({
                requiresConfirmation: true,
                document: { name: 'Unsaved Doc.md' }
            });

            render(<TabBar />);

            fireEvent.click(screen.getByTestId('close-tab-1'));

            expect(screen.getByTestId('close-confirm-modal')).toBeInTheDocument();
            expect(screen.getByText('Confirm close: Unsaved Doc.md')).toBeInTheDocument();
        });

        it('should force close when discard is selected', () => {
            mockCloseTab.mockReturnValue({
                requiresConfirmation: true,
                document: { name: 'Unsaved Doc.md' }
            });

            render(<TabBar />);

            fireEvent.click(screen.getByTestId('close-tab-1'));
            fireEvent.click(screen.getByText('Discard'));

            expect(mockForceCloseTab).toHaveBeenCalledWith('tab-1');
        });

        it('should close modal when cancel is selected', () => {
            mockCloseTab.mockReturnValue({
                requiresConfirmation: true,
                document: { name: 'Unsaved Doc.md' }
            });

            render(<TabBar />);

            fireEvent.click(screen.getByTestId('close-tab-1'));
            fireEvent.click(screen.getByText('Cancel'));

            expect(screen.queryByTestId('close-confirm-modal')).not.toBeInTheDocument();
        });
    });

    describe('add tab', () => {
        it('should call addTab when add button is clicked', () => {
            render(<TabBar />);

            fireEvent.click(screen.getByLabelText('New document'));

            expect(mockAddTab).toHaveBeenCalled();
        });
    });

    describe('middle click', () => {
        it('should close tab on middle click', () => {
            render(<TabBar />);

            const tab = screen.getByTestId('tab-tab-1');
            fireEvent.click(tab, { button: 1 }); // Middle click

            // The mock Tab calls onMiddleClick on auxClick which triggers closeTab
            // Since our mock uses onAuxClick, let's trigger it differently
            fireEvent(tab, new MouseEvent('auxclick', { bubbles: true, button: 1 }));

            expect(mockCloseTab).toHaveBeenCalledWith('tab-1');
        });
    });
});
