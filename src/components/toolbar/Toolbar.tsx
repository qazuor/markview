import { cn } from '@/utils/cn';
import type { EditorView } from '@codemirror/view';
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
 * Document formatting toolbar
 */
export function Toolbar({ editorView, className }: ToolbarProps) {
    const { handleFormat, handleHeading, handleInsert, handleList, handleEmojiInsert } = useToolbarActions({
        editorView
    });

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
            aria-label="Formatting toolbar"
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
