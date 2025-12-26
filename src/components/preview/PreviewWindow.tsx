import { usePreviewSync } from '@/hooks/useBroadcastChannel';
import { cn } from '@/utils/cn';
import { useTranslation } from 'react-i18next';
import { Preview } from './Preview';

/**
 * Standalone preview window component
 * Used when preview is opened in a new tab/window
 */
export function PreviewWindow() {
    const { t } = useTranslation();
    const { content, theme, isEditorConnected } = usePreviewSync(false);

    // Show disconnect message if editor is closed
    if (!isEditorConnected && content) {
        return (
            <div className={cn('flex h-screen flex-col', theme === 'dark' ? 'dark bg-secondary-950' : 'bg-white')}>
                {/* Warning banner */}
                <div className="bg-amber-100 px-4 py-2 text-center text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                    <p className="text-sm font-medium">{t('preview.editorDisconnected', 'Editor window closed')}</p>
                    <p className="text-xs">{t('preview.lastContent', 'Showing last received content')}</p>
                </div>

                {/* Preview content */}
                <div className="flex-1 overflow-hidden">
                    <Preview content={content} className="h-full" />
                </div>
            </div>
        );
    }

    // Waiting for connection
    if (!content) {
        return (
            <div
                className={cn(
                    'flex h-screen items-center justify-center',
                    theme === 'dark' ? 'dark bg-secondary-950 text-secondary-100' : 'bg-white text-secondary-900'
                )}
            >
                <div className="text-center">
                    <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-secondary-300 border-t-primary-500 mx-auto" />
                    <p className="text-lg font-medium">{t('preview.waitingForContent', 'Waiting for content...')}</p>
                    <p className="text-sm text-secondary-500">{t('preview.editInMainWindow', 'Edit your document in the main window')}</p>
                </div>
            </div>
        );
    }

    // Normal preview
    return (
        <div className={cn('h-screen', theme === 'dark' ? 'dark' : '')}>
            <Preview content={content} className="h-full" />
        </div>
    );
}

/**
 * Open preview in new window
 */
export function openPreviewWindow(): Window | null {
    const width = 800;
    const height = 600;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;

    return window.open(
        '/preview',
        'markview-preview',
        `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
    );
}
