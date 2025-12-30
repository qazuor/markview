/**
 * Sync Conflict Modal
 * Shows when there's a conflict between local and server versions
 */

import { conflictResolver, syncService } from '@/services/sync';
import { useSyncStore } from '@/stores/syncStore';
import { cn } from '@/utils/cn';
import { AlertTriangle, Check, ChevronDown, ChevronUp, Clock, Copy, FileText, Server } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, ModalFooter } from '../ui/Modal';

export function SyncConflictModal() {
    const { t } = useTranslation();
    const activeConflict = useSyncStore((s) => s.activeConflict);
    const setActiveConflict = useSyncStore((s) => s.setActiveConflict);

    const isOpen = activeConflict !== null;

    const diffStats = useMemo(() => {
        if (!activeConflict) return null;
        return conflictResolver.calculateDiff(activeConflict.localDocument.content, activeConflict.serverDocument.content);
    }, [activeConflict]);

    const handleClose = () => {
        setActiveConflict(null);
    };

    const handleResolve = async (resolution: 'local' | 'server' | 'both') => {
        if (!activeConflict) return;

        await syncService.resolveConflict(
            activeConflict.documentId,
            resolution,
            activeConflict.localDocument,
            activeConflict.serverDocument
        );

        setActiveConflict(null);
    };

    if (!activeConflict) return null;

    const localDoc = activeConflict.localDocument;
    const serverDoc = activeConflict.serverDocument;

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title={t('sync.conflict.title')} size="lg">
            <div className="space-y-6">
                {/* Warning banner */}
                <div className="flex items-start gap-3 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-text-secondary">
                        <p className="font-medium text-yellow-500">{t('sync.conflict.warning')}</p>
                        <p className="mt-1">{t('sync.conflict.description')}</p>
                    </div>
                </div>

                {/* Document info */}
                <div className="flex items-center gap-2 text-text-primary">
                    <FileText className="h-4 w-4" />
                    <span className="font-medium">{localDoc.name}</span>
                </div>

                {/* Version comparison */}
                <div className="grid grid-cols-2 gap-4">
                    {/* Local version */}
                    <VersionCard
                        title={t('sync.conflict.localVersion')}
                        icon={<Clock className="h-4 w-4" />}
                        version={localDoc.syncVersion ?? 0}
                        updatedAt={localDoc.updatedAt}
                        lines={diffStats?.localLines ?? 0}
                        isLocal
                    />

                    {/* Server version */}
                    <VersionCard
                        title={t('sync.conflict.serverVersion')}
                        icon={<Server className="h-4 w-4" />}
                        version={serverDoc.syncVersion}
                        updatedAt={serverDoc.updatedAt}
                        lines={diffStats?.serverLines ?? 0}
                    />
                </div>

                {/* Diff stats */}
                {diffStats && (
                    <div className="p-3 bg-bg-secondary rounded-lg text-sm text-text-secondary">
                        <p>
                            <span className="text-green-500">+{diffStats.addedLines}</span> {t('sync.conflict.linesAdded')} /{' '}
                            <span className="text-red-500">-{diffStats.removedLines}</span> {t('sync.conflict.linesRemoved')} (
                            {diffStats.changedPercentage}% {t('sync.conflict.changed')})
                        </p>
                    </div>
                )}

                {/* Content preview */}
                <ContentPreview localContent={localDoc.content} serverContent={serverDoc.content} />

                {/* Resolution options */}
                <div className="space-y-3">
                    <p className="text-sm font-medium text-text-primary">{t('sync.conflict.chooseResolution')}</p>

                    <ResolutionOption
                        icon={<Clock className="h-5 w-5" />}
                        title={t('sync.conflict.keepLocal')}
                        description={t('sync.conflict.keepLocalDesc')}
                        onClick={() => handleResolve('local')}
                    />

                    <ResolutionOption
                        icon={<Server className="h-5 w-5" />}
                        title={t('sync.conflict.keepServer')}
                        description={t('sync.conflict.keepServerDesc')}
                        onClick={() => handleResolve('server')}
                    />

                    <ResolutionOption
                        icon={<Copy className="h-5 w-5" />}
                        title={t('sync.conflict.keepBoth')}
                        description={t('sync.conflict.keepBothDesc')}
                        onClick={() => handleResolve('both')}
                    />
                </div>
            </div>

            <ModalFooter>
                <button
                    type="button"
                    onClick={handleClose}
                    className={cn(
                        'px-4 py-2 rounded-md',
                        'text-sm font-medium',
                        'text-text-secondary hover:text-text-primary',
                        'hover:bg-bg-tertiary',
                        'transition-colors'
                    )}
                >
                    {t('common.cancel')}
                </button>
            </ModalFooter>
        </Modal>
    );
}

