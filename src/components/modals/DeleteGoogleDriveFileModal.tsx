import { Modal, ModalFooter } from '@/components/ui/Modal';
import { clearAllCaches, fileOperation } from '@/services/gdrive';
import { cn } from '@/utils/cn';
import { AlertTriangle, Loader2, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface DeleteGoogleDriveFileModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    fileName: string;
    fileId: string;
}

/**
 * Modal for confirming file deletion from Google Drive
 */
export function DeleteGoogleDriveFileModal({ isOpen, onClose, onSuccess, fileName, fileId }: DeleteGoogleDriveFileModalProps) {
    const { t } = useTranslation();
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        setIsDeleting(true);
        setError(null);

        try {
            const result = await fileOperation({
                operation: 'delete',
                fileId
            });

            if (result.success) {
                clearAllCaches();
                onSuccess();
                onClose();
            } else {
                throw new Error(result.error || 'Failed to delete file');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : t('gdrive.deleteFile.error'));
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={t('gdrive.deleteFile.title')} size="md">
            <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                    {/* Warning banner */}
                    <div className="flex items-start gap-3 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                        <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                        <div className="text-sm">
                            <p className="font-medium text-yellow-500">{t('gdrive.deleteFile.warning')}</p>
                            <p className="mt-1 text-text-secondary">{t('gdrive.deleteFile.movedToTrash')}</p>
                        </div>
                    </div>

                    {/* File info */}
                    <div className="p-4 bg-bg-secondary rounded-lg">
                        <p className="font-medium text-text-primary">{fileName}</p>
                        <p className="text-xs text-text-muted mt-1">Google Drive</p>
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
                                {t('gdrive.deleteFile.deleting')}
                            </>
                        ) : (
                            <>
                                <Trash2 className="h-4 w-4" />
                                {t('gdrive.deleteFile.delete')}
                            </>
                        )}
                    </button>
                </ModalFooter>
            </form>
        </Modal>
    );
}
