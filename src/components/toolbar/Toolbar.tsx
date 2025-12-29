import { useMobile } from '@/hooks';
import { cn } from '@/utils/cn';
import type { EditorView } from '@codemirror/view';
import { ChevronDown, MoreHorizontal, X } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { EmojiPicker } from './EmojiPicker';
import { FormatButtonGroup, ToolbarSeparator } from './FormatButton';
import {
    BoldButton,
    BulletListButton,
    CodeBlockButton,
    HeadingDropdown,
    HorizontalRuleButton,
    ImageButton,
    InlineCodeButton,
    ItalicButton,
    LinkButton,
    NumberedListButton,
    QuoteButton,
    StrikethroughButton,
    TaskListButton
} from './buttons';
import { useToolbarActions } from './hooks/useToolbarActions';

interface ToolbarProps {
    editorView: EditorView | null;
    className?: string;
}

/**
 * Mobile bottom sheet for more options
 */
function MobileBottomSheet({
    isOpen,
    onClose,
    title,
    closeLabel,
    children
}: {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    closeLabel: string;
    children: React.ReactNode;
}) {
    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-50 bg-black/50 animate-in fade-in duration-200"
                onClick={onClose}
                onKeyDown={(e) => e.key === 'Escape' && onClose()}
                role="button"
                tabIndex={0}
                aria-label={closeLabel}
            />
            {/* Sheet */}
            <div
                className={cn(
                    'fixed bottom-0 left-0 right-0 z-50',
                    'bg-bg-primary border-t border-border rounded-t-2xl shadow-2xl',
                    'animate-in slide-in-from-bottom duration-300',
                    'max-h-[70vh] overflow-y-auto'
                )}
            >
                {/* Handle */}
                <div className="flex justify-center pt-2 pb-1">
                    <div className="w-10 h-1 bg-border rounded-full" />
                </div>
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-2 border-b border-border">
                    <span className="text-sm font-medium text-text-primary">{title}</span>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-tertiary"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>
                {/* Content */}
                <div className="p-4">{children}</div>
            </div>
        </>
    );
}

/**
 * Mobile heading dropdown
 */
function MobileHeadingDropdown({
    isOpen,
    onClose,
    onHeading
}: {
    isOpen: boolean;
    onClose: () => void;
    onHeading: (level: number) => void;
}) {
    if (!isOpen) return null;

    return (
        <>
            {/* biome-ignore lint/a11y/useKeyWithClickEvents: Backdrop click handler */}
            <div className="fixed inset-0 z-40" onClick={onClose} />
            <div
                className={cn(
                    'absolute top-full left-0 mt-1 z-50',
                    'bg-bg-secondary border border-border rounded-lg shadow-lg',
                    'py-1 min-w-[120px]',
                    'animate-in fade-in slide-in-from-top-2 duration-150'
                )}
            >
                {[1, 2, 3, 4, 5, 6].map((level) => (
                    <button
                        key={level}
                        type="button"
                        onClick={() => {
                            onHeading(level);
                            onClose();
                        }}
                        className={cn(
                            'w-full px-3 py-2 text-left',
                            'hover:bg-bg-tertiary active:bg-bg-tertiary',
                            'transition-colors touch-manipulation'
                        )}
                    >
                        <span
                            className="text-text-primary"
                            style={{ fontSize: `${1.5 - level * 0.15}rem`, fontWeight: level <= 2 ? 700 : 600 }}
                        >
                            H{level}
                        </span>
                    </button>
                ))}
            </div>
        </>
    );
}

/**
 * Document formatting toolbar
 */
