import { DocumentSyncStatus } from '@/components/statusbar/DocumentSyncStatus';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

// Mock react-i18next
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key
    })
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
    AlertCircle: () => <span data-testid="icon-alert" />,
    Check: () => <span data-testid="icon-check" />,
    Circle: () => <span data-testid="icon-circle" />,
    Loader2: () => <span data-testid="icon-loader" />
}));

// Mock cn utility
vi.mock('@/utils/cn', () => ({
    cn: (...args: (string | boolean | undefined)[]) => args.filter(Boolean).join(' ')
}));

describe('DocumentSyncStatus', () => {
    describe('syncing status', () => {
        it('should render syncing state', () => {
            render(<DocumentSyncStatus syncStatus="syncing" />);

            expect(screen.getByTestId('icon-loader')).toBeInTheDocument();
            expect(screen.getByText('fileExplorer.status.syncing')).toBeInTheDocument();
        });

        it('should apply syncing styles', () => {
            render(<DocumentSyncStatus syncStatus="syncing" />);

            const container = screen.getByText('fileExplorer.status.syncing').parentElement;
            expect(container).toHaveClass('text-blue-700');
        });
    });

    describe('modified status', () => {
        it('should render modified state', () => {
            render(<DocumentSyncStatus syncStatus="modified" />);

            expect(screen.getByTestId('icon-circle')).toBeInTheDocument();
            expect(screen.getByText('fileExplorer.status.modified')).toBeInTheDocument();
        });

        it('should apply modified styles', () => {
            render(<DocumentSyncStatus syncStatus="modified" />);

            const container = screen.getByText('fileExplorer.status.modified').parentElement;
            expect(container).toHaveClass('text-orange-700');
        });
    });

    describe('synced status', () => {
        it('should render synced state', () => {
            render(<DocumentSyncStatus syncStatus="synced" />);

            expect(screen.getByTestId('icon-check')).toBeInTheDocument();
            expect(screen.getByText('fileExplorer.status.synced')).toBeInTheDocument();
        });

        it('should apply synced styles', () => {
            render(<DocumentSyncStatus syncStatus="synced" />);

            const container = screen.getByText('fileExplorer.status.synced').parentElement;
            expect(container).toHaveClass('text-green-700');
        });
    });

    describe('error status', () => {
        it('should render error state', () => {
            render(<DocumentSyncStatus syncStatus="error" />);

            expect(screen.getByTestId('icon-alert')).toBeInTheDocument();
            expect(screen.getByText('fileExplorer.status.error')).toBeInTheDocument();
        });

        it('should apply error styles', () => {
            render(<DocumentSyncStatus syncStatus="error" />);

            const container = screen.getByText('fileExplorer.status.error').parentElement;
            expect(container).toHaveClass('text-red-700');
        });
    });

    describe('local status (default)', () => {
        it('should render local state', () => {
            render(<DocumentSyncStatus syncStatus="local" />);

            expect(screen.getByTestId('icon-circle')).toBeInTheDocument();
            expect(screen.getByText('fileExplorer.status.local')).toBeInTheDocument();
        });

        it('should apply local styles', () => {
            render(<DocumentSyncStatus syncStatus="local" />);

            const container = screen.getByText('fileExplorer.status.local').parentElement;
            expect(container).toHaveClass('text-slate-600');
        });

        it('should handle unknown status as local', () => {
            // @ts-expect-error - testing unknown status
            render(<DocumentSyncStatus syncStatus="unknown" />);

            expect(screen.getByText('fileExplorer.status.local')).toBeInTheDocument();
        });
    });

    describe('custom className', () => {
        it('should apply custom className to syncing status', () => {
            render(<DocumentSyncStatus syncStatus="syncing" className="custom-class" />);

            const container = screen.getByText('fileExplorer.status.syncing').parentElement;
            expect(container).toHaveClass('custom-class');
        });

        it('should apply custom className to synced status', () => {
            render(<DocumentSyncStatus syncStatus="synced" className="custom-class" />);

            const container = screen.getByText('fileExplorer.status.synced').parentElement;
            expect(container).toHaveClass('custom-class');
        });

        it('should apply custom className to modified status', () => {
            render(<DocumentSyncStatus syncStatus="modified" className="custom-class" />);

            const container = screen.getByText('fileExplorer.status.modified').parentElement;
            expect(container).toHaveClass('custom-class');
        });

        it('should apply custom className to error status', () => {
            render(<DocumentSyncStatus syncStatus="error" className="custom-class" />);

            const container = screen.getByText('fileExplorer.status.error').parentElement;
            expect(container).toHaveClass('custom-class');
        });

        it('should apply custom className to local status', () => {
            render(<DocumentSyncStatus syncStatus="local" className="custom-class" />);

            const container = screen.getByText('fileExplorer.status.local').parentElement;
            expect(container).toHaveClass('custom-class');
        });
    });

    describe('icons', () => {
        it('should use loader icon for syncing', () => {
            render(<DocumentSyncStatus syncStatus="syncing" />);
            expect(screen.getByTestId('icon-loader')).toBeInTheDocument();
        });

        it('should use circle icon for modified', () => {
            render(<DocumentSyncStatus syncStatus="modified" />);
            expect(screen.getByTestId('icon-circle')).toBeInTheDocument();
        });

        it('should use check icon for synced', () => {
            render(<DocumentSyncStatus syncStatus="synced" />);
            expect(screen.getByTestId('icon-check')).toBeInTheDocument();
        });

        it('should use alert icon for error', () => {
            render(<DocumentSyncStatus syncStatus="error" />);
            expect(screen.getByTestId('icon-alert')).toBeInTheDocument();
        });

        it('should use circle icon for local', () => {
            render(<DocumentSyncStatus syncStatus="local" />);
            expect(screen.getByTestId('icon-circle')).toBeInTheDocument();
        });
    });
});
