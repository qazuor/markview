import { cn } from '@/utils/cn';

interface EncodingProps {
    encoding?: string;
    className?: string;
}

/**
 * Display file encoding
 */
export function Encoding({ encoding = 'UTF-8', className }: EncodingProps) {
    return (
        <button
            type="button"
            className={cn('hover:text-text-secondary transition-colors cursor-pointer', className)}
            title="Select encoding"
        >
            {encoding}
        </button>
    );
}
