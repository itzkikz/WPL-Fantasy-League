// features/device/reportDevice.ts
// Silent, fire-and-forget heartbeat that tells the server how the user is
// running the app: installed as a PWA (vs browser), OS, browser, device type.
import apiClient from "../../api/client";
import { API_ENDPOINTS } from "../../api/endpoints";

export interface DeviceInfo {
  pwaInstalled: boolean;
  standalone: boolean;
  os: string;
  browser: string;
  deviceType: "mobile" | "tablet" | "desktop";
}

const safeLocalStorage = {
  get(key: string): string | null {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  },
};

export const detectDeviceInfo = (): DeviceInfo => {
  const ua = navigator.userAgent;
  const uaData = (navigator as any).userAgentData;

  const standalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as any).standalone === true;

  const pwaInstalled = standalone || safeLocalStorage.get("pwa-installed") === "true";

  // OS
  let os = "Unknown";
  if (/Windows/.test(ua)) os = "Windows";
  else if (/Mac OS X|Macintosh/.test(ua)) os = "macOS";
  else if (/Android/.test(ua)) os = "Android";
  else if (/iPhone|iPad|iPod/.test(ua)) os = "iOS";
  else if (/Linux/.test(ua)) os = "Linux";
  else if (uaData && typeof uaData.platform === "string" && uaData.platform) os = uaData.platform;

  // Browser
  let browser = "Unknown";
  if (/CriOS/.test(ua)) browser = "Chrome";
  else if (/FxiOS/.test(ua)) browser = "Firefox";
  else if (/Edg\//.test(ua)) browser = "Edge";
  else if (/OPiOS|Opera/.test(ua)) browser = "Opera";
  else if (/Chrome\//.test(ua)) browser = "Chrome";
  else if (/Safari\//.test(ua)) browser = "Safari";

  // Device type
  let deviceType: DeviceInfo["deviceType"] = "desktop";
  if (/Mobi|Android|iPhone|iPod/.test(ua)) deviceType = "mobile";
  else if (/iPad|Tablet/.test(ua)) deviceType = "tablet";

  return { pwaInstalled, standalone, os, browser, deviceType };
};

// Fire-and-forget: never blocks UI, never surfaces errors.
// Callers decide how often to report (MainLayout once per visit, install events, subscribe).
export const reportDevice = (): void => {
  try {
    const info = detectDeviceInfo();
    apiClient.post(API_ENDPOINTS.MANAGER.DEVICE_REPORT, info).catch(() => {
      // silent — reporting must never affect the user experience
    });
  } catch {
    // silent
  }
};
