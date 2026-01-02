import { SyncConflictModal } from '@/components/sync/SyncConflictModal';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock react-i18next
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
        i18n: { language: 'en' }
    })
}));

// Mock sync services
const mockCalculateDiff = vi.fn();
const mockResolveConflict = vi.fn();

vi.mock('@/services/sync', () => ({
    conflictResolver: {
        calculateDiff: (local: string, server: string) => mockCalculateDiff(local, server)
    },
    syncService: {
        resolveConflict: (...args: unknown[]) => mockResolveConflict(...args)
    }
}));

// Mock cn utility
vi.mock('@/utils/cn', () => ({
    cn: (...args: unknown[]) => args.filter(Boolean).join(' ')
}));

// Mock Modal component
vi.mock('@/components/ui/Modal', () => ({
    Modal: ({ isOpen, onClose, title, children }: { isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }) =>
        isOpen ? (
            <div data-testid="modal">
                <h2 data-testid="modal-title">{title}</h2>
                {children}
                <button type="button" data-testid="modal-backdrop" onClick={onClose}>
                    Backdrop
                </button>
            </div>
        ) : null,
    ModalFooter: ({ children }: { children: React.ReactNode }) => <div data-testid="modal-footer">{children}</div>
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
    AlertTriangle: () => <span data-testid="icon-alert" />,
    Check: () => <span data-testid="icon-check" />,
    ChevronDown: () => <span data-testid="icon-chevron-down" />,
    ChevronUp: () => <span data-testid="icon-chevron-up" />,
    Clock: () => <span data-testid="icon-clock" />,
    Copy: () => <span data-testid="icon-copy" />,
    FileText: () => <span data-testid="icon-file" />,
    Server: () => <span data-testid="icon-server" />
}));

// Store mocks
const mockActiveConflict = vi.fn<[], unknown>().mockReturnValue(null);
const mockSetActiveConflict = vi.fn();

vi.mock('@/stores/syncStore', () => ({
    useSyncStore: (selector: (state: unknown) => unknown) => {
        const state = {
            activeConflict: mockActiveConflict(),
            setActiveConflict: mockSetActiveConflict
        };
        return selector(state);
    }
}));

// Test data
const createConflict = () => ({
    documentId: 'doc-1',
    localDocument: {
        id: 'doc-1',
        name: 'test.md',
        content: '# Local Version\nLocal content here',
        syncVersion: 1,
        updatedAt: '2024-01-01T10:00:00Z'
    },
    serverDocument: {
        id: 'doc-1',
        name: 'test.md',
        content: '# Server Version\nServer content here',
        syncVersion: 2,
        updatedAt: '2024-01-01T12:00:00Z'
    }
});

