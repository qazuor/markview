import {
    DEFAULT_EDITOR_FONT_SIZE,
    DEFAULT_PREVIEW_FONT_SIZE,
    DEFAULT_SETTINGS,
    type Language,
    MAX_FONT_SIZE,
    MIN_FONT_SIZE,
    type PreviewStyle,
    type Settings,
    type Theme,
    ZOOM_STEP
} from '@/types/settings';
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface SettingsState extends Settings {
    updateSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
    updateSettings: (settings: Partial<Settings>) => void;
    resetSettings: () => void;
    setTheme: (theme: Theme) => void;
    setPreviewStyle: (style: PreviewStyle) => void;
    setLanguage: (language: Language) => void;
    toggleSetting: (key: keyof Settings) => void;
    // Zoom functions
    zoomIn: () => void;
    zoomOut: () => void;
    resetZoom: () => void;
    zoomEditorIn: () => void;
    zoomEditorOut: () => void;
    resetEditorZoom: () => void;
    zoomPreviewIn: () => void;
    zoomPreviewOut: () => void;
    resetPreviewZoom: () => void;
    getZoomPercentage: () => number;
}

export const useSettingsStore = create<SettingsState>()(
    devtools(
        persist(
            (set) => ({
                ...DEFAULT_SETTINGS,

                updateSetting: (key, value) => {
                    set({ [key]: value });
                },

                updateSettings: (settings) => {
                    set(settings);
                },

                resetSettings: () => {
                    set(DEFAULT_SETTINGS);
                },

                setTheme: (theme) => {
                    set({ theme });
                },

                setPreviewStyle: (style) => {
                    set({ previewStyle: style });
                },

                setLanguage: (language) => {
                    set({ language });
                },

                toggleSetting: (key) => {
                    set((state) => {
                        const value = state[key];
                        if (typeof value === 'boolean') {
                            return { [key]: !value };
                        }
                        return {};
                    });
                },

                // Zoom both editor and preview together
                zoomIn: () => {
                    set((state) => ({
                        editorFontSize: Math.min(state.editorFontSize + ZOOM_STEP, MAX_FONT_SIZE),
                        previewFontSize: Math.min(state.previewFontSize + ZOOM_STEP, MAX_FONT_SIZE)
                    }));
                },

                zoomOut: () => {
                    set((state) => ({
                        editorFontSize: Math.max(state.editorFontSize - ZOOM_STEP, MIN_FONT_SIZE),
                        previewFontSize: Math.max(state.previewFontSize - ZOOM_STEP, MIN_FONT_SIZE)
                    }));
                },

                resetZoom: () => {
                    set({
                        editorFontSize: DEFAULT_EDITOR_FONT_SIZE,
                        previewFontSize: DEFAULT_PREVIEW_FONT_SIZE
                    });
                },

                // Editor-only zoom
                zoomEditorIn: () => {
                    set((state) => ({
                        editorFontSize: Math.min(state.editorFontSize + ZOOM_STEP, MAX_FONT_SIZE)
                    }));
                },

                zoomEditorOut: () => {
                    set((state) => ({
                        editorFontSize: Math.max(state.editorFontSize - ZOOM_STEP, MIN_FONT_SIZE)
                    }));
                },

                resetEditorZoom: () => {
                    set({ editorFontSize: DEFAULT_EDITOR_FONT_SIZE });
                },

                // Preview-only zoom
                zoomPreviewIn: () => {
                    set((state) => ({
                        previewFontSize: Math.min(state.previewFontSize + ZOOM_STEP, MAX_FONT_SIZE)
                    }));
                },

                zoomPreviewOut: () => {
                    set((state) => ({
                        previewFontSize: Math.max(state.previewFontSize - ZOOM_STEP, MIN_FONT_SIZE)
                    }));
                },

                resetPreviewZoom: () => {
                    set({ previewFontSize: DEFAULT_PREVIEW_FONT_SIZE });
                },

                // Get average zoom percentage
                getZoomPercentage: () => {
                    const state = useSettingsStore.getState();
                    const editorPercent = Math.round((state.editorFontSize / DEFAULT_EDITOR_FONT_SIZE) * 100);
                    const previewPercent = Math.round((state.previewFontSize / DEFAULT_PREVIEW_FONT_SIZE) * 100);
                    return Math.round((editorPercent + previewPercent) / 2);
                }
            }),
            {
                name: 'markview:settings'
            }
        ),
        { name: 'SettingsStore' }
    )
);
