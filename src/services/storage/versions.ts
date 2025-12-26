/**
 * Document version history management
 */

import { getVersionsKey } from './keys';
import { getItem, removeItem, setItem } from './localStorage';
import { canStore, estimateSize } from './quota';

const MAX_VERSIONS_PER_DOCUMENT = 10;

export interface DocumentVersion {
    id: string;
    docId: string;
    content: string;
    label?: string;
    createdAt: string;
    size: number;
}

export interface VersionList {
    docId: string;
    versions: DocumentVersion[];
}

/**
 * Generate unique version ID
 */
function generateVersionId(): string {
    return `v_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Save a new version of a document
 */
export function saveVersion(
    docId: string,
    content: string,
    label?: string
): { success: boolean; version?: DocumentVersion; error?: string } {
    const version: DocumentVersion = {
        id: generateVersionId(),
        docId,
        content,
        label,
        createdAt: new Date().toISOString(),
        size: content.length
    };

    const size = estimateSize(version);
    if (!canStore(size)) {
        return { success: false, error: 'Storage quota exceeded' };
    }

    // Get existing versions
    const versions = getVersions(docId);

    // Add new version at the beginning
    versions.unshift(version);

    // Keep only max versions
    if (versions.length > MAX_VERSIONS_PER_DOCUMENT) {
        versions.splice(MAX_VERSIONS_PER_DOCUMENT);
    }

    // Save
    const result = setItem(getVersionsKey(docId), { docId, versions });
    if (!result.success) {
        return { success: false, error: result.error };
    }

    return { success: true, version };
}

/**
 * Get all versions for a document
 */
export function getVersions(docId: string): DocumentVersion[] {
    const result = getItem<VersionList>(getVersionsKey(docId));
    if (!result.success || !result.data) {
        return [];
    }
    return result.data.versions;
}

/**
 * Get a specific version
 */
export function getVersion(docId: string, versionId: string): DocumentVersion | null {
    const versions = getVersions(docId);
    return versions.find((v) => v.id === versionId) ?? null;
}

/**
 * Delete a specific version
 */
export function deleteVersion(docId: string, versionId: string): boolean {
    const versions = getVersions(docId);
    const index = versions.findIndex((v) => v.id === versionId);

    if (index === -1) {
        return false;
    }

    versions.splice(index, 1);

    if (versions.length === 0) {
        removeItem(getVersionsKey(docId));
    } else {
        setItem(getVersionsKey(docId), { docId, versions });
    }

    return true;
}

/**
 * Delete all versions for a document
 */
export function deleteAllVersions(docId: string): boolean {
    const result = removeItem(getVersionsKey(docId));
    return result.success;
}

/**
 * Update version label
 */
export function updateVersionLabel(docId: string, versionId: string, label: string): boolean {
    const versions = getVersions(docId);
    const version = versions.find((v) => v.id === versionId);

    if (!version) {
        return false;
    }

    version.label = label;
    setItem(getVersionsKey(docId), { docId, versions });
    return true;
}

/**
 * Get version count for a document
 */
export function getVersionCount(docId: string): number {
    return getVersions(docId).length;
}

/**
 * Check if document has versions
 */
export function hasVersions(docId: string): boolean {
    return getVersionCount(docId) > 0;
}

export interface VersionDiff {
    type: 'added' | 'removed' | 'unchanged';
    line: string;
    lineNumber: number;
}

/**
 * Simple line-by-line diff between two contents
 */
export function diffVersions(oldContent: string, newContent: string): VersionDiff[] {
    const oldLines = oldContent.split('\n');
    const newLines = newContent.split('\n');
    const result: VersionDiff[] = [];

    const maxLength = Math.max(oldLines.length, newLines.length);

    for (let i = 0; i < maxLength; i++) {
        const oldLine = oldLines[i];
        const newLine = newLines[i];

        if (oldLine === undefined) {
            result.push({
                type: 'added',
                line: newLine ?? '',
                lineNumber: i + 1
            });
        } else if (newLine === undefined) {
            result.push({
                type: 'removed',
                line: oldLine,
                lineNumber: i + 1
            });
        } else if (oldLine !== newLine) {
            result.push({
                type: 'removed',
                line: oldLine,
                lineNumber: i + 1
            });
            result.push({
                type: 'added',
                line: newLine,
                lineNumber: i + 1
            });
        } else {
            result.push({
                type: 'unchanged',
                line: oldLine,
                lineNumber: i + 1
            });
        }
    }

    return result;
}
