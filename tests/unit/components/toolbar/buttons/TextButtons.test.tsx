import { BoldButton, ItalicButton, StrikethroughButton, UnderlineButton } from '@/components/toolbar/buttons/TextButtons';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock react-i18next
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key
    })
}));

// Mock FormatButton to simplify testing
vi.mock('@/components/toolbar/FormatButton', () => ({
    FormatButton: ({
        label,
        shortcut,
        onClick
    }: {
        label: string;
        shortcut?: string;
        onClick: () => void;
    }) => (
        <button type="button" onClick={onClick} aria-label={label} title={shortcut}>
            {label}
        </button>
    )
}));

describe('BoldButton', () => {
    const mockOnFormat = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should render with Bold label', () => {
        render(<BoldButton onFormat={mockOnFormat} />);

        expect(screen.getByText('Bold')).toBeInTheDocument();
    });

    it('should have correct aria-label', () => {
        render(<BoldButton onFormat={mockOnFormat} />);

        expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Bold');
    });

    it('should have Ctrl+B shortcut', () => {
        render(<BoldButton onFormat={mockOnFormat} />);

        expect(screen.getByRole('button')).toHaveAttribute('title', 'Ctrl+B');
    });

    it('should call onFormat with "bold" when clicked', () => {
        render(<BoldButton onFormat={mockOnFormat} />);

        fireEvent.click(screen.getByRole('button'));

        expect(mockOnFormat).toHaveBeenCalledWith('bold');
    });
});

describe('ItalicButton', () => {
    const mockOnFormat = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should render with Italic label', () => {
        render(<ItalicButton onFormat={mockOnFormat} />);

        expect(screen.getByText('Italic')).toBeInTheDocument();
    });

    it('should have correct aria-label', () => {
        render(<ItalicButton onFormat={mockOnFormat} />);

        expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Italic');
    });

    it('should have Ctrl+I shortcut', () => {
        render(<ItalicButton onFormat={mockOnFormat} />);

        expect(screen.getByRole('button')).toHaveAttribute('title', 'Ctrl+I');
    });

    it('should call onFormat with "italic" when clicked', () => {
        render(<ItalicButton onFormat={mockOnFormat} />);

        fireEvent.click(screen.getByRole('button'));

        expect(mockOnFormat).toHaveBeenCalledWith('italic');
    });
});

describe('StrikethroughButton', () => {
    const mockOnFormat = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should render with Strikethrough label', () => {
        render(<StrikethroughButton onFormat={mockOnFormat} />);

        expect(screen.getByText('Strikethrough')).toBeInTheDocument();
    });

    it('should have correct aria-label', () => {
        render(<StrikethroughButton onFormat={mockOnFormat} />);

        expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Strikethrough');
    });

    it('should have Ctrl+Shift+S shortcut', () => {
        render(<StrikethroughButton onFormat={mockOnFormat} />);

        expect(screen.getByRole('button')).toHaveAttribute('title', 'Ctrl+Shift+S');
    });

    it('should call onFormat with "strikethrough" when clicked', () => {
        render(<StrikethroughButton onFormat={mockOnFormat} />);

        fireEvent.click(screen.getByRole('button'));

        expect(mockOnFormat).toHaveBeenCalledWith('strikethrough');
    });
});

describe('UnderlineButton', () => {
    const mockOnFormat = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should render with Underline label', () => {
        render(<UnderlineButton onFormat={mockOnFormat} />);

        expect(screen.getByText('Underline')).toBeInTheDocument();
    });

    it('should have correct aria-label', () => {
        render(<UnderlineButton onFormat={mockOnFormat} />);

        expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Underline');
    });

    it('should have Ctrl+U shortcut', () => {
        render(<UnderlineButton onFormat={mockOnFormat} />);

        expect(screen.getByRole('button')).toHaveAttribute('title', 'Ctrl+U');
    });

    it('should call onFormat with "underline" when clicked', () => {
        render(<UnderlineButton onFormat={mockOnFormat} />);

        fireEvent.click(screen.getByRole('button'));

        expect(mockOnFormat).toHaveBeenCalledWith('underline');
    });
});
