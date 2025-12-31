import { SaveStatus } from '@/components/statusbar/SaveStatus';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

describe('SaveStatus', () => {
    describe('saved state', () => {
        it('should display Saved when not modified', () => {
            render(<SaveStatus isModified={false} />);

            expect(screen.getByText('Saved')).toBeInTheDocument();
        });

        it('should have green color when saved', () => {
            const { container } = render(<SaveStatus isModified={false} />);

            const span = container.firstChild;
            expect(span).toHaveClass('text-green-500');
        });

        it('should show check icon when saved', () => {
            const { container } = render(<SaveStatus isModified={false} />);

            const icon = container.querySelector('svg');
            expect(icon).toBeInTheDocument();
            expect(icon).toHaveClass('h-3', 'w-3');
        });
    });

    describe('modified state', () => {
        it('should display Modified when content is modified', () => {
            render(<SaveStatus isModified={true} />);

            expect(screen.getByText('Modified')).toBeInTheDocument();
        });

        it('should have amber color when modified', () => {
            const { container } = render(<SaveStatus isModified={true} />);

            const span = container.firstChild;
            expect(span).toHaveClass('text-amber-500');
        });

        it('should show circle icon when modified', () => {
            const { container } = render(<SaveStatus isModified={true} />);

            const icon = container.querySelector('svg');
            expect(icon).toBeInTheDocument();
            expect(icon).toHaveClass('h-2', 'w-2');
        });
    });

    describe('saving state', () => {
        it('should display Saving... when isSaving is true', () => {
            render(<SaveStatus isModified={false} isSaving={true} />);

            expect(screen.getByText('Saving...')).toBeInTheDocument();
        });

        it('should have muted color when saving', () => {
            const { container } = render(<SaveStatus isModified={false} isSaving={true} />);

            const span = container.firstChild;
            expect(span).toHaveClass('text-text-muted');
        });

        it('should show spinning loader when saving', () => {
            const { container } = render(<SaveStatus isModified={false} isSaving={true} />);

            const icon = container.querySelector('svg');
            expect(icon).toBeInTheDocument();
            expect(icon).toHaveClass('animate-spin');
        });

        it('should prioritize saving over modified', () => {
            render(<SaveStatus isModified={true} isSaving={true} />);

            expect(screen.getByText('Saving...')).toBeInTheDocument();
            expect(screen.queryByText('Modified')).not.toBeInTheDocument();
        });
    });

    describe('styling', () => {
        it('should apply custom className when saved', () => {
            const { container } = render(<SaveStatus isModified={false} className="custom-class" />);

            const span = container.firstChild;
            expect(span).toHaveClass('custom-class');
        });

        it('should apply custom className when modified', () => {
            const { container } = render(<SaveStatus isModified={true} className="custom-class" />);

            const span = container.firstChild;
            expect(span).toHaveClass('custom-class');
        });

        it('should apply custom className when saving', () => {
            const { container } = render(<SaveStatus isModified={false} isSaving={true} className="custom-class" />);

            const span = container.firstChild;
            expect(span).toHaveClass('custom-class');
        });

        it('should have flex layout', () => {
            const { container } = render(<SaveStatus isModified={false} />);

            const span = container.firstChild;
            expect(span).toHaveClass('flex', 'items-center', 'gap-1');
        });
    });

    describe('default props', () => {
        it('should default isSaving to false', () => {
            render(<SaveStatus isModified={false} />);

            expect(screen.getByText('Saved')).toBeInTheDocument();
            expect(screen.queryByText('Saving...')).not.toBeInTheDocument();
        });
    });
});
