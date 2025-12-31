import { Modal, ModalFooter } from '@/components/ui/Modal';
import { clearAllCaches, fileOperation } from '@/services/gdrive';
import { removeFile as deleteGitHubFile } from '@/services/github';
import { useDocumentStore } from '@/stores/documentStore';
import type { Document } from '@/types';
import { cn } from '@/utils/cn';
import { AlertTriangle, Cloud, HardDrive, Loader2, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface DeleteDocumentModalProps {
    isOpen: boolean;
    onClose: () => void;
    document: Document | null;
}

type DeleteOption = 'local' | 'cloud';

/**
 * Modal for deleting a document with option to delete from cloud
 */
export function DeleteDocumentModal({ isOpen, onClose, document }: DeleteDocumentModalProps) {
    const { t } = useTranslation();
    const deleteDocument = useDocumentStore((s) => s.deleteDocument);
    const [selectedOption, setSelectedOption] = useState<DeleteOption>('local');
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!document) return null;

    const isCloudDocument = document.source === 'github' || document.source === 'gdrive';
    const cloudName = document.source === 'github' ? 'GitHub' : 'Google Drive';

    const handleDelete = async () => {
        setIsDeleting(true);
        setError(null);

        try {
            // If deleting from cloud
            if (selectedOption === 'cloud' && isCloudDocument) {
                if (document.source === 'gdrive' && document.driveInfo) {
                    const result = await fileOperation({
                        operation: 'delete',
                        fileId: document.driveInfo.fileId
                    });

                    if (!result.success) {
                        throw new Error(result.error || t('deleteDocument.cloudError'));
                    }
                    clearAllCaches();
                } else if (document.source === 'github' && document.githubInfo) {
                    const { owner, repo, path, sha, branch } = document.githubInfo;
                    const result = await deleteGitHubFile({
                        repo: `${owner}/${repo}`,
                        path,
                        sha,
                        branch,
                        message: t('deleteDocument.defaultCommitMessage', { fileName: document.name })
                    });

                    if (!result.success) {
                        throw new Error(t('deleteDocument.cloudError'));
                    }
                }
            }

            // Always delete from local document store
            deleteDocument(document.id);
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : t('deleteDocument.error'));
        } finally {
            setIsDeleting(false);
        }
    };

    const handleClose = () => {
        setSelectedOption('local');
        setError(null);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title={t('deleteDocument.title')} size="md">
            <div className="space-y-4">
                {/* Warning banner */}
                <div className="flex items-start gap-3 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                        <p className="font-medium text-yellow-500">{t('deleteDocument.warning')}</p>
                    </div>
                </div>

                {/* File info */}
                <div className="p-4 bg-bg-secondary rounded-lg">
                    <p className="font-medium text-text-primary">{document.name}</p>
                    <p className="text-xs text-text-muted mt-1">
                        {document.source === 'local'
                            ? t('fileExplorer.source.local')
                            : document.source === 'github'
                              ? 'GitHub'
                              : 'Google Drive'}
                    </p>
                </div>

                {/* Delete options - only show for cloud documents */}
                {isCloudDocument && (
                    <div className="space-y-2">
                        <p className="text-sm font-medium text-text-primary">{t('deleteDocument.chooseOption')}</p>

                        {/* Local only option */}
                        <button
                            type="button"
                            onClick={() => setSelectedOption('local')}
                            className={cn(
                                'w-full flex items-start gap-3 p-3 rounded-lg border transition-colors text-left',
                                selectedOption === 'local'
                                    ? 'border-primary-500 bg-primary-500/10'
                                    : 'border-border hover:border-border-hover'
                            )}
                        >
                            <HardDrive
                                className={cn(
                                    'h-5 w-5 mt-0.5 flex-shrink-0',
                                    selectedOption === 'local' ? 'text-primary-500' : 'text-text-muted'
                                )}
                            />
                            <div>
                                <p className={cn('font-medium', selectedOption === 'local' ? 'text-primary-500' : 'text-text-primary')}>
                                    {t('deleteDocument.localOnly')}
                                </p>
                                <p className="text-xs text-text-muted mt-0.5">{t('deleteDocument.localOnlyDesc', { cloud: cloudName })}</p>
                            </div>
                        </button>

                        {/* Cloud delete option */}
                        <button
                            type="button"
                            onClick={() => setSelectedOption('cloud')}
                            className={cn(
                                'w-full flex items-start gap-3 p-3 rounded-lg border transition-colors text-left',
                                selectedOption === 'cloud' ? 'border-red-500 bg-red-500/10' : 'border-border hover:border-border-hover'
                            )}
                        >
                            <Cloud
                                className={cn(
                                    'h-5 w-5 mt-0.5 flex-shrink-0',
                                    selectedOption === 'cloud' ? 'text-red-500' : 'text-text-muted'
                                )}
                            />
                            <div>
                                <p className={cn('font-medium', selectedOption === 'cloud' ? 'text-red-500' : 'text-text-primary')}>
                                    {t('deleteDocument.alsoFromCloud', { cloud: cloudName })}
                                </p>
                                <p className="text-xs text-text-muted mt-0.5">
                                    {t('deleteDocument.alsoFromCloudDesc', { cloud: cloudName })}
                                </p>
                            </div>
                        </button>
                    </div>
                )}

                {/* Error message */}
                {error && <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-500">{error}</div>}
            </div>

            <ModalFooter>
                <button
                    type="button"
                    onClick={handleClose}
                    disabled={isDeleting}
                    className={cn(
                        'px-4 py-2 rounded-md',
                        'text-sm font-medium',
                        'text-text-secondary hover:text-text-primary',
                        'hover:bg-bg-tertiary',
                        'transition-colors',
                        'disabled:opacity-50'
                    )}
                >
                    {t('common.cancel')}
                </button>
                <button
                    type="button"
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className={cn(
                        'px-4 py-2 rounded-md',
                        'text-sm font-medium',
                        'bg-red-500 hover:bg-red-600 text-white',
                        'transition-colors',
                        'disabled:opacity-50 disabled:cursor-not-allowed',
                        'flex items-center gap-2'
                    )}
                >
                    {isDeleting ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            {t('deleteDocument.deleting')}
                        </>
                    ) : (
                        <>
                            <Trash2 className="h-4 w-4" />
                            {t('common.delete')}
                        </>
                    )}
                </button>
            </ModalFooter>
        </Modal>
    );
}
