import { Tooltip, TooltipWithShortcut } from '@/components/ui/Tooltip';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

// Mock react-i18next
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key
    })
}));

describe('Tooltip', () => {
    it('should render children', () => {
        render(
            <Tooltip content="Tooltip content">
                <button type="button">Hover me</button>
            </Tooltip>
        );

        expect(screen.getByText('Hover me')).toBeInTheDocument();
    });

    it('should render trigger as child element', () => {
        render(
            <Tooltip content="Tooltip content">
                <button type="button">Button</button>
            </Tooltip>
        );

        expect(screen.getByRole('button')).toBeInTheDocument();
    });
});

describe('TooltipWithShortcut', () => {
    it('should render label', () => {
        render(<TooltipWithShortcut label="Save" />);

        expect(screen.getByText('Save')).toBeInTheDocument();
    });

    it('should render shortcut when provided', () => {
        render(<TooltipWithShortcut label="Save" shortcut="Ctrl+S" />);

        expect(screen.getByText('Ctrl+S')).toBeInTheDocument();
    });

    it('should not render shortcut when not provided', () => {
        render(<TooltipWithShortcut label="Save" />);

        expect(screen.queryByRole('kbd')).not.toBeInTheDocument();
    });

    it('should render shortcut in kbd element', () => {
        const { container } = render(<TooltipWithShortcut label="Undo" shortcut="Ctrl+Z" />);

        const kbd = container.querySelector('kbd');
        expect(kbd).toBeInTheDocument();
        expect(kbd).toHaveTextContent('Ctrl+Z');
    });

    it('should display label and shortcut together', () => {
        render(<TooltipWithShortcut label="Copy" shortcut="Ctrl+C" />);

        expect(screen.getByText('Copy')).toBeInTheDocument();
        expect(screen.getByText('Ctrl+C')).toBeInTheDocument();
    });
});
