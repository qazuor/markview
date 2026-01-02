import { VersionHistoryModal } from '@/components/modals/VersionHistoryModal';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock react-i18next
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, params?: Record<string, unknown>) => {
            if (params?.documentName) return `History: ${params.documentName}`;
            if (params?.date) return `Restore to ${params.date}?`;
            if (params?.count !== undefined) return `${params.count} lines`;
            return key;
        }
    })
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
    Clock: () => <span data-testid="icon-clock" />,
    Pencil: () => <span data-testid="icon-pencil" />,
    RotateCcw: () => <span data-testid="icon-restore" />,
    Trash2: () => <span data-testid="icon-trash" />
}));

// Mock Modal component
vi.mock('@/components/ui', () => ({
    Modal: ({ children, isOpen, title }: { children: React.ReactNode; isOpen: boolean; title: string }) =>
        isOpen ? (
            <dialog data-testid="modal" open>
                <h2>{title}</h2>
                {children}
            </dialog>
        ) : null
}));

// Mock version service
const mockVersions = [
    {
        id: 'v1',
        documentId: 'doc-1',
        content: '# Version 1 content',
        createdAt: '2024-01-15T10:00:00Z',
        size: 1024,
        label: 'Initial version'
    },
    {
        id: 'v2',
        documentId: 'doc-1',
        content: '# Version 2 content\nMore text',
        createdAt: '2024-01-16T14:30:00Z',
        size: 2048,
        label: null
    }
];

const mockGetVersions = vi.fn();
const mockDeleteVersion = vi.fn();
const mockUpdateVersionLabel = vi.fn();

vi.mock('@/services/storage/versions', () => ({
    getVersions: (...args: unknown[]) => mockGetVersions(...args),
    deleteVersion: (...args: unknown[]) => mockDeleteVersion(...args),
    updateVersionLabel: (...args: unknown[]) => mockUpdateVersionLabel(...args)
}));

// Mock cn utility
vi.mock('@/utils/cn', () => ({
    cn: (...args: (string | boolean | undefined)[]) => args.filter(Boolean).join(' ')
}));

