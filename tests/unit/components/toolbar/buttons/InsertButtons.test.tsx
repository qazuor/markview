import {
    CodeBlockButton,
    HorizontalRuleButton,
    ImageButton,
    InlineCodeButton,
    LinkButton,
    QuoteButton
} from '@/components/toolbar/buttons/InsertButtons';
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
        <button type="button" onClick={onClick} aria-label={label} title={shortcut || undefined}>
            {label}
        </button>
    )
}));

describe('LinkButton', () => {
    const mockOnInsert = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should render with Insert Link label', () => {
        render(<LinkButton onInsert={mockOnInsert} />);

        expect(screen.getByText('Insert Link')).toBeInTheDocument();
    });

    it('should have correct aria-label', () => {
        render(<LinkButton onInsert={mockOnInsert} />);

        expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Insert Link');
    });

    it('should have Ctrl+K shortcut', () => {
        render(<LinkButton onInsert={mockOnInsert} />);

        expect(screen.getByRole('button')).toHaveAttribute('title', 'Ctrl+K');
    });

    it('should call onInsert with "link" when clicked', () => {
        render(<LinkButton onInsert={mockOnInsert} />);

        fireEvent.click(screen.getByRole('button'));

        expect(mockOnInsert).toHaveBeenCalledWith('link');
    });
});

describe('ImageButton', () => {
    const mockOnInsert = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should render with Insert Image label', () => {
        render(<ImageButton onInsert={mockOnInsert} />);

        expect(screen.getByText('Insert Image')).toBeInTheDocument();
    });

    it('should have correct aria-label', () => {
        render(<ImageButton onInsert={mockOnInsert} />);

        expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Insert Image');
    });

    it('should have Ctrl+Shift+I shortcut', () => {
        render(<ImageButton onInsert={mockOnInsert} />);

        expect(screen.getByRole('button')).toHaveAttribute('title', 'Ctrl+Shift+I');
    });

    it('should call onInsert with "image" when clicked', () => {
        render(<ImageButton onInsert={mockOnInsert} />);

        fireEvent.click(screen.getByRole('button'));

        expect(mockOnInsert).toHaveBeenCalledWith('image');
    });
});

describe('InlineCodeButton', () => {
    const mockOnInsert = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should render with Inline Code label', () => {
        render(<InlineCodeButton onInsert={mockOnInsert} />);

        expect(screen.getByText('Inline Code')).toBeInTheDocument();
    });

    it('should have correct aria-label', () => {
        render(<InlineCodeButton onInsert={mockOnInsert} />);

        expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Inline Code');
    });

    it('should have Ctrl+` shortcut', () => {
        render(<InlineCodeButton onInsert={mockOnInsert} />);

        expect(screen.getByRole('button')).toHaveAttribute('title', 'Ctrl+`');
    });

    it('should call onInsert with "inlineCode" when clicked', () => {
        render(<InlineCodeButton onInsert={mockOnInsert} />);

        fireEvent.click(screen.getByRole('button'));

        expect(mockOnInsert).toHaveBeenCalledWith('inlineCode');
    });
});

describe('CodeBlockButton', () => {
    const mockOnInsert = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should render with Code Block label', () => {
        render(<CodeBlockButton onInsert={mockOnInsert} />);

        expect(screen.getByText('Code Block')).toBeInTheDocument();
    });

    it('should have correct aria-label', () => {
        render(<CodeBlockButton onInsert={mockOnInsert} />);

        expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Code Block');
    });

    it('should have Ctrl+Shift+` shortcut', () => {
        render(<CodeBlockButton onInsert={mockOnInsert} />);

        expect(screen.getByRole('button')).toHaveAttribute('title', 'Ctrl+Shift+`');
    });

    it('should call onInsert with "codeBlock" when clicked', () => {
        render(<CodeBlockButton onInsert={mockOnInsert} />);

        fireEvent.click(screen.getByRole('button'));

        expect(mockOnInsert).toHaveBeenCalledWith('codeBlock');
    });
});

describe('QuoteButton', () => {
    const mockOnInsert = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should render with Blockquote label', () => {
        render(<QuoteButton onInsert={mockOnInsert} />);

        expect(screen.getByText('Blockquote')).toBeInTheDocument();
    });

    it('should have correct aria-label', () => {
        render(<QuoteButton onInsert={mockOnInsert} />);

        expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Blockquote');
    });

    it('should have Ctrl+Shift+Q shortcut', () => {
        render(<QuoteButton onInsert={mockOnInsert} />);

        expect(screen.getByRole('button')).toHaveAttribute('title', 'Ctrl+Shift+Q');
    });

    it('should call onInsert with "blockquote" when clicked', () => {
        render(<QuoteButton onInsert={mockOnInsert} />);

        fireEvent.click(screen.getByRole('button'));

        expect(mockOnInsert).toHaveBeenCalledWith('blockquote');
    });
});

describe('HorizontalRuleButton', () => {
    const mockOnInsert = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should render with Horizontal Rule label', () => {
        render(<HorizontalRuleButton onInsert={mockOnInsert} />);

        expect(screen.getByText('Horizontal Rule')).toBeInTheDocument();
    });

    it('should have correct aria-label', () => {
        render(<HorizontalRuleButton onInsert={mockOnInsert} />);

        expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Horizontal Rule');
    });

    it('should not have a shortcut', () => {
        render(<HorizontalRuleButton onInsert={mockOnInsert} />);

        expect(screen.getByRole('button')).not.toHaveAttribute('title');
    });

    it('should call onInsert with "hr" when clicked', () => {
        render(<HorizontalRuleButton onInsert={mockOnInsert} />);

        fireEvent.click(screen.getByRole('button'));

        expect(mockOnInsert).toHaveBeenCalledWith('hr');
    });
});
