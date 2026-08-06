import { createRootRoute } from "@tanstack/react-router";
import { MainLayout } from "../components/layouts/MainLayout";

const CHUNK_ERROR_PATTERN =
    /Failed to fetch dynamically imported module|Importing a module script failed|Loading chunk .* failed|Unexpected token|Unable to preload CSS/i;

const isChunkLoadError = (error: unknown): boolean => {
    const message = error instanceof Error ? error.message : String(error);
    return CHUNK_ERROR_PATTERN.test(message);
};

const RECOVERY_KEY = "pwa_chunk_recovery_attempt";

// Called once when a lazy route chunk fails to load because the running app is
// stale (old hashed assets were removed after a deploy). Request the new
// service worker to take over and reload so the latest build is served.
const recoverFromStaleChunk = (): boolean => {
    try {
        const now = Date.now();
        const last = parseInt(sessionStorage.getItem(RECOVERY_KEY) || "0", 10);
        if (now - last < 30_000) return false;

        sessionStorage.setItem(RECOVERY_KEY, String(now));

        if ("serviceWorker" in navigator) {
            navigator.serviceWorker.getRegistration().then((reg) => {
                if (reg && reg.waiting) {
                    reg.waiting.postMessage({ type: "SKIP_WAITING" });
                }
            });
        }
        window.location.reload();
        return true;
    } catch {
        return false;
    }
};

function ErrorScreen({ chunkError }: { chunkError: boolean }) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6 text-center bg-background text-text-primary">
            <div className="text-5xl">⚠️</div>
            <h1 className="text-xl font-bold">Something went wrong</h1>
            <p className="text-sm text-text-muted max-w-sm">
                {chunkError
                    ? "A new version of the app was deployed. Reloading should fix this."
                    : "An unexpected error occurred while loading this page."}
            </p>
            <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
                Reload
            </button>
        </div>
    );
}

export const Route = createRootRoute({
    component: MainLayout,
    notFoundComponent: () => <div className="p-4 text-center">Page Not Found</div>,
    errorComponent: ({ error }) => {
        if (isChunkLoadError(error) && recoverFromStaleChunk()) {
            return <div className="p-4 text-center text-text-muted">Reloading…</div>;
        }
        return <ErrorScreen chunkError={isChunkLoadError(error)} />;
    },
});
