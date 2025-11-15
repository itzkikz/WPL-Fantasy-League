import React, { useState, useEffect } from "react";
import { useUserStore } from "../store/useUserStore";
import { useSubscribe } from "../features/notifications/hooks";
import { SubscribeRequest } from "../features/notifications/types";
import Button from "../components/common/Button";

export default function Notifications() {
  const mutation = useSubscribe();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
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
        setIsSubscribed(!!subscribed);
      } catch (error) {
        console.error("Failed to check subscription status:", error);
      } finally {
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
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

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      {user && user?.teamName ? (
        <>
          {!isSubscribed && (
            <Button 
              label="Allow Notifications" 
              onClick={() => subscribeUser()} 
            />
          )}
          {isSubscribed && (
            <div>✓ Notifications enabled</div>
          )}
        </>
      ) : (
        <>Login to get notifications</>
      )}
    </>
  );
}
