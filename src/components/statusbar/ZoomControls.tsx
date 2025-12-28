import { useSettingsStore } from '@/stores/settingsStore';
import { cn } from '@/utils/cn';
import { Minus, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ZoomControlsProps {
    className?: string;
}

/**
 * Zoom controls for editor and preview font sizes
 */
export function ZoomControls({ className }: ZoomControlsProps) {
    const { t } = useTranslation();
    const zoomIn = useSettingsStore((s) => s.zoomIn);
    const zoomOut = useSettingsStore((s) => s.zoomOut);
    const resetZoom = useSettingsStore((s) => s.resetZoom);
    const getZoomPercentage = useSettingsStore((s) => s.getZoomPercentage);

    const percentage = getZoomPercentage();

    return (
        <div className={cn('flex items-center gap-1', className)} aria-label={t('zoom.controls')}>
            <button
                type="button"
                onClick={zoomOut}
                className={cn('p-1 rounded hover:bg-bg-hover transition-colors', 'focus:outline-none focus:ring-1 focus:ring-primary-500')}
                title={`${t('zoom.zoomOut')} (Ctrl+-)`}
                aria-label={t('zoom.zoomOut')}
            >
                <Minus className="h-3 w-3" />
            </button>

            <button
                type="button"
                onClick={resetZoom}
                className={cn(
                    'px-1.5 py-0.5 rounded hover:bg-bg-hover transition-colors',
                    'focus:outline-none focus:ring-1 focus:ring-primary-500',
                    'min-w-[40px] text-center'
                )}
                title={`${t('zoom.resetZoom')} (Ctrl+0)`}
                aria-label={`${t('zoom.currentZoom')}: ${percentage}%`}
            >
                {percentage}%
            </button>

            <button
                type="button"
                onClick={zoomIn}
                className={cn('p-1 rounded hover:bg-bg-hover transition-colors', 'focus:outline-none focus:ring-1 focus:ring-primary-500')}
                title={`${t('zoom.zoomIn')} (Ctrl++)`}
                aria-label={t('zoom.zoomIn')}
            >
                <Plus className="h-3 w-3" />
            </button>
        </div>
    );
}
