// Single source of truth for the app version and the service worker cache
// namespace. __APP_VERSION__ is injected at build time by vite.config.js
// (git short SHA, or VITE_APP_VERSION override).
export const APP_VERSION: string = __APP_VERSION__ || 'dev';

export const CACHE_VERSION = `v${APP_VERSION}`;
