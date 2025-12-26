/**
 * Session persistence for app state restoration
 */

import { STORAGE_KEYS } from './keys';
import { getItem, setItem } from './localStorage';

export interface SessionState {
    openTabs: string[];
    activeDocumentId: string | null;
    sidebarCollapsed: boolean;
    sidebarWidth: number;
    activePanel: string;
    windowWidth?: number;
    windowHeight?: number;
    savedAt: string;
}

const DEFAULT_SESSION: SessionState = {
    openTabs: [],
    activeDocumentId: null,
    sidebarCollapsed: false,
    sidebarWidth: 260,
    activePanel: 'files',
    savedAt: new Date().toISOString()
};

/**
 * Save current session state
 */
export function saveSession(session: Partial<SessionState>): boolean {
    const existing = loadSession();
    const updated: SessionState = {
        ...existing,
        ...session,
        savedAt: new Date().toISOString()
    };

    const result = setItem(STORAGE_KEYS.SESSION, updated);
    return result.success;
}

/**
 * Load session state
 */
export function loadSession(): SessionState {
    const result = getItem<SessionState>(STORAGE_KEYS.SESSION);
    if (!result.success || !result.data) {
        return DEFAULT_SESSION;
    }
    return result.data;
}

/**
 * Clear session state
 */
export function clearSession(): void {
    setItem(STORAGE_KEYS.SESSION, DEFAULT_SESSION);
}

/**
 * Save open tabs
 */
export function saveOpenTabs(tabIds: string[]): void {
    saveSession({ openTabs: tabIds });
}

/**
 * Save active document
 */
export function saveActiveDocument(docId: string | null): void {
    saveSession({ activeDocumentId: docId });
}

/**
 * Save sidebar state
 */
export function saveSidebarState(collapsed: boolean, width: number): void {
    saveSession({ sidebarCollapsed: collapsed, sidebarWidth: width });
}

/**
 * Save active panel
 */
export function saveActivePanel(panel: string): void {
    saveSession({ activePanel: panel });
}

/**
 * Check if session exists
 */
export function hasSession(): boolean {
    const result = getItem<SessionState>(STORAGE_KEYS.SESSION);
    return result.success && result.data !== undefined && result.data.openTabs.length > 0;
}

/**
 * Register beforeunload handler to save session
 */
export function registerSessionSaveHandler(getSession: () => Partial<SessionState>): () => void {
    const handler = () => {
        saveSession(getSession());
    };

    window.addEventListener('beforeunload', handler);

    return () => {
        window.removeEventListener('beforeunload', handler);
    };
}
