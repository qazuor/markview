import { FormatButton, FormatButtonGroup, ToolbarSeparator } from '@/components/toolbar/FormatButton';
import { fireEvent, render, screen } from '@testing-library/react';
import { Bold } from 'lucide-react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock react-i18next
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key
    })
}));

// Mock Tooltip components to simplify testing
vi.mock('@/components/ui', () => ({
    Tooltip: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    TooltipWithShortcut: ({ label, shortcut }: { label: string; shortcut?: string }) => (
        <span data-testid="tooltip-content">
            {label}
            {shortcut && <span> ({shortcut})</span>}
        </span>
    )
}));

describe('FormatButton', () => {
    const defaultProps = {
        icon: Bold,
        label: 'Bold',
        onClick: vi.fn()
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('rendering', () => {
        it('should render button with icon', () => {
            render(<FormatButton {...defaultProps} />);

            const button = screen.getByRole('button');
            expect(button).toBeInTheDocument();
        });

        it('should render with aria-label', () => {
            render(<FormatButton {...defaultProps} />);

            expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Bold');
        });

        it('should have type="button"', () => {
            render(<FormatButton {...defaultProps} />);

            expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
        });
    });

    describe('active state', () => {
        it('should have aria-pressed=false by default', () => {
            render(<FormatButton {...defaultProps} />);

            expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'false');
        });

        it('should have aria-pressed=true when active', () => {
            render(<FormatButton {...defaultProps} active={true} />);

            expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true');
        });

        it('should apply active styles when active', () => {
            render(<FormatButton {...defaultProps} active={true} />);

            const button = screen.getByRole('button');
            expect(button).toHaveClass('bg-slate-400/50');
        });
    });

    describe('disabled state', () => {
        it('should not be disabled by default', () => {
            render(<FormatButton {...defaultProps} />);

            expect(screen.getByRole('button')).not.toBeDisabled();
        });

        it('should be disabled when disabled prop is true', () => {
            render(<FormatButton {...defaultProps} disabled={true} />);

            expect(screen.getByRole('button')).toBeDisabled();
        });

        it('should not call onClick when disabled', () => {
            const onClick = vi.fn();
            render(<FormatButton {...defaultProps} onClick={onClick} disabled={true} />);

            fireEvent.click(screen.getByRole('button'));

            expect(onClick).not.toHaveBeenCalled();
        });
    });

    describe('click handler', () => {
        it('should call onClick when clicked', () => {
            const onClick = vi.fn();
            render(<FormatButton {...defaultProps} onClick={onClick} />);

            fireEvent.click(screen.getByRole('button'));

            expect(onClick).toHaveBeenCalledTimes(1);
        });
    });

    describe('shortcut', () => {
        it('should render without shortcut', () => {
            render(<FormatButton {...defaultProps} />);

            expect(screen.getByRole('button')).toBeInTheDocument();
        });

        it('should render with shortcut prop', () => {
            render(<FormatButton {...defaultProps} shortcut="Ctrl+B" />);

            // The button renders correctly with shortcut passed to tooltip
            expect(screen.getByRole('button')).toBeInTheDocument();
        });
    });

    describe('custom className', () => {
        it('should apply custom className', () => {
            render(<FormatButton {...defaultProps} className="custom-class" />);

            expect(screen.getByRole('button')).toHaveClass('custom-class');
        });
    });

    describe('styling', () => {
        it('should have base button styles', () => {
            render(<FormatButton {...defaultProps} />);

            const button = screen.getByRole('button');
            expect(button).toHaveClass('inline-flex', 'items-center', 'justify-center');
            expect(button).toHaveClass('h-8', 'w-8', 'rounded-md');
        });
    });
});

describe('FormatButtonGroup', () => {
    it('should render children', () => {
        render(
            <FormatButtonGroup>
                <button type="button">Child 1</button>
                <button type="button">Child 2</button>
            </FormatButtonGroup>
        );

        expect(screen.getByText('Child 1')).toBeInTheDocument();
        expect(screen.getByText('Child 2')).toBeInTheDocument();
    });

    it('should have flex layout', () => {
        const { container } = render(
            <FormatButtonGroup>
                <button type="button">Child</button>
            </FormatButtonGroup>
        );

        expect(container.firstChild).toHaveClass('flex', 'items-center', 'gap-0.5');
    });

    it('should apply custom className', () => {
        const { container } = render(
            <FormatButtonGroup className="custom-group">
                <button type="button">Child</button>
            </FormatButtonGroup>
        );

        expect(container.firstChild).toHaveClass('custom-group');
    });
});

describe('ToolbarSeparator', () => {
    it('should render a separator', () => {
        const { container } = render(<ToolbarSeparator />);

        expect(container.firstChild).toBeInTheDocument();
    });

    it('should have aria-hidden', () => {
        const { container } = render(<ToolbarSeparator />);

        expect(container.firstChild).toHaveAttribute('aria-hidden', 'true');
    });

    it('should have separator styles', () => {
        const { container } = render(<ToolbarSeparator />);

        expect(container.firstChild).toHaveClass('mx-1.5', 'h-6', 'w-px');
    });

    it('should have background color', () => {
        const { container } = render(<ToolbarSeparator />);

        expect(container.firstChild).toHaveClass('bg-slate-400');
    });
});
