import { cn } from '@/utils/cn';
import { useTranslation } from 'react-i18next';

interface CursorPositionProps {
    line: number;
    column: number;
    className?: string;
}

/**
 * Display current cursor position
 */
export function CursorPosition({ line, column, className }: CursorPositionProps) {
    const { t } = useTranslation();

    return (
        <button
            type="button"
            className={cn('hover:text-text-secondary transition-colors cursor-pointer', className)}
            title={t('status.goToLine')}
        >
            Ln {line}, Col {column}
        </button>
    );
}
