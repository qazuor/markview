/**
 * Storage key constants for localStorage
 * Using const assertions for type safety
 */

const STORAGE_PREFIX = 'markview' as const;

export const STORAGE_KEYS = {
    // Documents
    DOCUMENTS: `${STORAGE_PREFIX}:documents`,
    DOCUMENT_PREFIX: `${STORAGE_PREFIX}:doc:`,

    // Settings
    SETTINGS: `${STORAGE_PREFIX}:settings`,
    THEME: `${STORAGE_PREFIX}:theme`,

    // UI State
    UI_STATE: `${STORAGE_PREFIX}:ui`,
    SIDEBAR_STATE: `${STORAGE_PREFIX}:sidebar`,

    // Session
    SESSION: `${STORAGE_PREFIX}:session`,
    ACTIVE_DOCUMENT: `${STORAGE_PREFIX}:active`,
    OPEN_TABS: `${STORAGE_PREFIX}:tabs`,

    // Versions
    VERSIONS_PREFIX: `${STORAGE_PREFIX}:versions:`,

    // GitHub
    GITHUB_TOKEN: `${STORAGE_PREFIX}:github:token`,
    GITHUB_REPOS: `${STORAGE_PREFIX}:github:repos`
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];

/**
 * Get document-specific storage key
 */
export function getDocumentKey(docId: string): string {
    return `${STORAGE_KEYS.DOCUMENT_PREFIX}${docId}`;
}

/**
 * Get version-specific storage key
 */
export function getVersionsKey(docId: string): string {
    return `${STORAGE_KEYS.VERSIONS_PREFIX}${docId}`;
}
