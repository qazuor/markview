import { Sidebar } from '@/components/sidebar/Sidebar';
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
    ChevronLeft: () => <span data-testid="icon-chevron-left" />
}));

// Mock UI components
vi.mock('@/components/ui', () => ({
    IconButton: ({ onClick, label, icon }: { onClick?: () => void; label: string; icon: React.ReactNode }) => (
        <button type="button" onClick={onClick} aria-label={label}>
            {icon}
        </button>
    ),
    Tooltip: ({ children }: { children: React.ReactNode }) => <>{children}</>
}));

// Mock child components
const mockSetActiveSection = vi.fn();
vi.mock('@/components/sidebar/SidebarNav', () => ({
    SidebarNav: ({
        activeSection,
        onSectionChange,
        className
    }: {
        activeSection: string;
        onSectionChange: (section: string) => void;
        className?: string;
    }) => (
        <nav data-testid="sidebar-nav" className={className} data-active={activeSection}>
            <button type="button" onClick={() => onSectionChange('explorer')}>
                Explorer
            </button>
            <button type="button" onClick={() => onSectionChange('github')}>
                GitHub
            </button>
            <button type="button" onClick={() => onSectionChange('gdrive')}>
                GDrive
            </button>
        </nav>
    )
}));

vi.mock('@/components/sidebar/FileExplorer', () => ({
    FileExplorer: () => <div data-testid="file-explorer">File Explorer</div>
}));

vi.mock('@/components/sidebar/GitHubExplorer', () => ({
    GitHubExplorer: ({ onFileOpened }: { onFileOpened?: () => void }) => (
        <div data-testid="github-explorer">
            GitHub Explorer
            <button type="button" onClick={onFileOpened}>
                Open File
            </button>
        </div>
    )
}));

vi.mock('@/components/sidebar/GoogleDriveExplorer', () => ({
    GoogleDriveExplorer: ({ onFileOpened }: { onFileOpened?: () => void }) => (
        <div data-testid="gdrive-explorer">
            Google Drive Explorer
            <button type="button" onClick={onFileOpened}>
                Open File
            </button>
        </div>
    )
}));

// Mock cn utility
vi.mock('@/utils/cn', () => ({
    cn: (...args: (string | boolean | undefined)[]) => args.filter(Boolean).join(' ')
}));