interface VersionCardProps {
    title: string;
    icon: React.ReactNode;
    version: number;
    updatedAt: string;
    lines: number;
    isLocal?: boolean;
}

function VersionCard({ title, icon, version, updatedAt, lines, isLocal }: VersionCardProps) {
    const { t } = useTranslation();

    return (
        <div className={cn('p-4 rounded-lg border', isLocal ? 'border-blue-500/30 bg-blue-500/5' : 'border-purple-500/30 bg-purple-500/5')}>
            <div className="flex items-center gap-2 mb-3">
                <span className={isLocal ? 'text-blue-500' : 'text-purple-500'}>{icon}</span>
                <span className="font-medium text-text-primary">{title}</span>
            </div>
            <dl className="space-y-1 text-sm">
                <div className="flex justify-between">
                    <dt className="text-text-muted">{t('sync.conflict.version')}</dt>
                    <dd className="text-text-primary">{version}</dd>
                </div>
                <div className="flex justify-between">
                    <dt className="text-text-muted">{t('sync.conflict.updated')}</dt>
                    <dd className="text-text-primary">{formatDate(updatedAt)}</dd>
                </div>
                <div className="flex justify-between">
                    <dt className="text-text-muted">{t('sync.conflict.lines')}</dt>
                    <dd className="text-text-primary">{lines}</dd>
                </div>
            </dl>
        </div>
    );
}

interface ResolutionOptionProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    onClick: () => void;
}

function ResolutionOption({ icon, title, description, onClick }: ResolutionOptionProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                'w-full flex items-start gap-3 p-4',
                'bg-bg-secondary hover:bg-bg-tertiary',
                'border border-border hover:border-primary-500/50',
                'rounded-lg',
                'transition-colors',
                'text-left',
                'group'
            )}
        >
            <span className="text-text-muted group-hover:text-primary-500 transition-colors">{icon}</span>
            <div className="flex-1">
                <p className="font-medium text-text-primary">{title}</p>
                <p className="text-sm text-text-muted">{description}</p>
            </div>
            <Check className="h-5 w-5 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
    );
}

