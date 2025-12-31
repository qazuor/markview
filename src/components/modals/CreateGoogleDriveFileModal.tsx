import { GDriveFolderSelector } from '@/components/gdrive';
import { Modal, ModalFooter } from '@/components/ui/Modal';
import { clearAllCaches, fileOperation } from '@/services/gdrive';
import { cn } from '@/utils/cn';
import { FileText, Loader2, Plus } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface CreateGoogleDriveFileModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (fileId: string, name: string) => void;
    currentFolderId?: string;
    currentFolderName?: string;
}

/**
 * Modal for creating a new file in Google Drive
 */
export function CreateGoogleDriveFileModal({
    isOpen,
    onClose,
    onSuccess,
    currentFolderId = 'root',
    currentFolderName
}: CreateGoogleDriveFileModalProps) {
    const { t } = useTranslation();
    const [fileName, setFileName] = useState('');
    const [selectedFolderId, setSelectedFolderId] = useState(currentFolderId);
    const [selectedFolderName, setSelectedFolderName] = useState(currentFolderName || t('gdrive.root'));
    const [isCreating, setIsCreating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Reset form and focus input when modal opens
    useEffect(() => {
        if (isOpen) {
            setFileName('');
            setSelectedFolderId(currentFolderId);
            setSelectedFolderName(currentFolderName || t('gdrive.root'));
            setError(null);
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen, currentFolderId, currentFolderName, t]);

    const validateFileName = (name: string): string | null => {
        if (!name.trim()) {
            return t('gdrive.createFile.invalidName');
        }

        // Check for valid markdown extension
        const lowerName = name.toLowerCase();
        if (!lowerName.endsWith('.md') && !lowerName.endsWith('.mdx')) {
            return t('gdrive.createFile.mustBeMarkdown');
        }

        // Check for invalid characters
        if (/[<>:"|?*\\]/.test(name)) {
            return t('gdrive.createFile.invalidName');
        }

        return null;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const validationError = validateFileName(fileName);
        if (validationError) {
            setError(validationError);
            return;
        }

        setIsCreating(true);
        setError(null);

        try {
            const result = await fileOperation({
                operation: 'create',
                name: fileName.trim(),
                content: '',
                parentId: selectedFolderId !== 'root' ? selectedFolderId : undefined,
                mimeType: 'text/markdown'
            });

            if (result.success && result.file) {
                clearAllCaches();
                onSuccess(result.file.id, result.file.name);
                onClose();
            } else {
                throw new Error(result.error || 'Failed to create file');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : t('gdrive.createFile.error'));
        } finally {
            setIsCreating(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    // Auto-add .md extension if needed
    const handleFileNameBlur = () => {
        const name = fileName.trim();
        if (name && !name.toLowerCase().endsWith('.md') && !name.toLowerCase().endsWith('.mdx')) {
            setFileName(`${name}.md`);
        }
    };

    const handleFolderSelect = (folderId: string, folderName: string) => {
        setSelectedFolderId(folderId);
        setSelectedFolderName(folderName);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={t('gdrive.createFile.title')} size="md">
            <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                    {/* Google Drive info */}
                    <div className="flex items-center gap-3 p-3 bg-bg-secondary rounded-lg">
                        <FileText className="h-5 w-5 text-text-muted flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                            <p className="font-medium text-text-primary">Google Drive</p>
                        </div>
                    </div>

                    {/* Folder selector */}
                    <div>
                        <span className="block text-sm font-medium text-text-primary mb-2">{t('gdrive.createFile.location')}</span>
                        <GDriveFolderSelector
                            selectedFolderId={selectedFolderId}
                            selectedFolderName={selectedFolderName}
                            onSelect={handleFolderSelect}
                        />
                    </div>

                    {/* File name input */}
                    <div>
                        <label htmlFor="gdrive-file-name" className="block text-sm font-medium text-text-primary mb-2">
                            {t('gdrive.createFile.fileName')}
                        </label>
                        <input
                            ref={inputRef}
                            id="gdrive-file-name"
                            type="text"
                            value={fileName}
                            onChange={(e) => setFileName(e.target.value)}
                            onBlur={handleFileNameBlur}
                            onKeyDown={handleKeyDown}
                            placeholder={t('gdrive.createFile.fileNamePlaceholder')}
                            className={cn(
                                'w-full px-3 py-2 rounded-md',
                                'bg-bg-secondary border border-border',
                                'text-text-primary placeholder:text-text-muted',
                                'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
                                error && 'border-red-500 focus:ring-red-500'
                            )}
                            disabled={isCreating}
                        />
                    </div>

                    {/* Error message */}
                    {error && <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-500">{error}</div>}
                </div>

                <ModalFooter>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isCreating}
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
                        disabled={isCreating || !fileName.trim()}
                        className={cn(
                            'px-4 py-2 rounded-md',
                            'text-sm font-medium',
                            'bg-primary-500 hover:bg-primary-600 text-white',
                            'transition-colors',
                            'disabled:opacity-50 disabled:cursor-not-allowed',
                            'flex items-center gap-2'
                        )}
                    >
                        {isCreating ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                {t('gdrive.createFile.creating')}
                            </>
                        ) : (
                            <>
                                <Plus className="h-4 w-4" />
                                {t('gdrive.createFile.create')}
                            </>
                        )}
                    </button>
                </ModalFooter>
            </form>
        </Modal>
    );
}
