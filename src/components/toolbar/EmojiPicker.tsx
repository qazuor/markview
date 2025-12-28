import { useSettingsStore } from '@/stores/settingsStore';
import { cn } from '@/utils/cn';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import { Smile } from 'lucide-react';
import { useCallback, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';

interface EmojiPickerProps {
    onEmojiSelect: (emoji: string) => void;
    className?: string;
}

interface EmojiData {
    native: string;
    shortcodes?: string;
}

export function EmojiPicker({ onEmojiSelect, className }: EmojiPickerProps) {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const theme = useSettingsStore((s) => s.theme);

    // Determine picker theme based on app theme
    const pickerTheme = theme === 'dark' ? 'dark' : theme === 'light' ? 'light' : 'auto';

    const handleEmojiSelect = useCallback(
        (emoji: EmojiData) => {
            onEmojiSelect(emoji.native);
            setIsOpen(false);
        },
        [onEmojiSelect]
    );

    return (
        <div className={cn('relative', className)}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    'p-1.5 rounded-md',
                    'hover:bg-bg-hover active:bg-bg-active',
                    'transition-colors duration-150',
                    isOpen && 'bg-bg-hover'
                )}
                title={t('toolbar.emoji')}
                aria-label={t('toolbar.emoji')}
            >
                <Smile className="h-4 w-4" />
            </button>

            {isOpen &&
                createPortal(
                    <>
                        {/* Backdrop with semi-transparent background */}
                        {/* biome-ignore lint/a11y/useKeyWithClickEvents: Backdrop is purely visual */}
                        <div className="fixed inset-0 z-[9998] bg-black/20 backdrop-blur-[1px]" onClick={() => setIsOpen(false)} />

                        {/* Centered Picker with fade-in animation */}
                        <div
                            className={cn(
                                'fixed z-[9999]',
                                'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
                                'animate-in fade-in duration-200',
                                'rounded-xl shadow-2xl overflow-hidden'
                            )}
                        >
                            <Picker
                                data={data}
                                onEmojiSelect={handleEmojiSelect}
                                theme={pickerTheme}
                                previewPosition="none"
                                skinTonePosition="none"
                                maxFrequentRows={2}
                                perLine={9}
                            />
                        </div>
                    </>,
                    document.body
                )}
        </div>
    );
}
