import { Modal } from '@/components/ui';
import { type DocumentVersion, deleteVersion, getVersions, updateVersionLabel } from '@/services/storage/versions';
import { cn } from '@/utils/cn';
import { Clock, Pencil, RotateCcw, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface VersionHistoryModalProps {
    isOpen: boolean;
    documentId: string;
    documentName: string;
    onClose: () => void;
    onRestore: (content: string) => void;
    onCompare?: (versionId: string) => void;
}

/**
 * Modal for viewing and managing document version history
 */
export function VersionHistoryModal({ isOpen, documentId, documentName, onClose, onRestore, onCompare }: VersionHistoryModalProps) {
    const { t } = useTranslation();
    const [versions, setVersions] = useState<DocumentVersion[]>([]);
    const [selectedVersion, setSelectedVersion] = useState<string | null>(null);
    const [editingLabel, setEditingLabel] = useState<string | null>(null);
    const [labelValue, setLabelValue] = useState('');

    // Load versions
    useEffect(() => {
        if (isOpen && documentId) {
            const loadedVersions = getVersions(documentId);
            setVersions(loadedVersions);
            setSelectedVersion(null);
        }
    }, [isOpen, documentId]);

    const handleRestore = useCallback(
        (version: DocumentVersion) => {
            const confirmed = window.confirm(t('versions.confirmRestore', { date: formatDate(version.createdAt) }));

            if (confirmed) {
                onRestore(version.content);
                onClose();
            }
        },
        [onRestore, onClose, t]
    );

    const handleDelete = useCallback(
        (versionId: string) => {
            const confirmed = window.confirm(t('versions.confirmDelete'));

            if (confirmed) {
                deleteVersion(documentId, versionId);
                setVersions(getVersions(documentId));
            }
        },
        [documentId, t]
    );

    const handleStartEdit = (version: DocumentVersion) => {
        setEditingLabel(version.id);
        setLabelValue(version.label ?? '');
    };

    const handleSaveLabel = (versionId: string) => {
        updateVersionLabel(documentId, versionId, labelValue);
        setVersions(getVersions(documentId));
        setEditingLabel(null);
    };

    const selectedVersionData = selectedVersion ? versions.find((v) => v.id === selectedVersion) : null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={t('versions.titleWithName', { documentName })} size="lg">
            <div className="flex h-[60vh]">
                {/* Version list */}
                <div className="w-1/3 border-r border-border overflow-y-auto">
                    {versions.length === 0 ? (
                        <div className="p-4 text-sm text-text-muted text-center">{t('versions.noVersions')}</div>
                    ) : (
                        <ul className="p-2 space-y-1">
                            {versions.map((version) => (
                                <li key={version.id}>
                                    <button
                                        type="button"
                                        onClick={() => setSelectedVersion(version.id)}
                                        className={cn(
                                            'w-full text-left px-3 py-2 rounded-md',
                                            'text-sm transition-colors',
                                            'hover:bg-bg-tertiary',
                                            selectedVersion === version.id && 'bg-bg-tertiary'
                                        )}
                                    >
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-4 w-4 text-text-muted shrink-0" />
                                            <div className="min-w-0 flex-1">
                                                {editingLabel === version.id ? (
                                                    <input
                                                        type="text"
                                                        value={labelValue}
                                                        onChange={(e) => setLabelValue(e.target.value)}
                                                        onBlur={() => handleSaveLabel(version.id)}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') handleSaveLabel(version.id);
                                                            if (e.key === 'Escape') setEditingLabel(null);
                                                        }}
                                                        className="w-full px-1 py-0.5 text-xs bg-bg-secondary border border-border rounded"
                                                        onClick={(e) => e.stopPropagation()}
                                                    />
                                                ) : (
                                                    <span className="font-medium truncate block">
                                                        {version.label || formatDate(version.createdAt)}
                                                    </span>
                                                )}
                                                <span className="text-xs text-text-muted">{formatBytes(version.size)}</span>
                                            </div>
                                        </div>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Preview / Actions */}
                <div className="flex-1 flex flex-col">
                    {selectedVersionData ? (
                        <>
                            {/* Actions bar */}
                            <div className="flex items-center justify-between px-4 py-2 border-b border-border">
                                <span className="text-sm text-text-muted">{formatDate(selectedVersionData.createdAt)}</span>
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => handleStartEdit(selectedVersionData)}
                                        className="p-1.5 text-text-muted hover:text-text-primary hover:bg-bg-tertiary rounded"
                                        title={t('versions.editLabel')}
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </button>
                                    {onCompare && (
                                        <button
                                            type="button"
                                            onClick={() => onCompare(selectedVersionData.id)}
                                            className="px-2 py-1 text-xs bg-bg-tertiary hover:bg-bg-secondary rounded transition-colors"
                                        >
                                            {t('versions.compare')}
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => handleRestore(selectedVersionData)}
                                        className="flex items-center gap-1 px-2 py-1 text-xs bg-primary-500 text-white hover:bg-primary-600 rounded transition-colors"
                                    >
                                        <RotateCcw className="h-3 w-3" />
                                        {t('versions.restore')}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleDelete(selectedVersionData.id)}
                                        className="p-1.5 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950 rounded"
                                        title={t('versions.deleteVersion')}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Content preview */}
                            <div className="flex-1 overflow-auto p-4">
                                <pre className="text-xs font-mono whitespace-pre-wrap text-text-secondary">
                                    {selectedVersionData.content}
                                </pre>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-text-muted text-sm">{t('versions.selectVersion')}</div>
                    )}
                </div>
            </div>
        </Modal>
    );
}

function formatDate(isoString: string): string {
    const date = new Date(isoString);
    return date.toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    return `${(bytes / 1024).toFixed(1)} KB`;
}
