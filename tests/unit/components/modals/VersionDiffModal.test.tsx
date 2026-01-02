import { VersionDiffModal } from '@/components/modals/VersionDiffModal';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock react-i18next
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, params?: Record<string, unknown>) => {
            if (params?.date) return `Comparing with ${params.date}`;
            if (params?.count !== undefined) return `${params.count}`;
            return key;
        }
    })
}));

// Mock Modal component
vi.mock('@/components/ui', () => ({
    Modal: ({
        children,
        isOpen,
        title
    }: {
        children: React.ReactNode;
        isOpen: boolean;
        title: string;
        onClose: () => void;
        size?: string;
    }) =>
        isOpen ? (
            <dialog data-testid="modal" open>
                <h2>{title}</h2>
                {children}
            </dialog>
        ) : null
}));

// Mock version service
const mockVersion = {
    id: 'v1',
    documentId: 'doc-1',
    content: 'Line 1\nLine 2\nLine 3',
    createdAt: '2024-01-15T10:00:00Z',
    size: 1024,
    label: 'Initial version'
};

const mockDiff = [
    { lineNumber: 1, line: 'Line 1', type: 'unchanged' as const },
    { lineNumber: 2, line: 'Line 2', type: 'removed' as const },
    { lineNumber: 3, line: 'Line 2 modified', type: 'added' as const },
    { lineNumber: 4, line: 'Line 3', type: 'unchanged' as const },
    { lineNumber: 5, line: 'New line', type: 'added' as const }
];

const mockGetVersion = vi.fn();
const mockDiffVersions = vi.fn();

vi.mock('@/services/storage/versions', () => ({
    getVersion: (...args: unknown[]) => mockGetVersion(...args),
    diffVersions: (...args: unknown[]) => mockDiffVersions(...args)
}));

// Mock cn utility
vi.mock('@/utils/cn', () => ({
    cn: (...args: (string | boolean | undefined)[]) => args.filter(Boolean).join(' ')
}));

