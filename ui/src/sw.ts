/// <reference lib="webworker" />
// If TS complains about lib definitions, ensure "WebWorker" is in tsconfig lib (see notes below).
import { clientsClaim } from 'workbox-core'
import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching'

declare const self: ServiceWorkerGlobalScope

self.skipWaiting()
clientsClaim()

// Required: injection point for Workbox
cleanupOutdatedCaches()
precacheAndRoute(self.__WB_MANIFEST) // Workbox replaces this at build [web:137]

type Action = { action: string; title: string; icon?: string }
interface PushPayload {
  title?: string
  body?: string
  tag?: string
  url?: string
  renotify?: boolean
  badge?: string
  icon?: string
  data?: any
  actions?: Action[]
}

// Install/activate lifecycle
self.addEventListener('install', (_event: ExtendableEvent) => {
  self.skipWaiting()
})

self.addEventListener('activate', (event: ExtendableEvent) => {
  event.waitUntil(self.clients.claim())
})

// Handle push messages
self.addEventListener('push', (event: PushEvent) => {
  // Default payload
  let payload: PushPayload = { title: 'Update Check', body: '' }

  // Try to parse structured JSON payload; fallback to text if needed
  try {
    if (event.data) {
      // PushMessageData.json() is synchronous in SW
      payload = event.data.json() as PushPayload
    }
  } catch {
    try {
      const raw = event.data?.text ? (event.data.text() as unknown as string) : 'New update'
      payload = { title: 'Error Update', body: raw }
    } catch {
      payload = { title: 'Live Update', body: 'New update' }
    }
  }

  // Build notification
  const title = payload.title ?? 'Live Update'
  const options: NotificationOptions = {
    body: payload.body ?? '',
    tag: payload.tag ?? 'live-activity', // same tag replaces previous notification
    renotify: payload.renotify ?? true,
    // Prefer root-relative paths for PWA assets served from /public
    badge: payload.badge ?? '/icons/pwa-192x192.png',
    icon: payload.icon ?? '/icons/pwa-192x192.png',
    data: payload.data ?? { url: payload.url ?? '/' },
    actions: payload.actions ?? [] // e.g., [{ action: 'pause', title: 'Pause' }]
  }

  const showPromise = self.registration.showNotification(title, options)
  event.waitUntil(showPromise)
})

// Handle notification click — open/focus client and navigate
self.addEventListener('notificationclick', (event: NotificationEvent) => {
  event.notification.close()
  const url = (event.notification.data && (event.notification.data as any).url) || '/'

  const task = (async () => {
    const allClients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true })
    const targetPath = new URL(url, self.location.origin).pathname

    const existing = allClients.find((c): c is WindowClient => {
      return 'url' in c && typeof (c as WindowClient).url === 'string'
        && (c as WindowClient).url.includes(targetPath)
    })

    if (existing && 'focus' in existing) {
      return existing.focus()
    }
    if ('openWindow' in self.clients && typeof self.clients.openWindow === 'function') {
      return self.clients.openWindow(url)
    }
  })()

  event.waitUntil(task)
})

export {}