// components/PWAInstallBanner.tsx
import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: ReadonlyArray<string>;
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
    appinstalled: Event;
  }
}

const PWAInstallBanner: React.FC = () => {
  const [showBanner, setShowBanner] = useState<boolean>(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState<boolean>(false);
  const [isAndroid, setIsAndroid] = useState<boolean>(false);

  useEffect(() => {
    // Detect iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    const isIOSSafari = iOS && !navigator.userAgent.match(/CriOS|FxiOS|OPiOS|mercury/i);
    setIsIOS(isIOSSafari);

    // Detect Android
    const android = /Android/.test(navigator.userAgent);
    setIsAndroid(android);

    const checkInstallation = async () => {
      // Check if running in standalone mode
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isIOSStandalone = (window.navigator as any).standalone === true;

      // Check localStorage
      const isInstalledFromStorage = localStorage.getItem('pwa-installed') === 'true';
      const dismissedTimestamp = localStorage.getItem('pwa-install-dismissed-timestamp');

      // Clear dismissed state after 7 days
      const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;
      let isDismissed = false;

      if (dismissedTimestamp) {
        const dismissedTime = parseInt(dismissedTimestamp, 10);
        if (Date.now() - dismissedTime < SEVEN_DAYS) {
          isDismissed = true;
        } else {
          // Clear old dismissal
          localStorage.removeItem('pwa-install-dismissed');
          localStorage.removeItem('pwa-install-dismissed-timestamp');
        }
      }

      // If already installed, don't show banner
      if (isStandalone || isIOSStandalone || isInstalledFromStorage) {
        console.log('PWA already installed, not showing banner');
        setShowBanner(false);
        return;
      }

      // If dismissed recently, don't show
      if (isDismissed) {
        console.log('PWA banner dismissed recently, not showing');
        setShowBanner(false);
        return;
      }

      // For iOS, show manual instructions banner
      if (isIOSSafari) {
        console.log('iOS detected, showing manual install instructions');
        setShowBanner(true);
        return;
      }

      // For getInstalledRelatedApps
      if ('getInstalledRelatedApps' in navigator) {
        try {
          const relatedApps = await (navigator as any).getInstalledRelatedApps();
          if (relatedApps.length > 0) {
            console.log('Related apps installed, not showing banner');
            setShowBanner(false);
            return;
          }
        } catch (error) {
          console.log('getInstalledRelatedApps not available');
        }
      }

      // For Android, we need to wait for beforeinstallprompt
      // Don't show banner yet, it will be shown when event fires
      console.log('Waiting for beforeinstallprompt event');
    };

    checkInstallation();

    // Listen for beforeinstallprompt (Chrome/Edge only)
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent): void => {
      console.log('beforeinstallprompt event fired');
      e.preventDefault();
      setDeferredPrompt(e);

      const isInstalled = localStorage.getItem('pwa-installed') === 'true';
      const dismissedTimestamp = localStorage.getItem('pwa-install-dismissed-timestamp');

      // Check if recently dismissed
      let isDismissed = false;
      if (dismissedTimestamp) {
        const dismissedTime = parseInt(dismissedTimestamp, 10);
        const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;
        if (Date.now() - dismissedTime < SEVEN_DAYS) {
          isDismissed = true;
        }
      }

      if (!isInstalled && !isDismissed) {
        console.log('Showing install banner');
        setShowBanner(true);
      } else {
        console.log('Not showing banner - installed:', isInstalled, 'dismissed:', isDismissed);
      }
    };

    const handleAppInstalled = (): void => {
      console.log('App installed');
      localStorage.setItem('pwa-installed', 'true');
      setShowBanner(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async (): Promise<void> => {
    if (!deferredPrompt) return;

    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        localStorage.setItem('pwa-installed', 'true');
        setShowBanner(false);
      }
    } catch (error) {
      console.error('Error during installation:', error);
    }

    setDeferredPrompt(null);
  };

  const handleDismiss = (): void => {
    console.log('Banner dismissed');
    setShowBanner(false);
    localStorage.setItem('pwa-install-dismissed', 'true');
    localStorage.setItem('pwa-install-dismissed-timestamp', Date.now().toString());
  };

  if (!showBanner) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 text-white shadow-lg">
      <div className="max-w-md mx-auto px-4 py-3">
        {/* iOS Instructions */}
        {isIOS && !deferredPrompt && (
          <div className="flex flex-col gap-2">
            <div className="flex items-start justify-between">
              <div className="flex-1 pr-2">
                <p className="text-sm font-medium mb-1">Install WPL Fantasy Football</p>
                <p className="text-xs opacity-90">
                  Tap <span className="inline-flex items-center mx-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M16 5l-1.42 1.42-1.59-1.59V16h-1.98V4.83L9.42 6.42 8 5l4-4 4 4zm4 5v11c0 1.1-.9 2-2 2H6c-1.11 0-2-.9-2-2V10c0-1.11.89-2 2-2h3v2H6v11h12V10h-3V8h3c1.1 0 2 .89 2 2z" />
                    </svg>
                  </span> then "Add to Home Screen"
                </p>
              </div>
              <button
                onClick={handleDismiss}
                className="px-3 py-2 text-white hover:bg-white/20 rounded-lg transition shrink-0"
                aria-label="Dismiss"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Android/Chrome Install Button */}
        {!isIOS && deferredPrompt && (
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium">Install WPL Fantasy Football</p>
              <p className="text-xs opacity-90">Get the full app experience</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleInstallClick}
                className="px-4 py-2 bg-white text-blue-600 rounded-lg text-sm font-semibold hover:bg-gray-100 transition"
              >
                Install
              </button>
              <button
                onClick={handleDismiss}
                className="px-3 py-2 text-white hover:bg-white/20 rounded-lg transition"
                aria-label="Dismiss"
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PWAInstallBanner;
