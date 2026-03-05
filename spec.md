# FarmFlow360

## Current State
FarmFlow360 is a mobile-first React web app with a Motoko backend on ICP. It has authentication, dashboard, estates, labour, rainfall, harvest, daily logs, weather, and profile screens. No PWA support currently exists -- no manifest, no service worker, no install prompt.

## Requested Changes (Diff)

### Add
- `manifest.webmanifest` in `public/` with app name, short name, icons, theme color, background color, display mode (standalone), start URL, orientation (portrait)
- PWA icons: 192x192 and 512x512 versions of the FarmFlow360 app icon in `public/`
- `<link rel="manifest">` and `<meta name="theme-color">` tags in `index.html`
- `<meta name="apple-mobile-web-app-capable">` and related Apple PWA meta tags in `index.html`
- `vite-plugin-pwa` or manual service worker registration for offline caching of app shell
- Install prompt banner/toast in the app (shown when browser fires `beforeinstallprompt`)

### Modify
- `index.html` -- add manifest link, theme-color meta, Apple PWA meta tags, title "FarmFlow360"
- `vite.config.js` -- add `vite-plugin-pwa` plugin with workbox config for caching app shell

### Remove
- Nothing

## Implementation Plan
1. Generate PWA icons (192x192 and 512x512) using generate_image
2. Create `public/manifest.webmanifest` with correct FarmFlow360 metadata
3. Update `index.html` with manifest link, theme-color, Apple PWA meta tags, and correct title
4. Install `vite-plugin-pwa` and configure it in `vite.config.js` with workbox for app shell caching
5. Add install prompt UI (small banner or toast) that appears when the browser supports PWA install
6. Validate and deploy
