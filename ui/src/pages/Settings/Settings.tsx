import React, { useState } from "react";
import { useNavigate, useRouter } from "@tanstack/react-router";
import { ThemeToggle } from "../../components/ThemeToggle";
import { useManagerDetails } from "../../features/manager/hooks";
import { useUserStore } from "../../store/useUserStore";
import {
  Settings as SettingsIcon,
  Palette,
  Cpu,
  LogOut,
  RefreshCw,
  Check,
  ShieldCheck,
  ArrowLeft,
} from "lucide-react";

export default function Settings() {
  const { data: managerDetails } = useManagerDetails();
  const [clearing, setClearing] = useState(false);
  const [cleared, setCleared] = useState(false);
  const navigate = useNavigate();
  const router = useRouter();
  const removeUser = useUserStore((state) => state.removeUser);
  const user = useUserStore((state) => state.user);
  const isAdmin = user?.role === "admin";

  const handleLogout = () => {
    localStorage.removeItem("token");
    removeUser();
    navigate({ to: "/login" });
  };

  const handleClearCache = async () => {
    setClearing(true);

    try {
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isStandalone = window.matchMedia("(display-mode: standalone)").matches;

      if (isIOS && isStandalone) {
        alert(
          "📱 To fully reset the app on iOS:\n\n" +
            "1. Delete this app from your home screen\n" +
            "2. Open Safari and visit the site\n" +
            "3. Tap Share → Add to Home Screen\n\n" +
            "This will give you a completely fresh install."
        );
        setClearing(false);
        return;
      }

      if ("caches" in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map((name) => caches.delete(name)));
      }

      const authToken = localStorage.getItem("jwtToken");
      localStorage.clear();
      if (authToken) {
        localStorage.setItem("jwtToken", authToken);
      }

      if ("serviceWorker" in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map((reg) => reg.unregister()));
      }

      setCleared(true);

      setTimeout(() => {
        (window as Window).location.reload();
      }, 1500);
    } catch (error) {
      console.error("Error clearing cache:", error);
      alert("Failed to clear cache. Please try manually refreshing the page.");
      setClearing(false);
    }
  };

  const appVersion = localStorage.getItem("app_version") || "1.0.0";
  const managerList = Array.isArray(managerDetails?.managers)
    ? managerDetails?.managers
    : managerDetails?.managers?.split(",").map((s: string) => s.trim());

  return (
    <div className="min-h-screen bg-background text-text-primary font-outfit select-none px-3 sm:px-4 pt-3 sm:pt-4 pb-6 pb-[env(safe-area-inset-bottom)] lg:p-6 animate-fade-in transition-colors">
      <div className="max-w-2xl mx-auto space-y-3.5 sm:space-y-5">
        
        {/* Compact Header with Back Button */}
        <div className="relative rounded-2xl bg-gradient-overview bg-dots border border-border p-4 sm:p-5 overflow-hidden shadow-card">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-36 h-36 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.history.back()}
                aria-label="Go back"
                className="p-2.5 rounded-xl bg-surface border border-border hover:bg-elevated active:scale-95 transition-all text-text-muted hover:text-text-primary cursor-pointer shrink-0"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <h1 className="text-lg sm:text-xl font-black text-text-primary tracking-tight">
                  Settings
                </h1>
                <p className="text-xs text-text-muted mt-0.5">
                  Manage app preferences & account settings
                </p>
              </div>
            </div>
            <span className="text-[10px] font-extrabold uppercase font-mono tracking-wider px-2.5 py-1 rounded-full bg-surface border border-border text-text-muted">
              v{appVersion}
            </span>
          </div>
        </div>

        {/* Profile Card */}
        <div className="p-4 sm:p-5 rounded-2xl bg-card border border-border shadow-card relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-28 h-28 bg-primary/10 rounded-full blur-2xl -mr-8 -mt-8 transition-transform group-hover:scale-125 duration-500 pointer-events-none" />

          <div className="relative z-10 flex items-center gap-3.5 sm:gap-4">
            <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-2xl bg-gradient-to-br from-primary to-purple-700 border border-primary/30 flex items-center justify-center text-white text-xl sm:text-2xl font-black shadow-md shrink-0 overflow-hidden">
              {isAdmin ? (
                <ShieldCheck className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              ) : managerDetails?.logo ? (
                <img
                  src={managerDetails.logo}
                  alt={`${managerDetails.team} logo`}
                  className="h-10 w-10 sm:h-11 sm:w-11 object-contain"
                />
              ) : (
                managerDetails?.team?.charAt(0) || "U"
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-text-primary truncate">
                  {isAdmin ? "Administrator" : managerDetails?.team || "User Profile"}
                </h2>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {isAdmin ? (
                  <span className="px-2 py-0.5 rounded-md bg-primary/15 border border-primary/30 text-[10px] font-bold text-secondary font-mono">
                    System Admin
                  </span>
                ) : (
                  managerList?.map((manager: string, idx: number) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md bg-surface border border-border text-[10px] font-bold text-text-muted truncate max-w-[120px]"
                    >
                      {manager}
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Options Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          
          {/* Appearance Section */}
          <div className="p-4 sm:p-5 rounded-2xl bg-card border border-border shadow-card flex flex-col justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 shrink-0">
                <Palette className="w-4 h-4 text-secondary" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-extrabold text-text-primary uppercase tracking-wider">
                  Appearance
                </h3>
                <p className="text-[10px] sm:text-xs text-text-muted mt-0.5">
                  Customize color theme
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[var(--color-border-divider)]">
              <div>
                <p className="text-xs font-bold text-text-primary">App Theme</p>
                <p className="text-[10px] text-text-muted">Light & Dark mode</p>
              </div>
              <ThemeToggle />
            </div>
          </div>

          {/* System & Cache Section */}
          <div className="p-4 sm:p-5 rounded-2xl bg-card border border-border shadow-card flex flex-col justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 shrink-0">
                <Cpu className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-extrabold text-text-primary uppercase tracking-wider">
                  System
                </h3>
                <p className="text-[10px] sm:text-xs text-text-muted mt-0.5">
                  App storage & performance
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[var(--color-border-divider)]">
              <div>
                <p className="text-xs font-bold text-text-primary">Clear App Cache</p>
                <p className="text-[10px] text-text-muted">Reset local storage</p>
              </div>
              <button
                onClick={handleClearCache}
                disabled={clearing || cleared}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  cleared
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                    : clearing
                    ? "bg-surface text-text-muted cursor-not-allowed opacity-60"
                    : "bg-surface border border-border text-text-primary hover:bg-elevated hover:border-primary/30 active:scale-95"
                }`}
              >
                {cleared ? (
                  <>
                    <Check className="w-3.5 h-3.5" /> Cleared
                  </>
                ) : clearing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Clearing...
                  </>
                ) : (
                  "Clear Data"
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Danger Zone / Sign Out */}
        <div className="p-4 sm:p-5 rounded-2xl border border-danger/20 bg-danger/5 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-danger/10 text-danger shrink-0">
              <LogOut className="w-4 h-4 text-danger-bright" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-extrabold text-danger-bright uppercase tracking-wider">
                Sign Out
              </h3>
              <p className="text-[10px] sm:text-xs text-text-muted mt-0.5">
                Logout of your fantasy account on this device
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full sm:w-auto px-5 py-2 rounded-xl text-xs font-black text-white bg-danger hover:bg-danger/90 active:scale-95 transition-all shadow-md cursor-pointer shrink-0"
          >
            Sign Out
          </button>
        </div>

      </div>
    </div>
  );
}
