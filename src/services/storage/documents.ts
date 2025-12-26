/**
 * Document persistence service
 */

import type { Document } from '@/types';
import { STORAGE_KEYS, getDocumentKey } from './keys';
import { getItem, getKeysByPrefix, removeItem, setItem } from './localStorage';
import { canStore, estimateSize } from './quota';

export interface StoredDocument {
    id: string;
    name: string;
    content: string;
    createdAt: string;
    updatedAt: string;
    isManuallyNamed: boolean;
    cursorPosition?: {
        line: number;
        column: number;
    };
    scrollPosition?: {
        top: number;
        left: number;
    };
}

export interface DocumentListItem {
    id: string;
    name: string;
    updatedAt: string;
    size: number;
}

/**
 * Save a document to localStorage
 */
export function saveDocument(doc: Document): { success: boolean; error?: string } {
    const storedDoc: StoredDocument = {
        id: doc.id,
        name: doc.name,
        content: doc.content,
        createdAt: doc.createdAt.toISOString(),
        updatedAt: new Date().toISOString(),
        isManuallyNamed: doc.isManuallyNamed
    };

    const size = estimateSize(storedDoc);
    if (!canStore(size)) {
        return { success: false, error: 'Storage quota exceeded' };
    }

    const result = setItem(getDocumentKey(doc.id), storedDoc);
    if (!result.success) {
        return { success: false, error: result.error };
    }

    // Update document index
    updateDocumentIndex(doc.id, doc.name, doc.content.length);

    return { success: true };
}

/**
 * Load a document from localStorage
 */
export function loadDocument(docId: string): StoredDocument | null {
    const result = getItem<StoredDocument>(getDocumentKey(docId));
    if (!result.success || !result.data) {
        return null;
    }
    return result.data;
}

/**
 * Delete a document from localStorage
 */
export function deleteDocument(docId: string): { success: boolean; error?: string } {
    // Remove document
    const result = removeItem(getDocumentKey(docId));
    if (!result.success) {
        return { success: false, error: result.error };
    }

    // Update index
    removeFromDocumentIndex(docId);

    return { success: true };
}

/**
 * Get list of all stored documents
 */
export function getDocumentList(): DocumentListItem[] {
    const result = getItem<Record<string, DocumentListItem>>(STORAGE_KEYS.DOCUMENTS);
    if (!result.success || !result.data) {
        return [];
    }

    // Sort by updatedAt descending
    return Object.values(result.data).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

/**
 * Check if a document exists
 */
export function documentExists(docId: string): boolean {
    const result = getItem<StoredDocument>(getDocumentKey(docId));
    return result.success && result.data !== undefined;
}

/**
 * Get count of stored documents
 */
export function getDocumentCount(): number {
    const keys = getKeysByPrefix(STORAGE_KEYS.DOCUMENT_PREFIX);
    return keys.length;
}

/**
 * Save cursor position for a document
 */
export function saveCursorPosition(docId: string, line: number, column: number): void {
    const doc = loadDocument(docId);
    if (!doc) return;

    doc.cursorPosition = { line, column };
    setItem(getDocumentKey(docId), doc);
}

/**
 * Save scroll position for a document
 */
export function saveScrollPosition(docId: string, top: number, left: number): void {
    const doc = loadDocument(docId);
    if (!doc) return;

    doc.scrollPosition = { top, left };
    setItem(getDocumentKey(docId), doc);
}

// Internal: Update document index
function updateDocumentIndex(docId: string, name: string, size: number): void {
    const result = getItem<Record<string, DocumentListItem>>(STORAGE_KEYS.DOCUMENTS);
    const index = result.data ?? {};

    index[docId] = {
        id: docId,
        name,
        updatedAt: new Date().toISOString(),
        size
    };

    setItem(STORAGE_KEYS.DOCUMENTS, index);
}

// Internal: Remove from document index
function removeFromDocumentIndex(docId: string): void {
    const result = getItem<Record<string, DocumentListItem>>(STORAGE_KEYS.DOCUMENTS);
    if (!result.data) return;

    const index = result.data;
    delete index[docId];

    setItem(STORAGE_KEYS.DOCUMENTS, index);
}

/**
 * Convert stored document to Document type
 */
export function toDocument(stored: StoredDocument): Document {
    return {
        id: stored.id,
        name: stored.name,
        content: stored.content,
        createdAt: new Date(stored.createdAt),
        updatedAt: new Date(stored.updatedAt),
        isModified: false,
        isManuallyNamed: stored.isManuallyNamed,
        source: 'local',
        cursor: stored.cursorPosition ?? { line: 1, column: 1 },
        scroll: { line: 1, percentage: 0 }
    };
}

/**
 * Load all documents from storage
 */
export function loadAllDocuments(): Document[] {
    const list = getDocumentList();
    const documents: Document[] = [];

    for (const item of list) {
        const stored = loadDocument(item.id);
        if (stored) {
            documents.push(toDocument(stored));
        }
    }

    return documents;
}
