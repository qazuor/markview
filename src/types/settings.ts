export type Theme = 'dark' | 'light' | 'system';

export type PreviewStyle = 'github' | 'gitlab' | 'notion' | 'obsidian' | 'stackoverflow' | 'devto';

export type Language = 'en' | 'es';

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
}

export const DEFAULT_SETTINGS: Settings = {
    theme: 'system',
    previewStyle: 'github',
    editorFontSize: 14,
    previewFontSize: 16,
    fontFamily: 'JetBrains Mono',
    wordWrap: true,
    lineNumbers: true,
    minimap: false,
    syncScroll: true,
    autoSave: true,
    autoSaveInterval: 2000,
    formatOnSave: false,
    lintOnType: true,
    language: 'en'
};
