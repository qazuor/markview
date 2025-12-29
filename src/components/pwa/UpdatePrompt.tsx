import { Button } from '@/components/ui/Button';
import { usePWA } from '@/hooks/usePWA';
import { RefreshCw, X } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Update prompt component
 * Shows when a new version of the app is available
 */
export function UpdatePrompt() {
    const { t } = useTranslation();
    const { hasUpdate, updateServiceWorker } = usePWA();
    const [isDismissed, setIsDismissed] = useState(false);

    const handleUpdate = () => {
        updateServiceWorker();
    };

    const handleDismiss = () => {
        setIsDismissed(true);
    };

    if (!hasUpdate || isDismissed) {
        return null;
    }

    return (
        <div className="fixed bottom-4 right-4 z-50 max-w-sm">
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4">
                <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                        <RefreshCw className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>

                    <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{t('pwa.update.title')}</h3>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{t('pwa.update.description')}</p>

                        <div className="mt-3 flex gap-2">
                            <Button onClick={handleUpdate} size="sm" className="flex-1">
                                {t('pwa.update.button')}
                            </Button>
                            <Button onClick={handleDismiss} variant="ghost" size="sm">
                                {t('pwa.update.later')}
                            </Button>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={handleDismiss}
                        className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        aria-label={t('common.close')}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
