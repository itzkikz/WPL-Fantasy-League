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

  const { user } = useUserStore();

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
                <div className="text-center py-12 rounded-lg">
                  <p className="text-gray-500">No notifications</p>
                </div>
              )}</div>              </div>

             
        </>
      ) : (
        <>Login to get notifications</>
      )}
    </>
  );
}
