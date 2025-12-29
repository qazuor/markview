import { Button } from '@/components/ui/Button';
import { usePWA } from '@/hooks/usePWA';
import { Download, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Install prompt component for PWA
 * Shows a banner prompting user to install the app
 */
export function InstallPrompt() {
    const { t } = useTranslation();
    const { isInstallable, promptInstall, dismissInstall } = usePWA();
    const [isDismissed, setIsDismissed] = useState(false);

    // Check if user previously dismissed the prompt
    useEffect(() => {
        const dismissed = localStorage.getItem('pwa-install-dismissed');
        setIsDismissed(dismissed === 'true');
    }, []);

    const handleInstall = async () => {
        await promptInstall();
    };

    const handleDismiss = () => {
        dismissInstall();
        setIsDismissed(true);
    };

    // Don't show if not installable, already dismissed, or installed
    if (!isInstallable || isDismissed) {
        return null;
    }

    return (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 max-w-md w-full mx-4">
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4">
                <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                        <Download className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>

                    <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{t('pwa.install.title')}</h3>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{t('pwa.install.description')}</p>

                        <div className="mt-3 flex gap-2">
                            <Button onClick={handleInstall} size="sm" className="flex-1">
                                {t('pwa.install.button')}
                            </Button>
                            <Button onClick={handleDismiss} variant="ghost" size="sm">
                                {t('common.cancel')}
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
