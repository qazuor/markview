import type { SyncStatus } from '@/types';
import { cn } from '@/utils/cn';
import { X } from 'lucide-react';
import type React from 'react';
import { useTranslation } from 'react-i18next';
import { EditableTabName } from './EditableTabName';
import { TabContextMenu } from './TabContextMenu';

interface TabProps {
    id: string;
    name: string;
    isActive: boolean;
    syncStatus: SyncStatus;
    onClick: () => void;
    onClose: (e: React.MouseEvent) => void;
    onMiddleClick: (e: React.MouseEvent) => void;
    onCloseOthers: () => void;
    onCloseAll: () => void;
    onCloseSynced: () => void;
}

/**
 * Individual tab component with context menu support
 */
export function Tab({
    id,
    name,
    isActive,
    syncStatus,
    onClick,
    onClose,
    onMiddleClick,
    onCloseOthers,
    onCloseAll,
    onCloseSynced
}: TabProps) {
    const { t } = useTranslation();

    const handleAuxClick = (e: React.MouseEvent) => {
        // Middle mouse button
        if (e.button === 1) {
            onMiddleClick(e);
        }
    };

    const handleCloseClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onClose(e);
    };

    // Sync status colors using hex values for inline styles (avoids Tailwind purging issues)
    const statusColors: Record<SyncStatus, string> = {
        synced: '#22c55e', // green-500
        local: '#22c55e', // green-500
        modified: '#f97316', // orange-500
        syncing: '#3b82f6', // blue-500
        'cloud-pending': '#06b6d4', // cyan-500 (distinct from orange, represents "cloud")
        error: '#ef4444' // red-500
    };

    const statusTooltips: Record<SyncStatus, string> = {
        synced: t('syncStatus.synced'),
        local: t('syncStatus.synced'),
        modified: t('syncStatus.modified'),
        syncing: t('syncStatus.syncing'),
        'cloud-pending': t('syncStatus.cloudPending'),
        error: t('syncStatus.error')
    };

    const statusColor = statusColors[syncStatus] || '#22c55e';
    const statusTooltip = statusTooltips[syncStatus] || t('syncStatus.synced');
    const isSyncing = syncStatus === 'syncing';

    return (
        <TabContextMenu
            tabId={id}
            onClose={() => onClose({ stopPropagation: () => {} } as React.MouseEvent)}
            onCloseOthers={onCloseOthers}
            onCloseAll={onCloseAll}
            onCloseSynced={onCloseSynced}
        >
            <div
                role="tab"
                tabIndex={isActive ? 0 : -1}
                aria-selected={isActive}
                data-tab-id={id}
                onClick={onClick}
                onAuxClick={handleAuxClick}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        onClick();
                    }
                }}
                className={cn(
                    'group relative flex items-center gap-2 px-3 py-1.5',
                    'min-w-[100px] max-w-[180px]',
                    'cursor-pointer select-none',
                    'border-r border-border',
                    'transition-colors duration-150',
                    isActive ? 'bg-bg-primary text-text-primary' : 'bg-bg-secondary text-text-secondary hover:bg-bg-tertiary'
                )}
            >
                {/* Sync status indicator with tooltip */}
                <span
                    className={cn('absolute left-1.5 top-1/2 -translate-y-1/2 h-2.5 w-2.5 rounded-full', isSyncing && 'animate-pulse')}
                    style={{ backgroundColor: statusColor }}
                    title={statusTooltip}
                />

                {/* Tab name - double-click to rename */}
                <EditableTabName documentId={id} name={name} isActive={isActive} className="flex-1 text-sm ml-2" />

                {/* Close button */}
                <button
                    type="button"
                    onClick={handleCloseClick}
                    className={cn(
                        'p-0.5 rounded-sm',
                        'opacity-0 group-hover:opacity-100',
                        'hover:bg-bg-tertiary',
                        'transition-opacity duration-150',
                        'focus:outline-none focus-visible:opacity-100 focus-visible:ring-1 focus-visible:ring-primary-500',
                        isActive && 'opacity-100'
                    )}
                    aria-label={`Close ${name}`}
                >
                    <X className="h-3.5 w-3.5" />
                </button>

                {/* Active indicator */}
                {isActive && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500" />}
            </div>
        </TabContextMenu>
    );
}
