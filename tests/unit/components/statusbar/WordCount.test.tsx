import { WordCount } from '@/components/statusbar/WordCount';
import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

// Mock react-i18next
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key
    })
}));

describe('WordCount', () => {
    // Helper to get the word count span text
    const getWordCountText = (container: HTMLElement) => {
        const span = container.querySelector('span');
        return span?.textContent;
    };

    describe('basic rendering', () => {
        it('should display word count', () => {
            const { container } = render(<WordCount content="Hello world" />);

            expect(getWordCountText(container)).toBe('2 words');
        });

        it('should display 0 words for empty content', () => {
            const { container } = render(<WordCount content="" />);

            expect(getWordCountText(container)).toBe('0 words');
        });

        it('should display 0 words for whitespace only', () => {
            const { container } = render(<WordCount content="   " />);

            expect(getWordCountText(container)).toBe('0 words');
        });
    });

    describe('word counting', () => {
        it('should count single word correctly', () => {
            const { container } = render(<WordCount content="Hello" />);

            expect(getWordCountText(container)).toBe('1 words');
        });

        it('should count multiple words correctly', () => {
            const { container } = render(<WordCount content="The quick brown fox jumps over the lazy dog" />);

            expect(getWordCountText(container)).toBe('9 words');
        });

        it('should handle multiple spaces between words', () => {
            const { container } = render(<WordCount content="Hello    world" />);

            expect(getWordCountText(container)).toBe('2 words');
        });

        it('should handle newlines', () => {
            const { container } = render(<WordCount content={'Hello\nworld\n'} />);

            expect(getWordCountText(container)).toBe('2 words');
        });

        it('should handle tabs as whitespace', () => {
            const { container } = render(<WordCount content={'Hello\tworld'} />);

            expect(getWordCountText(container)).toBe('2 words');
        });
    });

    describe('formatting', () => {
        it('should format large numbers with locale separator', () => {
            const content = Array(1500).fill('word').join(' ');
            const { container } = render(<WordCount content={content} />);

            expect(getWordCountText(container)).toBe('1,500 words');
        });
    });

    describe('styling', () => {
        it('should apply custom className', () => {
            const { container } = render(<WordCount content="Hello" className="custom-class" />);

            const span = container.querySelector('span');
            expect(span).toHaveClass('custom-class');
        });

        it('should have cursor-help class', () => {
            const { container } = render(<WordCount content="Hello" />);

            const span = container.querySelector('span');
            expect(span).toHaveClass('cursor-help');
        });
    });
});
