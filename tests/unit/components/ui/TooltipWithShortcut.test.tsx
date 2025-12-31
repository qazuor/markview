import { TooltipWithShortcut } from '@/components/ui/Tooltip';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

describe('TooltipWithShortcut', () => {
    describe('rendering', () => {
        it('should render label', () => {
            render(<TooltipWithShortcut label="Bold" />);

            expect(screen.getByText('Bold')).toBeInTheDocument();
        });

        it('should render label and shortcut', () => {
            render(<TooltipWithShortcut label="Bold" shortcut="Ctrl+B" />);

            expect(screen.getByText('Bold')).toBeInTheDocument();
            expect(screen.getByText('Ctrl+B')).toBeInTheDocument();
        });

        it('should not render shortcut when not provided', () => {
            render(<TooltipWithShortcut label="Bold" />);

            expect(screen.queryByRole('kbd')).not.toBeInTheDocument();
        });
    });

    describe('structure', () => {
        it('should wrap content in a span with flex layout', () => {
            const { container } = render(<TooltipWithShortcut label="Bold" shortcut="Ctrl+B" />);

            const wrapper = container.firstChild;
            expect(wrapper).toHaveClass('flex', 'items-center', 'gap-2');
        });

        it('should render shortcut in kbd element', () => {
            render(<TooltipWithShortcut label="Bold" shortcut="Ctrl+B" />);

            const kbd = screen.getByText('Ctrl+B');
            expect(kbd.tagName).toBe('KBD');
        });
    });

    describe('styling', () => {
        it('should have styled kbd element', () => {
            render(<TooltipWithShortcut label="Bold" shortcut="Ctrl+B" />);

            const kbd = screen.getByText('Ctrl+B');
            expect(kbd).toHaveClass('px-1.5', 'py-0.5', 'text-[10px]', 'bg-white/20', 'rounded', 'font-mono');
        });
    });

    describe('different shortcuts', () => {
        it('should render Ctrl+I shortcut', () => {
            render(<TooltipWithShortcut label="Italic" shortcut="Ctrl+I" />);

            expect(screen.getByText('Italic')).toBeInTheDocument();
            expect(screen.getByText('Ctrl+I')).toBeInTheDocument();
        });

        it('should render Ctrl+Shift+S shortcut', () => {
            render(<TooltipWithShortcut label="Strikethrough" shortcut="Ctrl+Shift+S" />);

            expect(screen.getByText('Strikethrough')).toBeInTheDocument();
            expect(screen.getByText('Ctrl+Shift+S')).toBeInTheDocument();
        });

        it('should render F11 shortcut', () => {
            render(<TooltipWithShortcut label="Zen Mode" shortcut="F11" />);

            expect(screen.getByText('Zen Mode')).toBeInTheDocument();
            expect(screen.getByText('F11')).toBeInTheDocument();
        });
    });

    describe('edge cases', () => {
        it('should handle empty shortcut', () => {
            render(<TooltipWithShortcut label="Bold" shortcut="" />);

            expect(screen.getByText('Bold')).toBeInTheDocument();
            // Empty string is falsy, so no kbd should be rendered
            expect(screen.queryByRole('kbd')).not.toBeInTheDocument();
        });

        it('should handle long label', () => {
            render(<TooltipWithShortcut label="This is a very long label for testing" shortcut="Ctrl+X" />);

            expect(screen.getByText('This is a very long label for testing')).toBeInTheDocument();
            expect(screen.getByText('Ctrl+X')).toBeInTheDocument();
        });
    });
});
