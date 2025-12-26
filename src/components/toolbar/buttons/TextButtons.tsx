import { Bold, Italic, Strikethrough, Underline } from 'lucide-react';
import { FormatButton } from '../FormatButton';

interface TextButtonProps {
    onFormat: (format: string) => void;
}

/**
 * Bold formatting button
 */
export function BoldButton({ onFormat }: TextButtonProps) {
    return <FormatButton icon={Bold} label="Bold" shortcut="Ctrl+B" onClick={() => onFormat('bold')} />;
}

/**
 * Italic formatting button
 */
export function ItalicButton({ onFormat }: TextButtonProps) {
    return <FormatButton icon={Italic} label="Italic" shortcut="Ctrl+I" onClick={() => onFormat('italic')} />;
}

/**
 * Strikethrough formatting button
 */
export function StrikethroughButton({ onFormat }: TextButtonProps) {
    return <FormatButton icon={Strikethrough} label="Strikethrough" shortcut="Ctrl+Shift+S" onClick={() => onFormat('strikethrough')} />;
}

/**
 * Underline formatting button (for completeness)
 */
export function UnderlineButton({ onFormat }: TextButtonProps) {
    return <FormatButton icon={Underline} label="Underline" shortcut="Ctrl+U" onClick={() => onFormat('underline')} />;
}
