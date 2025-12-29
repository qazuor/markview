import { useEffect, useState } from 'react';
import type { Workbox } from 'workbox-window';

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface IOSNavigator extends Navigator {
    standalone?: boolean;
}

interface PWAState {
    isInstallable: boolean;
    isInstalled: boolean;
    isOnline: boolean;
    hasUpdate: boolean;
}

interface PWAActions {
    promptInstall: () => Promise<void>;
    dismissInstall: () => void;
    updateServiceWorker: () => void;
}

export function usePWA(): PWAState & PWAActions {
    const [installPromptEvent, setInstallPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
    const [isInstalled, setIsInstalled] = useState(false);
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [hasUpdate, setHasUpdate] = useState(false);
    const [wb, setWb] = useState<Workbox | null>(null);

    // Detect if app is installed
    useEffect(() => {
        const checkInstalled = () => {
            // Check if running in standalone mode
            const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
            // Check if running as PWA on iOS
            const isIOSPWA = (window.navigator as IOSNavigator).standalone === true;

            setIsInstalled(isStandalone || isIOSPWA);
        };

        checkInstalled();

        // Listen for display mode changes
        const mediaQuery = window.matchMedia('(display-mode: standalone)');
        const handleChange = () => checkInstalled();

        if (mediaQuery.addEventListener) {
            mediaQuery.addEventListener('change', handleChange);
        } else {
            // Fallback for older browsers
            mediaQuery.addListener(handleChange);
        }

        return () => {
            if (mediaQuery.removeEventListener) {
                mediaQuery.removeEventListener('change', handleChange);
            } else {
                mediaQuery.removeListener(handleChange);
            }
        };
    }, []);

    // Listen for install prompt
    useEffect(() => {
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            setInstallPromptEvent(e as BeforeInstallPromptEvent);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    // Listen for online/offline status
    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    // Listen for service worker updates
    useEffect(() => {
        if ('serviceWorker' in navigator) {
            import('workbox-window').then(({ Workbox }) => {
                const workbox = new Workbox('/sw.js');

                workbox.addEventListener('waiting', () => {
                    setHasUpdate(true);
                });

                workbox.register();
                setWb(workbox);
            });
        }
    }, []);

    const promptInstall = async () => {
        if (!installPromptEvent) {
            return;
        }

        await installPromptEvent.prompt();
        const { outcome } = await installPromptEvent.userChoice;

        if (outcome === 'accepted') {
            setInstallPromptEvent(null);
        }
    };

    const dismissInstall = () => {
        setInstallPromptEvent(null);
        // Store dismissal in localStorage
        localStorage.setItem('pwa-install-dismissed', 'true');
    };

    const updateServiceWorker = () => {
        if (wb) {
            wb.addEventListener('controlling', () => {
                window.location.reload();
            });

            wb.messageSkipWaiting();
        }
    };

    return {
        isInstallable: !!installPromptEvent && !isInstalled,
        isInstalled,
        isOnline,
        hasUpdate,
        promptInstall,
        dismissInstall,
        updateServiceWorker
    };
}
