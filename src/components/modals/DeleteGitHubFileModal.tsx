import { Modal, ModalFooter } from '@/components/ui/Modal';
import { removeFile } from '@/services/github';
import { cn } from '@/utils/cn';
import { AlertTriangle, GitBranch, Loader2, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface DeleteGitHubFileModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    fileName: string;
    filePath: string;
    repoName: string;
    branch: string;
    sha: string;
}

/**
 * Modal for confirming file deletion from GitHub
 */
export function DeleteGitHubFileModal({
    isOpen,
    onClose,
    onSuccess,
    fileName,
    filePath,
    repoName,
    branch,
    sha
}: DeleteGitHubFileModalProps) {
    const { t } = useTranslation();
    const [commitMessage, setCommitMessage] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Set default message when modal opens
    useEffect(() => {
        if (isOpen) {
            setCommitMessage(t('github.deleteFile.defaultMessage', { fileName }));
            setError(null);
        }
    }, [isOpen, fileName, t]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!commitMessage.trim()) {
            setError(t('github.commit.messageRequired'));
            return;
        }

        setIsDeleting(true);
        setError(null);

        try {
            const result = await removeFile({
                repo: repoName,
                path: filePath,
                message: commitMessage.trim(),
                sha,
                branch
            });

            if (result.success) {
                onSuccess();
                onClose();
            } else {
                throw new Error('Failed to delete file');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : t('github.deleteFile.error'));
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={t('github.deleteFile.title')} size="md">
            <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                    {/* Warning banner */}
                    <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                        <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                        <div className="text-sm">
                            <p className="font-medium text-red-500">{t('github.deleteFile.warning')}</p>
                            <p className="mt-1 text-text-secondary">{t('github.deleteFile.cannotUndo')}</p>
                        </div>
                    </div>

                    {/* File info */}
                    <div className="p-4 bg-bg-secondary rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-text-primary">{fileName}</span>
                            <div className="flex items-center gap-1.5 px-2 py-1 bg-bg-tertiary rounded text-xs text-text-secondary">
                                <GitBranch className="h-3 w-3" />
                                {branch}
                            </div>
                        </div>
                        <p className="text-sm text-text-muted font-mono truncate">{filePath}</p>
                        <p className="text-xs text-text-muted mt-1">{repoName}</p>
                    </div>

                    {/* Commit message */}
                    <div>
                        <label htmlFor="delete-commit-message" className="block text-sm font-medium text-text-primary mb-2">
                            {t('github.deleteFile.commitMessage')}
                        </label>
                        <input
                            id="delete-commit-message"
                            type="text"
                            value={commitMessage}
                            onChange={(e) => setCommitMessage(e.target.value)}
                            placeholder={t('github.commit.messagePlaceholder')}
                            className={cn(
                                'w-full px-3 py-2 rounded-md',
                                'bg-bg-secondary border border-border',
                                'text-text-primary placeholder:text-text-muted',
                                'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
                                error && 'border-red-500 focus:ring-red-500'
                            )}
                            disabled={isDeleting}
                        />
                    </div>

                    {/* Error message */}
                    {error && <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-500">{error}</div>}
                </div>

                <ModalFooter>
                    <button
                        type="button"
                        onClick={onClose}
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
                        type="submit"
                        disabled={isDeleting || !commitMessage.trim()}
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
                                {t('github.deleteFile.deleting')}
                            </>
                        ) : (
                            <>
                                <Trash2 className="h-4 w-4" />
                                {t('github.deleteFile.delete')}
                            </>
                        )}
                    </button>
                </ModalFooter>
            </form>
        </Modal>
    );
}
