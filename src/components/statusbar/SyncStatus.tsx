import { useAuth } from '@/components/auth/AuthProvider';
import { useSyncStore } from '@/stores/syncStore';
import type { SyncState } from '@/types/sync';
import { AlertCircle, Check, Cloud, CloudOff, Loader2, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';

/**
 * Displays the current sync status in the status bar.
 * Only visible when the user is authenticated.
 */
export function SyncStatus() {
    const { t } = useTranslation();
    const { isAuthenticated } = useAuth();
    const syncStatus = useSyncStore((s) => s.syncState);
    const lastSyncedAt = useSyncStore((s) => s.lastSyncedAt);
    const pendingQueueLength = useSyncStore((s) => s.pendingQueue.length);
    const hasPendingChanges = pendingQueueLength > 0;

    // Don't show if not authenticated
    if (!isAuthenticated) {
        return null;
    }

    const { icon: Icon, label, className } = getSyncStatusDisplay(syncStatus, hasPendingChanges, t);

    const tooltip = lastSyncedAt ? t('sync.lastSynced', { time: formatRelativeTime(lastSyncedAt) }) : t(`sync.status.${syncStatus}`);

    return (
        <div className={`flex items-center gap-1.5 px-2 text-xs ${className}`} title={tooltip}>
            <Icon className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{label}</span>
        </div>
    );
}

function getSyncStatusDisplay(
    status: SyncState,
    hasPendingChanges: boolean,
    t: (key: string) => string
): { icon: typeof Cloud; label: string; className: string } {
    if (hasPendingChanges && status !== 'syncing') {
        return {
            icon: RefreshCw,
            label: t('sync.status.pending'),
            className: 'text-yellow-500'
        };
    }

    switch (status) {
        case 'syncing':
            return {
                icon: Loader2,
                label: t('sync.status.syncing'),
                className: 'text-blue-500 animate-pulse'
            };
        case 'synced':
            return {
                icon: Check,
                label: t('sync.status.synced'),
                className: 'text-green-500'
            };
        case 'error':
            return {
                icon: AlertCircle,
                label: t('sync.status.error'),
                className: 'text-red-500'
            };
        case 'offline':
            return {
                icon: CloudOff,
                label: t('sync.status.offline'),
                className: 'text-gray-400'
            };
        default:
            return {
                icon: Cloud,
                label: '',
                className: 'text-gray-400'
            };
    }
}

function formatRelativeTime(isoString: string): string {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);

    if (diffSecs < 60) {
        return 'just now';
    }
    if (diffMins < 60) {
        return `${diffMins}m ago`;
    }
    if (diffHours < 24) {
        return `${diffHours}h ago`;
    }
    return date.toLocaleDateString();
}
