/**
 * Auto-save service with debouncing
 */

import type { Document } from '@/types';
import { saveDocument } from './documents';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export interface AutoSaveCallbacks {
    onStatusChange?: (status: SaveStatus) => void;
    onSave?: (docId: string) => void;
    onError?: (error: string) => void;
}

interface AutoSaveTimer {
    timerId: ReturnType<typeof setTimeout> | null;
    docId: string;
}

const DEBOUNCE_DELAY = 2000; // 2 seconds

const timers = new Map<string, AutoSaveTimer>();

/**
 * Schedule an auto-save for a document
 */
export function scheduleAutoSave(doc: Document, callbacks?: AutoSaveCallbacks): void {
    const existing = timers.get(doc.id);

    // Cancel existing timer
    if (existing?.timerId) {
        clearTimeout(existing.timerId);
    }

    // Schedule new save
    const timerId = setTimeout(() => {
        performSave(doc, callbacks);
    }, DEBOUNCE_DELAY);

    timers.set(doc.id, { timerId, docId: doc.id });
}

/**
 * Cancel pending auto-save for a document
 */
export function cancelAutoSave(docId: string): void {
    const existing = timers.get(docId);
    if (existing?.timerId) {
        clearTimeout(existing.timerId);
    }
    timers.delete(docId);
}

/**
 * Cancel all pending auto-saves
 */
export function cancelAllAutoSaves(): void {
    for (const timer of timers.values()) {
        if (timer.timerId) {
            clearTimeout(timer.timerId);
        }
    }
    timers.clear();
}

/**
 * Perform immediate save
 */
export function immediateSave(doc: Document, callbacks?: AutoSaveCallbacks): boolean {
    // Cancel any pending auto-save
    cancelAutoSave(doc.id);

    // Perform save
    return performSave(doc, callbacks);
}

/**
 * Flush all pending saves immediately
 */
export function flushPendingSaves(documents: Map<string, Document>): void {
    for (const [docId, timer] of timers.entries()) {
        if (timer.timerId) {
            clearTimeout(timer.timerId);
            const doc = documents.get(docId);
            if (doc) {
                performSave(doc);
            }
        }
    }
    timers.clear();
}

/**
 * Check if there are pending saves
 */
export function hasPendingSaves(): boolean {
    return timers.size > 0;
}

/**
 * Get list of documents with pending saves
 */
export function getPendingSaveIds(): string[] {
    return Array.from(timers.keys());
}

// Internal: Perform the actual save
function performSave(doc: Document, callbacks?: AutoSaveCallbacks): boolean {
    callbacks?.onStatusChange?.('saving');

    const result = saveDocument(doc);

    if (result.success) {
        callbacks?.onStatusChange?.('saved');
        callbacks?.onSave?.(doc.id);

        // Reset to idle after delay
        setTimeout(() => {
            callbacks?.onStatusChange?.('idle');
        }, 2000);

        return true;
    }

    callbacks?.onStatusChange?.('error');
    callbacks?.onError?.(result.error ?? 'Unknown error');
    return false;
}