function formatDate(isoString: string): string {
    if (!isoString) return '-';
    const date = new Date(isoString);
    if (Number.isNaN(date.getTime())) return '-';
    return date.toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

interface ContentPreviewProps {
    localContent: string;
    serverContent: string;
}

interface DiffHunk {
    startLine: number;
    lines: Array<{ type: 'added' | 'removed' | 'context'; content: string; lineNum?: number }>;
}

function ContentPreview({ localContent, serverContent }: ContentPreviewProps) {
    const { t } = useTranslation();
    const [isExpanded, setIsExpanded] = useState(true); // Start expanded by default
    const CONTEXT_LINES = 3;

    // Generate diff hunks with context
    const diffHunks = useMemo((): DiffHunk[] => {
        const localLines = localContent.split('\n');
        const serverLines = serverContent.split('\n');

        // Find changed line indices
        const maxLen = Math.max(localLines.length, serverLines.length);
        const changes: Array<{ index: number; type: 'added' | 'removed' | 'modified' }> = [];

        for (let i = 0; i < maxLen; i++) {
            const local = localLines[i];
            const server = serverLines[i];

            if (local !== server) {
                if (local !== undefined && server !== undefined) {
                    changes.push({ index: i, type: 'modified' });
                } else if (local !== undefined) {
                    changes.push({ index: i, type: 'added' });
                } else {
                    changes.push({ index: i, type: 'removed' });
                }
            }
        }

        if (changes.length === 0) {
            return [];
        }

        // Group changes into hunks with context
        const hunks: DiffHunk[] = [];
        let currentHunk: DiffHunk | null = null;
        let lastChangeEnd = -1;

        for (const change of changes) {
            const contextStart = Math.max(0, change.index - CONTEXT_LINES);
            const contextEnd = Math.min(maxLen - 1, change.index + CONTEXT_LINES);

            // Check if this change should be part of the current hunk
            if (currentHunk && contextStart <= lastChangeEnd + 1) {
                // Extend current hunk - add context lines between last change and this one
                for (let i = lastChangeEnd + 1; i < change.index; i++) {
                    if (localLines[i] === serverLines[i]) {
                        currentHunk.lines.push({ type: 'context', content: localLines[i] ?? '', lineNum: i + 1 });
                    }
                }
            } else {
                // Start new hunk
                if (currentHunk) {
                    hunks.push(currentHunk);
                }
                currentHunk = { startLine: contextStart + 1, lines: [] };

                // Add leading context
                for (let i = contextStart; i < change.index; i++) {
                    currentHunk.lines.push({ type: 'context', content: localLines[i] ?? serverLines[i] ?? '', lineNum: i + 1 });
                }
            }

            // Add the changed lines
            if (change.type === 'modified') {
                currentHunk.lines.push({ type: 'removed', content: serverLines[change.index] ?? '', lineNum: change.index + 1 });
                currentHunk.lines.push({ type: 'added', content: localLines[change.index] ?? '', lineNum: change.index + 1 });
            } else if (change.type === 'added') {
                currentHunk.lines.push({ type: 'added', content: localLines[change.index] ?? '', lineNum: change.index + 1 });
            } else {
                currentHunk.lines.push({ type: 'removed', content: serverLines[change.index] ?? '', lineNum: change.index + 1 });
            }

            lastChangeEnd = contextEnd;

            // Add trailing context for this change (will be merged if next change is close)
            const nextChange = changes[changes.indexOf(change) + 1];
            const trailingEnd = nextChange ? Math.min(contextEnd, nextChange.index - CONTEXT_LINES - 1) : contextEnd;

            for (let i = change.index + 1; i <= trailingEnd; i++) {
                const line = localLines[i];
                if (line !== undefined && line === serverLines[i]) {
                    currentHunk.lines.push({ type: 'context', content: line, lineNum: i + 1 });
                }
            }
        }

        if (currentHunk) {
            hunks.push(currentHunk);
        }

        return hunks;
    }, [localContent, serverContent]);

    const totalChanges = diffHunks.reduce((acc, hunk) => acc + hunk.lines.filter((l) => l.type !== 'context').length, 0);

    return (
        <div className="border border-border rounded-lg overflow-hidden">
            <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between p-3 bg-bg-secondary hover:bg-bg-tertiary transition-colors"
            >
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-text-primary">{t('sync.conflict.previewContent')}</span>
                    {diffHunks.length > 0 && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-500">
                            {diffHunks.length} {diffHunks.length === 1 ? 'change' : 'changes'}
                        </span>
                    )}
                </div>
                {isExpanded ? <ChevronUp className="h-4 w-4 text-text-muted" /> : <ChevronDown className="h-4 w-4 text-text-muted" />}
            </button>

            {isExpanded && (
                <div className="border-t border-border">
                    <div className="max-h-72 overflow-auto bg-bg-primary">
                        {diffHunks.length === 0 ? (
                            <div className="p-4 text-center text-text-muted text-sm">{t('sync.conflict.noChanges')}</div>
                        ) : (
                            <div className="divide-y divide-border">
                                {diffHunks.map((hunk) => (
                                    <div key={`hunk-${hunk.startLine}`} className="relative">
                                        {/* Hunk header */}
                                        <div className="sticky top-0 px-3 py-1.5 bg-bg-tertiary text-xs text-text-muted font-mono border-b border-border">
                                            @@ Line {hunk.startLine} @@
                                        </div>
                                        {/* Hunk content */}
                                        <pre className="text-xs font-mono">
                                            {hunk.lines.map((line) => (
                                                <div
                                                    key={`${line.type}-${line.lineNum}-${line.content.slice(0, 20)}`}
                                                    className={cn(
                                                        'px-3 py-0.5 flex',
                                                        line.type === 'added' && 'bg-green-500/15',
                                                        line.type === 'removed' && 'bg-red-500/15',
                                                        line.type === 'context' && 'bg-transparent'
                                                    )}
                                                >
                                                    <span
                                                        className={cn(
                                                            'select-none w-4 flex-shrink-0 text-center',
                                                            line.type === 'added' && 'text-green-500',
                                                            line.type === 'removed' && 'text-red-500',
                                                            line.type === 'context' && 'text-text-muted'
                                                        )}
                                                    >
                                                        {line.type === 'added' ? '+' : line.type === 'removed' ? '-' : ' '}
                                                    </span>
                                                    <span
                                                        className={cn(
                                                            'flex-1 whitespace-pre-wrap break-all',
                                                            line.type === 'added' && 'text-green-400',
                                                            line.type === 'removed' && 'text-red-400',
                                                            line.type === 'context' && 'text-text-secondary'
                                                        )}
                                                    >
                                                        {line.content || ' '}
                                                    </span>
                                                </div>
                                            ))}
                                        </pre>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    {/* Summary footer */}
                    {totalChanges > 0 && (
                        <div className="px-3 py-2 bg-bg-secondary border-t border-border text-xs text-text-muted">
                            <span className="text-green-500">
                                +{diffHunks.reduce((acc, h) => acc + h.lines.filter((l) => l.type === 'added').length, 0)}
                            </span>
                            {' / '}
                            <span className="text-red-500">
                                -{diffHunks.reduce((acc, h) => acc + h.lines.filter((l) => l.type === 'removed').length, 0)}
                            </span>
                            {' lines'}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
