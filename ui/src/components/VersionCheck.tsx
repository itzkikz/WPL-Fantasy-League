import { useEffect, useState } from 'react'

// IMPORTANT: Increment this version number with each major deployment
const CURRENT_VERSION = '1.1.0'
const VERSION_KEY = 'app_version'

export function VersionCheck() {
    const [showUpdateBanner, setShowUpdateBanner] = useState(false)
    const [dismissed, setDismissed] = useState(false)

    useEffect(() => {
        try {
            // Get the version from localStorage
            const storedVersion = localStorage.getItem(VERSION_KEY)

            // If no version stored, or version is old, show banner
            if (!storedVersion || storedVersion !== CURRENT_VERSION) {
                console.log(`Version mismatch: stored=${storedVersion}, current=${CURRENT_VERSION}`)
                setShowUpdateBanner(true)

                // Update to current version
                localStorage.setItem(VERSION_KEY, CURRENT_VERSION)
            }

            // Also check if service worker cache version is old
            if ('caches' in window) {
                caches.keys().then((cacheNames) => {
                    const hasOldCache = cacheNames.some(name =>
                        name.startsWith('wpl-fantasy-') && !name.includes('v3')
                    )
                    const hasNonVersionedCache = cacheNames.some(name =>
                        name === 'assets' || name === 'images' || name === 'api-cache-v1'
                    )

                    if (hasOldCache || hasNonVersionedCache) {
                        console.log('Old cache detected:', cacheNames)
                        setShowUpdateBanner(true)
                    }
                })
            }
        } catch (error) {
            console.error('Version check error:', error)
        }
    }, [])

    if (!showUpdateBanner || dismissed) return null

    const handleReinstall = () => {
        // Show instructions modal or redirect to help page
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches

        if (isIOS && isStandalone) {
            // iOS PWA - needs reinstall
            alert(
                '📱 To update the app:\n\n' +
                '1. Delete this app from your home screen\n' +
                '2. Open Safari and visit the site\n' +
                '3. Tap Share → Add to Home Screen\n\n' +
                'This one-time update is required for the latest features.'
            )
        } else {
            // Browser or Android - hard reload should work
            if ('caches' in window) {
                caches.keys().then((names) => {
                    return Promise.all(names.map(name => caches.delete(name)))
                }).then(() => {
                    (window as Window).location.reload()
                })
            } else {
                (window as Window).location.reload()
            }
        }
    }

    const handleDismiss = () => {
        setDismissed(true)
        // Set a flag to not show again for 24 hours
        const dismissedUntil = Date.now() + (24 * 60 * 60 * 1000)
        localStorage.setItem('update_banner_dismissed', dismissedUntil.toString())
    }

    return (
        <div className="fixed top-0 left-0 right-0 bg-linear-to-r from-purple-600 to-pink-600 text-white px-4 py-3 z-100 shadow-lg">
            <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 flex-1">
                    <div className="shrink-0">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div className="flex-1">
                        <p className="font-semibold text-sm sm:text-base">
                            App Update Required
                        </p>
                        <p className="text-xs sm:text-sm opacity-90">
                            Please update to get the latest features and improvements
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleReinstall}
                        className="px-3 py-1.5 sm:px-4 sm:py-2 bg-white text-purple-600 font-semibold rounded-lg text-xs sm:text-sm hover:bg-gray-100 transition-colors whitespace-nowrap"
                    >
                        Update Now
                    </button>
                    <button
                        onClick={handleDismiss}
                        className="px-2 py-1.5 sm:px-3 sm:py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                        aria-label="Dismiss"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    )
}
