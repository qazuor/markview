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

        it('should set theme to system', () => {
            const { setTheme } = useSettingsStore.getState();

            act(() => {
                setTheme('system');
            });

            expect(useSettingsStore.getState().theme).toBe('system');
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
                // Testing that passing a non-boolean setting key doesn't crash
                (toggleSetting as (key: string) => void)('theme');
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

    describe('Sync Functions', () => {
        describe('setSyncStatus', () => {
            it('should set sync status to syncing', () => {
                const { setSyncStatus } = useSettingsStore.getState();

                act(() => {
                    setSyncStatus('syncing');
                });

                expect(useSettingsStore.getState().syncStatus).toBe('syncing');
            });

            it('should set sync status to synced', () => {
                const { setSyncStatus } = useSettingsStore.getState();

                act(() => {
                    setSyncStatus('synced');
                });

                expect(useSettingsStore.getState().syncStatus).toBe('synced');
            });

            it('should set sync status to error', () => {
                const { setSyncStatus } = useSettingsStore.getState();

                act(() => {
                    setSyncStatus('error');
                });

                expect(useSettingsStore.getState().syncStatus).toBe('error');
            });

            it('should set sync status to offline', () => {
                const { setSyncStatus } = useSettingsStore.getState();

                act(() => {
                    setSyncStatus('offline');
                });

                expect(useSettingsStore.getState().syncStatus).toBe('offline');
            });
        });

        describe('setSyncError', () => {
            it('should set sync error and change status to error', () => {
                const { setSyncError } = useSettingsStore.getState();

                act(() => {
                    setSyncError('Connection failed');
                });

                const state = useSettingsStore.getState();
                expect(state.syncError).toBe('Connection failed');
                expect(state.syncStatus).toBe('error');
            });

            it('should clear sync error and set status to idle', () => {
                const { setSyncError } = useSettingsStore.getState();

                act(() => {
                    setSyncError('Some error');
                    setSyncError(null);
                });

                const state = useSettingsStore.getState();
                expect(state.syncError).toBeNull();
                expect(state.syncStatus).toBe('idle');
            });
        });

        describe('markSynced', () => {
            it('should set synced status and clear error', () => {
                const { setSyncError, markSynced } = useSettingsStore.getState();

                act(() => {
                    setSyncError('Previous error');
                    markSynced();
                });

                const state = useSettingsStore.getState();
                expect(state.syncStatus).toBe('synced');
                expect(state.syncError).toBeNull();
                expect(state.pendingChanges).toBe(false);
                expect(state.lastSyncedAt).toBeDefined();
            });

            it('should set lastSyncedAt to current time', () => {
                const { markSynced } = useSettingsStore.getState();
                const before = new Date().toISOString();

                act(() => {
                    markSynced();
                });

                const after = new Date().toISOString();
                const lastSyncedAt = useSettingsStore.getState().lastSyncedAt;

                expect(lastSyncedAt).toBeDefined();
                expect(lastSyncedAt && lastSyncedAt >= before).toBe(true);
                expect(lastSyncedAt && lastSyncedAt <= after).toBe(true);
            });
        });

        describe('markPendingChanges', () => {
            it('should set pendingChanges to true', () => {
                const { markPendingChanges } = useSettingsStore.getState();

                act(() => {
                    markPendingChanges();
                });

                expect(useSettingsStore.getState().pendingChanges).toBe(true);
            });
        });

        describe('mergeServerSettings', () => {
            it('should merge server settings with local state', () => {
                const { updateSettings, mergeServerSettings } = useSettingsStore.getState();

                act(() => {
                    updateSettings({ theme: 'dark', autoSave: false });
                    mergeServerSettings({ theme: 'light', previewStyle: 'github' });
                });

                const state = useSettingsStore.getState();
                expect(state.theme).toBe('light'); // Server value takes precedence
                expect(state.previewStyle).toBe('github'); // Server value added
                expect(state.autoSave).toBe(false); // Local value preserved
                expect(state.pendingChanges).toBe(false); // Cleared after merge
            });

            it('should preserve local values not in server settings', () => {
                const { updateSettings, mergeServerSettings } = useSettingsStore.getState();

                act(() => {
                    updateSettings({ lineNumbers: false, minimap: false });
                    mergeServerSettings({ theme: 'dark' });
                });

                const state = useSettingsStore.getState();
                expect(state.lineNumbers).toBe(false);
                expect(state.minimap).toBe(false);
                expect(state.theme).toBe('dark');
            });
        });

        describe('getSettingsForSync', () => {
            it('should return only settings (not sync state)', () => {
                const { updateSettings, getSettingsForSync } = useSettingsStore.getState();

                act(() => {
                    updateSettings({ theme: 'dark', autoSave: false });
                });

                const settings = getSettingsForSync();

                expect(settings.theme).toBe('dark');
                expect(settings.autoSave).toBe(false);
                // Should not include sync state
                expect((settings as Record<string, unknown>).syncStatus).toBeUndefined();
                expect((settings as Record<string, unknown>).lastSyncedAt).toBeUndefined();
                expect((settings as Record<string, unknown>).syncError).toBeUndefined();
                expect((settings as Record<string, unknown>).pendingChanges).toBeUndefined();
            });

            it('should include all settings fields', () => {
                const { getSettingsForSync } = useSettingsStore.getState();

                const settings = getSettingsForSync();

                expect(settings).toHaveProperty('theme');
                expect(settings).toHaveProperty('previewStyle');
                expect(settings).toHaveProperty('editorFontSize');
                expect(settings).toHaveProperty('previewFontSize');
                expect(settings).toHaveProperty('fontFamily');
                expect(settings).toHaveProperty('wordWrap');
                expect(settings).toHaveProperty('lineNumbers');
                expect(settings).toHaveProperty('minimap');
                expect(settings).toHaveProperty('syncScroll');
                expect(settings).toHaveProperty('autoSave');
                expect(settings).toHaveProperty('autoSaveInterval');
                expect(settings).toHaveProperty('formatOnSave');
                expect(settings).toHaveProperty('lintOnType');
                expect(settings).toHaveProperty('language');
                expect(settings).toHaveProperty('cloudSyncEnabled');
                expect(settings).toHaveProperty('cloudSyncDebounceMs');
                expect(settings).toHaveProperty('cloudSyncOnAppOpen');
                expect(settings).toHaveProperty('cloudSyncConflictResolution');
            });
        });
    });

    describe('pendingChanges flag', () => {
        it('should set pendingChanges when updateSetting is called', () => {
            const { updateSetting } = useSettingsStore.getState();

            act(() => {
                updateSetting('theme', 'dark');
            });

            expect(useSettingsStore.getState().pendingChanges).toBe(true);
        });

        it('should set pendingChanges when updateSettings is called', () => {
            const { updateSettings } = useSettingsStore.getState();

            act(() => {
                updateSettings({ autoSave: false });
            });

            expect(useSettingsStore.getState().pendingChanges).toBe(true);
        });
    });
});
