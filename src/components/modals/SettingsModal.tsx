import { Modal } from '@/components/ui';
import { useSettingsStore } from '@/stores/settingsStore';
import type { Language, PreviewStyle, Theme } from '@/types/settings';
import { cn } from '@/utils/cn';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type SettingsTab = 'appearance' | 'editor' | 'behavior';

const themes: { value: Theme; label: string }[] = [
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
    { value: 'system', label: 'System' }
];

const previewStyles: { value: PreviewStyle; label: string }[] = [
    { value: 'github', label: 'GitHub' },
    { value: 'gitlab', label: 'GitLab' },
    { value: 'notion', label: 'Notion' },
    { value: 'obsidian', label: 'Obsidian' },
    { value: 'stackoverflow', label: 'Stack Overflow' },
    { value: 'devto', label: 'Dev.to' }
];

const languages: { value: Language; label: string }[] = [
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Español' }
];

const fontFamilies = ['JetBrains Mono', 'Fira Code', 'Source Code Pro', 'Consolas', 'Monaco', 'monospace'];

/**
 * Settings modal for app configuration
 */
export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
    const [activeTab, setActiveTab] = useState<SettingsTab>('appearance');
    const { t, i18n } = useTranslation();

    const settings = useSettingsStore();
    const {
        theme,
        previewStyle,
        editorFontSize,
        previewFontSize,
        fontFamily,
        wordWrap,
        lineNumbers,
        minimap,
        syncScroll,
        autoSave,
        autoSaveInterval,
        formatOnSave,
        lintOnType,
        language,
        updateSetting,
        resetSettings
    } = settings;

    // Sync language with i18n
    useEffect(() => {
        if (i18n.language !== language) {
            i18n.changeLanguage(language);
        }
    }, [language, i18n]);

    const tabs: { id: SettingsTab; label: string }[] = [
        { id: 'appearance', label: t('settings.tabs.appearance') },
        { id: 'editor', label: t('settings.tabs.editor') },
        { id: 'behavior', label: t('settings.tabs.behavior') }
    ];

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={t('settings.title')} size="lg">
            {/* Tabs */}
            <div className="flex border-b border-border mb-4">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                            'px-4 py-2 text-sm font-medium -mb-px',
                            'border-b-2 transition-colors',
                            activeTab === tab.id
                                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                                : 'border-transparent text-text-muted hover:text-text-secondary'
                        )}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="space-y-6 overflow-y-auto max-h-[60vh] pr-2">
                {/* Appearance Tab */}
                {activeTab === 'appearance' && (
                    <>
                        <SettingGroup title={t('settings.theme')}>
                            <Select value={theme} onChange={(v) => updateSetting('theme', v as Theme)} options={themes} />
                        </SettingGroup>

                        <SettingGroup title={t('settings.previewStyle')}>
                            <Select
                                value={previewStyle}
                                onChange={(v) => updateSetting('previewStyle', v as PreviewStyle)}
                                options={previewStyles}
                            />
                        </SettingGroup>

                        <SettingGroup title={t('settings.fontFamily')}>
                            <Select
                                value={fontFamily}
                                onChange={(v) => updateSetting('fontFamily', v)}
                                options={fontFamilies.map((f) => ({ value: f, label: f }))}
                            />
                        </SettingGroup>

                        <SettingGroup title={t('settings.editorFontSize')}>
                            <NumberInput
                                value={editorFontSize}
                                onChange={(v) => updateSetting('editorFontSize', v)}
                                min={10}
                                max={32}
                                suffix="px"
                            />
                        </SettingGroup>

                        <SettingGroup title={t('settings.previewFontSize')}>
                            <NumberInput
                                value={previewFontSize}
                                onChange={(v) => updateSetting('previewFontSize', v)}
                                min={10}
                                max={32}
                                suffix="px"
                            />
                        </SettingGroup>

                        <SettingGroup title={t('settings.language')}>
                            <Select value={language} onChange={(v) => updateSetting('language', v as Language)} options={languages} />
                        </SettingGroup>
                    </>
                )}

                {/* Editor Tab */}
                {activeTab === 'editor' && (
                    <>
                        <SettingGroup title={t('settings.wordWrap')} description={t('settings.descriptions.wordWrap')}>
                            <Toggle checked={wordWrap} onChange={(v) => updateSetting('wordWrap', v)} />
                        </SettingGroup>

                        <SettingGroup title={t('settings.lineNumbers')} description={t('settings.descriptions.lineNumbers')}>
                            <Toggle checked={lineNumbers} onChange={(v) => updateSetting('lineNumbers', v)} />
                        </SettingGroup>

                        <SettingGroup title={t('settings.minimap')} description={t('settings.descriptions.minimap')}>
                            <Toggle checked={minimap} onChange={(v) => updateSetting('minimap', v)} />
                        </SettingGroup>

                        <SettingGroup title={t('settings.syncScroll')} description={t('settings.descriptions.syncScroll')}>
                            <Toggle checked={syncScroll} onChange={(v) => updateSetting('syncScroll', v)} />
                        </SettingGroup>
                    </>
                )}

                {/* Behavior Tab */}
                {activeTab === 'behavior' && (
                    <>
                        <SettingGroup title={t('settings.autoSave')} description={t('settings.descriptions.autoSave')}>
                            <Toggle checked={autoSave} onChange={(v) => updateSetting('autoSave', v)} />
                        </SettingGroup>

                        <SettingGroup title={t('settings.autoSaveInterval')} description={t('settings.descriptions.autoSaveInterval')}>
                            <NumberInput
                                value={autoSaveInterval}
                                onChange={(v) => updateSetting('autoSaveInterval', v)}
                                min={500}
                                max={60000}
                                step={500}
                                suffix="ms"
                                disabled={!autoSave}
                            />
                        </SettingGroup>

                        <SettingGroup title={t('settings.formatOnSave')} description={t('settings.descriptions.formatOnSave')}>
                            <Toggle checked={formatOnSave} onChange={(v) => updateSetting('formatOnSave', v)} />
                        </SettingGroup>

                        <SettingGroup title={t('settings.lintOnType')} description={t('settings.descriptions.lintOnType')}>
                            <Toggle checked={lintOnType} onChange={(v) => updateSetting('lintOnType', v)} />
                        </SettingGroup>
                    </>
                )}
            </div>

            {/* Footer */}
            <div className="mt-4 pt-4 border-t border-border flex justify-between items-center">
                <button
                    type="button"
                    onClick={resetSettings}
                    className={cn(
                        'px-3 py-1.5 text-sm rounded-md',
                        'text-red-500 hover:bg-red-50 dark:hover:bg-red-950',
                        'transition-colors'
                    )}
                >
                    {t('settings.reset')}
                </button>
                <button
                    type="button"
                    onClick={onClose}
                    className={cn(
                        'px-4 py-1.5 text-sm rounded-md',
                        'bg-primary-500 text-white',
                        'hover:bg-primary-600',
                        'transition-colors'
                    )}
                >
                    {t('settings.done')}
                </button>
            </div>
        </Modal>
    );
}

