import { CloseConfirmModal } from '@/components/tabs/CloseConfirmModal';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

// Mock react-i18next
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, params?: { fileName?: string }) => {
            if (params?.fileName) return `${key}:${params.fileName}`;
            return key;
        }
    })
}));

describe('CloseConfirmModal', () => {
    const defaultProps = {
        isOpen: true,
        fileName: 'test-document.md',
        onAction: vi.fn()
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('rendering', () => {
        it('should render when isOpen is true', async () => {
            render(<CloseConfirmModal {...defaultProps} />);

            await waitFor(() => {
                expect(screen.getByText('confirm.unsavedChangesTitle')).toBeInTheDocument();
            });
        });

        it('should not render when isOpen is false', () => {
            render(<CloseConfirmModal {...defaultProps} isOpen={false} />);

            expect(screen.queryByText('confirm.unsavedChangesTitle')).not.toBeInTheDocument();
        });

        it('should display file name in description', async () => {
            render(<CloseConfirmModal {...defaultProps} />);

            await waitFor(() => {
                expect(screen.getByText('confirm.unsavedChangesDescription:test-document.md')).toBeInTheDocument();
            });
        });

        it('should show warning message', async () => {
            render(<CloseConfirmModal {...defaultProps} />);

            await waitFor(() => {
                expect(screen.getByText('confirm.unsavedChangesWarning')).toBeInTheDocument();
            });
        });
    });

    describe('buttons', () => {
        it('should render cancel button', async () => {
            render(<CloseConfirmModal {...defaultProps} />);

            await waitFor(() => {
                expect(screen.getByText('common.cancel')).toBeInTheDocument();
            });
        });

        it('should render dont save button', async () => {
            render(<CloseConfirmModal {...defaultProps} />);

            await waitFor(() => {
                expect(screen.getByText('confirm.dontSave')).toBeInTheDocument();
            });
        });

        it('should render save button', async () => {
            render(<CloseConfirmModal {...defaultProps} />);

            await waitFor(() => {
                expect(screen.getByText('common.save')).toBeInTheDocument();
            });
        });
    });

    describe('actions', () => {
        it('should call onAction with cancel when cancel button is clicked', async () => {
            const onAction = vi.fn();
            render(<CloseConfirmModal {...defaultProps} onAction={onAction} />);

            await waitFor(() => {
                fireEvent.click(screen.getByText('common.cancel'));
            });

            expect(onAction).toHaveBeenCalledWith('cancel');
        });

        it('should call onAction with discard when dont save button is clicked', async () => {
            const onAction = vi.fn();
            render(<CloseConfirmModal {...defaultProps} onAction={onAction} />);

            await waitFor(() => {
                fireEvent.click(screen.getByText('confirm.dontSave'));
            });

            expect(onAction).toHaveBeenCalledWith('discard');
        });

        it('should call onAction with save when save button is clicked', async () => {
            const onAction = vi.fn();
            render(<CloseConfirmModal {...defaultProps} onAction={onAction} />);

            await waitFor(() => {
                fireEvent.click(screen.getByText('common.save'));
            });

            expect(onAction).toHaveBeenCalledWith('save');
        });

        it('should call onAction with cancel when modal is closed', async () => {
            const onAction = vi.fn();
            render(<CloseConfirmModal {...defaultProps} onAction={onAction} />);

            await waitFor(() => {
                const closeButton = screen.getByRole('button', { name: 'common.close' });
                fireEvent.click(closeButton);
            });

            expect(onAction).toHaveBeenCalledWith('cancel');
        });
    });

    describe('button variants', () => {
        it('should have ghost variant on cancel button', async () => {
            render(<CloseConfirmModal {...defaultProps} />);

            await waitFor(() => {
                const cancelButton = screen.getByText('common.cancel');
                expect(cancelButton).toHaveClass('bg-transparent');
            });
        });

        it('should have primary variant on save button', async () => {
            render(<CloseConfirmModal {...defaultProps} />);

            await waitFor(() => {
                const saveButton = screen.getByText('common.save');
                expect(saveButton).toHaveClass('bg-primary-500');
            });
        });
    });
});
