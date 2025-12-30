/**
 * Conflict Resolution Service
 * Handles detection and resolution of sync conflicts
 */

import type { SyncConflict, SyncDocument } from '@/types/sync';

export interface ConflictResolutionResult {
    resolvedDocument: SyncDocument;
    resolution: 'local' | 'server' | 'both';
}

/**
 * Detect if there's a conflict between local and server versions
 */
export function detectConflict(localDoc: { syncVersion?: number; updatedAt: string | Date }, serverDoc: SyncDocument): boolean {
    const localVersion = localDoc.syncVersion ?? 0;
    const serverVersion = serverDoc.syncVersion;

    // Conflict if local version is behind server version
    // This means the server has changes we don't have
    if (localVersion < serverVersion) {
        const localUpdated = new Date(localDoc.updatedAt).getTime();
        const serverUpdated = new Date(serverDoc.updatedAt).getTime();

        // Only a conflict if local was modified after server sync
        // (meaning we have local changes that would be overwritten)
        return localUpdated > serverUpdated;
    }

    return false;
}

/**
 * Create a conflict object for UI display
 */
export function createConflict(localDoc: SyncDocument, serverDoc: SyncDocument): SyncConflict {
    return {
        documentId: localDoc.id,
        localDocument: localDoc,
        serverDocument: serverDoc
    };
}

/**
 * Resolve conflict by keeping local version
 */
export function resolveWithLocal(localDoc: SyncDocument, serverDoc: SyncDocument): ConflictResolutionResult {
    return {
        resolvedDocument: {
            ...localDoc,
            // Increment version to push over server
            syncVersion: serverDoc.syncVersion + 1
        },
        resolution: 'local'
    };
}

/**
 * Resolve conflict by keeping server version
 */
export function resolveWithServer(serverDoc: SyncDocument): ConflictResolutionResult {
    return {
        resolvedDocument: serverDoc,
        resolution: 'server'
    };
}

/**
 * Resolve conflict by keeping both (creates a copy)
 */
export function resolveWithBoth(_localDoc: SyncDocument, serverDoc: SyncDocument): ConflictResolutionResult {
    // Keep local as the main document, server becomes the resolved one
    // The caller should create a copy of the local document
    return {
        resolvedDocument: serverDoc,
        resolution: 'both'
    };
}

/**
 * Generate a merged document name for "keep both" resolution
 */
export function generateConflictCopyName(originalName: string): string {
    const timestamp = new Date().toISOString().slice(0, 10);
    const baseName = originalName.replace(/\s*\(conflict.*\)$/i, '');
    return `${baseName} (conflict ${timestamp})`;
}

/**
 * Compare two documents to determine which is newer
 */
export function compareDocuments(
    doc1: { updatedAt: string | Date; syncVersion?: number },
    doc2: { updatedAt: string | Date; syncVersion?: number }
): 'first' | 'second' | 'equal' {
    const version1 = doc1.syncVersion ?? 0;
    const version2 = doc2.syncVersion ?? 0;

    if (version1 !== version2) {
        return version1 > version2 ? 'first' : 'second';
    }

    const time1 = new Date(doc1.updatedAt).getTime();
    const time2 = new Date(doc2.updatedAt).getTime();

    if (time1 === time2) return 'equal';
    return time1 > time2 ? 'first' : 'second';
}

/**
 * Calculate difference statistics between two document contents
 */
export function calculateDiff(
    localContent: string,
    serverContent: string
): {
    localLines: number;
    serverLines: number;
    addedLines: number;
    removedLines: number;
    changedPercentage: number;
} {
    const localLines = localContent.split('\n');
    const serverLines = serverContent.split('\n');

    const localSet = new Set(localLines);
    const serverSet = new Set(serverLines);

    let addedLines = 0;
    let removedLines = 0;

    for (const line of localLines) {
        if (!serverSet.has(line)) {
            addedLines++;
        }
    }

    for (const line of serverLines) {
        if (!localSet.has(line)) {
            removedLines++;
        }
    }

    const totalLines = Math.max(localLines.length, serverLines.length);
    const changedLines = addedLines + removedLines;
    const changedPercentage = totalLines > 0 ? Math.round((changedLines / totalLines) * 100) : 0;

    return {
        localLines: localLines.length,
        serverLines: serverLines.length,
        addedLines,
        removedLines,
        changedPercentage
    };
}

export const conflictResolver = {
    detect: detectConflict,
    create: createConflict,
    resolveWithLocal,
    resolveWithServer,
    resolveWithBoth,
    generateCopyName: generateConflictCopyName,
    compare: compareDocuments,
    calculateDiff
};
