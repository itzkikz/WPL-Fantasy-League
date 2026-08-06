// vite.config.ts
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";

// App version comes straight from package.json; bump it before each release.
let appVersion = "0.0.0";
try {
  const pkg = JSON.parse(
    readFileSync(fileURLToPath(new URL("./package.json", import.meta.url)), "utf-8")
  );
  appVersion = pkg.version || "0.0.0";
} catch {
  // fall back to the default above
}

export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(appVersion),
  },
  plugins: [
    // Please make sure that '@tanstack/router-plugin' is passed before '@vitejs/plugin-react'
    tanstackRouter({
      target: "react",
      autoCodeSplitting: true,
    }),
    react(),
    tailwindcss(),
    VitePWA({
      // Use a custom Service Worker so push handlers can be authored
      // and precache will be injected automatically.
      strategies: "injectManifest", // enable custom SW for push [docs]
      srcDir: "src", // where the SW file lives
      filename: "sw.ts", // custom SW entry
      registerType: "prompt",
      devOptions: { enabled: true }, // SW+manifest in dev (localhost is secure)
      includeAssets: [
        "favicon.ico",
        "robots.txt",
        "apple-touch-icon.png",
        "mask-icon.svg",
      ],
      manifest: {
        name: "WPL Fantasy Football",
        short_name: "WPLFF",
        description: "fantasy football app",
        start_url: "/",
        scope: "/",
        display: "standalone",
        theme_color: "#ffffffff",
        background_color: "#ffffffff",
        icons: [
          { src: "pwa-192x192.png", sizes: "192x192", type: "image/png" },
          { src: "pwa-512x512.png", sizes: "512x512", type: "image/png" },
          {
            src: "maskable-icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      // Pass Workbox InjectManifest options here if needed (for precache injection).
      injectManifest: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
      },
      // NOTE: runtimeCaching here is only for generateSW; with injectManifest,
      // implement runtime routes/plugins inside src/sw.ts instead.
      // cleanupOutdatedCaches is already handled in our custom sw.ts
    }),
  ],
});
