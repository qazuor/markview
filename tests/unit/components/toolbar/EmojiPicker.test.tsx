import { EmojiPicker } from '@/components/toolbar/EmojiPicker';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock react-i18next
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key
    })
}));

// Mock settingsStore
vi.mock('@/stores/settingsStore', () => ({
    useSettingsStore: (selector: (state: { theme: string }) => unknown) => selector({ theme: 'light' })
}));

// Mock emoji-mart
vi.mock('@emoji-mart/data', () => ({
    default: {}
}));

vi.mock('@emoji-mart/react', () => ({
    default: ({ onEmojiSelect }: { onEmojiSelect: (emoji: { native: string }) => void }) => (
        <div data-testid="emoji-picker">
            <button type="button" data-testid="emoji-button" onClick={() => onEmojiSelect({ native: '😀' })}>
                Select Emoji
            </button>
        </div>
    )
}));

describe('EmojiPicker', () => {
    const mockOnEmojiSelect = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('rendering', () => {
        it('should render toggle button', () => {
            render(<EmojiPicker onEmojiSelect={mockOnEmojiSelect} />);

            expect(screen.getByRole('button', { name: 'toolbar.emoji' })).toBeInTheDocument();
        });

        it('should have correct aria-label', () => {
            render(<EmojiPicker onEmojiSelect={mockOnEmojiSelect} />);

            expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'toolbar.emoji');
        });

        it('should have correct title', () => {
            render(<EmojiPicker onEmojiSelect={mockOnEmojiSelect} />);

            expect(screen.getByRole('button')).toHaveAttribute('title', 'toolbar.emoji');
        });

        it('should not show picker initially', () => {
            render(<EmojiPicker onEmojiSelect={mockOnEmojiSelect} />);

            expect(screen.queryByTestId('emoji-picker')).not.toBeInTheDocument();
        });
    });

    describe('toggle behavior', () => {
        it('should show picker when button is clicked', () => {
            render(<EmojiPicker onEmojiSelect={mockOnEmojiSelect} />);

            fireEvent.click(screen.getByRole('button', { name: 'toolbar.emoji' }));

            expect(screen.getByTestId('emoji-picker')).toBeInTheDocument();
        });

        it('should hide picker when button is clicked again', () => {
            render(<EmojiPicker onEmojiSelect={mockOnEmojiSelect} />);

            // Open
            fireEvent.click(screen.getByRole('button', { name: 'toolbar.emoji' }));
            expect(screen.getByTestId('emoji-picker')).toBeInTheDocument();

            // Close
            fireEvent.click(screen.getByRole('button', { name: 'toolbar.emoji' }));
            expect(screen.queryByTestId('emoji-picker')).not.toBeInTheDocument();
        });
    });

    describe('emoji selection', () => {
        it('should call onEmojiSelect with emoji when emoji is selected', () => {
            render(<EmojiPicker onEmojiSelect={mockOnEmojiSelect} />);

            fireEvent.click(screen.getByRole('button', { name: 'toolbar.emoji' }));
            fireEvent.click(screen.getByTestId('emoji-button'));

            expect(mockOnEmojiSelect).toHaveBeenCalledWith('😀');
        });

        it('should close picker after emoji selection', () => {
            render(<EmojiPicker onEmojiSelect={mockOnEmojiSelect} />);

            fireEvent.click(screen.getByRole('button', { name: 'toolbar.emoji' }));
            expect(screen.getByTestId('emoji-picker')).toBeInTheDocument();

            fireEvent.click(screen.getByTestId('emoji-button'));
            expect(screen.queryByTestId('emoji-picker')).not.toBeInTheDocument();
        });
    });

    describe('backdrop', () => {
        it('should close picker when backdrop is clicked', () => {
            render(<EmojiPicker onEmojiSelect={mockOnEmojiSelect} />);

            fireEvent.click(screen.getByRole('button', { name: 'toolbar.emoji' }));
            expect(screen.getByTestId('emoji-picker')).toBeInTheDocument();

            // Click the backdrop (the div with fixed inset-0)
            const backdrop = document.querySelector('.fixed.inset-0');
            if (backdrop) {
                fireEvent.click(backdrop);
            }

            expect(screen.queryByTestId('emoji-picker')).not.toBeInTheDocument();
        });
    });

    describe('styling', () => {
        it('should apply custom className', () => {
            const { container } = render(<EmojiPicker onEmojiSelect={mockOnEmojiSelect} className="custom-class" />);

            expect(container.firstChild).toHaveClass('custom-class');
        });

        it('should apply active styles when picker is open', () => {
            render(<EmojiPicker onEmojiSelect={mockOnEmojiSelect} />);

            const button = screen.getByRole('button', { name: 'toolbar.emoji' });
            fireEvent.click(button);

            expect(button).toHaveClass('bg-bg-hover');
        });
    });
});
