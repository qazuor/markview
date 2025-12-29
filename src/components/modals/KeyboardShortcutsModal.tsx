import { Modal } from '@/components/ui';
import { cn } from '@/utils/cn';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface ShortcutGroup {
    nameKey: string;
    shortcuts: { keys: string; descriptionKey: string }[];
}

const shortcutGroups: ShortcutGroup[] = [
    {
        nameKey: 'shortcuts.groups.textFormatting',
        shortcuts: [
            { keys: 'Ctrl+B', descriptionKey: 'shortcuts.actions.bold' },
            { keys: 'Ctrl+I', descriptionKey: 'shortcuts.actions.italic' },
            { keys: 'Ctrl+Shift+S', descriptionKey: 'shortcuts.actions.strikethrough' },
            { keys: 'Ctrl+`', descriptionKey: 'shortcuts.actions.inlineCode' },
            { keys: 'Ctrl+Shift+`', descriptionKey: 'shortcuts.actions.codeBlock' }
        ]
    },
    {
        nameKey: 'shortcuts.groups.headings',
        shortcuts: [
            { keys: 'Ctrl+1', descriptionKey: 'shortcuts.actions.heading1' },
            { keys: 'Ctrl+2', descriptionKey: 'shortcuts.actions.heading2' },
            { keys: 'Ctrl+3', descriptionKey: 'shortcuts.actions.heading3' },
            { keys: 'Ctrl+4', descriptionKey: 'shortcuts.actions.heading4' },
            { keys: 'Ctrl+5', descriptionKey: 'shortcuts.actions.heading5' },
            { keys: 'Ctrl+6', descriptionKey: 'shortcuts.actions.heading6' }
        ]
    },
    {
        nameKey: 'shortcuts.groups.lists',
        shortcuts: [
            { keys: 'Ctrl+Shift+8', descriptionKey: 'shortcuts.actions.bulletList' },
            { keys: 'Ctrl+Shift+7', descriptionKey: 'shortcuts.actions.numberedList' },
            { keys: 'Ctrl+Shift+9', descriptionKey: 'shortcuts.actions.taskList' }
        ]
    },
    {
        nameKey: 'shortcuts.groups.insert',
        shortcuts: [
            { keys: 'Ctrl+K', descriptionKey: 'shortcuts.actions.link' },
            { keys: 'Ctrl+Shift+I', descriptionKey: 'shortcuts.actions.image' },
            { keys: 'Ctrl+Shift+Q', descriptionKey: 'shortcuts.actions.blockquote' }
        ]
    },
    {
        nameKey: 'shortcuts.navigation',
        shortcuts: [
            { keys: 'Ctrl+G', descriptionKey: 'shortcuts.actions.goToLine' },
            { keys: 'Ctrl+F', descriptionKey: 'shortcuts.actions.find' },
            { keys: 'Ctrl+H', descriptionKey: 'shortcuts.actions.findAndReplace' },
            { keys: 'F3', descriptionKey: 'shortcuts.actions.findNext' },
            { keys: 'Shift+F3', descriptionKey: 'shortcuts.actions.findPrevious' }
        ]
    },
    {
        nameKey: 'shortcuts.groups.editor',
        shortcuts: [
            { keys: 'Ctrl+Z', descriptionKey: 'shortcuts.actions.undo' },
            { keys: 'Ctrl+Shift+Z', descriptionKey: 'shortcuts.actions.redo' },
            { keys: 'Ctrl+S', descriptionKey: 'shortcuts.actions.saveFile' },
            { keys: 'Ctrl+Shift+S', descriptionKey: 'shortcuts.actions.saveAs' },
            { keys: 'Ctrl+N', descriptionKey: 'shortcuts.actions.newFile' },
            { keys: 'Ctrl+W', descriptionKey: 'shortcuts.actions.closeTab' }
        ]
    },
    {
        nameKey: 'shortcuts.groups.view',
        shortcuts: [
            { keys: 'Ctrl+/', descriptionKey: 'shortcuts.actions.shortcuts' },
            { keys: 'Ctrl+B', descriptionKey: 'shortcuts.actions.toggleSidebar' },
            { keys: 'Ctrl+,', descriptionKey: 'shortcuts.actions.settings' },
            { keys: 'F11', descriptionKey: 'shortcuts.actions.zenMode' },
            { keys: 'Ctrl+Shift+Z', descriptionKey: 'shortcuts.actions.toggleZenMode' }
        ]
    }
];

interface KeyboardShortcutsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

/**
 * Modal showing all keyboard shortcuts
 */
export function KeyboardShortcutsModal({ isOpen, onClose }: KeyboardShortcutsModalProps) {
    const { t } = useTranslation();
    const [filter, setFilter] = useState('');

    const filteredGroups = useMemo(() => {
        if (!filter.trim()) return shortcutGroups;

        const lowerFilter = filter.toLowerCase();
        return shortcutGroups
            .map((group) => ({
                ...group,
                shortcuts: group.shortcuts.filter(
                    (s) => t(s.descriptionKey).toLowerCase().includes(lowerFilter) || s.keys.toLowerCase().includes(lowerFilter)
                )
            }))
            .filter((group) => group.shortcuts.length > 0);
    }, [filter, t]);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={t('shortcuts.title')} size="lg">
            {/* Search */}
            <div className="mb-4">
                <input
                    type="text"
                    placeholder={t('shortcuts.searchPlaceholder')}
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className={cn(
                        'w-full px-3 py-2',
                        'text-sm bg-bg-tertiary rounded-md',
                        'border border-transparent',
                        'focus:outline-none focus:border-primary-500',
                        'placeholder:text-text-muted'
                    )}
                />
            </div>

            {/* Shortcut groups */}
            <div className="space-y-6 overflow-y-auto max-h-[60vh] pr-2">
                {filteredGroups.map((group) => (
                    <div key={group.nameKey}>
                        <h3 className="text-sm font-semibold text-text-primary mb-2">{t(group.nameKey)}</h3>
                        <div className="space-y-1">
                            {group.shortcuts.map((shortcut) => (
                                <div
                                    key={shortcut.keys}
                                    className="flex items-center justify-between py-1 px-2 rounded hover:bg-bg-tertiary"
                                >
                                    <span className="text-sm text-text-secondary">{t(shortcut.descriptionKey)}</span>
                                    <kbd className={cn('px-2 py-1 text-xs font-mono', 'bg-bg-tertiary rounded', 'border border-border')}>
                                        {shortcut.keys}
                                    </kbd>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                {filteredGroups.length === 0 && <div className="text-center py-8 text-text-muted">{t('shortcuts.noShortcutsFound')}</div>}
            </div>

            {/* Footer hint */}
            <div className="mt-4 pt-4 border-t border-border text-xs text-text-muted text-center">
                {t('shortcuts.press')} <kbd className="px-1 py-0.5 bg-bg-tertiary rounded border border-border">Esc</kbd>{' '}
                {t('shortcuts.toClose')}
            </div>
        </Modal>
    );
}
