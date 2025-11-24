import React, { useState } from "react";
import StatRow from "../../components/StatRow";
import { ThemeToggle } from "../../components/ThemeToggle";
import { useManagerDetails } from "../../features/manager/hooks";

export default function Settings() {
  const { data: managerDetails, isLoading, isSuccess } = useManagerDetails();
  const [clearing, setClearing] = useState(false);
  const [cleared, setCleared] = useState(false);

  const handleClearCache = async () => {
    setClearing(true);

    try {
      // Check if it's an iOS PWA
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;

      if (isIOS && isStandalone) {
        // iOS PWA - can't force clear, show instructions
        alert(
          '📱 To fully reset the app on iOS:\n\n' +
          '1. Delete this app from your home screen\n' +
          '2. Open Safari and visit the site\n' +
          '3. Tap Share → Add to Home Screen\n\n' +
          'This will give you a completely fresh install.'
        );
        setClearing(false);
        return;
      }

      // Clear all caches
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        console.log('Clearing caches:', cacheNames);
        await Promise.all(cacheNames.map(name => caches.delete(name)));
      }

      // Clear localStorage (except auth tokens)
      const authToken = localStorage.getItem('jwtToken');
      localStorage.clear();
      if (authToken) {
        localStorage.setItem('jwtToken', authToken);
      }

      // Unregister service workers
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map(reg => reg.unregister()));
      }

      setCleared(true);

      // Reload after a short delay
      setTimeout(() => {
        (window as Window).location.reload();
      }, 1500);
    } catch (error) {
      console.error('Error clearing cache:', error);
      alert('Failed to clear cache. Please try manually refreshing the page.');
      setClearing(false);
    }
  };

  // Get app version
  const appVersion = localStorage.getItem('app_version') || 'Unknown';

  return (
    <div className="p-6 border-b border-light-border dark:border-dark-border">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-4xl font-bold">Hi, {managerDetails?.team}</h2>
      </div>

      <div className="space-y-3 mb-4">
        <StatRow
          textSize="text-3xl"
          label="Managers"
          value=""
          border={false}
        />
        {managerDetails?.managers.split(',').map((val) => (<StatRow
          textSize="text-xl"
          label={val}
          value=""
          border={false}
        />))}

        {/* <StatRow
          textSize="text-xl"
          label="Password"
          value="Click to change"
          border={false}
        /> */}
      </div>

      <div className="flex items-center justify-between mt-4 mb-4">
        <h2 className="text-2xl font-bold">Appearance</h2>
      </div>

      <div className="space-y-3 mb-6">
        <div
          className="flex items-center justify-between"
        >
          <p>Theme</p>
          <div className="flex items-center gap-3">
            <p className="font-semibold">
              <ThemeToggle />
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-6 mb-4">
        <h2 className="text-2xl font-bold">Advanced</h2>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">App Version</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{appVersion}</p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="font-medium">Clear App Cache</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Reset the app and clear all cached data
            </p>
          </div>
          <button
            onClick={handleClearCache}
            disabled={clearing || cleared}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${cleared
                ? 'bg-green-500 text-white'
                : clearing
                  ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                  : 'bg-red-500 hover:bg-red-600 text-white'
              }`}
          >
            {cleared ? '✓ Cleared' : clearing ? 'Clearing...' : 'Clear Cache'}
          </button>
        </div>

        <div className="text-xs text-gray-500 dark:text-gray-400 border-t border-light-border dark:border-dark-border pt-4">
          <p className="font-semibold mb-1">Note:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Clearing cache will reload the app</li>
            <li>You will stay logged in</li>
            <li>On iOS PWA, you may need to reinstall for full reset</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
