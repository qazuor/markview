import { usePWA } from '@/hooks/usePWA';
import { CloudOff, Wifi } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Offline indicator component
 * Shows a subtle notification when the app goes offline
 */
export function OfflineIndicator() {
    const { t } = useTranslation();
    const { isOnline } = usePWA();
    const [wasOffline, setWasOffline] = useState(false);
    const [showReconnected, setShowReconnected] = useState(false);

    useEffect(() => {
        if (!isOnline) {
            setWasOffline(true);
        } else if (wasOffline) {
            // Show "reconnected" message briefly
            setShowReconnected(true);
            const timer = setTimeout(() => {
                setShowReconnected(false);
                setWasOffline(false);
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [isOnline, wasOffline]);

    // Show offline indicator
    if (!isOnline) {
        return (
            <div className="fixed top-0 left-0 right-0 z-50">
                <div className="bg-amber-500 dark:bg-amber-600 text-white px-4 py-2">
                    <div className="flex items-center justify-center gap-2 text-sm">
                        <CloudOff className="w-4 h-4" />
                        <span>{t('pwa.offline.message')}</span>
                    </div>
                </div>
            </div>
        );
    }

    // Show reconnected message
    if (showReconnected) {
        return (
            <div className="fixed top-0 left-0 right-0 z-50">
                <div className="bg-green-500 dark:bg-green-600 text-white px-4 py-2 animate-fade-in">
                    <div className="flex items-center justify-center gap-2 text-sm">
                        <Wifi className="w-4 h-4" />
                        <span>{t('pwa.offline.reconnected')}</span>
                    </div>
                </div>
            </div>
        );
    }

    return null;
}
