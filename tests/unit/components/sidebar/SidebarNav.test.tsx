import { SidebarNav } from '@/components/sidebar/SidebarNav';
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
    IconButton: ({
        icon,
        label,
        onClick,
        variant,
        className
    }: {
        icon: React.ReactNode;
        label: string;
        onClick: () => void;
        variant?: string;
        className?: string;
    }) => (
        <button type="button" onClick={onClick} aria-label={label} data-variant={variant} className={className}>
            {icon}
        </button>
    ),
    Tooltip: ({ children }: { children: React.ReactNode; content: string; side?: string }) => <>{children}</>
}));

describe('SidebarNav', () => {
    const mockOnSectionChange = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('rendering', () => {
        it('should render navigation element', () => {
            render(<SidebarNav activeSection="explorer" onSectionChange={mockOnSectionChange} />);

            expect(screen.getByRole('navigation')).toBeInTheDocument();
        });

        it('should have aria-label for accessibility', () => {
            render(<SidebarNav activeSection="explorer" onSectionChange={mockOnSectionChange} />);

            expect(screen.getByRole('navigation')).toHaveAttribute('aria-label', 'aria.sidebarSections');
        });

        it('should render explorer button', () => {
            render(<SidebarNav activeSection="explorer" onSectionChange={mockOnSectionChange} />);

            expect(screen.getByRole('button', { name: 'sidebar.explorer' })).toBeInTheDocument();
        });

        it('should render github button', () => {
            render(<SidebarNav activeSection="explorer" onSectionChange={mockOnSectionChange} />);

            expect(screen.getByRole('button', { name: 'sidebar.github' })).toBeInTheDocument();
        });

        it('should render gdrive button', () => {
            render(<SidebarNav activeSection="explorer" onSectionChange={mockOnSectionChange} />);

            expect(screen.getByRole('button', { name: 'sidebar.gdrive' })).toBeInTheDocument();
        });
    });

    describe('active section', () => {
        it('should show explorer as active', () => {
            render(<SidebarNav activeSection="explorer" onSectionChange={mockOnSectionChange} />);

            const explorerButton = screen.getByRole('button', { name: 'sidebar.explorer' });
            expect(explorerButton).toHaveAttribute('data-variant', 'default');
        });

        it('should show github as active', () => {
            render(<SidebarNav activeSection="github" onSectionChange={mockOnSectionChange} />);

            const githubButton = screen.getByRole('button', { name: 'sidebar.github' });
            expect(githubButton).toHaveAttribute('data-variant', 'default');
        });

        it('should show gdrive as active', () => {
            render(<SidebarNav activeSection="gdrive" onSectionChange={mockOnSectionChange} />);

            const gdriveButton = screen.getByRole('button', { name: 'sidebar.gdrive' });
            expect(gdriveButton).toHaveAttribute('data-variant', 'default');
        });

        it('should show inactive sections with ghost variant', () => {
            render(<SidebarNav activeSection="explorer" onSectionChange={mockOnSectionChange} />);

            const githubButton = screen.getByRole('button', { name: 'sidebar.github' });
            const gdriveButton = screen.getByRole('button', { name: 'sidebar.gdrive' });

            expect(githubButton).toHaveAttribute('data-variant', 'ghost');
            expect(gdriveButton).toHaveAttribute('data-variant', 'ghost');
        });
    });

    describe('interactions', () => {
        it('should call onSectionChange with explorer when clicked', () => {
            render(<SidebarNav activeSection="github" onSectionChange={mockOnSectionChange} />);

            fireEvent.click(screen.getByRole('button', { name: 'sidebar.explorer' }));

            expect(mockOnSectionChange).toHaveBeenCalledWith('explorer');
        });

        it('should call onSectionChange with github when clicked', () => {
            render(<SidebarNav activeSection="explorer" onSectionChange={mockOnSectionChange} />);

            fireEvent.click(screen.getByRole('button', { name: 'sidebar.github' }));

            expect(mockOnSectionChange).toHaveBeenCalledWith('github');
        });

        it('should call onSectionChange with gdrive when clicked', () => {
            render(<SidebarNav activeSection="explorer" onSectionChange={mockOnSectionChange} />);

            fireEvent.click(screen.getByRole('button', { name: 'sidebar.gdrive' }));

            expect(mockOnSectionChange).toHaveBeenCalledWith('gdrive');
        });
    });

    describe('styling', () => {
        it('should apply custom className', () => {
            render(<SidebarNav activeSection="explorer" onSectionChange={mockOnSectionChange} className="custom-class" />);

            expect(screen.getByRole('navigation')).toHaveClass('custom-class');
        });

        it('should have flex layout', () => {
            render(<SidebarNav activeSection="explorer" onSectionChange={mockOnSectionChange} />);

            expect(screen.getByRole('navigation')).toHaveClass('flex', 'flex-col', 'items-center');
        });
    });

    describe('cloud section', () => {
        it('should have data-tour attribute on cloud section', () => {
            const { container } = render(<SidebarNav activeSection="explorer" onSectionChange={mockOnSectionChange} />);

            const cloudSection = container.querySelector('[data-tour="cloud"]');
            expect(cloudSection).toBeInTheDocument();
        });

        it('should have border separator before cloud section', () => {
            const { container } = render(<SidebarNav activeSection="explorer" onSectionChange={mockOnSectionChange} />);

            const cloudSection = container.querySelector('[data-tour="cloud"]');
            expect(cloudSection).toHaveClass('border-t', 'border-border');
        });
    });
});
