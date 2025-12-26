import { Code, FileCode, Image, Link, Minus, Quote } from 'lucide-react';
import { FormatButton } from '../FormatButton';

interface InsertButtonProps {
    onInsert: (type: string) => void;
}

/**
 * Insert link button
 */
export function LinkButton({ onInsert }: InsertButtonProps) {
    return <FormatButton icon={Link} label="Insert Link" shortcut="Ctrl+K" onClick={() => onInsert('link')} />;
}

/**
 * Insert image button
 */
export function ImageButton({ onInsert }: InsertButtonProps) {
    return <FormatButton icon={Image} label="Insert Image" shortcut="Ctrl+Shift+I" onClick={() => onInsert('image')} />;
}

/**
 * Inline code button
 */
export function InlineCodeButton({ onInsert }: InsertButtonProps) {
    return <FormatButton icon={Code} label="Inline Code" shortcut="Ctrl+`" onClick={() => onInsert('inlineCode')} />;
}

/**
 * Code block button
 */
export function CodeBlockButton({ onInsert }: InsertButtonProps) {
    return <FormatButton icon={FileCode} label="Code Block" shortcut="Ctrl+Shift+`" onClick={() => onInsert('codeBlock')} />;
}

/**
 * Blockquote button
 */
export function QuoteButton({ onInsert }: InsertButtonProps) {
    return <FormatButton icon={Quote} label="Blockquote" shortcut="Ctrl+Shift+Q" onClick={() => onInsert('blockquote')} />;
}

/**
 * Horizontal rule button
 */
export function HorizontalRuleButton({ onInsert }: InsertButtonProps) {
    return <FormatButton icon={Minus} label="Horizontal Rule" onClick={() => onInsert('hr')} />;
}
