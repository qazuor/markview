import { DropOverlay } from '@/components/ui/DropOverlay';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

// Mock react-i18next
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key
    })
}));

describe('DropOverlay', () => {
    describe('visibility', () => {
        it('should render when isVisible is true', () => {
            render(<DropOverlay isVisible={true} />);

            expect(screen.getByText('common.import')).toBeInTheDocument();
        });

        it('should not render when isVisible is false', () => {
            render(<DropOverlay isVisible={false} />);

            expect(screen.queryByText('common.import')).not.toBeInTheDocument();
        });
    });

    describe('content', () => {
        it('should show upload icon area', () => {
            const { container } = render(<DropOverlay isVisible={true} />);

            // Check for the upload icon container
            const iconContainer = container.querySelector('.rounded-full');
            expect(iconContainer).toBeInTheDocument();
        });

        it('should show drop instructions', () => {
            render(<DropOverlay isVisible={true} />);

            expect(screen.getByText('Drop markdown files here')).toBeInTheDocument();
        });

        it('should show translated import text', () => {
            render(<DropOverlay isVisible={true} />);

            expect(screen.getByText('common.import')).toBeInTheDocument();
        });
    });

    describe('styling', () => {
        it('should have fixed positioning', () => {
            const { container } = render(<DropOverlay isVisible={true} />);

            const overlay = container.firstChild;
            expect(overlay).toHaveClass('fixed', 'inset-0');
        });

        it('should have high z-index', () => {
            const { container } = render(<DropOverlay isVisible={true} />);

            const overlay = container.firstChild;
            expect(overlay).toHaveClass('z-[100]');
        });

        it('should have pointer-events-none to allow drop through', () => {
            const { container } = render(<DropOverlay isVisible={true} />);

            const overlay = container.firstChild;
            expect(overlay).toHaveClass('pointer-events-none');
        });

        it('should have dashed border on inner container', () => {
            const { container } = render(<DropOverlay isVisible={true} />);

            const innerContainer = container.querySelector('.border-dashed');
            expect(innerContainer).toBeInTheDocument();
        });
    });
});
