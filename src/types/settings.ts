export type Theme = 'dark' | 'light' | 'system';

export type PreviewStyle = 'github' | 'gitlab' | 'notion' | 'obsidian' | 'stackoverflow' | 'devto';

export type Language = 'en' | 'es';

// Zoom constants
export const MIN_FONT_SIZE = 8;
export const MAX_FONT_SIZE = 32;
export const ZOOM_STEP = 2;
export const DEFAULT_EDITOR_FONT_SIZE = 14;
export const DEFAULT_PREVIEW_FONT_SIZE = 16;

export type ConflictResolution = 'ask' | 'local' | 'server';

export interface Settings {
    // Appearance
    theme: Theme;
    previewStyle: PreviewStyle;
    editorFontSize: number;
    previewFontSize: number;
    fontFamily: string;

    // Editor
    wordWrap: boolean;
    lineNumbers: boolean;
    minimap: boolean;
    syncScroll: boolean;

    // Behavior
    autoSave: boolean;
    autoSaveInterval: number;
    formatOnSave: boolean;
    lintOnType: boolean;

    // Language
    language: Language;

    // Cloud Sync
    cloudSyncEnabled: boolean;
    cloudSyncDebounceMs: number;
    cloudSyncOnAppOpen: boolean;
    cloudSyncConflictResolution: ConflictResolution;
}

export const DEFAULT_SETTINGS: Settings = {
    theme: 'light',
    previewStyle: 'github',
    editorFontSize: DEFAULT_EDITOR_FONT_SIZE,
    previewFontSize: DEFAULT_PREVIEW_FONT_SIZE,
    fontFamily: 'Fira Code',
    wordWrap: true,
    lineNumbers: true,
    minimap: true,
    syncScroll: true,
    autoSave: true,
    autoSaveInterval: 2000,
    formatOnSave: false,
    lintOnType: true,
    language: 'en',
    cloudSyncEnabled: true,
    cloudSyncDebounceMs: 2000,
    cloudSyncOnAppOpen: true,
    cloudSyncConflictResolution: 'ask'
};
