import type { SyncStatus } from '@/types';
import { cn } from '@/utils/cn';
import { AlertCircle, Check, Circle, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface DocumentSyncStatusProps {
    syncStatus: SyncStatus;
    className?: string;
}

/**
 * Display document sync status indicator
 */
export function DocumentSyncStatus({ syncStatus, className }: DocumentSyncStatusProps) {
    const { t } = useTranslation();

    switch (syncStatus) {
        case 'syncing':
            return (
                <span className={cn('flex items-center gap-1 text-blue-500', className)}>
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span>{t('fileExplorer.status.syncing')}</span>
                </span>
            );
        case 'modified':
            return (
                <span className={cn('flex items-center gap-1 text-orange-500', className)}>
                    <Circle className="h-2 w-2 fill-current" />
                    <span>{t('fileExplorer.status.modified')}</span>
                </span>
            );
        case 'synced':
            return (
                <span className={cn('flex items-center gap-1 text-green-500', className)}>
                    <Check className="h-3 w-3" />
                    <span>{t('fileExplorer.status.synced')}</span>
                </span>
            );
        case 'error':
            return (
                <span className={cn('flex items-center gap-1 text-red-500', className)}>
                    <AlertCircle className="h-3 w-3" />
                    <span>{t('fileExplorer.status.error')}</span>
                </span>
            );
        default: // 'local'
            return (
                <span className={cn('flex items-center gap-1 text-gray-400', className)}>
                    <Circle className="h-2 w-2 fill-current" />
                    <span>{t('fileExplorer.status.local')}</span>
                </span>
            );
    }
}