// Helper Components

interface SettingGroupProps {
    title: string;
    description?: string;
    children: React.ReactNode;
}

function SettingGroup({ title, description, children }: SettingGroupProps) {
    return (
        <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
                <div className="text-sm font-medium text-text-primary">{title}</div>
                {description && <div className="text-xs text-text-muted mt-0.5">{description}</div>}
            </div>
            <div className="shrink-0">{children}</div>
        </div>
    );
}

interface SelectProps {
    value: string;
    onChange: (value: string) => void;
    options: { value: string; label: string }[];
}

function Select({ value, onChange, options }: SelectProps) {
    return (
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={cn(
                'px-3 py-1.5 text-sm rounded-md',
                'bg-bg-tertiary border border-border',
                'focus:outline-none focus:ring-2 focus:ring-primary-500',
                'cursor-pointer'
            )}
        >
            {options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                    {opt.label}
                </option>
            ))}
        </select>
    );
}

interface ToggleProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
}

function Toggle({ checked, onChange }: ToggleProps) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            onClick={() => onChange(!checked)}
            className={cn(
                'relative inline-flex h-6 w-11 items-center rounded-full',
                'transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
                checked ? 'bg-primary-500' : 'bg-secondary-300 dark:bg-secondary-600'
            )}
        >
            <span
                className={cn(
                    'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                    checked ? 'translate-x-6' : 'translate-x-1'
                )}
            />
        </button>
    );
}

interface NumberInputProps {
    value: number;
    onChange: (value: number) => void;
    min?: number;
    max?: number;
    step?: number;
    suffix?: string;
    disabled?: boolean;
}

function NumberInput({ value, onChange, min = 0, max = 100, step = 1, suffix, disabled }: NumberInputProps) {
    return (
        <div className="flex items-center gap-2">
            <input
                type="number"
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                min={min}
                max={max}
                step={step}
                disabled={disabled}
                className={cn(
                    'w-20 px-2 py-1.5 text-sm text-right rounded-md',
                    'bg-bg-tertiary border border-border',
                    'focus:outline-none focus:ring-2 focus:ring-primary-500',
                    disabled && 'opacity-50 cursor-not-allowed'
                )}
            />
            {suffix && <span className="text-sm text-text-muted">{suffix}</span>}
        </div>
    );
}
