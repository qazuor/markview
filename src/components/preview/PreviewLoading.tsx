import { cn } from '@/utils/cn';

interface PreviewLoadingProps {
    className?: string;
}

/**
 * Loading skeleton for preview
 */
export function PreviewLoading({ className }: PreviewLoadingProps) {
    return (
        <div className={cn('animate-pulse space-y-4 p-6', className)}>
            {/* Title skeleton */}
            <div className="h-8 w-3/4 rounded bg-secondary-200 dark:bg-secondary-700" />

            {/* Paragraph skeletons */}
            <div className="space-y-2">
                <div className="h-4 w-full rounded bg-secondary-200 dark:bg-secondary-700" />
                <div className="h-4 w-full rounded bg-secondary-200 dark:bg-secondary-700" />
                <div className="h-4 w-5/6 rounded bg-secondary-200 dark:bg-secondary-700" />
            </div>

            {/* Subtitle skeleton */}
            <div className="h-6 w-1/2 rounded bg-secondary-200 dark:bg-secondary-700" />

            {/* More paragraph skeletons */}
            <div className="space-y-2">
                <div className="h-4 w-full rounded bg-secondary-200 dark:bg-secondary-700" />
                <div className="h-4 w-4/5 rounded bg-secondary-200 dark:bg-secondary-700" />
            </div>

            {/* Code block skeleton */}
            <div className="h-24 w-full rounded bg-secondary-200 dark:bg-secondary-700" />

            {/* List skeleton */}
            <div className="space-y-2 pl-4">
                <div className="h-4 w-3/4 rounded bg-secondary-200 dark:bg-secondary-700" />
                <div className="h-4 w-2/3 rounded bg-secondary-200 dark:bg-secondary-700" />
                <div className="h-4 w-4/5 rounded bg-secondary-200 dark:bg-secondary-700" />
            </div>
        </div>
    );
}

/**
 * Simple spinner for preview
 */
export function PreviewSpinner({ className }: PreviewLoadingProps) {
    return (
        <div className={cn('flex items-center justify-center p-6', className)}>
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-secondary-300 border-t-primary-500" />
        </div>
    );
}
