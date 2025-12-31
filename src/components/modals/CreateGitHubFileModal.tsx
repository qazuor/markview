import { Modal, ModalFooter } from '@/components/ui/Modal';
import { createFile } from '@/services/github';
import { cn } from '@/utils/cn';
import { FileText, FolderOpen, GitBranch, Loader2, Plus } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface CreateGitHubFileModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (fileId: string, path: string, sha: string) => void;
    repoName: string;
    branch: string;
    currentPath?: string;
}

/**
 * Modal for creating a new file in a GitHub repository
 */
export function CreateGitHubFileModal({ isOpen, onClose, onSuccess, repoName, branch, currentPath = '' }: CreateGitHubFileModalProps) {
    const { t } = useTranslation();
    const [fileName, setFileName] = useState('');
    const [commitMessage, setCommitMessage] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Reset form and focus input when modal opens
    useEffect(() => {
        if (isOpen) {
            setFileName('');
            setCommitMessage('');
            setError(null);
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    // Update commit message when filename changes
    useEffect(() => {
        if (fileName) {
            setCommitMessage(t('github.createFile.defaultMessage', { fileName }));
        }
    }, [fileName, t]);

    const validateFileName = (name: string): string | null => {
        if (!name.trim()) {
            return t('github.createFile.invalidName');
        }

        // Check for valid markdown extension
        const lowerName = name.toLowerCase();
        if (!lowerName.endsWith('.md') && !lowerName.endsWith('.mdx')) {
            return t('github.createFile.mustBeMarkdown');
        }

        // Check for invalid characters
        if (/[<>:"|?*\\]/.test(name)) {
            return t('github.createFile.invalidName');
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

        if (!commitMessage.trim()) {
            setError(t('github.commit.messageRequired'));
            return;
        }

        setIsCreating(true);
        setError(null);

        try {
            // Construct full path
            const fullPath = currentPath ? `${currentPath}/${fileName}` : fileName;

            const result = await createFile(
                repoName,
                fullPath,
                '', // Empty content for new file
                commitMessage.trim(),
                branch
            );

            if (result.success && result.sha) {
                onSuccess(result.sha, fullPath, result.sha);
                onClose();
            } else {
                throw new Error(result.error || 'Failed to create file');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : t('github.createFile.error'));
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

    const displayPath = currentPath || '/';

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={t('github.createFile.title')} size="md">
            <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                    {/* Repository info */}
                    <div className="flex items-center gap-3 p-3 bg-bg-secondary rounded-lg">
                        <FileText className="h-5 w-5 text-text-muted flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                            <p className="font-medium text-text-primary truncate">{repoName}</p>
                        </div>
                        <div className="flex items-center gap-1.5 px-2 py-1 bg-bg-tertiary rounded text-xs text-text-secondary">
                            <GitBranch className="h-3 w-3" />
                            {branch}
                        </div>
                    </div>

                    {/* Current location */}
                    <div className="flex items-center gap-2 text-sm text-text-muted">
                        <FolderOpen className="h-4 w-4" />
                        <span>{t('github.createFile.location')}:</span>
                        <code className="px-2 py-0.5 bg-bg-secondary rounded text-text-primary">{displayPath}</code>
                    </div>

                    {/* File name input */}
                    <div>
                        <label htmlFor="file-name" className="block text-sm font-medium text-text-primary mb-2">
                            {t('github.createFile.fileName')}
                        </label>
                        <input
                            ref={inputRef}
                            id="file-name"
                            type="text"
                            value={fileName}
                            onChange={(e) => setFileName(e.target.value)}
                            onBlur={handleFileNameBlur}
                            onKeyDown={handleKeyDown}
                            placeholder={t('github.createFile.fileNamePlaceholder')}
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

                    {/* Commit message */}
                    <div>
                        <label htmlFor="commit-message" className="block text-sm font-medium text-text-primary mb-2">
                            {t('github.createFile.commitMessage')}
                        </label>
                        <input
                            id="commit-message"
                            type="text"
                            value={commitMessage}
                            onChange={(e) => setCommitMessage(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={t('github.commit.messagePlaceholder')}
                            className={cn(
                                'w-full px-3 py-2 rounded-md',
                                'bg-bg-secondary border border-border',
                                'text-text-primary placeholder:text-text-muted',
                                'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent'
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
                                {t('github.createFile.creating')}
                            </>
                        ) : (
                            <>
                                <Plus className="h-4 w-4" />
                                {t('github.createFile.create')}
                            </>
                        )}
                    </button>
                </ModalFooter>
            </form>
        </Modal>
    );
}