describe('SyncConflictModal', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockActiveConflict.mockReturnValue(null);
        mockCalculateDiff.mockReturnValue({
            localLines: 2,
            serverLines: 2,
            addedLines: 1,
            removedLines: 1,
            changedPercentage: 50
        });
        mockResolveConflict.mockResolvedValue(undefined);
    });

    describe('when no conflict', () => {
        it('should not render when activeConflict is null', () => {
            mockActiveConflict.mockReturnValue(null);

            render(<SyncConflictModal />);

            expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
        });
    });

    describe('when conflict exists', () => {
        beforeEach(() => {
            mockActiveConflict.mockReturnValue(createConflict());
        });

        it('should render modal when conflict exists', () => {
            render(<SyncConflictModal />);

            expect(screen.getByTestId('modal')).toBeInTheDocument();
        });

        it('should show modal title', () => {
            render(<SyncConflictModal />);

            expect(screen.getByTestId('modal-title')).toHaveTextContent('sync.conflict.title');
        });

        it('should show warning banner', () => {
            render(<SyncConflictModal />);

            expect(screen.getByText('sync.conflict.warning')).toBeInTheDocument();
            expect(screen.getByText('sync.conflict.description')).toBeInTheDocument();
        });

        it('should show document name', () => {
            render(<SyncConflictModal />);

            expect(screen.getByText('test.md')).toBeInTheDocument();
        });

        it('should show local version card', () => {
            render(<SyncConflictModal />);

            expect(screen.getByText('sync.conflict.localVersion')).toBeInTheDocument();
        });

        it('should show server version card', () => {
            render(<SyncConflictModal />);

            expect(screen.getByText('sync.conflict.serverVersion')).toBeInTheDocument();
        });

        it('should show diff stats', () => {
            render(<SyncConflictModal />);

            expect(screen.getByText(/\+1/)).toBeInTheDocument();
            expect(screen.getByText(/-1/)).toBeInTheDocument();
            expect(screen.getByText(/50%/)).toBeInTheDocument();
        });

        it('should show resolution options', () => {
            render(<SyncConflictModal />);

            expect(screen.getByText('sync.conflict.keepLocal')).toBeInTheDocument();
            expect(screen.getByText('sync.conflict.keepServer')).toBeInTheDocument();
            expect(screen.getByText('sync.conflict.keepBoth')).toBeInTheDocument();
        });

        it('should show cancel button', () => {
            render(<SyncConflictModal />);

            expect(screen.getByText('common.cancel')).toBeInTheDocument();
        });
    });

    describe('resolution actions', () => {
        beforeEach(() => {
            mockActiveConflict.mockReturnValue(createConflict());
        });

        it('should resolve with local when Keep Local is clicked', async () => {
            render(<SyncConflictModal />);

            fireEvent.click(screen.getByText('sync.conflict.keepLocal'));

            await waitFor(() => {
                expect(mockResolveConflict).toHaveBeenCalledWith(
                    'doc-1',
                    'local',
                    expect.objectContaining({ name: 'test.md' }),
                    expect.objectContaining({ name: 'test.md' })
                );
            });
        });

        it('should resolve with server when Keep Server is clicked', async () => {
            render(<SyncConflictModal />);

            fireEvent.click(screen.getByText('sync.conflict.keepServer'));

            await waitFor(() => {
                expect(mockResolveConflict).toHaveBeenCalledWith(
                    'doc-1',
                    'server',
                    expect.objectContaining({ name: 'test.md' }),
                    expect.objectContaining({ name: 'test.md' })
                );
            });
        });

        it('should resolve with both when Keep Both is clicked', async () => {
            render(<SyncConflictModal />);

            fireEvent.click(screen.getByText('sync.conflict.keepBoth'));

            await waitFor(() => {
                expect(mockResolveConflict).toHaveBeenCalledWith(
                    'doc-1',
                    'both',
                    expect.objectContaining({ name: 'test.md' }),
                    expect.objectContaining({ name: 'test.md' })
                );
            });
        });

        it('should clear conflict after resolution', async () => {
            render(<SyncConflictModal />);

            fireEvent.click(screen.getByText('sync.conflict.keepLocal'));

            await waitFor(() => {
                expect(mockSetActiveConflict).toHaveBeenCalledWith(null);
            });
        });
    });

    describe('cancel action', () => {
        beforeEach(() => {
            mockActiveConflict.mockReturnValue(createConflict());
        });

        it('should clear conflict when cancel is clicked', () => {
            render(<SyncConflictModal />);

            fireEvent.click(screen.getByText('common.cancel'));

            expect(mockSetActiveConflict).toHaveBeenCalledWith(null);
        });
    });

    describe('content preview', () => {
        beforeEach(() => {
            mockActiveConflict.mockReturnValue(createConflict());
        });

        it('should show preview content header', () => {
            render(<SyncConflictModal />);

            expect(screen.getByText('sync.conflict.previewContent')).toBeInTheDocument();
        });

        it('should be expandable', () => {
            render(<SyncConflictModal />);

            // Preview starts expanded
            expect(screen.getByTestId('icon-chevron-up')).toBeInTheDocument();

            // Click to collapse
            fireEvent.click(screen.getByText('sync.conflict.previewContent'));

            expect(screen.getByTestId('icon-chevron-down')).toBeInTheDocument();
        });

        it('should show changes count badge', () => {
            render(<SyncConflictModal />);

            // Should show changes badge (depends on diff)
            const changeElements = screen.getAllByText(/change/);
            expect(changeElements.length).toBeGreaterThan(0);
        });
    });

    describe('version card', () => {
        beforeEach(() => {
            mockActiveConflict.mockReturnValue(createConflict());
        });

        it('should show version numbers', () => {
            render(<SyncConflictModal />);

            // Multiple elements may contain version numbers
            const versionElements = screen.getAllByText('1');
            expect(versionElements.length).toBeGreaterThan(0);
            const version2Elements = screen.getAllByText('2');
            expect(version2Elements.length).toBeGreaterThan(0);
        });

        it('should show line counts', () => {
            render(<SyncConflictModal />);

            // Line counts from diffStats
            const lineElements = screen.getAllByText('2');
            expect(lineElements.length).toBeGreaterThan(0);
        });

        it('should show update dates', () => {
            render(<SyncConflictModal />);

            // Should format dates
            expect(screen.getAllByText('sync.conflict.updated').length).toBe(2);
        });
    });

    describe('diff calculation', () => {
        it('should call calculateDiff with document contents', () => {
            const conflict = createConflict();
            mockActiveConflict.mockReturnValue(conflict);

            render(<SyncConflictModal />);

            expect(mockCalculateDiff).toHaveBeenCalledWith(conflict.localDocument.content, conflict.serverDocument.content);
        });

        it('should handle null diffStats gracefully', () => {
            mockActiveConflict.mockReturnValue(createConflict());
            mockCalculateDiff.mockReturnValue(null);

            expect(() => render(<SyncConflictModal />)).not.toThrow();
        });
    });

    describe('edge cases', () => {
        it('should handle missing syncVersion', () => {
            const conflict = createConflict();
            conflict.localDocument.syncVersion = undefined as unknown as number;
            mockActiveConflict.mockReturnValue(conflict);

            expect(() => render(<SyncConflictModal />)).not.toThrow();
            expect(screen.getByText('0')).toBeInTheDocument();
        });

        it('should handle empty content', () => {
            const conflict = createConflict();
            conflict.localDocument.content = '';
            conflict.serverDocument.content = '';
            mockActiveConflict.mockReturnValue(conflict);

            expect(() => render(<SyncConflictModal />)).not.toThrow();
        });

        it('should handle identical content', () => {
            const conflict = createConflict();
            conflict.localDocument.content = '# Same content';
            conflict.serverDocument.content = '# Same content';
            mockActiveConflict.mockReturnValue(conflict);

            expect(() => render(<SyncConflictModal />)).not.toThrow();
        });
    });

    describe('icons', () => {
        beforeEach(() => {
            mockActiveConflict.mockReturnValue(createConflict());
        });

        it('should show alert icon in warning banner', () => {
            render(<SyncConflictModal />);

            expect(screen.getByTestId('icon-alert')).toBeInTheDocument();
        });

        it('should show file icon for document name', () => {
            render(<SyncConflictModal />);

            expect(screen.getByTestId('icon-file')).toBeInTheDocument();
        });

        it('should show clock icon for local version', () => {
            render(<SyncConflictModal />);

            expect(screen.getAllByTestId('icon-clock').length).toBeGreaterThan(0);
        });

        it('should show server icon for server version', () => {
            render(<SyncConflictModal />);

            expect(screen.getAllByTestId('icon-server').length).toBeGreaterThan(0);
        });

        it('should show copy icon for keep both option', () => {
            render(<SyncConflictModal />);

            expect(screen.getByTestId('icon-copy')).toBeInTheDocument();
        });
    });
});
