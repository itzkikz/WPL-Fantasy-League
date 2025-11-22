import { useEffect, useState } from 'react'

export function UpdatePrompt() {
    const [needRefresh, setNeedRefresh] = useState(false)
    const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null)

    useEffect(() => {
        // Manual service worker registration
        if ('serviceWorker' in navigator) {
            // In dev mode with vite-plugin-pwa devOptions.enabled, the SW is at /dev-sw.js?dev-sw
            // In production, it's at /sw.js
            const swUrl = import.meta.env.DEV ? '/dev-sw.js?dev-sw' : '/sw.js'

            navigator.serviceWorker
                .register(swUrl, {
                    scope: '/'
                })
                .then((reg) => {
                    console.log('SW Registered:', reg)
                    setRegistration(reg)

                    // Check for updates periodically
                    setInterval(() => {
                        reg.update()
                    }, 60 * 60 * 1000) // Check every hour

                    // Listen for updates
                    reg.addEventListener('updatefound', () => {
                        const newWorker = reg.installing
                        if (newWorker) {
                            newWorker.addEventListener('statechange', () => {
                                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                    setNeedRefresh(true)
                                }
                            })
                        }
                    })
                })
                .catch((error) => {
                    console.error('SW registration error', error)
                })

            // Listen for app ready to work offline
            navigator.serviceWorker.ready.then(() => {
                console.log('App ready to work offline')
            })
        }
    }, [])

    if (!needRefresh) return null

    const handleUpdate = () => {
        if (registration && registration.waiting) {
            // Send message to waiting service worker to skip waiting
            registration.waiting.postMessage({ type: 'SKIP_WAITING' })

            // Reload the page after service worker takes control
            navigator.serviceWorker.addEventListener('controllerchange', () => {
                window.location.reload()
            })
        }
    }

    return (
        <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 z-50">
            <div className="flex flex-col gap-3">
                <div className="flex items-start gap-3">
                    <div className="shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-blue-600 dark:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                    </div>
                    <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                            Update Available
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                            A new version of the app is available. Reload to get the latest features.
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleUpdate}
                        className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                    >
                        Update Now
                    </button>
                    <button
                        onClick={() => setNeedRefresh(false)}
                        className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-medium rounded-lg transition-colors"
                    >
                        Later
                    </button>
                </div>
            </div>
        </div>
    )
}
