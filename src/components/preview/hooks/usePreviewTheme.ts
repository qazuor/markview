import { useSettingsStore } from '@/stores/settingsStore';
import { useMemo } from 'react';

export type PreviewThemeClass =
    | 'preview-github'
    | 'preview-gitlab'
    | 'preview-notion'
    | 'preview-obsidian'
    | 'preview-stackoverflow'
    | 'preview-devto';

/**
 * Hook to get the current preview theme class based on settings
 */
export function usePreviewTheme(): { themeClass: PreviewThemeClass; isDark: boolean } {
    const { previewStyle, theme } = useSettingsStore();

    const isDark = useMemo(() => {
        if (theme === 'system') {
            if (typeof window !== 'undefined') {
                return window.matchMedia('(prefers-color-scheme: dark)').matches;
            }
            return false;
        }
        return theme === 'dark';
    }, [theme]);

    const themeClass = useMemo((): PreviewThemeClass => {
        switch (previewStyle) {
            case 'github':
                return 'preview-github';
            case 'gitlab':
                return 'preview-gitlab';
            case 'notion':
                return 'preview-notion';
            case 'obsidian':
                return 'preview-obsidian';
            case 'stackoverflow':
                return 'preview-stackoverflow';
            case 'devto':
                return 'preview-devto';
            default:
                return 'preview-github';
        }
    }, [previewStyle]);

    return { themeClass, isDark };
}
