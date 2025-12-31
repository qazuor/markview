import { useMobile } from '@/hooks';
import type { SyncStatus as SyncStatusType } from '@/types';
import { cn } from '@/utils/cn';
import { useTranslation } from 'react-i18next';
import { CursorPosition } from './CursorPosition';
import { DocumentSyncStatus } from './DocumentSyncStatus';
import { Encoding } from './Encoding';
import { LineEnding } from './LineEnding';
import { SyncStatus } from './SyncStatus';
import { WordCount } from './WordCount';
import { ZoomControls } from './ZoomControls';

interface StatusBarProps {
    line?: number;
    column?: number;
    content?: string;
    syncStatus?: SyncStatusType;
    className?: string;
}

/**
 * Status bar with document information
 */
export function StatusBar({ line = 1, column = 1, content = '', syncStatus = 'local', className }: StatusBarProps) {
    const { t } = useTranslation();
    const { isMobile } = useMobile();

    // Mobile: show only essential info
    if (isMobile) {
        return (
            <footer
                data-tour="statusbar"
                className={cn(
                    'flex items-center justify-between px-2 py-0.5',
                    'bg-slate-300 dark:bg-bg-secondary border-t border-slate-400 dark:border-border',
                    'text-xs text-slate-700 dark:text-text-muted',
                    className
                )}
                aria-label={t('aria.editorStatus')}
            >
                {/* Left section - minimal info */}
                <div className="flex items-center gap-3">
                    <CursorPosition line={line} column={column} />
                    <WordCount content={content} />
                </div>

                {/* Right section - sync status */}
                <div className="flex items-center gap-2">
                    <SyncStatus />
                    <DocumentSyncStatus syncStatus={syncStatus} />
                </div>
            </footer>
        );
    }

    // Desktop: full status bar
    return (
        <footer
            data-tour="statusbar"
            className={cn(
                'flex items-center justify-between px-3 py-1',
                'bg-slate-300 dark:bg-bg-secondary border-t border-slate-400 dark:border-border',
                'text-xs text-slate-700 dark:text-text-muted',
                className
            )}
            aria-label={t('aria.editorStatus')}
        >
            {/* Left section */}
            <div className="flex items-center gap-4">
                <CursorPosition line={line} column={column} />
                <WordCount content={content} />
            </div>

            {/* Right section */}
            <div className="flex items-center gap-4">
                <ZoomControls />
                <SyncStatus />
                <DocumentSyncStatus syncStatus={syncStatus} />
                <LineEnding />
                <Encoding />
            </div>
        </footer>
    );
}
