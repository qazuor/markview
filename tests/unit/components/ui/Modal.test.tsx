import { Modal, ModalFooter } from '@/components/ui/Modal';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

// Mock react-i18next
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key
    })
}));

describe('Modal', () => {
    const defaultProps = {
        isOpen: true,
        onClose: vi.fn()
    };

    describe('visibility', () => {
        it('should render children when open', () => {
            render(
                <Modal {...defaultProps}>
                    <div>Modal content</div>
                </Modal>
            );

            expect(screen.getByText('Modal content')).toBeInTheDocument();
        });

        it('should not render when closed', () => {
            render(
                <Modal {...defaultProps} isOpen={false}>
                    <div>Modal content</div>
                </Modal>
            );

            expect(screen.queryByText('Modal content')).not.toBeInTheDocument();
        });
    });

    describe('title and description', () => {
        it('should render title when provided', () => {
            render(
                <Modal {...defaultProps} title="Test Title">
                    <div>Content</div>
                </Modal>
            );

            expect(screen.getByText('Test Title')).toBeInTheDocument();
        });

        it('should not render title when not provided', () => {
            render(
                <Modal {...defaultProps}>
                    <div>Content</div>
                </Modal>
            );

            expect(screen.queryByRole('heading')).not.toBeInTheDocument();
        });

        it('should render description when provided', () => {
            render(
                <Modal {...defaultProps} title="Title" description="Test description">
                    <div>Content</div>
                </Modal>
            );

            expect(screen.getByText('Test description')).toBeInTheDocument();
        });
    });

    describe('close button', () => {
        it('should render close button', () => {
            render(
                <Modal {...defaultProps}>
                    <div>Content</div>
                </Modal>
            );

            expect(screen.getByRole('button', { name: 'common.close' })).toBeInTheDocument();
        });

        it('should call onClose when close button is clicked', () => {
            const onClose = vi.fn();
            render(
                <Modal {...defaultProps} onClose={onClose}>
                    <div>Content</div>
                </Modal>
            );

            fireEvent.click(screen.getByRole('button', { name: 'common.close' }));

            expect(onClose).toHaveBeenCalled();
        });
    });

    describe('sizes', () => {
        it('should apply small size', () => {
            render(
                <Modal {...defaultProps} size="sm" title="Test">
                    <div>Content</div>
                </Modal>
            );

            // Modal is rendered in a portal, so we need to query the document
            const content = document.querySelector('[role="dialog"]');
            expect(content).toHaveClass('max-w-sm');
        });

        it('should apply medium size by default', () => {
            render(
                <Modal {...defaultProps} title="Test">
                    <div>Content</div>
                </Modal>
            );

            const content = document.querySelector('[role="dialog"]');
            expect(content).toHaveClass('max-w-md');
        });

        it('should apply large size', () => {
            render(
                <Modal {...defaultProps} size="lg" title="Test">
                    <div>Content</div>
                </Modal>
            );

            const content = document.querySelector('[role="dialog"]');
            expect(content).toHaveClass('max-w-2xl');
        });

        it('should apply extra large size', () => {
            render(
                <Modal {...defaultProps} size="xl" title="Test">
                    <div>Content</div>
                </Modal>
            );

            const content = document.querySelector('[role="dialog"]');
            expect(content).toHaveClass('max-w-4xl');
        });
    });

    describe('custom className', () => {
        it('should merge custom className', () => {
            render(
                <Modal {...defaultProps} className="custom-class" title="Test">
                    <div>Content</div>
                </Modal>
            );

            const content = document.querySelector('[role="dialog"]');
            expect(content).toHaveClass('custom-class');
        });
    });
});

describe('ModalFooter', () => {
    it('should render children', () => {
        render(
            <ModalFooter>
                <button type="button">Cancel</button>
                <button type="button">Save</button>
            </ModalFooter>
        );

        expect(screen.getByText('Cancel')).toBeInTheDocument();
        expect(screen.getByText('Save')).toBeInTheDocument();
    });

    it('should have flex layout', () => {
        const { container } = render(
            <ModalFooter>
                <button type="button">Button</button>
            </ModalFooter>
        );

        const footer = container.firstChild;
        expect(footer).toHaveClass('flex');
    });

    it('should align items to end', () => {
        const { container } = render(
            <ModalFooter>
                <button type="button">Button</button>
            </ModalFooter>
        );

        const footer = container.firstChild;
        expect(footer).toHaveClass('justify-end');
    });

    it('should merge custom className', () => {
        const { container } = render(
            <ModalFooter className="custom-footer">
                <button type="button">Button</button>
            </ModalFooter>
        );

        const footer = container.firstChild;
        expect(footer).toHaveClass('custom-footer');
    });
});
