import { Modal, ModalFooter } from '@/components/ui/Modal';
import { cn } from '@/utils/cn';
import { GitBranch, GitCommit, Loader2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface CommitModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCommit: (message: string) => Promise<void>;
    fileName: string;
    repoName: string;
    branch: string;
    filePath: string;
}

/**
 * Modal for entering commit message when saving to GitHub
 */
export function CommitModal({ isOpen, onClose, onCommit, fileName, repoName, branch, filePath }: CommitModalProps) {
    const { t } = useTranslation();
    const [message, setMessage] = useState('');
    const [isCommitting, setIsCommitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    // Set default message and focus input when modal opens
    useEffect(() => {
        if (isOpen) {
            setMessage(t('github.commit.defaultMessage', { fileName }));
            setError(null);
            setTimeout(() => inputRef.current?.select(), 100);
        }
    }, [isOpen, fileName, t]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!message.trim()) {
            setError(t('github.commit.messageRequired'));
            return;
        }

        setIsCommitting(true);
        setError(null);

        try {
            await onCommit(message.trim());
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : t('github.commit.error'));
        } finally {
            setIsCommitting(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        // Ctrl+Enter to submit
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={t('github.commit.title')} size="md">
            <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                    {/* File info */}
                    <div className="flex items-center gap-3 p-3 bg-bg-secondary rounded-lg">
                        <GitCommit className="h-5 w-5 text-text-muted flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                            <p className="font-medium text-text-primary truncate">{fileName}</p>
                            <p className="text-sm text-text-muted truncate">{repoName}</p>
                        </div>
                        <div className="flex items-center gap-1.5 px-2 py-1 bg-bg-tertiary rounded text-xs text-text-secondary">
                            <GitBranch className="h-3 w-3" />
                            {branch}
                        </div>
                    </div>

                    {/* File path */}
                    <div className="text-xs text-text-muted font-mono bg-bg-secondary px-3 py-2 rounded">{filePath}</div>

                    {/* Commit message */}
                    <div>
                        <label htmlFor="commit-message" className="block text-sm font-medium text-text-primary mb-2">
                            {t('github.commit.messageLabel')}
                        </label>
                        <textarea
                            ref={inputRef}
                            id="commit-message"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={t('github.commit.messagePlaceholder')}
                            rows={3}
                            className={cn(
                                'w-full px-3 py-2 rounded-md',
                                'bg-bg-secondary border border-border',
                                'text-text-primary placeholder:text-text-muted',
                                'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
                                'resize-none',
                                error && 'border-red-500 focus:ring-red-500'
                            )}
                            disabled={isCommitting}
                        />
                        <div className="flex items-center justify-between mt-1">
                            <span className={cn('text-xs', message.length > 72 ? 'text-yellow-500' : 'text-text-muted')}>
                                {message.length} {t('github.commit.characters')}
                                {message.length > 72 && ` (${t('github.commit.recommended72')})`}
                            </span>
                            <span className="text-xs text-text-muted">{t('github.commit.ctrlEnterToCommit')}</span>
                        </div>
                    </div>

                    {/* Error message */}
                    {error && <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-500">{error}</div>}
                </div>

                <ModalFooter>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isCommitting}
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
                        disabled={isCommitting || !message.trim()}
                        className={cn(
                            'px-4 py-2 rounded-md',
                            'text-sm font-medium',
                            'bg-primary-500 hover:bg-primary-600 text-white',
                            'transition-colors',
                            'disabled:opacity-50 disabled:cursor-not-allowed',
                            'flex items-center gap-2'
                        )}
                    >
                        {isCommitting ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                {t('github.commit.committing')}
                            </>
                        ) : (
                            <>
                                <GitCommit className="h-4 w-4" />
                                {t('github.commit.commit')}
                            </>
                        )}
                    </button>
                </ModalFooter>
            </form>
        </Modal>
    );
}
