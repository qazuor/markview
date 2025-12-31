import { SyncStatus } from '@/components/statusbar/SyncStatus';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock react-i18next
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, params?: Record<string, string>) => {
            if (params?.time) return `Last synced: ${params.time}`;
            return key;
        }
    })
}));

// Mock useAuth
const mockUseAuth = vi.fn();
vi.mock('@/components/auth/AuthProvider', () => ({
    useAuth: () => mockUseAuth()
}));

// Mock useSyncStore
const mockSyncState = vi.hoisted(() => ({
    syncState: 'idle' as 'idle' | 'syncing' | 'synced' | 'error' | 'offline',
    lastSyncedAt: null as string | null,
    pendingQueue: [] as unknown[]
}));
vi.mock('@/stores/syncStore', () => ({
    useSyncStore: (selector: (state: typeof mockSyncState) => unknown) => selector(mockSyncState)
}));

describe('SyncStatus', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockUseAuth.mockReturnValue({ isAuthenticated: true });
        mockSyncState.syncState = 'idle';
        mockSyncState.lastSyncedAt = null;
        mockSyncState.pendingQueue = [];
    });

    describe('authentication', () => {
        it('should not render when not authenticated', () => {
            mockUseAuth.mockReturnValue({ isAuthenticated: false });

            const { container } = render(<SyncStatus />);

            expect(container.firstChild).toBeNull();
        });

        it('should render when authenticated', () => {
            mockUseAuth.mockReturnValue({ isAuthenticated: true });

            const { container } = render(<SyncStatus />);

            expect(container.firstChild).not.toBeNull();
        });
    });

    describe('sync states', () => {
        it('should show synced status', () => {
            mockSyncState.syncState = 'synced';

            render(<SyncStatus />);

            expect(screen.getByText('sync.status.synced')).toBeInTheDocument();
        });

        it('should show syncing status with animation', () => {
            mockSyncState.syncState = 'syncing';

            const { container } = render(<SyncStatus />);

            const statusDiv = container.firstChild as HTMLElement;
            expect(statusDiv).toHaveClass('animate-pulse');
            expect(screen.getByText('sync.status.syncing')).toBeInTheDocument();
        });

        it('should show error status', () => {
            mockSyncState.syncState = 'error';

            render(<SyncStatus />);

            expect(screen.getByText('sync.status.error')).toBeInTheDocument();
        });

        it('should show offline status', () => {
            mockSyncState.syncState = 'offline';

            render(<SyncStatus />);

            expect(screen.getByText('sync.status.offline')).toBeInTheDocument();
        });
    });

    describe('pending changes', () => {
        it('should show pending status when there are pending changes', () => {
            mockSyncState.syncState = 'idle';
            mockSyncState.pendingQueue = [{ id: 'doc-1' }];

            render(<SyncStatus />);

            expect(screen.getByText('sync.status.pending')).toBeInTheDocument();
        });

        it('should not show pending when syncing', () => {
            mockSyncState.syncState = 'syncing';
            mockSyncState.pendingQueue = [{ id: 'doc-1' }];

            render(<SyncStatus />);

            expect(screen.getByText('sync.status.syncing')).toBeInTheDocument();
        });
    });

    describe('tooltip', () => {
        it('should show last synced time in tooltip when available', () => {
            mockSyncState.syncState = 'synced';
            mockSyncState.lastSyncedAt = new Date().toISOString();

            const { container } = render(<SyncStatus />);

            expect(container.firstChild).toHaveAttribute('title', expect.stringContaining('Last synced:'));
        });

        it('should show status in tooltip when no last synced time', () => {
            mockSyncState.syncState = 'synced';
            mockSyncState.lastSyncedAt = null;

            const { container } = render(<SyncStatus />);

            expect(container.firstChild).toHaveAttribute('title', 'sync.status.synced');
        });
    });

    describe('styling', () => {
        it('should have green color for synced status', () => {
            mockSyncState.syncState = 'synced';

            const { container } = render(<SyncStatus />);

            expect(container.firstChild).toHaveClass('text-green-700');
        });

        it('should have blue color for syncing status', () => {
            mockSyncState.syncState = 'syncing';

            const { container } = render(<SyncStatus />);

            expect(container.firstChild).toHaveClass('text-blue-700');
        });

        it('should have red color for error status', () => {
            mockSyncState.syncState = 'error';

            const { container } = render(<SyncStatus />);

            expect(container.firstChild).toHaveClass('text-red-700');
        });

        it('should have amber color for pending status', () => {
            mockSyncState.pendingQueue = [{ id: 'doc-1' }];

            const { container } = render(<SyncStatus />);

            expect(container.firstChild).toHaveClass('text-amber-700');
        });
    });

    describe('icon rendering', () => {
        it('should render an icon', () => {
            mockSyncState.syncState = 'synced';

            const { container } = render(<SyncStatus />);

            const svg = container.querySelector('svg');
            expect(svg).toBeInTheDocument();
        });
    });
});
