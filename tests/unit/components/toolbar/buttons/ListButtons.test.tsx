import { BulletListButton, NumberedListButton, TaskListButton } from '@/components/toolbar/buttons/ListButtons';
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

describe('BulletListButton', () => {
    const mockOnList = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should render with Bullet List label', () => {
        render(<BulletListButton onList={mockOnList} />);

        expect(screen.getByText('Bullet List')).toBeInTheDocument();
    });

    it('should have correct aria-label', () => {
        render(<BulletListButton onList={mockOnList} />);

        expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Bullet List');
    });

    it('should have Ctrl+Shift+8 shortcut', () => {
        render(<BulletListButton onList={mockOnList} />);

        expect(screen.getByRole('button')).toHaveAttribute('title', 'Ctrl+Shift+8');
    });

    it('should call onList with "bulletList" when clicked', () => {
        render(<BulletListButton onList={mockOnList} />);

        fireEvent.click(screen.getByRole('button'));

        expect(mockOnList).toHaveBeenCalledWith('bulletList');
    });
});

describe('NumberedListButton', () => {
    const mockOnList = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should render with Numbered List label', () => {
        render(<NumberedListButton onList={mockOnList} />);

        expect(screen.getByText('Numbered List')).toBeInTheDocument();
    });

    it('should have correct aria-label', () => {
        render(<NumberedListButton onList={mockOnList} />);

        expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Numbered List');
    });

    it('should have Ctrl+Shift+7 shortcut', () => {
        render(<NumberedListButton onList={mockOnList} />);

        expect(screen.getByRole('button')).toHaveAttribute('title', 'Ctrl+Shift+7');
    });

    it('should call onList with "numberedList" when clicked', () => {
        render(<NumberedListButton onList={mockOnList} />);

        fireEvent.click(screen.getByRole('button'));

        expect(mockOnList).toHaveBeenCalledWith('numberedList');
    });
});

describe('TaskListButton', () => {
    const mockOnList = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should render with Task List label', () => {
        render(<TaskListButton onList={mockOnList} />);

        expect(screen.getByText('Task List')).toBeInTheDocument();
    });

    it('should have correct aria-label', () => {
        render(<TaskListButton onList={mockOnList} />);

        expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Task List');
    });

    it('should have Ctrl+Shift+9 shortcut', () => {
        render(<TaskListButton onList={mockOnList} />);

        expect(screen.getByRole('button')).toHaveAttribute('title', 'Ctrl+Shift+9');
    });

    it('should call onList with "taskList" when clicked', () => {
        render(<TaskListButton onList={mockOnList} />);

        fireEvent.click(screen.getByRole('button'));

        expect(mockOnList).toHaveBeenCalledWith('taskList');
    });
});
