import { cn } from '@/utils/cn';
import { useTranslation } from 'react-i18next';

type LineEndingType = 'LF' | 'CRLF';

interface LineEndingProps {
    type?: LineEndingType;
    className?: string;
}

/**
 * Display line ending type
 */
export function LineEnding({ type = 'LF', className }: LineEndingProps) {
    const { t } = useTranslation();

    return (
        <button
            type="button"
            className={cn('hover:text-text-secondary transition-colors cursor-pointer', className)}
            title={t('status.selectLineEnding')}
        >
            {type}
        </button>
    );
}
