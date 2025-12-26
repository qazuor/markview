import { cn } from '@/utils/cn';

interface CursorPositionProps {
    line: number;
    column: number;
    className?: string;
}

/**
 * Display current cursor position
 */
export function CursorPosition({ line, column, className }: CursorPositionProps) {
    return (
        <button type="button" className={cn('hover:text-text-secondary transition-colors cursor-pointer', className)} title="Go to line">
            Ln {line}, Col {column}
        </button>
    );
}
