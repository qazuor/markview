import { cn } from '@/utils/cn';

type LineEndingType = 'LF' | 'CRLF';

interface LineEndingProps {
    type?: LineEndingType;
    className?: string;
}

/**
 * Display line ending type
 */
export function LineEnding({ type = 'LF', className }: LineEndingProps) {
    return (
        <button
            type="button"
            className={cn('hover:text-text-secondary transition-colors cursor-pointer', className)}
            title="Select end of line sequence"
        >
            {type}
        </button>
    );
}
