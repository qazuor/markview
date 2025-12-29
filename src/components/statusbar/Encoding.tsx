import { cn } from '@/utils/cn';
import { useTranslation } from 'react-i18next';

interface EncodingProps {
    encoding?: string;
    className?: string;
}

/**
 * Display file encoding
 */
export function Encoding({ encoding = 'UTF-8', className }: EncodingProps) {
    const { t } = useTranslation();

    return (
        <button
            type="button"
            className={cn('hover:text-text-secondary transition-colors cursor-pointer', className)}
            title={t('status.selectEncoding')}
        >
            {encoding}
        </button>
    );
}