export function Toolbar({ editorView, className }: ToolbarProps) {
    const { t } = useTranslation();
    const { isMobile } = useMobile();
    const [headingOpen, setHeadingOpen] = useState(false);
    const [moreOpen, setMoreOpen] = useState(false);
    const { handleFormat, handleHeading, handleInsert, handleList, handleEmojiInsert } = useToolbarActions({
        editorView
    });

    const closeMore = () => setMoreOpen(false);

    // Mobile toolbar - frequent actions + expandable bottom sheet
    if (isMobile) {
        return (
            <>
                <div
                    data-tour="toolbar"
                    className={cn('flex items-center gap-1 px-2 py-1.5', 'bg-bg-tertiary border-b border-border', className)}
                    role="toolbar"
                    aria-label={t('aria.formattingToolbar')}
                >
                    {/* Frequent actions - always visible */}
                    <FormatButtonGroup>
                        <BoldButton onFormat={handleFormat} />
                        <ItalicButton onFormat={handleFormat} />
                    </FormatButtonGroup>

                    {/* Heading dropdown */}
                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => setHeadingOpen(!headingOpen)}
                            className={cn(
                                'flex items-center gap-0.5 px-2 py-1.5 rounded',
                                'text-text-secondary hover:text-text-primary',
                                'hover:bg-bg-hover active:bg-bg-hover',
                                'transition-colors touch-manipulation',
                                headingOpen && 'bg-bg-hover text-text-primary'
                            )}
                            aria-label={t('toolbar.heading')}
                        >
                            <span className="text-sm font-bold">H</span>
                            <ChevronDown className="h-3 w-3" />
                        </button>
                        <MobileHeadingDropdown isOpen={headingOpen} onClose={() => setHeadingOpen(false)} onHeading={handleHeading} />
                    </div>

                    {/* Link - frequent */}
                    <LinkButton onInsert={handleInsert} />

                    {/* Inline code - frequent */}
                    <InlineCodeButton onInsert={handleInsert} />

                    {/* Spacer */}
                    <div className="flex-1" />

                    {/* More button */}
                    <button
                        type="button"
                        onClick={() => setMoreOpen(true)}
                        className={cn(
                            'flex items-center justify-center p-2 rounded-lg',
                            'text-text-secondary hover:text-text-primary',
                            'hover:bg-bg-hover active:bg-bg-hover',
                            'transition-colors touch-manipulation'
                        )}
                        aria-label={t('common.more')}
                    >
                        <MoreHorizontal className="h-5 w-5" />
                    </button>
                </div>

                {/* Bottom sheet with more options */}
                <MobileBottomSheet isOpen={moreOpen} onClose={closeMore} title={t('toolbar.moreOptions')} closeLabel={t('common.close')}>
                    <div className="space-y-4">
                        {/* Text formatting */}
                        <div>
                            <p className="text-xs text-text-muted mb-2 uppercase tracking-wide">{t('toolbar.text')}</p>
                            <div className="flex flex-wrap gap-2">
                                <StrikethroughButton
                                    onFormat={(type) => {
                                        handleFormat(type);
                                        closeMore();
                                    }}
                                />
                            </div>
                        </div>

                        {/* Insert */}
                        <div>
                            <p className="text-xs text-text-muted mb-2 uppercase tracking-wide">{t('toolbar.insert')}</p>
                            <div className="flex flex-wrap gap-2">
                                <ImageButton
                                    onInsert={(type) => {
                                        handleInsert(type);
                                        closeMore();
                                    }}
                                />
                                <CodeBlockButton
                                    onInsert={(type) => {
                                        handleInsert(type);
                                        closeMore();
                                    }}
                                />
                                <QuoteButton
                                    onInsert={(type) => {
                                        handleInsert(type);
                                        closeMore();
                                    }}
                                />
                                <HorizontalRuleButton
                                    onInsert={(type) => {
                                        handleInsert(type);
                                        closeMore();
                                    }}
                                />
                            </div>
                        </div>

                        {/* Lists */}
                        <div>
                            <p className="text-xs text-text-muted mb-2 uppercase tracking-wide">{t('toolbar.lists')}</p>
                            <div className="flex flex-wrap gap-2">
                                <BulletListButton
                                    onList={(type) => {
                                        handleList(type);
                                        closeMore();
                                    }}
                                />
                                <NumberedListButton
                                    onList={(type) => {
                                        handleList(type);
                                        closeMore();
                                    }}
                                />
                                <TaskListButton
                                    onList={(type) => {
                                        handleList(type);
                                        closeMore();
                                    }}
                                />
                            </div>
                        </div>

                        {/* Emoji */}
                        <div>
                            <p className="text-xs text-text-muted mb-2 uppercase tracking-wide">{t('toolbar.emoji')}</p>
                            <EmojiPicker
                                onEmojiSelect={(emoji) => {
                                    handleEmojiInsert(emoji);
                                    closeMore();
                                }}
                            />
                        </div>
                    </div>
                </MobileBottomSheet>
            </>
        );
    }

    // Desktop toolbar - full version
    return (
        <div
            data-tour="toolbar"
            className={cn(
                'flex items-center gap-1 px-2 py-1.5',
                'bg-bg-tertiary border-b border-border',
                'overflow-x-auto scrollbar-thin',
                className
            )}
            role="toolbar"
            aria-label={t('aria.formattingToolbar')}
        >
            {/* Heading dropdown */}
            <HeadingDropdown onHeading={handleHeading} />

            <ToolbarSeparator />

            {/* Text formatting */}
            <FormatButtonGroup>
                <BoldButton onFormat={handleFormat} />
                <ItalicButton onFormat={handleFormat} />
                <StrikethroughButton onFormat={handleFormat} />
            </FormatButtonGroup>

            <ToolbarSeparator />

            {/* Links and media */}
            <FormatButtonGroup>
                <LinkButton onInsert={handleInsert} />
                <ImageButton onInsert={handleInsert} />
            </FormatButtonGroup>

            <ToolbarSeparator />

            {/* Code */}
            <FormatButtonGroup>
                <InlineCodeButton onInsert={handleInsert} />
                <CodeBlockButton onInsert={handleInsert} />
            </FormatButtonGroup>

            <ToolbarSeparator />

            {/* Block elements */}
            <FormatButtonGroup>
                <QuoteButton onInsert={handleInsert} />
                <HorizontalRuleButton onInsert={handleInsert} />
            </FormatButtonGroup>

            <ToolbarSeparator />

            {/* Lists */}
            <FormatButtonGroup>
                <BulletListButton onList={handleList} />
                <NumberedListButton onList={handleList} />
                <TaskListButton onList={handleList} />
            </FormatButtonGroup>

            <ToolbarSeparator />

            {/* Emoji */}
            <EmojiPicker onEmojiSelect={handleEmojiInsert} />
        </div>
    );
}