describe('VersionDiffModal', () => {
    const defaultProps = {
        isOpen: true,
        documentId: 'doc-1',
        versionId: 'v1',
        currentContent: 'Line 1\nLine 2 modified\nLine 3\nNew line',
        onClose: vi.fn()
    };

    beforeEach(() => {
        vi.clearAllMocks();
        mockGetVersion.mockReturnValue(mockVersion);
        mockDiffVersions.mockReturnValue(mockDiff);
    });

    describe('rendering', () => {
        it('should render modal when open', () => {
            render(<VersionDiffModal {...defaultProps} />);

            expect(screen.getByTestId('modal')).toBeInTheDocument();
        });

        it('should not render when closed', () => {
            render(<VersionDiffModal {...defaultProps} isOpen={false} />);

            expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
        });

        it('should show compare title', () => {
            render(<VersionDiffModal {...defaultProps} />);

            expect(screen.getByText('versions.compareTitle')).toBeInTheDocument();
        });

        it('should return null when no version found', () => {
            mockGetVersion.mockReturnValue(null);
            render(<VersionDiffModal {...defaultProps} />);

            expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
        });
    });

    describe('loading version', () => {
        it('should get version by id', () => {
            render(<VersionDiffModal {...defaultProps} />);

            expect(mockGetVersion).toHaveBeenCalledWith('doc-1', 'v1');
        });

        it('should call diffVersions with version and current content', () => {
            render(<VersionDiffModal {...defaultProps} />);

            expect(mockDiffVersions).toHaveBeenCalledWith('Line 1\nLine 2\nLine 3', 'Line 1\nLine 2 modified\nLine 3\nNew line');
        });

        it('should not load version when closed', () => {
            render(<VersionDiffModal {...defaultProps} isOpen={false} />);

            expect(mockGetVersion).not.toHaveBeenCalled();
        });

        it('should not load version when no versionId', () => {
            render(<VersionDiffModal {...defaultProps} versionId="" />);

            expect(mockGetVersion).not.toHaveBeenCalled();
        });
    });

    describe('stats display', () => {
        it('should show added count in stats bar', () => {
            render(<VersionDiffModal {...defaultProps} />);

            // Stats bar has green-600 class for added count
            const statsBar = screen.getByText(/Comparing with/).parentElement;
            expect(statsBar).toHaveTextContent('2'); // 2 added lines
        });

        it('should show removed count in stats bar', () => {
            render(<VersionDiffModal {...defaultProps} />);

            // Stats bar has red-600 class for removed count
            const statsBar = screen.getByText(/Comparing with/).parentElement;
            expect(statsBar).toHaveTextContent('1'); // 1 removed line
        });

        it('should show version date in comparison text', () => {
            render(<VersionDiffModal {...defaultProps} />);

            expect(screen.getByText(/Comparing with/)).toBeInTheDocument();
        });
    });

    describe('diff display', () => {
        it('should render diff table', () => {
            render(<VersionDiffModal {...defaultProps} />);

            expect(screen.getByRole('table')).toBeInTheDocument();
        });

        it('should show line numbers', () => {
            render(<VersionDiffModal {...defaultProps} />);

            // Line numbers appear in the table cells
            const table = screen.getByRole('table');
            expect(table).toHaveTextContent('1');
            expect(table).toHaveTextContent('2');
            expect(table).toHaveTextContent('3');
        });

        it('should show diff content', () => {
            render(<VersionDiffModal {...defaultProps} />);

            expect(screen.getByText('Line 1')).toBeInTheDocument();
            expect(screen.getByText('Line 2')).toBeInTheDocument();
            expect(screen.getByText('Line 2 modified')).toBeInTheDocument();
        });

        it('should show + for added lines', () => {
            render(<VersionDiffModal {...defaultProps} />);

            const plusSigns = screen.getAllByText('+');
            expect(plusSigns.length).toBe(2); // Two added lines
        });

        it('should show - for removed lines', () => {
            render(<VersionDiffModal {...defaultProps} />);

            const minusSigns = screen.getAllByText('-');
            expect(minusSigns.length).toBe(1); // One removed line
        });
    });

    describe('legend', () => {
        it('should show added legend', () => {
            render(<VersionDiffModal {...defaultProps} />);

            expect(screen.getByText('versions.addedInCurrent')).toBeInTheDocument();
        });

        it('should show removed legend', () => {
            render(<VersionDiffModal {...defaultProps} />);

            expect(screen.getByText('versions.removedFromVersion')).toBeInTheDocument();
        });
    });

    describe('empty diff', () => {
        it('should show zero stats for identical content', () => {
            mockDiffVersions.mockReturnValue([{ lineNumber: 1, line: 'Same', type: 'unchanged' }]);

            render(<VersionDiffModal {...defaultProps} />);

            // Should show 0 for both added and removed
            const zeros = screen.getAllByText('0');
            expect(zeros.length).toBe(2);
        });
    });

    describe('memoization', () => {
        it('should recalculate diff when content changes', () => {
            const { rerender } = render(<VersionDiffModal {...defaultProps} />);

            expect(mockDiffVersions).toHaveBeenCalledTimes(1);

            rerender(<VersionDiffModal {...defaultProps} currentContent="New content" />);

            expect(mockDiffVersions).toHaveBeenCalledTimes(2);
        });

        it('should recalculate when versionId changes', () => {
            mockGetVersion.mockImplementation((docId: string, vId: string) => {
                if (vId === 'v2')
                    return {
                        ...mockVersion,
                        id: 'v2',
                        content: 'Different content'
                    };
                return mockVersion;
            });

            const { rerender } = render(<VersionDiffModal {...defaultProps} />);

            rerender(<VersionDiffModal {...defaultProps} versionId="v2" />);

            expect(mockGetVersion).toHaveBeenCalledWith('doc-1', 'v2');
        });
    });
});
