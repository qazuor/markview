/**
 * Auto-save hook for documents
 */

import { formatMarkdown } from '@/services/markdown/formatter';
import { type SaveStatus, cancelAutoSave, immediateSave, scheduleAutoSave } from '@/services/storage/autoSave';
import { useDocumentStore } from '@/stores/documentStore';
import { useSettingsStore } from '@/stores/settingsStore';
import type { Document } from '@/types';
import { useCallback, useEffect, useRef, useState } from 'react';

interface UseAutoSaveOptions {
    enabled?: boolean;
    onSave?: (docId: string) => void;
    onError?: (error: string) => void;
}

interface UseAutoSaveReturn {
    status: SaveStatus;
    lastSaved: Date | null;
    save: () => void;
    isSaving: boolean;
}

export function useAutoSave(document: Document | null, options: UseAutoSaveOptions = {}): UseAutoSaveReturn {
    const { enabled = true, onSave, onError } = options;

    const [status, setStatus] = useState<SaveStatus>('idle');
    const [lastSaved, setLastSaved] = useState<Date | null>(null);

    const autoSaveEnabled = useSettingsStore((s) => s.autoSave);
    const formatOnSave = useSettingsStore((s) => s.formatOnSave);
    const updateContent = useDocumentStore((s) => s.updateContent);
    const docRef = useRef(document);
    docRef.current = document;

    // Schedule auto-save on content change
    useEffect(() => {
        if (!enabled || !autoSaveEnabled || !document?.isModified) {
            return;
        }

        scheduleAutoSave(document, {
            onStatusChange: setStatus,
            onSave: (docId) => {
                setLastSaved(new Date());
                onSave?.(docId);
            },
            onError
        });

        return () => {
            cancelAutoSave(document.id);
        };
    }, [enabled, autoSaveEnabled, document, onSave, onError]);

    // Manual save with optional formatting
    const save = useCallback(async () => {
        const doc = docRef.current;
        if (!doc) return;

        let docToSave = doc;

        // Format on save if enabled
        if (formatOnSave && doc.content) {
            try {
                setStatus('saving');
                const formattedContent = await formatMarkdown(doc.content);

                // Only update if content changed
                if (formattedContent !== doc.content) {
                    updateContent(doc.id, formattedContent);
                    docToSave = { ...doc, content: formattedContent };
                }
            } catch (error) {
                console.error('Format on save failed:', error);
            }
        }

        const success = immediateSave(docToSave, {
            onStatusChange: setStatus,
            onSave: (docId) => {
                setLastSaved(new Date());
                onSave?.(docId);
            },
            onError
        });

        if (success) {
            setLastSaved(new Date());
        }
    }, [onSave, onError, formatOnSave, updateContent]);

    return {
        status,
        lastSaved,
        save,
        isSaving: status === 'saving'
    };
}
