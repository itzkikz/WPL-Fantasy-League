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

  // Chrome on iOS has its Share button in a different spot than Safari,
  // so the install steps differ per browser
  const isIOSChrome = isIOS && /CriOS/i.test(navigator.userAgent);

  useEffect(() => {
    // Detect iOS
    // Every iOS browser (Safari, Chrome, Firefox, Opera) supports manual
    // "Add to Home Screen" via the share sheet, and none of them fire
    // beforeinstallprompt — so treat all of them as "iOS" for the banner.
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(iOS);

    // Detect Android
    const android = /Android/.test(navigator.userAgent);
    setIsAndroid(android);

    const checkInstallation = async () => {
      // Check if running in standalone mode
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isIOSStandalone = (window.navigator as any).standalone === true;

      // Check localStorage
      const isInstalledFromStorage = localStorage.getItem('pwa-installed') === 'true';

      // Check if dismissed earlier in this session (sessionStorage clears on the next visit)
      const isDismissed = sessionStorage.getItem('pwa-install-dismissed') === 'true';

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
      if (iOS) {
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

      // Check if dismissed earlier in this session (sessionStorage clears on the next visit)
      const isDismissed = sessionStorage.getItem('pwa-install-dismissed') === 'true';

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
    // Only hide for this session — the prompt returns on the next visit
    sessionStorage.setItem('pwa-install-dismissed', 'true');
  };

  if (!showBanner) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-surface/95 dark:bg-[#120C22]/95 backdrop-blur-xl border-b border-border shadow-card animate-fade-in">
      <div className="max-w-md mx-auto px-4 py-3">
        {/* iOS Instructions */}
        {isIOS && !deferredPrompt && (
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 min-w-0">
              <div className="shrink-0 w-9 h-9 rounded-full bg-gradient-core flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16 5l-1.42 1.42-1.59-1.59V16h-1.98V4.83L9.42 6.42 8 5l4-4 4 4zm4 5v11c0 1.1-.9 2-2 2H6c-1.11 0-2-.9-2-2V10c0-1.11.89-2 2-2h3v2H6v11h12V10h-3V8h3c1.1 0 2 .89 2 2z" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-text-primary mb-1">Install WPL Fantasy Football</p>
                {isIOSChrome ? (
                  <ol className="text-xs text-text-muted list-decimal list-inside space-y-0.5 leading-relaxed">
                    <li>
                      Tap the{" "}
                      <span className="inline-flex items-center align-middle mx-0.5 text-primary">
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M16 5l-1.42 1.42-1.59-1.59V16h-1.98V4.83L9.42 6.42 8 5l4-4 4 4zm4 5v11c0 1.1-.9 2-2 2H6c-1.11 0-2-.9-2-2V10c0-1.11.89-2 2-2h3v2H6v11h12V10h-3V8h3c1.1 0 2 .89 2 2z" />
                        </svg>
                      </span>{" "}
                      Share icon in the toolbar
                    </li>
                    <li>
                      Tap <span className="font-semibold text-text-secondary">"Add to Home Screen"</span>
                    </li>
                    <li>
                      Tap <span className="font-semibold text-text-secondary">Add</span> to confirm
                    </li>
                  </ol>
                ) : (
                  <ol className="text-xs text-text-muted list-decimal list-inside space-y-0.5 leading-relaxed">
                    <li>
                      Tap the{" "}
                      <span className="inline-flex items-center align-middle mx-0.5 text-primary">
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M16 5l-1.42 1.42-1.59-1.59V16h-1.98V4.83L9.42 6.42 8 5l4-4 4 4zm4 5v11c0 1.1-.9 2-2 2H6c-1.11 0-2-.9-2-2V10c0-1.11.89-2 2-2h3v2H6v11h12V10h-3V8h3c1.1 0 2 .89 2 2z" />
                        </svg>
                      </span>{" "}
                      Share button in the bottom toolbar
                    </li>
                    <li>
                      Scroll down and tap{" "}
                      <span className="font-semibold text-text-secondary">"Add to Home Screen"</span>
                    </li>
                    <li>
                      Tap <span className="font-semibold text-text-secondary">Add</span> to confirm
                    </li>
                  </ol>
                )}
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="shrink-0 p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-elevated transition-colors"
              aria-label="Dismiss"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Android/Chrome Install Button */}
        {!isIOS && deferredPrompt && (
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="shrink-0 w-9 h-9 rounded-full bg-gradient-core flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16 5l-1.42 1.42-1.59-1.59V16h-1.98V4.83L9.42 6.42 8 5l4-4 4 4zm4 5v11c0 1.1-.9 2-2 2H6c-1.11 0-2-.9-2-2V10c0-1.11.89-2 2-2h3v2H6v11h12V10h-3V8h3c1.1 0 2 .89 2 2z" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-text-primary truncate">Install WPL Fantasy Football</p>
                <p className="text-xs text-text-muted truncate">Get the full app experience</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={handleInstallClick}
                className="px-4 py-2 bg-gradient-button text-white rounded-full text-sm font-semibold hover:opacity-95 transition shadow-sm"
              >
                Install
              </button>
              <button
                onClick={handleDismiss}
                className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-elevated transition-colors"
                aria-label="Dismiss"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PWAInstallBanner;
