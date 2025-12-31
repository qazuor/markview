import { CursorPosition } from '@/components/statusbar/CursorPosition';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

// Mock react-i18next
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key
    })
}));

describe('CursorPosition', () => {
    describe('basic rendering', () => {
        it('should display line and column', () => {
            render(<CursorPosition line={10} column={5} />);

            expect(screen.getByText('Ln 10, Col 5')).toBeInTheDocument();
        });

        it('should display line 1, column 1', () => {
            render(<CursorPosition line={1} column={1} />);

            expect(screen.getByText('Ln 1, Col 1')).toBeInTheDocument();
        });

        it('should handle large line numbers', () => {
            render(<CursorPosition line={1000} column={50} />);

            expect(screen.getByText('Ln 1000, Col 50')).toBeInTheDocument();
        });
    });

    describe('button rendering', () => {
        it('should render as button', () => {
            render(<CursorPosition line={1} column={1} />);

            expect(screen.getByRole('button')).toBeInTheDocument();
        });

        it('should have button type', () => {
            render(<CursorPosition line={1} column={1} />);

            expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
        });

        it('should have title attribute', () => {
            render(<CursorPosition line={1} column={1} />);

            expect(screen.getByRole('button')).toHaveAttribute('title', 'status.goToLine');
        });
    });

    describe('styling', () => {
        it('should apply custom className', () => {
            render(<CursorPosition line={1} column={1} className="custom-class" />);

            expect(screen.getByRole('button')).toHaveClass('custom-class');
        });

        it('should have hover styles', () => {
            render(<CursorPosition line={1} column={1} />);

            expect(screen.getByRole('button')).toHaveClass('hover:text-text-secondary');
        });

        it('should have cursor-pointer', () => {
            render(<CursorPosition line={1} column={1} />);

            expect(screen.getByRole('button')).toHaveClass('cursor-pointer');
        });
    });
});
