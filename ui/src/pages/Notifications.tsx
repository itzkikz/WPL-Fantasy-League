import React from "react";
import { useUserStore } from "../store/useUserStore";
import { useSubscribe } from "../features/notifications/hooks";
import { SubscribeRequest } from "../features/notifications/types";

export default function Notifications() {
  const mutation = useSubscribe();
  const publicKey =
    "BMIl52TuxsGMqPfiY0vKqyW_sXETc34YrkSTrEqrQEUQsLhMtIwBR1h_Hlmks5EFtY3u7Rz8M17Qy4Dwmv9v-A0";

  const subscribeUser = async () => {
    if ("serviceWorker" in navigator) {
      try {
        const registration = await navigator.serviceWorker.ready;
        const subscribed = await registration.pushManager.getSubscription();
        if (subscribed) {
          console.info("User is already subscribed.");
          return;
        } else {
          const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlB64ToUint8Array(publicKey),
          });
          console.log("User is subscribed:", subscription);

          // Send subscription to server
          //   await fetch(`http://192.168.29.222:8080/api/notify/subscribe`, {
          //     method: "POST",
          //     headers: {
          //       "Content-Type": "application/json",
          //     },
          //     body: JSON.stringify(subscription),
          //   });
          mutation.mutate({ subscription });
        }
      } catch (error) {
        console.error("Failed to subscribe the user:: ", error);
        // alert("Subscription failed. See console for details.");
        // setError(JSON.stringify(error));
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

  return (
    <>
      {user && user?.teamName ? (
        <>
          <button onClick={() => subscribeUser()}>Test</button>
        </>
      ) : (
        <>Login to get notifications</>
      )}
    </>
  );
}
