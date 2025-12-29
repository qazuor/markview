import { cn } from '@/utils/cn';
import { useTranslation } from 'react-i18next';

interface PreviewLoadingProps {
    className?: string;
}

/**
 * Loading state for preview with spinner
 */
export function PreviewLoading({ className }: PreviewLoadingProps) {
    const { t } = useTranslation();

    return (
        <div className={cn('h-full flex items-center justify-center cursor-wait', className)}>
            <div className="flex flex-col items-center gap-3">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-secondary-300 border-t-primary-500" />
                <span className="text-sm text-secondary-500 dark:text-secondary-400">{t('preview.loading')}</span>
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
