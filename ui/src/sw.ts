/// <reference lib="webworker" />
// If TS complains about lib definitions, ensure "WebWorker" is in tsconfig lib.
import { clientsClaim } from 'workbox-core'
import { cleanupOutdatedCaches, precacheAndRoute, matchPrecache, createHandlerBoundToURL } from 'workbox-precaching'
import { registerRoute, NavigationRoute, setDefaultHandler, setCatchHandler } from 'workbox-routing'
import { CacheFirst, NetworkFirst, StaleWhileRevalidate, NetworkOnly } from 'workbox-strategies'
import { ExpirationPlugin } from 'workbox-expiration'
import { CacheableResponsePlugin } from 'workbox-cacheable-response'

declare const self: ServiceWorkerGlobalScope

// Take control ASAP
self.skipWaiting()
clientsClaim()

// Required: injection point for Workbox precache
cleanupOutdatedCaches()
precacheAndRoute(self.__WB_MANIFEST) // index.html and build assets included via injectManifest.globPatterns [web:37]

// ---------------------------
// SPA navigation (app shell)
// ---------------------------
// Option A: cache-first from precache using createHandlerBoundToURL('index.html')
const appShellHandler = createHandlerBoundToURL('index.html') // ensure index.html is in precache [web:36]
registerRoute(new NavigationRoute(appShellHandler)) // serve app shell for navigations [web:36]

// Option B (alternative): NetworkFirst for navigations (commented out)
// registerRoute(new NavigationRoute(new NetworkFirst({ cacheName: 'pages', networkTimeoutSeconds: 3, plugins: [new CacheableResponsePlugin({ statuses: [200] })] })))

// ---------------------------
// Static assets at runtime
// ---------------------------
// JS/CSS/workers/fonts: SWR keeps them fresh but available offline
registerRoute(
  ({ request }) =>
    request.destination === 'script' ||
    request.destination === 'style' ||
    request.destination === 'worker' ||
    request.destination === 'font',
  new StaleWhileRevalidate({
    cacheName: 'assets',
    plugins: [new CacheableResponsePlugin({ statuses: [200] })],
  })
)

// Images: CacheFirst with expiration
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'images',
    plugins: [
      new CacheableResponsePlugin({ statuses: [200] }),
      new ExpirationPlugin({ maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 30 }),
    ],
  })
)

// ---------------------------
// API runtime caching
// ---------------------------
// Adjust strategy per data freshness needs; CacheFirst mirrors your config
registerRoute(
  ({ url }) => /^https:\/\/wpl-fantasy-league\.onrender\.com\/api\/.*$/i.test(url.href),
  new CacheFirst({
    cacheName: 'api-cache-v1',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({ maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 }),
    ],
  })
)

// Conservative default for unmatched requests; combine with offline fallback below
setDefaultHandler(new NetworkOnly()) // fall through to catch handler on failure [web:21]

// ---------------------------
// Offline fallback
// ---------------------------
// If any route fails (e.g., offline), return precached index.html for navigations.
// Optionally, add a dedicated offline.html to precache and use it here.
setCatchHandler(async ({ request }) => {
  if (request.destination === 'document') {
    // Guaranteed to be in precache due to globPatterns including html
    const fallback = await matchPrecache('index.html') // robust even if cache key is versioned [web:21]
    return fallback || Response.error()
  }
  return Response.error()
})

// ---------------------------
// Existing push notifications
// ---------------------------

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

// Install/activate lifecycle (kept from your file)
self.addEventListener('install', (_event: ExtendableEvent) => {
  self.skipWaiting()
})

self.addEventListener('activate', (event: ExtendableEvent) => {
  event.waitUntil(self.clients.claim())
})

// Handle push messages (kept from your file)
self.addEventListener('push', (event: PushEvent) => {
  let payload: PushPayload = { title: 'Update Check', body: '' }

  try {
    if (event.data) {
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

  const title = payload.title ?? 'Live Update'
  const options: NotificationOptions = {
    body: payload.body ?? '',
    tag: payload.tag ?? 'live-activity',
    renotify: payload.renotify ?? true,
    // Use paths that exist in your deployed public path; adjust if app is served under a subpath.
    badge: payload.badge ?? '/icons/pwa-192x192.png',
    icon: payload.icon ?? '/icons/pwa-192x192.png',
    data: payload.data ?? { url: payload.url ?? '/' },
    actions: payload.actions ?? [],
  }

  const showPromise = self.registration.showNotification(title, options)
  event.waitUntil(showPromise)
})

// Handle notification click — open/focus client and navigate (kept from your file)
self.addEventListener('notificationclick', (event: NotificationEvent) => {
  event.notification.close()
  const url = (event.notification.data && (event.notification.data as any).url) || '/'

  const task = (async () => {
    const allClients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true })
    const targetPath = new URL(url, self.location.origin).pathname

    const existing = allClients.find((c): c is WindowClient => {
      return 'url' in c && typeof (c as WindowClient).url === 'string' && (c as WindowClient).url.includes(targetPath)
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

// Google Fonts stylesheets: SWR
registerRoute(
  ({ url }) =>
    url.origin === 'https://fonts.googleapis.com' &&
    url.pathname.startsWith('/css2'),
  new StaleWhileRevalidate({
    cacheName: 'google-fonts-stylesheets',
  })
)

// Google Fonts files: CacheFirst
registerRoute(
  ({ url }) =>
    url.origin === 'https://fonts.gstatic.com' &&
    (url.pathname.endsWith('.woff2') || url.pathname.endsWith('.ttf')),
  new CacheFirst({
    cacheName: 'google-fonts-webfonts',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({ maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 }),
    ],
  })
)


export { }
