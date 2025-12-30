/**
 * Sync Panel
 * Shows sync status, pending changes, and manual sync controls
 */

import { useAuth } from '@/components/auth/AuthProvider';
import { syncService } from '@/services/sync';
import { useSyncStore } from '@/stores/syncStore';
import { cn } from '@/utils/cn';
import { AlertCircle, Check, Cloud, CloudOff, Loader2, RefreshCw, Upload } from 'lucide-react';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface SyncPanelProps {
    className?: string;
    compact?: boolean;
}

export function SyncPanel({ className, compact = false }: SyncPanelProps) {
    const { t } = useTranslation();
    const { isAuthenticated } = useAuth();
    const syncState = useSyncStore((s) => s.syncState);
    const lastSyncedAt = useSyncStore((s) => s.lastSyncedAt);
    const syncError = useSyncStore((s) => s.syncError);
    const pendingCount = useSyncStore((s) => s.getPendingCount());
    const conflictCount = useSyncStore((s) => s.getConflictCount());
    const isProcessingQueue = useSyncStore((s) => s.isProcessingQueue);

    const [isSyncing, setIsSyncing] = useState(false);

    const handleManualSync = useCallback(async () => {
        if (isSyncing || !isAuthenticated) return;

        setIsSyncing(true);
        try {
            await syncService.forceSyncNow();
        } finally {
            setIsSyncing(false);
        }
    }, [isSyncing, isAuthenticated]);

    if (!isAuthenticated) {
        return null;
    }

    if (compact) {
        return (
            <button
                type="button"
                onClick={handleManualSync}
                disabled={isSyncing || syncState === 'syncing'}
                className={cn(
                    'flex items-center gap-1.5 px-2 py-1',
                    'text-xs rounded-md',
                    'hover:bg-bg-tertiary',
                    'disabled:opacity-50 disabled:cursor-not-allowed',
                    'transition-colors',
                    className
                )}
                title={lastSyncedAt ? t('sync.lastSynced', { time: formatRelativeTime(lastSyncedAt) }) : t('sync.neverSynced')}
            >
                <SyncIcon state={syncState} isLoading={isSyncing || isProcessingQueue} />
                {pendingCount > 0 && (
                    <span className="text-yellow-500">
                        {pendingCount} {t('sync.pending')}
                    </span>
                )}
            </button>
        );
    }

    return (
        <div className={cn('p-4 bg-bg-secondary rounded-lg border border-border', className)}>
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-text-primary flex items-center gap-2">
                    <Cloud className="h-4 w-4" />
                    {t('sync.cloudSync')}
                </h3>
                <button
                    type="button"
                    onClick={handleManualSync}
                    disabled={isSyncing || syncState === 'syncing' || syncState === 'offline'}
                    className={cn(
                        'flex items-center gap-1.5 px-3 py-1.5',
                        'text-sm font-medium rounded-md',
                        'bg-primary-500 text-white',
                        'hover:bg-primary-600',
                        'disabled:opacity-50 disabled:cursor-not-allowed',
                        'transition-colors'
                    )}
                >
                    {isSyncing || syncState === 'syncing' ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <RefreshCw className="h-4 w-4" />
                    )}
                    {t('sync.syncNow')}
                </button>
            </div>

            {/* Status */}
            <div className="space-y-3">
                <StatusRow label={t('sync.status.label')} value={<SyncStatusBadge state={syncState} />} />

                <StatusRow label={t('sync.lastSynced')} value={lastSyncedAt ? formatRelativeTime(lastSyncedAt) : t('sync.neverSynced')} />

                {pendingCount > 0 && (
                    <StatusRow
                        label={t('sync.pendingChanges')}
                        value={
                            <span className="flex items-center gap-1.5 text-yellow-500">
                                <Upload className="h-3.5 w-3.5" />
                                {pendingCount} {t('sync.itemsToSync')}
                            </span>
                        }
                    />
                )}

                {conflictCount > 0 && (
                    <StatusRow
                        label={t('sync.conflicts')}
                        value={
                            <span className="flex items-center gap-1.5 text-red-500">
                                <AlertCircle className="h-3.5 w-3.5" />
                                {conflictCount} {t('sync.conflictsToResolve')}
                            </span>
                        }
                    />
                )}

                {syncError && (
                    <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-md">
                        <p className="text-sm text-red-500">{syncError}</p>
                    </div>
                )}
            </div>
        </div>
    );
}

interface StatusRowProps {
    label: string;
    value: React.ReactNode;
}

function StatusRow({ label, value }: StatusRowProps) {
    return (
        <div className="flex items-center justify-between text-sm">
            <span className="text-text-muted">{label}</span>
            <span className="text-text-primary">{value}</span>
        </div>
    );
}

interface SyncIconProps {
    state: string;
    isLoading?: boolean;
}

function SyncIcon({ state, isLoading }: SyncIconProps) {
    if (isLoading || state === 'syncing') {
        return <Loader2 className="h-3.5 w-3.5 text-blue-500 animate-spin" />;
    }

    switch (state) {
        case 'synced':
            return <Check className="h-3.5 w-3.5 text-green-500" />;
        case 'error':
            return <AlertCircle className="h-3.5 w-3.5 text-red-500" />;
        case 'offline':
            return <CloudOff className="h-3.5 w-3.5 text-gray-400" />;
        default:
            return <Cloud className="h-3.5 w-3.5 text-gray-400" />;
    }
}

function SyncStatusBadge({ state }: { state: string }) {
    const { t } = useTranslation();

    const config = {
        idle: { color: 'text-gray-500 bg-gray-500/10', icon: <Cloud className="h-3 w-3" /> },
        syncing: { color: 'text-blue-500 bg-blue-500/10', icon: <Loader2 className="h-3 w-3 animate-spin" /> },
        synced: { color: 'text-green-500 bg-green-500/10', icon: <Check className="h-3 w-3" /> },
        error: { color: 'text-red-500 bg-red-500/10', icon: <AlertCircle className="h-3 w-3" /> },
        offline: { color: 'text-gray-400 bg-gray-500/10', icon: <CloudOff className="h-3 w-3" /> }
    } as const;

    const configEntry = config[state as keyof typeof config] ?? config.idle;
    const { color, icon } = configEntry;

    return (
        <span className={cn('inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium', color)}>
            {icon}
            {t(`sync.status.${state}`)}
        </span>
    );
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