describe('VersionHistoryModal', () => {
    const defaultProps = {
        isOpen: true,
        documentId: 'doc-1',
        documentName: 'Test Document',
        onClose: vi.fn(),
        onRestore: vi.fn(),
        onCompare: vi.fn()
    };

    beforeEach(() => {
        vi.clearAllMocks();
        mockGetVersions.mockReturnValue([...mockVersions]);
        vi.spyOn(window, 'confirm').mockReturnValue(true);
    });

    describe('rendering', () => {
        it('should render modal when open', () => {
            render(<VersionHistoryModal {...defaultProps} />);

            expect(screen.getByTestId('modal')).toBeInTheDocument();
        });

        it('should not render when closed', () => {
            render(<VersionHistoryModal {...defaultProps} isOpen={false} />);

            expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
        });

        it('should show document name in title', () => {
            render(<VersionHistoryModal {...defaultProps} />);

            expect(screen.getByText('History: Test Document')).toBeInTheDocument();
        });

        it('should load versions on open', () => {
            render(<VersionHistoryModal {...defaultProps} />);

            expect(mockGetVersions).toHaveBeenCalledWith('doc-1');
        });

        it('should show version list', () => {
            render(<VersionHistoryModal {...defaultProps} />);

            expect(screen.getByText('Initial version')).toBeInTheDocument();
        });

        it('should show no versions message when empty', () => {
            mockGetVersions.mockReturnValue([]);
            render(<VersionHistoryModal {...defaultProps} />);

            expect(screen.getByText('versions.noVersions')).toBeInTheDocument();
        });

        it('should show version size', () => {
            render(<VersionHistoryModal {...defaultProps} />);

            expect(screen.getByText('1.0 KB')).toBeInTheDocument();
            expect(screen.getByText('2.0 KB')).toBeInTheDocument();
        });

        it('should show select version prompt when none selected', () => {
            render(<VersionHistoryModal {...defaultProps} />);

            expect(screen.getByText('versions.selectVersion')).toBeInTheDocument();
        });
    });

    describe('version selection', () => {
        it('should select version on click', () => {
            render(<VersionHistoryModal {...defaultProps} />);

            fireEvent.click(screen.getByText('Initial version'));

            expect(screen.getByText('# Version 1 content')).toBeInTheDocument();
        });

        it('should show version content in preview', () => {
            render(<VersionHistoryModal {...defaultProps} />);

            fireEvent.click(screen.getByText('Initial version'));

            expect(screen.getByText('# Version 1 content')).toBeInTheDocument();
        });

        it('should show action buttons when version selected', () => {
            render(<VersionHistoryModal {...defaultProps} />);

            fireEvent.click(screen.getByText('Initial version'));

            expect(screen.getByText('versions.restore')).toBeInTheDocument();
        });
    });

    describe('restore version', () => {
        it('should confirm before restore', () => {
            render(<VersionHistoryModal {...defaultProps} />);

            fireEvent.click(screen.getByText('Initial version'));
            fireEvent.click(screen.getByText('versions.restore'));

            expect(window.confirm).toHaveBeenCalled();
        });

        it('should call onRestore with version content', () => {
            render(<VersionHistoryModal {...defaultProps} />);

            fireEvent.click(screen.getByText('Initial version'));
            fireEvent.click(screen.getByText('versions.restore'));

            expect(defaultProps.onRestore).toHaveBeenCalledWith('# Version 1 content');
        });

        it('should close modal after restore', () => {
            render(<VersionHistoryModal {...defaultProps} />);

            fireEvent.click(screen.getByText('Initial version'));
            fireEvent.click(screen.getByText('versions.restore'));

            expect(defaultProps.onClose).toHaveBeenCalled();
        });

        it('should not restore if cancelled', () => {
            vi.spyOn(window, 'confirm').mockReturnValue(false);
            render(<VersionHistoryModal {...defaultProps} />);

            fireEvent.click(screen.getByText('Initial version'));
            fireEvent.click(screen.getByText('versions.restore'));

            expect(defaultProps.onRestore).not.toHaveBeenCalled();
        });
    });

    describe('delete version', () => {
        it('should confirm before delete', () => {
            render(<VersionHistoryModal {...defaultProps} />);

            fireEvent.click(screen.getByText('Initial version'));
            const deleteButton = screen.getByTitle('versions.deleteVersion');
            fireEvent.click(deleteButton);

            expect(window.confirm).toHaveBeenCalled();
        });

        it('should call deleteVersion service', () => {
            render(<VersionHistoryModal {...defaultProps} />);

            fireEvent.click(screen.getByText('Initial version'));
            const deleteButton = screen.getByTitle('versions.deleteVersion');
            fireEvent.click(deleteButton);

            expect(mockDeleteVersion).toHaveBeenCalledWith('doc-1', 'v1');
        });

        it('should refresh version list after delete', () => {
            render(<VersionHistoryModal {...defaultProps} />);

            fireEvent.click(screen.getByText('Initial version'));
            const deleteButton = screen.getByTitle('versions.deleteVersion');
            fireEvent.click(deleteButton);

            expect(mockGetVersions).toHaveBeenCalledTimes(2);
        });

        it('should not delete if cancelled', () => {
            vi.spyOn(window, 'confirm').mockReturnValue(false);
            render(<VersionHistoryModal {...defaultProps} />);

            fireEvent.click(screen.getByText('Initial version'));
            const deleteButton = screen.getByTitle('versions.deleteVersion');
            fireEvent.click(deleteButton);

            expect(mockDeleteVersion).not.toHaveBeenCalled();
        });
    });

    describe('compare versions', () => {
        it('should show compare button when onCompare provided', () => {
            render(<VersionHistoryModal {...defaultProps} />);

            fireEvent.click(screen.getByText('Initial version'));

            expect(screen.getByText('versions.compare')).toBeInTheDocument();
        });

        it('should not show compare button when onCompare not provided', () => {
            render(<VersionHistoryModal {...defaultProps} onCompare={undefined} />);

            fireEvent.click(screen.getByText('Initial version'));

            expect(screen.queryByText('versions.compare')).not.toBeInTheDocument();
        });

        it('should call onCompare with version id', () => {
            render(<VersionHistoryModal {...defaultProps} />);

            fireEvent.click(screen.getByText('Initial version'));
            fireEvent.click(screen.getByText('versions.compare'));

            expect(defaultProps.onCompare).toHaveBeenCalledWith('v1');
        });
    });

    describe('edit label', () => {
        it('should show edit button for selected version', () => {
            render(<VersionHistoryModal {...defaultProps} />);

            fireEvent.click(screen.getByText('Initial version'));

            expect(screen.getByTitle('versions.editLabel')).toBeInTheDocument();
        });

        it('should show input when editing label', async () => {
            render(<VersionHistoryModal {...defaultProps} />);

            fireEvent.click(screen.getByText('Initial version'));
            fireEvent.click(screen.getByTitle('versions.editLabel'));

            await waitFor(() => {
                expect(screen.getByRole('textbox')).toBeInTheDocument();
            });
        });

        it('should prefill input with current label', async () => {
            render(<VersionHistoryModal {...defaultProps} />);

            fireEvent.click(screen.getByText('Initial version'));
            fireEvent.click(screen.getByTitle('versions.editLabel'));

            await waitFor(() => {
                const input = screen.getByRole('textbox') as HTMLInputElement;
                expect(input.value).toBe('Initial version');
            });
        });

        it('should save label on Enter', async () => {
            render(<VersionHistoryModal {...defaultProps} />);

            fireEvent.click(screen.getByText('Initial version'));
            fireEvent.click(screen.getByTitle('versions.editLabel'));

            await waitFor(() => {
                const input = screen.getByRole('textbox');
                fireEvent.change(input, { target: { value: 'New label' } });
                fireEvent.keyDown(input, { key: 'Enter' });
            });

            expect(mockUpdateVersionLabel).toHaveBeenCalledWith('doc-1', 'v1', 'New label');
        });

        it('should save label on blur', async () => {
            render(<VersionHistoryModal {...defaultProps} />);

            fireEvent.click(screen.getByText('Initial version'));
            fireEvent.click(screen.getByTitle('versions.editLabel'));

            await waitFor(() => {
                const input = screen.getByRole('textbox');
                fireEvent.change(input, { target: { value: 'Blurred label' } });
                fireEvent.blur(input);
            });

            expect(mockUpdateVersionLabel).toHaveBeenCalledWith('doc-1', 'v1', 'Blurred label');
        });

        it('should cancel edit on Escape', async () => {
            render(<VersionHistoryModal {...defaultProps} />);

            fireEvent.click(screen.getByText('Initial version'));
            fireEvent.click(screen.getByTitle('versions.editLabel'));

            await waitFor(() => {
                const input = screen.getByRole('textbox');
                fireEvent.change(input, { target: { value: 'Changed' } });
                fireEvent.keyDown(input, { key: 'Escape' });
            });

            expect(mockUpdateVersionLabel).not.toHaveBeenCalled();
        });
    });

    describe('reload on documentId change', () => {
        it('should reload versions when documentId changes', () => {
            const { rerender } = render(<VersionHistoryModal {...defaultProps} />);

            expect(mockGetVersions).toHaveBeenCalledWith('doc-1');

            rerender(<VersionHistoryModal {...defaultProps} documentId="doc-2" />);

            expect(mockGetVersions).toHaveBeenCalledWith('doc-2');
        });

        it('should clear selection when documentId changes', () => {
            const { rerender } = render(<VersionHistoryModal {...defaultProps} />);

            fireEvent.click(screen.getByText('Initial version'));
            expect(screen.getByText('# Version 1 content')).toBeInTheDocument();

            rerender(<VersionHistoryModal {...defaultProps} documentId="doc-2" />);

            expect(screen.getByText('versions.selectVersion')).toBeInTheDocument();
        });
    });
});
