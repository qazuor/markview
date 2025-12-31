import { Encoding } from '@/components/statusbar/Encoding';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

// Mock react-i18next
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key
    })
}));

describe('Encoding', () => {
    describe('basic rendering', () => {
        it('should display UTF-8 by default', () => {
            render(<Encoding />);

            expect(screen.getByText('UTF-8')).toBeInTheDocument();
        });

        it('should display custom encoding when specified', () => {
            render(<Encoding encoding="ISO-8859-1" />);

            expect(screen.getByText('ISO-8859-1')).toBeInTheDocument();
        });

        it('should display UTF-16 when specified', () => {
            render(<Encoding encoding="UTF-16" />);

            expect(screen.getByText('UTF-16')).toBeInTheDocument();
        });
    });

    describe('button rendering', () => {
        it('should render as button', () => {
            render(<Encoding />);

            expect(screen.getByRole('button')).toBeInTheDocument();
        });

        it('should have button type', () => {
            render(<Encoding />);

            expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
        });

        it('should have title attribute', () => {
            render(<Encoding />);

            expect(screen.getByRole('button')).toHaveAttribute('title', 'status.selectEncoding');
        });
    });

    describe('styling', () => {
        it('should apply custom className', () => {
            render(<Encoding className="custom-class" />);

            expect(screen.getByRole('button')).toHaveClass('custom-class');
        });

        it('should have hover styles', () => {
            render(<Encoding />);

            expect(screen.getByRole('button')).toHaveClass('hover:text-text-secondary');
        });

        it('should have cursor-pointer', () => {
            render(<Encoding />);

            expect(screen.getByRole('button')).toHaveClass('cursor-pointer');
        });

        it('should have transition', () => {
            render(<Encoding />);

            expect(screen.getByRole('button')).toHaveClass('transition-colors');
        });
    });
});
