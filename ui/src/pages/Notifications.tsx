import React, { useState, useEffect } from "react";
import { useUserStore } from "../store/useUserStore";
import {
  useNotifications,
  useSubscribe,
} from "../features/notifications/hooks";
import { Notifications, SubscribeRequest } from "../features/notifications/types";
import Button from "../components/common/Button";
import NotificationItem from "../components/NotificationItem";

export default function Notifications() {
  const mutation = useSubscribe();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSubLoading, setIsSubLoading] = useState(true);
  const [notificationsList, setNotificationsList] = useState<Notifications>()

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
          console.info("User is already subscribed.");
          setIsSubscribed(true);
          return;
        }

        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlB64ToUint8Array(publicKey),
        });
        console.log("User is subscribed:", subscription);

        // Send subscription to server
        mutation.mutate({ subscription });
        setIsSubscribed(true);
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
    console.log("Notifications:", notifications);
  }, [notifications]);

  if (isSubLoading) {
    return <div>Loading...</div>;
  }

  const handleDismiss = (id) => {
    setNotificationsList(notificationsList.filter(notif => notif.id !== id));
  };

  return (
    <>
      {user && user?.teamName ? (
        <>
          <div className="p-6 w-full">
            <div className="max-w-2xl mx-auto">
              <h1 className="text-2xl font-bold mb-6">
                Notifications
              </h1>
              {!isSubscribed && (
                <Button
                  label="Allow Notifications"
                  onClick={() => subscribeUser()}
                />
              )}
              {isSubscribed && notifications && notifications.length > 0 ? (
                notifications.map((notif) => (
                  <NotificationItem
                    key={notif.time}
                    title={notif.title}
                    message={notif.message}
                    time={notif.time}
                    onDismiss={() => handleDismiss(notif.id)}
                  />
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-white/5 rounded-3xl shadow-sm border border-gray-100 dark:border-white/10 mt-6">
                  <svg className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">No notifications yet</p>
                  <p className="text-sm text-gray-500 mt-1 text-center">When you get notifications, they'll show up here.</p>
                </div>
              )}
            </div>
          </div>


        </>
      ) : (
        <>Login to get notifications</>
      )}
    </>
  );
}
