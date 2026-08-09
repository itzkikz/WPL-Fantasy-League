import { useEffect, useRef, useState } from 'react'
import { registerSW } from 'virtual:pwa-register'

export function UpdatePrompt() {
    const [needRefresh, setNeedRefresh] = useState(false)
    const [offlineReady, setOfflineReady] = useState(false)
    const updateSWRef = useRef<((reloadPage?: boolean) => Promise<void>) | null>(null)

    useEffect(() => {
        if ('serviceWorker' in navigator) {
            let mounted = true
            let pollTimer: ReturnType<typeof setInterval> | null = null
            const removeListeners: Array<() => void> = []

            updateSWRef.current = registerSW({
                immediate: true,
                onNeedRefresh: () => setNeedRefresh(true),
                onOfflineReady: () => setOfflineReady(true),
                onRegistered: (registration) => {
                    if (!mounted || !registration) return

                    // iOS PWAs don't reliably poll for updates themselves, so
                    // check explicitly every 5 minutes and on focus/visibility.
                    const poll = () => {
                        registration.update().catch(() => {})
                    }
                    pollTimer = setInterval(poll, 5 * 60 * 1000)

                    const onFocus = () => {
                        if (!document.hidden) poll()
                    }
                    const onVisibility = () => {
                        if (!document.hidden) poll()
                    }
                    window.addEventListener('focus', onFocus)
                    document.addEventListener('visibilitychange', onVisibility)
                    removeListeners.push(() => {
                        window.removeEventListener('focus', onFocus)
                        document.removeEventListener('visibilitychange', onVisibility)
                    })
                },
            })

            return () => {
                mounted = false
                if (pollTimer) clearInterval(pollTimer)
                removeListeners.forEach((off) => off())
            }
        }
    }, [])

    const handleUpdate = () => {
        const updateSW = updateSWRef.current
        if (updateSW) {
            // Activates the waiting service worker (SKIP_WAITING) and reloads
            // the page on controllerchange so the new build is served cleanly.
            updateSW(true)
        }
        // iOS fallback: controllerchange can be unreliable on standalone PWAs,
        // so force a reload shortly after requesting the update.
        setTimeout(() => window.location.reload(), 1500)
    }

    return (
        <>
            {offlineReady && (
                <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-card border border-border rounded-2xl shadow-card dark:shadow-[0_20px_60px_rgba(0,0,0,0.65)] p-4 z-50 animate-slide-up">
                    <div className="flex items-start gap-3">
                        <div className="shrink-0 w-8 h-8 bg-success-bg text-success-text rounded-full flex items-center justify-center">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-text-primary">Ready to work offline</h3>
                            <p className="text-sm text-text-muted mt-1">
                                The app is cached and available offline.
                            </p>
                        </div>
                        <button
                            onClick={() => setOfflineReady(false)}
                            className="shrink-0 px-3 py-1.5 text-xs font-medium text-text-muted hover:text-text-primary rounded-lg transition-colors"
                        >
                            Dismiss
                        </button>
                    </div>
                </div>
            )}

            {needRefresh && (
                <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-card border border-border rounded-2xl shadow-card dark:shadow-[0_20px_60px_rgba(0,0,0,0.65)] p-4 z-50 animate-slide-up">
                    <div className="flex flex-col gap-3">
                        <div className="flex items-start gap-3">
                            <div className="shrink-0 w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-text-primary">
                                    Update Available
                                </h3>
                                <p className="text-sm text-text-muted mt-1">
                                    A new version of the app is available. Reload to get the latest features.
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={handleUpdate}
                                className="flex-1 px-4 py-2 bg-gradient-button text-white font-semibold rounded-lg hover:opacity-95 transition-colors"
                            >
                                Update Now
                            </button>
                            <button
                                onClick={() => setNeedRefresh(false)}
                                className="px-4 py-2 bg-elevated hover:bg-border text-text-primary font-medium rounded-lg transition-colors"
                            >
                                Later
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
