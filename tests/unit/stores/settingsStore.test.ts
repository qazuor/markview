import { useSettingsStore } from '@/stores/settingsStore';
import {
    DEFAULT_EDITOR_FONT_SIZE,
    DEFAULT_PREVIEW_FONT_SIZE,
    DEFAULT_SETTINGS,
    MAX_FONT_SIZE,
    MIN_FONT_SIZE,
    ZOOM_STEP
} from '@/types/settings';
import { act } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

describe('settingsStore', () => {
    beforeEach(() => {
        useSettingsStore.setState(DEFAULT_SETTINGS);
    });

    afterEach(() => {
        localStorage.clear();
    });

    describe('updateSetting', () => {
        it('should update a single setting', () => {
            const { updateSetting } = useSettingsStore.getState();

            act(() => {
                updateSetting('theme', 'dark');
            });

            expect(useSettingsStore.getState().theme).toBe('dark');
        });

        it('should update multiple different settings', () => {
            const { updateSetting } = useSettingsStore.getState();

            act(() => {
                updateSetting('autoSave', false);
                updateSetting('lineNumbers', false);
            });

            const state = useSettingsStore.getState();
            expect(state.autoSave).toBe(false);
            expect(state.lineNumbers).toBe(false);
        });
    });

    describe('updateSettings', () => {
        it('should update multiple settings at once', () => {
            const { updateSettings } = useSettingsStore.getState();

            act(() => {
                updateSettings({
                    theme: 'dark',
                    previewStyle: 'github',
                    autoSave: false
                });
            });

            const state = useSettingsStore.getState();
            expect(state.theme).toBe('dark');
            expect(state.previewStyle).toBe('github');
            expect(state.autoSave).toBe(false);
        });
    });

    describe('resetSettings', () => {
        it('should reset all settings to defaults', () => {
            const { updateSettings, resetSettings } = useSettingsStore.getState();

            act(() => {
                updateSettings({
                    theme: 'dark',
                    editorFontSize: 20,
                    autoSave: false
                });
                resetSettings();
            });

            const state = useSettingsStore.getState();
            expect(state.theme).toBe(DEFAULT_SETTINGS.theme);
            expect(state.editorFontSize).toBe(DEFAULT_SETTINGS.editorFontSize);
            expect(state.autoSave).toBe(DEFAULT_SETTINGS.autoSave);
        });
    });

    describe('setTheme', () => {
        it('should set theme to dark', () => {
            const { setTheme } = useSettingsStore.getState();

            act(() => {
                setTheme('dark');
            });

            expect(useSettingsStore.getState().theme).toBe('dark');
        });

        it('should set theme to light', () => {
            const { setTheme } = useSettingsStore.getState();

            act(() => {
                setTheme('light');
            });

            expect(useSettingsStore.getState().theme).toBe('light');
        });

        it('should set theme to auto', () => {
            const { setTheme } = useSettingsStore.getState();

            act(() => {
                setTheme('auto');
            });

            expect(useSettingsStore.getState().theme).toBe('auto');
        });
    });

    describe('setPreviewStyle', () => {
        it('should change preview style', () => {
            const { setPreviewStyle } = useSettingsStore.getState();

            act(() => {
                setPreviewStyle('github');
            });

            expect(useSettingsStore.getState().previewStyle).toBe('github');
        });
    });

    describe('setLanguage', () => {
        it('should change language', () => {
            const { setLanguage } = useSettingsStore.getState();

            act(() => {
                setLanguage('es');
            });

            expect(useSettingsStore.getState().language).toBe('es');
        });
    });

    describe('toggleSetting', () => {
        it('should toggle boolean setting', () => {
            const { toggleSetting } = useSettingsStore.getState();

            const initialValue = useSettingsStore.getState().autoSave;

            act(() => {
                toggleSetting('autoSave');
            });

            expect(useSettingsStore.getState().autoSave).toBe(!initialValue);
        });

        it('should toggle multiple times', () => {
            const { toggleSetting } = useSettingsStore.getState();

            act(() => {
                toggleSetting('lineNumbers');
                toggleSetting('lineNumbers');
            });

            expect(useSettingsStore.getState().lineNumbers).toBe(DEFAULT_SETTINGS.lineNumbers);
        });

        it('should not affect non-boolean settings', () => {
            const { toggleSetting } = useSettingsStore.getState();

            const initialTheme = useSettingsStore.getState().theme;

            act(() => {
                // @ts-expect-error Testing non-boolean setting behavior
                toggleSetting('theme');
            });

            expect(useSettingsStore.getState().theme).toBe(initialTheme);
        });
    });

    describe('Zoom - Both Editor and Preview', () => {
        describe('zoomIn', () => {
            it('should increase both font sizes by zoom step', () => {
                const { zoomIn } = useSettingsStore.getState();

                act(() => {
                    zoomIn();
                });

                const state = useSettingsStore.getState();
                expect(state.editorFontSize).toBe(DEFAULT_EDITOR_FONT_SIZE + ZOOM_STEP);
                expect(state.previewFontSize).toBe(DEFAULT_PREVIEW_FONT_SIZE + ZOOM_STEP);
            });

            it('should not exceed max font size', () => {
                const { updateSettings, zoomIn } = useSettingsStore.getState();

                act(() => {
                    updateSettings({
                        editorFontSize: MAX_FONT_SIZE,
                        previewFontSize: MAX_FONT_SIZE
                    });
                    zoomIn();
                });

                const state = useSettingsStore.getState();
                expect(state.editorFontSize).toBe(MAX_FONT_SIZE);
                expect(state.previewFontSize).toBe(MAX_FONT_SIZE);
            });
        });

        describe('zoomOut', () => {
            it('should decrease both font sizes by zoom step', () => {
                const { zoomOut } = useSettingsStore.getState();

                act(() => {
                    zoomOut();
                });

                const state = useSettingsStore.getState();
                expect(state.editorFontSize).toBe(DEFAULT_EDITOR_FONT_SIZE - ZOOM_STEP);
                expect(state.previewFontSize).toBe(DEFAULT_PREVIEW_FONT_SIZE - ZOOM_STEP);
            });

            it('should not go below min font size', () => {
                const { updateSettings, zoomOut } = useSettingsStore.getState();

                act(() => {
                    updateSettings({
                        editorFontSize: MIN_FONT_SIZE,
                        previewFontSize: MIN_FONT_SIZE
                    });
                    zoomOut();
                });

                const state = useSettingsStore.getState();
                expect(state.editorFontSize).toBe(MIN_FONT_SIZE);
                expect(state.previewFontSize).toBe(MIN_FONT_SIZE);
            });
        });

        describe('resetZoom', () => {
            it('should reset both font sizes to defaults', () => {
                const { updateSettings, resetZoom } = useSettingsStore.getState();

                act(() => {
                    updateSettings({
                        editorFontSize: 20,
                        previewFontSize: 22
                    });
                    resetZoom();
                });

                const state = useSettingsStore.getState();
                expect(state.editorFontSize).toBe(DEFAULT_EDITOR_FONT_SIZE);
                expect(state.previewFontSize).toBe(DEFAULT_PREVIEW_FONT_SIZE);
            });
        });
    });

    describe('Zoom - Editor Only', () => {
        describe('zoomEditorIn', () => {
            it('should increase editor font size only', () => {
                const { zoomEditorIn } = useSettingsStore.getState();

                act(() => {
                    zoomEditorIn();
                });

                const state = useSettingsStore.getState();
                expect(state.editorFontSize).toBe(DEFAULT_EDITOR_FONT_SIZE + ZOOM_STEP);
                expect(state.previewFontSize).toBe(DEFAULT_PREVIEW_FONT_SIZE);
            });

            it('should not exceed max font size', () => {
                const { updateSetting, zoomEditorIn } = useSettingsStore.getState();

                act(() => {
                    updateSetting('editorFontSize', MAX_FONT_SIZE);
                    zoomEditorIn();
                });

                expect(useSettingsStore.getState().editorFontSize).toBe(MAX_FONT_SIZE);
            });
        });

        describe('zoomEditorOut', () => {
            it('should decrease editor font size only', () => {
                const { zoomEditorOut } = useSettingsStore.getState();

                act(() => {
                    zoomEditorOut();
                });

                const state = useSettingsStore.getState();
                expect(state.editorFontSize).toBe(DEFAULT_EDITOR_FONT_SIZE - ZOOM_STEP);
                expect(state.previewFontSize).toBe(DEFAULT_PREVIEW_FONT_SIZE);
            });

            it('should not go below min font size', () => {
                const { updateSetting, zoomEditorOut } = useSettingsStore.getState();

                act(() => {
                    updateSetting('editorFontSize', MIN_FONT_SIZE);
                    zoomEditorOut();
                });

                expect(useSettingsStore.getState().editorFontSize).toBe(MIN_FONT_SIZE);
            });
        });

        describe('resetEditorZoom', () => {
            it('should reset editor font size to default', () => {
                const { updateSetting, resetEditorZoom } = useSettingsStore.getState();

                act(() => {
                    updateSetting('editorFontSize', 20);
                    resetEditorZoom();
                });

                expect(useSettingsStore.getState().editorFontSize).toBe(DEFAULT_EDITOR_FONT_SIZE);
            });
        });
    });

    describe('Zoom - Preview Only', () => {
        describe('zoomPreviewIn', () => {
            it('should increase preview font size only', () => {
                const { zoomPreviewIn } = useSettingsStore.getState();

                act(() => {
                    zoomPreviewIn();
                });

                const state = useSettingsStore.getState();
                expect(state.previewFontSize).toBe(DEFAULT_PREVIEW_FONT_SIZE + ZOOM_STEP);
                expect(state.editorFontSize).toBe(DEFAULT_EDITOR_FONT_SIZE);
            });

            it('should not exceed max font size', () => {
                const { updateSetting, zoomPreviewIn } = useSettingsStore.getState();

                act(() => {
                    updateSetting('previewFontSize', MAX_FONT_SIZE);
                    zoomPreviewIn();
                });

                expect(useSettingsStore.getState().previewFontSize).toBe(MAX_FONT_SIZE);
            });
        });

        describe('zoomPreviewOut', () => {
            it('should decrease preview font size only', () => {
                const { zoomPreviewOut } = useSettingsStore.getState();

                act(() => {
                    zoomPreviewOut();
                });

                const state = useSettingsStore.getState();
                expect(state.previewFontSize).toBe(DEFAULT_PREVIEW_FONT_SIZE - ZOOM_STEP);
                expect(state.editorFontSize).toBe(DEFAULT_EDITOR_FONT_SIZE);
            });

            it('should not go below min font size', () => {
                const { updateSetting, zoomPreviewOut } = useSettingsStore.getState();

                act(() => {
                    updateSetting('previewFontSize', MIN_FONT_SIZE);
                    zoomPreviewOut();
                });

                expect(useSettingsStore.getState().previewFontSize).toBe(MIN_FONT_SIZE);
            });
        });

        describe('resetPreviewZoom', () => {
            it('should reset preview font size to default', () => {
                const { updateSetting, resetPreviewZoom } = useSettingsStore.getState();

                act(() => {
                    updateSetting('previewFontSize', 22);
                    resetPreviewZoom();
                });

                expect(useSettingsStore.getState().previewFontSize).toBe(DEFAULT_PREVIEW_FONT_SIZE);
            });
        });
    });

    describe('getZoomPercentage', () => {
        it('should return 100% for default settings', () => {
            const { getZoomPercentage } = useSettingsStore.getState();

            const percentage = getZoomPercentage();
            expect(percentage).toBe(100);
        });

        it('should calculate average zoom percentage', () => {
            const { updateSettings, getZoomPercentage } = useSettingsStore.getState();

            act(() => {
                updateSettings({
                    editorFontSize: DEFAULT_EDITOR_FONT_SIZE * 1.5,
                    previewFontSize: DEFAULT_PREVIEW_FONT_SIZE * 1.5
                });
            });

            const percentage = getZoomPercentage();
            expect(percentage).toBe(150);
        });

        it('should handle different zoom levels for editor and preview', () => {
            const { updateSettings, getZoomPercentage } = useSettingsStore.getState();

            act(() => {
                updateSettings({
                    editorFontSize: DEFAULT_EDITOR_FONT_SIZE * 2, // 200%
                    previewFontSize: DEFAULT_PREVIEW_FONT_SIZE // 100%
                });
            });

            const percentage = getZoomPercentage();
            expect(percentage).toBe(150); // (200 + 100) / 2
        });
    });
});
