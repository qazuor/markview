import { Tooltip } from '@/components/ui';
import { cn } from '@/utils/cn';
import { calculateStats } from '@/utils/stats';
import { useMemo } from 'react';

interface WordCountProps {
    content: string;
    className?: string;
}

/**
 * Display word count with detailed stats on hover
 */
export function WordCount({ content, className }: WordCountProps) {
    const stats = useMemo(() => calculateStats(content), [content]);

    const tooltipContent = (
        <div className="space-y-1">
            <div>Characters: {stats.characters.toLocaleString()}</div>
            <div>Characters (no spaces): {stats.charactersNoSpaces.toLocaleString()}</div>
            <div>Lines: {stats.lines.toLocaleString()}</div>
            <div>Reading time: ~{stats.readingTime} min</div>
        </div>
    );

    return (
        <Tooltip content={tooltipContent}>
            <span className={cn('cursor-help hover:text-text-secondary transition-colors', className)}>
                {stats.words.toLocaleString()} words
            </span>
        </Tooltip>
    );
}
