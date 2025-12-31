import { PreviewLoading, PreviewSpinner } from '@/components/preview/PreviewLoading';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

// Mock react-i18next
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key
    })
}));

describe('PreviewLoading', () => {
    describe('rendering', () => {
        it('should render loading text', () => {
            render(<PreviewLoading />);

            expect(screen.getByText('preview.loading')).toBeInTheDocument();
        });

        it('should render spinner', () => {
            const { container } = render(<PreviewLoading />);

            const spinner = container.querySelector('.animate-spin');
            expect(spinner).toBeInTheDocument();
        });
    });

    describe('spinner styling', () => {
        it('should have correct size', () => {
            const { container } = render(<PreviewLoading />);

            const spinner = container.querySelector('.animate-spin');
            expect(spinner).toHaveClass('h-10', 'w-10');
        });

        it('should be rounded', () => {
            const { container } = render(<PreviewLoading />);

            const spinner = container.querySelector('.animate-spin');
            expect(spinner).toHaveClass('rounded-full');
        });

        it('should have border styles', () => {
            const { container } = render(<PreviewLoading />);

            const spinner = container.querySelector('.animate-spin');
            expect(spinner).toHaveClass('border-4');
        });
    });

    describe('layout', () => {
        it('should be centered', () => {
            const { container } = render(<PreviewLoading />);

            const wrapper = container.firstChild;
            expect(wrapper).toHaveClass('flex', 'items-center', 'justify-center');
        });

        it('should take full height', () => {
            const { container } = render(<PreviewLoading />);

            const wrapper = container.firstChild;
            expect(wrapper).toHaveClass('h-full');
        });

        it('should have cursor-wait', () => {
            const { container } = render(<PreviewLoading />);

            const wrapper = container.firstChild;
            expect(wrapper).toHaveClass('cursor-wait');
        });
    });

    describe('custom className', () => {
        it('should apply custom className', () => {
            const { container } = render(<PreviewLoading className="custom-class" />);

            const wrapper = container.firstChild;
            expect(wrapper).toHaveClass('custom-class');
        });
    });
});

describe('PreviewSpinner', () => {
    describe('rendering', () => {
        it('should render spinner', () => {
            const { container } = render(<PreviewSpinner />);

            const spinner = container.querySelector('.animate-spin');
            expect(spinner).toBeInTheDocument();
        });
    });

    describe('spinner styling', () => {
        it('should have correct size', () => {
            const { container } = render(<PreviewSpinner />);

            const spinner = container.querySelector('.animate-spin');
            expect(spinner).toHaveClass('h-8', 'w-8');
        });

        it('should be rounded', () => {
            const { container } = render(<PreviewSpinner />);

            const spinner = container.querySelector('.animate-spin');
            expect(spinner).toHaveClass('rounded-full');
        });

        it('should have border styles', () => {
            const { container } = render(<PreviewSpinner />);

            const spinner = container.querySelector('.animate-spin');
            expect(spinner).toHaveClass('border-4');
        });
    });

    describe('layout', () => {
        it('should be centered', () => {
            const { container } = render(<PreviewSpinner />);

            const wrapper = container.firstChild;
            expect(wrapper).toHaveClass('flex', 'items-center', 'justify-center');
        });

        it('should have padding', () => {
            const { container } = render(<PreviewSpinner />);

            const wrapper = container.firstChild;
            expect(wrapper).toHaveClass('p-6');
        });
    });

    describe('custom className', () => {
        it('should apply custom className', () => {
            const { container } = render(<PreviewSpinner className="custom-class" />);

            const wrapper = container.firstChild;
            expect(wrapper).toHaveClass('custom-class');
        });
    });
});
