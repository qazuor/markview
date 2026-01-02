import { StatusBar } from '@/components/statusbar/StatusBar';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock react-i18next
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key
    })
}));

// Mock hooks
const mockIsMobile = vi.fn(() => false);
vi.mock('@/hooks', () => ({
    useMobile: () => ({ isMobile: mockIsMobile() })
}));

// Mock child components
vi.mock('@/components/statusbar/CursorPosition', () => ({
    CursorPosition: ({ line, column }: { line: number; column: number }) => (
        <span data-testid="cursor-position">
            Ln {line}, Col {column}
        </span>
    )
}));

vi.mock('@/components/statusbar/WordCount', () => ({
    WordCount: ({ content }: { content: string }) => (
        <span data-testid="word-count">{content.split(/\s+/).filter(Boolean).length} words</span>
    )
}));

vi.mock('@/components/statusbar/ZoomControls', () => ({
    ZoomControls: () => <span data-testid="zoom-controls">Zoom</span>
}));

vi.mock('@/components/statusbar/SyncStatus', () => ({
    SyncStatus: () => <span data-testid="sync-status">Synced</span>
}));

vi.mock('@/components/statusbar/DocumentSyncStatus', () => ({
    DocumentSyncStatus: ({ syncStatus }: { syncStatus: string }) => <span data-testid="document-sync-status">{syncStatus}</span>
}));

vi.mock('@/components/statusbar/LineEnding', () => ({
    LineEnding: () => <span data-testid="line-ending">LF</span>
}));

vi.mock('@/components/statusbar/Encoding', () => ({
    Encoding: () => <span data-testid="encoding">UTF-8</span>
}));

// Mock cn utility
vi.mock('@/utils/cn', () => ({
    cn: (...args: (string | boolean | undefined)[]) => args.filter(Boolean).join(' ')
}));

describe('StatusBar', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockIsMobile.mockReturnValue(false);
    });

    describe('desktop rendering', () => {
        it('should render as footer', () => {
            render(<StatusBar />);

            expect(screen.getByRole('contentinfo')).toBeInTheDocument();
        });

        it('should have aria label for accessibility', () => {
            render(<StatusBar />);

            expect(screen.getByLabelText('aria.editorStatus')).toBeInTheDocument();
        });

        it('should render cursor position', () => {
            render(<StatusBar line={5} column={10} />);

            expect(screen.getByTestId('cursor-position')).toHaveTextContent('Ln 5, Col 10');
        });

        it('should render word count', () => {
            render(<StatusBar content="hello world test" />);

            expect(screen.getByTestId('word-count')).toHaveTextContent('3 words');
        });

        it('should render zoom controls', () => {
            render(<StatusBar />);

            expect(screen.getByTestId('zoom-controls')).toBeInTheDocument();
        });

        it('should render sync status', () => {
            render(<StatusBar />);

            expect(screen.getByTestId('sync-status')).toBeInTheDocument();
        });

        it('should render document sync status', () => {
            render(<StatusBar syncStatus="synced" />);

            expect(screen.getByTestId('document-sync-status')).toHaveTextContent('synced');
        });

        it('should render line ending indicator', () => {
            render(<StatusBar />);

            expect(screen.getByTestId('line-ending')).toBeInTheDocument();
        });

        it('should render encoding indicator', () => {
            render(<StatusBar />);

            expect(screen.getByTestId('encoding')).toBeInTheDocument();
        });

        it('should apply custom className', () => {
            render(<StatusBar className="custom-class" />);

            expect(screen.getByRole('contentinfo')).toHaveClass('custom-class');
        });

        it('should use default values', () => {
            render(<StatusBar />);

            expect(screen.getByTestId('cursor-position')).toHaveTextContent('Ln 1, Col 1');
            expect(screen.getByTestId('word-count')).toHaveTextContent('0 words');
            expect(screen.getByTestId('document-sync-status')).toHaveTextContent('local');
        });

        it('should have data-tour attribute', () => {
            render(<StatusBar />);

            expect(screen.getByRole('contentinfo')).toHaveAttribute('data-tour', 'statusbar');
        });
    });

    describe('mobile rendering', () => {
        beforeEach(() => {
            mockIsMobile.mockReturnValue(true);
        });

        it('should render minimal status bar on mobile', () => {
            render(<StatusBar />);

            expect(screen.getByRole('contentinfo')).toBeInTheDocument();
        });

        it('should show cursor position on mobile', () => {
            render(<StatusBar line={3} column={7} />);

            expect(screen.getByTestId('cursor-position')).toHaveTextContent('Ln 3, Col 7');
        });

        it('should show word count on mobile', () => {
            render(<StatusBar content="one two" />);

            expect(screen.getByTestId('word-count')).toHaveTextContent('2 words');
        });

        it('should show sync status on mobile', () => {
            render(<StatusBar />);

            expect(screen.getByTestId('sync-status')).toBeInTheDocument();
        });

        it('should show document sync status on mobile', () => {
            render(<StatusBar syncStatus="synced" />);

            expect(screen.getByTestId('document-sync-status')).toBeInTheDocument();
        });

        it('should not show zoom controls on mobile', () => {
            render(<StatusBar />);

            expect(screen.queryByTestId('zoom-controls')).not.toBeInTheDocument();
        });

        it('should not show line ending on mobile', () => {
            render(<StatusBar />);

            expect(screen.queryByTestId('line-ending')).not.toBeInTheDocument();
        });

        it('should not show encoding on mobile', () => {
            render(<StatusBar />);

            expect(screen.queryByTestId('encoding')).not.toBeInTheDocument();
        });
    });

    describe('sync status types', () => {
        it('should display local sync status', () => {
            render(<StatusBar syncStatus="local" />);

            expect(screen.getByTestId('document-sync-status')).toHaveTextContent('local');
        });

        it('should display synced status', () => {
            render(<StatusBar syncStatus="synced" />);

            expect(screen.getByTestId('document-sync-status')).toHaveTextContent('synced');
        });

        it('should display syncing status', () => {
            render(<StatusBar syncStatus="syncing" />);

            expect(screen.getByTestId('document-sync-status')).toHaveTextContent('syncing');
        });

        it('should display error status', () => {
            render(<StatusBar syncStatus="error" />);

            expect(screen.getByTestId('document-sync-status')).toHaveTextContent('error');
        });
    });
});
