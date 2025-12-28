import { Preview } from '@/components/preview';
import { usePreviewSync } from '@/hooks/useBroadcastChannel';
import { useTheme } from '@/hooks/useTheme';
import { cn } from '@/utils/cn';
import { ExternalLink, Unplug } from 'lucide-react';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Standalone preview window component
 * Receives content from main editor via BroadcastChannel
 */
export function PreviewWindow() {
    const { t } = useTranslation();
    useTheme();

    const { content, theme, isEditorConnected, isConnected } = usePreviewSync(false);

    // Update document title
    useEffect(() => {
        document.title = `${t('preview.title')} - ${t('app.name')}`;
    }, [t]);

    // Apply theme class to document
    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [theme]);

    if (!isConnected) {
        return (
            <div className="flex h-screen items-center justify-center bg-bg-primary text-text-primary">
                <div className="text-center p-8">
                    <Unplug className="h-12 w-12 mx-auto mb-4 text-text-muted" />
                    <h1 className="text-xl font-semibold mb-2">{t('preview.notSupported')}</h1>
                    <p className="text-text-secondary">{t('preview.browserNotSupported')}</p>
                </div>
            </div>
        );
    }

    if (!isEditorConnected) {
        return (
            <div className="flex h-screen items-center justify-center bg-bg-primary text-text-primary">
                <div className="text-center p-8">
                    <ExternalLink className="h-12 w-12 mx-auto mb-4 text-text-muted animate-pulse" />
                    <h1 className="text-xl font-semibold mb-2">{t('preview.waitingForEditor')}</h1>
                    <p className="text-text-secondary">{t('preview.openEditorHint')}</p>
                </div>
            </div>
        );
    }

    return (
        <div className={cn('h-screen flex flex-col', 'bg-bg-primary text-text-primary')}>
            {/* Header bar */}
            <header className="flex items-center justify-between px-4 h-10 bg-bg-secondary border-b border-border shrink-0">
                <div className="flex items-center gap-2">
                    <div
                        className={cn(
                            'w-5 h-5 rounded flex items-center justify-center',
                            'bg-gradient-to-br from-primary-500 to-primary-600',
                            'text-white font-bold text-xs'
                        )}
                    >
                        Q
                    </div>
                    <span className="text-sm font-medium">{t('preview.title')}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-text-muted">
                    <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-green-500" />
                        {t('preview.connected')}
                    </span>
                </div>
            </header>

            {/* Preview content */}
            <main className="flex-1 overflow-hidden">
                <Preview content={content} className="h-full" />
            </main>
        </div>
    );
}
