import { LineEnding } from '@/components/statusbar/LineEnding';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

// Mock react-i18next
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key
    })
}));

describe('LineEnding', () => {
    describe('basic rendering', () => {
        it('should display LF by default', () => {
            render(<LineEnding />);

            expect(screen.getByText('LF')).toBeInTheDocument();
        });

        it('should display CRLF when specified', () => {
            render(<LineEnding type="CRLF" />);

            expect(screen.getByText('CRLF')).toBeInTheDocument();
        });

        it('should display LF when specified', () => {
            render(<LineEnding type="LF" />);

            expect(screen.getByText('LF')).toBeInTheDocument();
        });
    });

    describe('button rendering', () => {
        it('should render as button', () => {
            render(<LineEnding />);

            expect(screen.getByRole('button')).toBeInTheDocument();
        });

        it('should have button type', () => {
            render(<LineEnding />);

            expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
        });

        it('should have title attribute', () => {
            render(<LineEnding />);

            expect(screen.getByRole('button')).toHaveAttribute('title', 'status.selectLineEnding');
        });
    });

    describe('styling', () => {
        it('should apply custom className', () => {
            render(<LineEnding className="custom-class" />);

            expect(screen.getByRole('button')).toHaveClass('custom-class');
        });

        it('should have hover styles', () => {
            render(<LineEnding />);

            expect(screen.getByRole('button')).toHaveClass('hover:text-text-secondary');
        });

        it('should have cursor-pointer', () => {
            render(<LineEnding />);

            expect(screen.getByRole('button')).toHaveClass('cursor-pointer');
        });

        it('should have transition', () => {
            render(<LineEnding />);

            expect(screen.getByRole('button')).toHaveClass('transition-colors');
        });
    });
});
