import { DEFAULT_SETTINGS, type Language, type PreviewStyle, type Settings, type Theme } from '@/types/settings';
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
                }
            }),
            {
                name: 'markview:settings'
            }
        ),
        { name: 'SettingsStore' }
    )
);
