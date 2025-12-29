import { Modal } from '@/components/ui';
import { type VersionDiff, diffVersions, getVersion } from '@/services/storage/versions';
import { cn } from '@/utils/cn';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

interface VersionDiffModalProps {
    isOpen: boolean;
    documentId: string;
    versionId: string;
    currentContent: string;
    onClose: () => void;
}

/**
 * Modal for comparing document versions
 */
export function VersionDiffModal({ isOpen, documentId, versionId, currentContent, onClose }: VersionDiffModalProps) {
    const { t } = useTranslation();

    const version = useMemo(() => {
        if (!isOpen || !versionId) return null;
        return getVersion(documentId, versionId);
    }, [isOpen, documentId, versionId]);

    const diff = useMemo(() => {
        if (!version) return [];
        return diffVersions(version.content, currentContent);
    }, [version, currentContent]);

    const stats = useMemo(() => {
        let added = 0;
        let removed = 0;

        for (const line of diff) {
            if (line.type === 'added') added++;
            if (line.type === 'removed') removed++;
        }

        return { added, removed };
    }, [diff]);

    if (!version) {
        return null;
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={t('versions.compareTitle')} size="xl">
            <div className="flex flex-col h-[70vh]">
                {/* Stats bar */}
                <div className="flex items-center gap-4 px-4 py-2 border-b border-border text-sm">
                    <span className="text-text-muted">{t('versions.comparingWith', { date: formatDate(version.createdAt) })}</span>
                    <span className="text-green-600">{t('versions.addedCount', { count: stats.added })}</span>
                    <span className="text-red-600">{t('versions.removedCount', { count: stats.removed })}</span>
                </div>

                {/* Diff view */}
                <div className="flex-1 overflow-auto">
                    <table className="w-full text-xs font-mono">
                        <tbody>
                            {diff.map((line, index) => (
                                <DiffLine key={`${line.lineNumber}-${index}`} diff={line} />
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Legend */}
                <div className="flex items-center gap-4 px-4 py-2 border-t border-border text-xs text-text-muted">
                    <span className="flex items-center gap-1">
                        <span className="w-3 h-3 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded" />
                        {t('versions.addedInCurrent')}
                    </span>
                    <span className="flex items-center gap-1">
                        <span className="w-3 h-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded" />
                        {t('versions.removedFromVersion')}
                    </span>
                </div>
            </div>
        </Modal>
    );
}

interface DiffLineProps {
    diff: VersionDiff;
}

function DiffLine({ diff }: DiffLineProps) {
    return (
        <tr
            className={cn(
                diff.type === 'added' && 'bg-green-50 dark:bg-green-900/20',
                diff.type === 'removed' && 'bg-red-50 dark:bg-red-900/20'
            )}
        >
            <td className="w-12 px-2 py-0.5 text-right text-text-muted border-r border-border select-none">{diff.lineNumber}</td>
            <td className="w-6 px-1 py-0.5 text-center select-none">
                {diff.type === 'added' && <span className="text-green-600">+</span>}
                {diff.type === 'removed' && <span className="text-red-600">-</span>}
            </td>
            <td
                className={cn(
                    'px-2 py-0.5 whitespace-pre-wrap',
                    diff.type === 'added' && 'text-green-700 dark:text-green-400',
                    diff.type === 'removed' && 'text-red-700 dark:text-red-400',
                    diff.type === 'unchanged' && 'text-text-secondary'
                )}
            >
                {diff.line || '\u00A0'}
            </td>
        </tr>
    );
}

function formatDate(isoString: string): string {
    const date = new Date(isoString);
    return date.toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}
