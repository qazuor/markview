import { saveFile } from '@/services/github';
import { useDocumentStore } from '@/stores/documentStore';
import type { Document } from '@/types';
import { useCallback, useState } from 'react';

interface UseGitHubSaveOptions {
    onSuccess?: (newSha: string) => void;
    onError?: (error: Error) => void;
    onConflict?: () => void;
}

interface UseGitHubSaveReturn {
    saveToGitHub: (document: Document, commitMessage: string) => Promise<boolean>;
    isSaving: boolean;
    error: Error | null;
    showCommitModal: boolean;
    pendingDocument: Document | null;
    openCommitModal: (document: Document) => void;
    closeCommitModal: () => void;
    confirmCommit: (message: string) => Promise<void>;
}

/**
 * Hook for saving documents to GitHub
 * Handles the commit flow including the commit modal
 */
export function useGitHubSave(options: UseGitHubSaveOptions = {}): UseGitHubSaveReturn {
    const { onSuccess, onError, onConflict } = options;
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [showCommitModal, setShowCommitModal] = useState(false);
    const [pendingDocument, setPendingDocument] = useState<Document | null>(null);

    const saveToGitHub = useCallback(
        async (document: Document, commitMessage: string): Promise<boolean> => {
            if (!document.githubInfo) {
                setError(new Error('Document is not from GitHub'));
                return false;
            }

            setIsSaving(true);
            setError(null);

            try {
                const { owner, repo, path, sha, branch } = document.githubInfo;
                const fullRepo = `${owner}/${repo}`;

                const result = await saveFile({
                    repo: fullRepo,
                    path,
                    content: document.content,
                    message: commitMessage,
                    sha,
                    branch
                });

                if (result.success && result.sha) {
                    // Update the document with new SHA
                    // The document store will handle the sync status update
                    const store = useDocumentStore.getState();
                    const currentDoc = store.documents.get(document.id);
                    if (currentDoc?.githubInfo) {
                        const newDocs = new Map(store.documents);
                        newDocs.set(document.id, {
                            ...currentDoc,
                            githubInfo: {
                                ...currentDoc.githubInfo,
                                sha: result.sha
                            },
                            syncStatus: 'synced'
                        });
                        useDocumentStore.setState({ documents: newDocs });
                    }

                    onSuccess?.(result.sha);
                    return true;
                }

                throw new Error(result.error || 'Failed to commit');
            } catch (err) {
                const error = err instanceof Error ? err : new Error('Unknown error');

                // Check for conflict
                if (error.message.includes('Conflict') || error.message.includes('409')) {
                    onConflict?.();
                } else {
                    onError?.(error);
                }

                setError(error);
                return false;
            } finally {
                setIsSaving(false);
            }
        },
        [onSuccess, onError, onConflict]
    );

    const openCommitModal = useCallback((document: Document) => {
        setPendingDocument(document);
        setShowCommitModal(true);
        setError(null);
    }, []);

    const closeCommitModal = useCallback(() => {
        setShowCommitModal(false);
        setPendingDocument(null);
        setError(null);
    }, []);

    const confirmCommit = useCallback(
        async (message: string) => {
            if (!pendingDocument) return;

            const success = await saveToGitHub(pendingDocument, message);
            if (success) {
                closeCommitModal();
            }
        },
        [pendingDocument, saveToGitHub, closeCommitModal]
    );

    return {
        saveToGitHub,
        isSaving,
        error,
        showCommitModal,
        pendingDocument,
        openCommitModal,
        closeCommitModal,
        confirmCommit
    };
}
