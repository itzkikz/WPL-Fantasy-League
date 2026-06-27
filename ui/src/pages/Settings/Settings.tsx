import React, { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ThemeToggle } from "../../components/ThemeToggle";
import { useManagerDetails } from "../../features/manager/hooks";
import { useUserStore } from "../../store/useUserStore";

export default function Settings() {
  const { data: managerDetails } = useManagerDetails();
  const [clearing, setClearing] = useState(false);
  const [cleared, setCleared] = useState(false);
  const navigate = useNavigate();
  const removeUser = useUserStore((state) => state.removeUser);

  const handleLogout = () => {
    localStorage.removeItem('token');
    removeUser();
    navigate({ to: '/login' });
  };

  const handleClearCache = async () => {
    setClearing(true);

    try {
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;

      if (isIOS && isStandalone) {
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

      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
      }

      const authToken = localStorage.getItem('jwtToken');
      localStorage.clear();
      if (authToken) {
        localStorage.setItem('jwtToken', authToken);
      }

      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map(reg => reg.unregister()));
      }

      setCleared(true);

      setTimeout(() => {
        (window as Window).location.reload();
      }, 1500);
    } catch (error) {
      console.error('Error clearing cache:', error);
      alert('Failed to clear cache. Please try manually refreshing the page.');
      setClearing(false);
    }
  };

  const appVersion = localStorage.getItem('app_version') || '1.0.0';
  const managerList = Array.isArray(managerDetails?.managers)
    ? managerDetails?.managers
    : managerDetails?.managers?.split(',').map((s: string) => s.trim());

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg p-4 lg:p-8 animate-in fade-in duration-500">
      <div className="max-w-3xl mx-auto space-y-8">

        {/* Header Section */}
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            Settings
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Manage your account preferences and app settings.
          </p>
        </div>

        {/* Profile Card */}
        <div className="p-6 rounded-2xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 shadow-sm backdrop-blur-md relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 dark:bg-blue-500/20 rounded-full blur-3xl -mr-10 -mt-10 transition-transform group-hover:scale-150 duration-700"></div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-inner">
                {managerDetails?.team?.charAt(0) || 'U'}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {managerDetails?.team || 'Loading...'}
                </h2>
                <div className="flex flex-wrap gap-2 mt-2">
                  {managerList?.map((manager: string, idx: number) => (
                    <span key={idx} className="px-2.5 py-0.5 rounded-full bg-gray-100 dark:bg-white/10 text-xs font-medium text-gray-700 dark:text-gray-300">
                      {manager}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Appearance Section */}
          <div className="p-6 rounded-2xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 shadow-sm backdrop-blur-md flex flex-col h-full">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 rounded-lg">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Appearance</h3>
            </div>

            <div className="flex items-center justify-between mt-auto py-2">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">App Theme</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Switch between light & dark mode</p>
              </div>
              <ThemeToggle />
            </div>
          </div>

          {/* System & Cache Section */}
          <div className="p-6 rounded-2xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 shadow-sm backdrop-blur-md flex flex-col h-full">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gray-100 dark:bg-gray-500/20 text-gray-600 dark:text-gray-400 rounded-lg">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">System</h3>
            </div>

            <div className="space-y-6 mt-auto">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Clear App Cache</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Reset local data</p>
                </div>
                <button
                  onClick={handleClearCache}
                  disabled={clearing || cleared}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${cleared
                    ? 'bg-green-500/10 text-green-600 dark:text-green-400 ring-1 ring-green-500/20'
                    : clearing
                      ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                      : 'bg-white dark:bg-white/5 text-gray-700 dark:text-gray-300 ring-1 ring-gray-200 dark:ring-white/10 hover:bg-gray-50 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white active:scale-95'
                    }`}
                >
                  {cleared ? '✓ Cleared' : clearing ? 'Clearing...' : 'Clear Data'}
                </button>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-white/5">
                <p className="text-sm text-gray-500 dark:text-gray-400">App Version</p>
                <span className="px-2 py-1 rounded bg-gray-100 dark:bg-white/5 text-xs font-mono text-gray-600 dark:text-gray-400">
                  v{appVersion}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="p-6 rounded-2xl border border-red-200 dark:border-red-900/30 bg-red-50/50 dark:bg-red-900/10 shadow-sm relative overflow-hidden">
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-red-600 dark:text-red-400">Sign Out</h3>
              <p className="text-sm text-red-500/80 dark:text-red-400/80 mt-1">
                You will need to sign back in to access your fantasy team.
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="px-6 py-2.5 rounded-xl font-semibold text-white bg-red-500 hover:bg-red-600 dark:bg-red-500/80 dark:hover:bg-red-500 shadow-sm shadow-red-500/20 transition-all active:scale-95 whitespace-nowrap"
            >
              Sign Out
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
