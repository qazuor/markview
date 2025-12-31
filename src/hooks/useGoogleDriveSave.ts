import { clearAllCaches, fileOperation } from '@/services/gdrive';
import { useDocumentStore } from '@/stores/documentStore';
import type { Document } from '@/types';
import { useCallback, useEffect, useRef, useState } from 'react';

interface UseGoogleDriveSaveOptions {
    onSuccess?: (fileId: string) => void;
    onError?: (error: Error) => void;
    autoSaveDelay?: number; // Delay in ms before auto-saving (0 = disabled)
}

interface UseGoogleDriveSaveReturn {
    saveToGoogleDrive: (document: Document) => Promise<boolean>;
    isSaving: boolean;
    error: Error | null;
}

/**
 * Hook for saving documents to Google Drive
 * Supports both manual save and auto-save functionality
 */
export function useGoogleDriveSave(options: UseGoogleDriveSaveOptions = {}): UseGoogleDriveSaveReturn {
    const { onSuccess, onError, autoSaveDelay = 0 } = options;
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
    const pendingDocRef = useRef<Document | null>(null);

    const saveToGoogleDrive = useCallback(
        async (document: Document): Promise<boolean> => {
            if (!document.driveInfo) {
                const err = new Error('Document is not from Google Drive');
                setError(err);
                onError?.(err);
                return false;
            }

            // Prevent concurrent saves
            if (isSaving) {
                return false;
            }

            setIsSaving(true);
            setError(null);

            // Update sync status to syncing
            useDocumentStore.getState().setSyncStatus(document.id, 'syncing');

            try {
                const result = await fileOperation({
                    operation: 'update',
                    fileId: document.driveInfo.fileId,
                    content: document.content
                });

                if (result.success) {
                    // Update the document store sync status and hash
                    const store = useDocumentStore.getState();
                    const currentDoc = store.documents.get(document.id);
                    if (currentDoc?.driveInfo) {
                        const newDocs = new Map(store.documents);
                        // Calculate new hash for the saved content
                        let hash = 0;
                        for (let i = 0; i < document.content.length; i++) {
                            const char = document.content.charCodeAt(i);
                            hash = (hash << 5) - hash + char;
                            hash = hash & hash;
                        }
                        newDocs.set(document.id, {
                            ...currentDoc,
                            syncStatus: 'synced',
                            originalContentHash: hash.toString(36)
                        });
                        useDocumentStore.setState({ documents: newDocs });
                    }

                    // Clear caches to refresh file list
                    clearAllCaches();

                    onSuccess?.(document.driveInfo.fileId);
                    return true;
                }

                throw new Error(result.error || 'Failed to save');
            } catch (err) {
                const error = err instanceof Error ? err : new Error('Unknown error');
                onError?.(error);
                setError(error);

                // Set error status
                useDocumentStore.getState().setSyncStatus(document.id, 'error');

                return false;
            } finally {
                setIsSaving(false);
            }
        },
        [isSaving, onSuccess, onError]
    );

    // Auto-save functionality
    useEffect(() => {
        if (autoSaveDelay <= 0) return;

        const unsubscribe = useDocumentStore.subscribe((state, prevState) => {
            // Find documents that changed to 'cloud-pending' status
            for (const [id, doc] of state.documents) {
                const prevDoc = prevState.documents.get(id);

                // Check if this is a GDrive document that just became cloud-pending
                if (
                    doc.source === 'gdrive' &&
                    doc.driveInfo &&
                    doc.syncStatus === 'cloud-pending' &&
                    prevDoc?.syncStatus !== 'cloud-pending'
                ) {
                    // Clear any existing timer
                    if (autoSaveTimerRef.current) {
                        clearTimeout(autoSaveTimerRef.current);
                    }

                    // Store the document for saving
                    pendingDocRef.current = doc;

                    // Schedule auto-save
                    autoSaveTimerRef.current = setTimeout(async () => {
                        const currentDoc = pendingDocRef.current;
                        if (currentDoc) {
                            // Get the latest version of the document
                            const latestDoc = useDocumentStore.getState().documents.get(currentDoc.id);
                            if (latestDoc && latestDoc.syncStatus === 'cloud-pending') {
                                await saveToGoogleDrive(latestDoc);
                            }
                        }
                        pendingDocRef.current = null;
                        autoSaveTimerRef.current = null;
                    }, autoSaveDelay);
                }
            }
        });

        return () => {
            unsubscribe();
            if (autoSaveTimerRef.current) {
                clearTimeout(autoSaveTimerRef.current);
            }
        };
    }, [autoSaveDelay, saveToGoogleDrive]);

    return {
        saveToGoogleDrive,
        isSaving,
        error
    };
}
