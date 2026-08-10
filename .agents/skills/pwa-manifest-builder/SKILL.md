---
name: pwa-manifest-builder
description: Builds and improves the ProFrio Industrial PWA configuration including manifest.json, iOS meta tags, and the Add to Home Screen install flow. Activate when the user asks about PWA features, installability, or making the app installable.
---

# PWA Manifest Builder — ProFrio Industrial

## Current Status
- ✅ `manifest.json` exists at project root
- ✅ Manifest linked in all 7 HTML files
- ✅ `js/offline-sync.js` provides IndexedDB offline queue
- ⚠️ App icons need a real 192px and 512px PNG

## manifest.json Reference
```json
{
  "name": "ProFrio Industrial",
  "short_name": "ProFrio",
  "description": "Sistema de gestión de intervenciones y materiales para ProFrio Industrial",
  "start_url": "./index.html",
  "display": "standalone",
  "background_color": "#1E3A8A",
  "theme_color": "#1E3A8A",
  "orientation": "portrait",
  "icons": [
    { "src": "icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any maskable" },
    { "src": "icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any maskable" }
  ]
}
```

## iOS Safari Meta Tags (Add to all HTML `<head>`)
```html
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="ProFrio">
<link rel="apple-touch-icon" href="icon-192.png">
```

## Install Prompt (Add to Home Screen)
```javascript
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  document.getElementById('btn-install-app')?.removeAttribute('hidden');
});

document.getElementById('btn-install-app')?.addEventListener('click', async () => {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  deferredPrompt = null;
  if (outcome === 'accepted') window.showToast('✅ App instalada', 'success');
});
```

## App Icon Creation
- Design a 512×512 PNG with the ❄️ snowflake icon on `#1E3A8A` blue background
- Save as `icon-512.png` and resize to `icon-192.png`
- Both files go in the project root (same level as `index.html`)