describe('Sidebar', () => {
    const defaultProps = {
        onCollapsedChange: vi.fn()
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('expanded state', () => {
        it('should render as aside', () => {
            render(<Sidebar {...defaultProps} />);

            expect(screen.getByRole('complementary')).toBeInTheDocument();
        });

        it('should have aria label', () => {
            render(<Sidebar {...defaultProps} />);

            expect(screen.getByLabelText('aria.sidebarNavigation')).toBeInTheDocument();
        });

        it('should render sidebar nav', () => {
            render(<Sidebar {...defaultProps} />);

            expect(screen.getByTestId('sidebar-nav')).toBeInTheDocument();
        });

        it('should show file explorer by default', () => {
            render(<Sidebar {...defaultProps} />);

            expect(screen.getByTestId('file-explorer')).toBeInTheDocument();
        });

        it('should have data-tour attribute', () => {
            render(<Sidebar {...defaultProps} />);

            expect(screen.getByRole('complementary')).toHaveAttribute('data-tour', 'sidebar');
        });

        it('should show collapse button', () => {
            render(<Sidebar {...defaultProps} />);

            expect(screen.getByText('sidebar.collapse')).toBeInTheDocument();
        });

        it('should call onCollapsedChange with true when collapse is clicked', () => {
            render(<Sidebar {...defaultProps} />);

            fireEvent.click(screen.getByLabelText('sidebar.collapseSidebar'));

            expect(defaultProps.onCollapsedChange).toHaveBeenCalledWith(true);
        });

        it('should apply custom className', () => {
            render(<Sidebar {...defaultProps} className="custom-class" />);

            expect(screen.getByRole('complementary')).toHaveClass('custom-class');
        });
    });

    describe('collapsed state', () => {
        it('should render collapsed sidebar', () => {
            render(<Sidebar {...defaultProps} isCollapsed={true} />);

            expect(screen.getByRole('complementary')).toBeInTheDocument();
        });

        it('should render sidebar nav in collapsed mode', () => {
            render(<Sidebar {...defaultProps} isCollapsed={true} />);

            expect(screen.getByTestId('sidebar-nav')).toBeInTheDocument();
        });

        it('should not show file explorer when collapsed', () => {
            render(<Sidebar {...defaultProps} isCollapsed={true} />);

            expect(screen.queryByTestId('file-explorer')).not.toBeInTheDocument();
        });

        it('should show expand button when collapsed', () => {
            render(<Sidebar {...defaultProps} isCollapsed={true} />);

            expect(screen.getByLabelText('sidebar.expandSidebar')).toBeInTheDocument();
        });

        it('should call onCollapsedChange with false when expand is clicked', () => {
            render(<Sidebar {...defaultProps} isCollapsed={true} />);

            fireEvent.click(screen.getByLabelText('sidebar.expandSidebar'));

            expect(defaultProps.onCollapsedChange).toHaveBeenCalledWith(false);
        });
    });

    describe('section navigation', () => {
        it('should show GitHub explorer when github section is active', () => {
            render(<Sidebar {...defaultProps} />);

            fireEvent.click(screen.getByText('GitHub'));

            expect(screen.getByTestId('github-explorer')).toBeInTheDocument();
            expect(screen.queryByTestId('file-explorer')).not.toBeInTheDocument();
        });

        it('should show Google Drive explorer when gdrive section is active', () => {
            render(<Sidebar {...defaultProps} />);

            fireEvent.click(screen.getByText('GDrive'));

            expect(screen.getByTestId('gdrive-explorer')).toBeInTheDocument();
            expect(screen.queryByTestId('file-explorer')).not.toBeInTheDocument();
        });

        it('should switch back to explorer when file opened from GitHub', () => {
            render(<Sidebar {...defaultProps} />);

            // Switch to GitHub
            fireEvent.click(screen.getByText('GitHub'));
            expect(screen.getByTestId('github-explorer')).toBeInTheDocument();

            // Open a file (should switch back to explorer)
            fireEvent.click(screen.getByText('Open File'));

            expect(screen.getByTestId('file-explorer')).toBeInTheDocument();
        });

        it('should switch back to explorer when file opened from GDrive', () => {
            render(<Sidebar {...defaultProps} />);

            // Switch to GDrive
            fireEvent.click(screen.getByText('GDrive'));
            expect(screen.getByTestId('gdrive-explorer')).toBeInTheDocument();

            // Open a file (should switch back to explorer)
            fireEvent.click(screen.getByText('Open File'));

            expect(screen.getByTestId('file-explorer')).toBeInTheDocument();
        });

        it('should show file explorer when explorer section is clicked', () => {
            render(<Sidebar {...defaultProps} />);

            // First switch to GitHub
            fireEvent.click(screen.getByText('GitHub'));
            expect(screen.getByTestId('github-explorer')).toBeInTheDocument();

            // Then switch back to Explorer
            fireEvent.click(screen.getByText('Explorer'));

            expect(screen.getByTestId('file-explorer')).toBeInTheDocument();
        });
    });

    describe('default values', () => {
        it('should default to expanded', () => {
            render(<Sidebar {...defaultProps} />);

            expect(screen.getByTestId('file-explorer')).toBeInTheDocument();
            expect(screen.getByText('sidebar.collapse')).toBeInTheDocument();
        });

        it('should work without onCollapsedChange callback', () => {
            render(<Sidebar />);

            // Should not throw when clicking collapse
            fireEvent.click(screen.getByLabelText('sidebar.collapseSidebar'));
        });
    });
});
