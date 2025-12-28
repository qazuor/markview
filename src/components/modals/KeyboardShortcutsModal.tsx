import { Modal } from '@/components/ui';
import { cn } from '@/utils/cn';
import { useMemo, useState } from 'react';

interface ShortcutGroup {
    name: string;
    shortcuts: { keys: string; description: string }[];
}

const shortcutGroups: ShortcutGroup[] = [
    {
        name: 'Text Formatting',
        shortcuts: [
            { keys: 'Ctrl+B', description: 'Bold' },
            { keys: 'Ctrl+I', description: 'Italic' },
            { keys: 'Ctrl+Shift+S', description: 'Strikethrough' },
            { keys: 'Ctrl+`', description: 'Inline code' },
            { keys: 'Ctrl+Shift+`', description: 'Code block' }
        ]
    },
    {
        name: 'Headings',
        shortcuts: [
            { keys: 'Ctrl+1', description: 'Heading 1' },
            { keys: 'Ctrl+2', description: 'Heading 2' },
            { keys: 'Ctrl+3', description: 'Heading 3' },
            { keys: 'Ctrl+4', description: 'Heading 4' },
            { keys: 'Ctrl+5', description: 'Heading 5' },
            { keys: 'Ctrl+6', description: 'Heading 6' }
        ]
    },
    {
        name: 'Lists',
        shortcuts: [
            { keys: 'Ctrl+Shift+8', description: 'Bullet list' },
            { keys: 'Ctrl+Shift+7', description: 'Numbered list' },
            { keys: 'Ctrl+Shift+9', description: 'Task list' }
        ]
    },
    {
        name: 'Insert',
        shortcuts: [
            { keys: 'Ctrl+K', description: 'Insert link' },
            { keys: 'Ctrl+Shift+I', description: 'Insert image' },
            { keys: 'Ctrl+Shift+Q', description: 'Blockquote' }
        ]
    },
    {
        name: 'Navigation',
        shortcuts: [
            { keys: 'Ctrl+G', description: 'Go to line' },
            { keys: 'Ctrl+F', description: 'Find' },
            { keys: 'Ctrl+H', description: 'Find and replace' },
            { keys: 'F3', description: 'Find next' },
            { keys: 'Shift+F3', description: 'Find previous' }
        ]
    },
    {
        name: 'Editor',
        shortcuts: [
            { keys: 'Ctrl+Z', description: 'Undo' },
            { keys: 'Ctrl+Shift+Z', description: 'Redo' },
            { keys: 'Ctrl+S', description: 'Save' },
            { keys: 'Ctrl+Shift+S', description: 'Save as' },
            { keys: 'Ctrl+N', description: 'New document' },
            { keys: 'Ctrl+W', description: 'Close tab' }
        ]
    },
    {
        name: 'View',
        shortcuts: [
            { keys: 'Ctrl+/', description: 'Show keyboard shortcuts' },
            { keys: 'Ctrl+B', description: 'Toggle sidebar' },
            { keys: 'Ctrl+,', description: 'Settings' },
            { keys: 'F11', description: 'Zen mode (distraction-free)' },
            { keys: 'Ctrl+Shift+Z', description: 'Toggle Zen mode' }
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
    const [filter, setFilter] = useState('');

    const filteredGroups = useMemo(() => {
        if (!filter.trim()) return shortcutGroups;

        const lowerFilter = filter.toLowerCase();
        return shortcutGroups
            .map((group) => ({
                ...group,
                shortcuts: group.shortcuts.filter(
                    (s) => s.description.toLowerCase().includes(lowerFilter) || s.keys.toLowerCase().includes(lowerFilter)
                )
            }))
            .filter((group) => group.shortcuts.length > 0);
    }, [filter]);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Keyboard Shortcuts" size="lg">
            {/* Search */}
            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Search shortcuts..."
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
                    <div key={group.name}>
                        <h3 className="text-sm font-semibold text-text-primary mb-2">{group.name}</h3>
                        <div className="space-y-1">
                            {group.shortcuts.map((shortcut) => (
                                <div
                                    key={shortcut.keys}
                                    className="flex items-center justify-between py-1 px-2 rounded hover:bg-bg-tertiary"
                                >
                                    <span className="text-sm text-text-secondary">{shortcut.description}</span>
                                    <kbd className={cn('px-2 py-1 text-xs font-mono', 'bg-bg-tertiary rounded', 'border border-border')}>
                                        {shortcut.keys}
                                    </kbd>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                {filteredGroups.length === 0 && <div className="text-center py-8 text-text-muted">No shortcuts found</div>}
            </div>

            {/* Footer hint */}
            <div className="mt-4 pt-4 border-t border-border text-xs text-text-muted text-center">
                Press <kbd className="px-1 py-0.5 bg-bg-tertiary rounded border border-border">Esc</kbd> to close
            </div>
        </Modal>
    );
}
