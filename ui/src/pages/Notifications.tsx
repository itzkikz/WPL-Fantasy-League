import { useState, useEffect } from "react";
import { useNavigate, useRouter } from "@tanstack/react-router";
import { useUserStore } from "../store/useUserStore";
import {
  useNotifications,
  useSubscribe,
  useMarkAsRead,
  useMarkAllAsRead,
  useDeleteNotification,
} from "../features/notifications/hooks";
import { Notifications as NotificationType } from "../features/notifications/types";
import { reportDevice } from "../features/device/reportDevice";
import NotificationItem from "../components/NotificationItem";
import {
  BellRing,
  CheckCheck,
  Inbox,
  LogIn,
  RefreshCw,
  ShieldAlert,
  ArrowLeft,
} from "lucide-react";

export default function Notifications() {
  const navigate = useNavigate();
  const router = useRouter();
  const mutation = useSubscribe();
  const markAsReadMutation = useMarkAsRead();
  const markAllAsReadMutation = useMarkAllAsRead();
  const deleteNotificationMutation = useDeleteNotification();

  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSubLoading, setIsSubLoading] = useState(false);
  const [visibleNotifications, setVisibleNotifications] = useState<NotificationType[]>([]);

  const publicKey =
    "BMIl52TuxsGMqPfiY0vKqyW_sXETc34YrkSTrEqrQEUQsLhMtIwBR1h_Hlmks5EFtY3u7Rz8M17Qy4Dwmv9v-A0";

  // Check subscription status on mount
  useEffect(() => {
    checkSubscriptionStatus();
  }, []);

  const checkSubscriptionStatus = async () => {
    if ("serviceWorker" in navigator) {
      try {
        const registration = await navigator.serviceWorker.ready;
        const subscribed = await registration.pushManager.getSubscription();
        mutation.mutate({ subscription: subscribed });
        setIsSubscribed(!!subscribed);
      } catch (error) {
        console.error("Failed to check subscription status:", error);
      } finally {
        setIsSubLoading(false);
      }
    } else {
      setIsSubLoading(false);
    }
  };

  const subscribeUser = async () => {
    if ("serviceWorker" in navigator) {
      try {
        const registration = await navigator.serviceWorker.ready;
        const subscribed = await registration.pushManager.getSubscription();

        if (subscribed) {
          setIsSubscribed(true);
          return;
        }

        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlB64ToUint8Array(publicKey),
        });

        mutation.mutate({ subscription });
        setIsSubscribed(true);
        // Fresh device report so push status + last-seen reflect immediately
        reportDevice();
      } catch (error) {
        console.error("Failed to subscribe the user:", error);
      }
    }
  };

  function urlB64ToUint8Array(base64: string) {
    const padding = "=".repeat((4 - (base64.length % 4)) % 4);
    const base64Safe = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
    const raw = atob(base64Safe);
    const out = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
    return out;
  }

  const user = useUserStore((state) => state.user);
  const { data: notifications, isLoading, error } = useNotifications();

  useEffect(() => {
    if (notifications) {
      setVisibleNotifications(notifications);
    }
  }, [notifications]);

  const unreadCount = visibleNotifications.filter((n) => !n.read).length;

  const handleMarkAllAsRead = () => {
    setVisibleNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    markAllAsReadMutation.mutate();
  };

  const handleOpen = (notif: NotificationType) => {
    if (!notif.read) {
      const notifId = notif.id || notif._id;
      setVisibleNotifications((prev) =>
        prev.map((n) => ((n.id || n._id) === notifId ? { ...n, read: true } : n))
      );
      if (notifId) {
        markAsReadMutation.mutate(notifId);
      }
    }
  };

  const handleDismiss = (notif: NotificationType) => {
    const notifId = notif.id || notif._id;
    setVisibleNotifications((prev) => prev.filter((n) => (n.id || n._id) !== notifId));
    if (notifId) {
      deleteNotificationMutation.mutate(notifId);
    }
  };

  if (isSubLoading) {
    return (
      <div className="w-full p-4 space-y-3">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className={`h-24 bg-surface border border-white/5 rounded-2xl skeleton-pulse stagger-${Math.min(i + 1, 5)}`}
          />
        ))}
      </div>
    );
  }

  if (!user || !user?.teamName) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="max-w-sm w-full text-center bg-surface border border-border rounded-3xl p-8 shadow-card">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center mb-4">
            <BellRing className="w-8 h-8 text-secondary" />
          </div>
          <h2 className="text-lg font-black text-white">Get notified</h2>
          <p className="text-sm text-text-secondary mt-2 leading-relaxed">
            Log in to stay updated with the latest league activity, gameweek results, and your
            team's performance.
          </p>
          <button
            onClick={() => navigate({ to: "/login" })}
            className="mt-5 w-full py-3 rounded-xl bg-gradient-button text-white text-sm font-bold flex items-center justify-center gap-2 active:scale-[0.99] transition-all shadow-[0_4px_16px_rgba(139,92,246,0.25)] cursor-pointer"
          >
            <LogIn className="w-4 h-4" /> Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full flex-1 h-full min-h-0 bg-background text-text-primary font-outfit select-none overflow-hidden animate-fade-in pb-[env(safe-area-inset-bottom)]">
      {/* STICKY FULL-WIDTH FIXED HEADER */}
      <div className="shrink-0 border-b border-border lg:border-b-0 bg-surface lg:bg-transparent shadow-sm lg:shadow-none sticky top-0 z-30 w-full">
        <header className="flex items-center gap-2.5 px-3 sm:px-4 py-2.5 lg:py-4 max-w-3xl mx-auto w-full">
          <button
            onClick={() => router.history.back()}
            className="lg:hidden flex items-center justify-center w-8 h-8 rounded-lg bg-background hover:bg-white/5 border border-border text-text-primary active:scale-95 transition-all cursor-pointer shrink-0"
            aria-label="Go back"
          >
            <ArrowLeft className="w-4 h-4 text-text-muted" />
          </button>

          <div className="w-9 h-9 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center text-secondary shrink-0">
            <BellRing className="w-4 h-4" />
          </div>

          <div className="flex-1 min-w-0">
            <h1 className="text-xs sm:text-sm font-black tracking-tight text-text-primary truncate">
              Notifications
            </h1>
            <p className="text-[10px] text-text-muted font-medium mt-0.5 truncate">
              Stay updated with league activity
            </p>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/15 border border-primary/40 text-secondary font-mono">
              {unreadCount > 0 ? `${unreadCount} new` : "All read"}
            </span>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-[10px] font-bold text-text-muted hover:text-secondary flex items-center gap-1 transition-colors cursor-pointer bg-background/50 border border-border px-2 py-0.5 rounded-lg"
              >
                <CheckCheck className="w-3 h-3" /> <span className="hidden sm:inline">Mark read</span>
              </button>
            )}
          </div>
        </header>
      </div>

      <div className="max-w-3xl mx-auto w-full flex flex-col flex-1 min-h-0 px-3 sm:px-4 py-3">
        {/* Scrollable Content */}
        <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide space-y-3 pb-6">
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className={`h-24 bg-surface border border-border rounded-2xl skeleton-pulse stagger-${Math.min(i + 1, 5)}`}
                />
              ))}
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-16 bg-surface border border-border rounded-2xl text-center">
              <div className="w-14 h-14 rounded-full bg-danger/10 border border-danger/20 flex items-center justify-center mb-3">
                <ShieldAlert className="w-7 h-7 text-danger-bright" />
              </div>
              <p className="text-sm font-bold text-text-primary">Couldn't load notifications</p>
              <p className="text-xs text-text-muted mt-1 mb-4">
                Something went wrong while fetching your notifications.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 rounded-lg bg-primary/15 border border-primary/40 text-primary text-xs font-bold flex items-center gap-1.5 cursor-pointer hover:bg-primary/25 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Retry
              </button>
            </div>
          ) : visibleNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 bg-surface border border-border rounded-2xl text-center">
              <div className="w-16 h-16 rounded-full bg-surface border border-border flex items-center justify-center mb-4">
                <Inbox className="w-8 h-8 text-text-muted/50" />
              </div>
              <p className="text-base font-bold text-text-primary">No notifications yet</p>
              <p className="text-sm text-text-muted mt-1">When you get notifications, they'll show up here.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {!isSubscribed && (
                <button
                  onClick={() => subscribeUser()}
                  className="w-full p-3 rounded-xl bg-surface border border-dashed border-primary/40 flex items-center justify-between gap-3 cursor-pointer hover:bg-primary/10 transition-all"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-9 h-9 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center">
                      <BellRing className="w-4 h-4 text-secondary" />
                    </span>
                    <div className="text-left">
                      <p className="text-xs font-bold text-text-primary">Enable push notifications</p>
                      <p className="text-[10px] text-text-muted">Get alerted instantly, even when the app is closed</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-primary border border-primary/40 bg-primary/10 px-2.5 py-1 rounded-full">
                    Enable
                  </span>
                </button>
              )}
              {visibleNotifications.map((notif) => (
                <NotificationItem
                  key={notif.id || notif._id || notif.time}
                  title={notif.title}
                  message={notif.message}
                  time={notif.time}
                  unread={!notif.read}
                  onOpen={() => handleOpen(notif)}
                  onDismiss={() => handleDismiss(notif)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}