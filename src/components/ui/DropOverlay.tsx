import { cn } from '@/utils/cn';
import { Upload } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface DropOverlayProps {
    isVisible: boolean;
}

export function DropOverlay({ isVisible }: DropOverlayProps) {
    const { t } = useTranslation();

    if (!isVisible) return null;

    return (
        <div
            className={cn(
                'fixed inset-0 z-[100]',
                'bg-primary-500/10 backdrop-blur-sm',
                'flex items-center justify-center',
                'pointer-events-none',
                'animate-in fade-in duration-200'
            )}
        >
            <div
                className={cn(
                    'flex flex-col items-center gap-4 p-8',
                    'bg-bg-primary/95 rounded-2xl shadow-2xl',
                    'border-2 border-dashed border-primary-500'
                )}
            >
                <div className="p-4 bg-primary-500/10 rounded-full">
                    <Upload className="h-12 w-12 text-primary-500" />
                </div>
                <div className="text-center">
                    <p className="text-lg font-medium text-text-primary">{t('common.import')}</p>
                    <p className="text-sm text-text-secondary">Drop markdown files here</p>
                </div>
            </div>
        </div>
    );
}
