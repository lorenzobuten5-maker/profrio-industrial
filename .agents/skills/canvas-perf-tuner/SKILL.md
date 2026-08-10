---
name: canvas-perf-tuner
description: Optimizes signature canvas performance and compression in ProFrio Industrial. Handles touch events, WebP compression, HiDPI retina rendering, and signature validation. Activate when the user reports signature issues or canvas performance problems.
---

# Canvas Performance Tuner — ProFrio Industrial

## Current Architecture
Both form files use `initSignaturePad(canvasId, inputId, clearBtnId)` defined in `js/utils.js`.

## WebP Compression (Standard in v25)
```javascript
// Always use this before saving to Supabase:
function compressCanvas(canvas, quality = 0.72) {
  return canvas.toDataURL('image/webp', quality);
}
// Result: ~65% smaller than PNG — saves Supabase storage
```

## Touch Event Fix (Critical for Mobile)
```javascript
canvas.addEventListener('touchstart', (e) => {
  e.preventDefault(); // Prevents page scroll while signing
}, { passive: false }); // Must be false to allow preventDefault
```

## HiDPI / Retina Display Fix
Signatures look blurry on Retina screens without DPI scaling:
```javascript
function setupHiDPICanvas(canvas) {
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width  = rect.width * dpr;
  canvas.height = rect.height * dpr;
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  return ctx;
}
```

## Empty Canvas Validation
```javascript
function isCanvasEmpty(canvas) {
  const ctx = canvas.getContext('2d');
  const pixels = new Uint32Array(
    ctx.getImageData(0, 0, canvas.width, canvas.height).data.buffer
  );
  return !pixels.some(color => color !== 0);
}
// Use before saving: if (isCanvasEmpty(sigCanvas)) { showToast('❌ Firma requerida'); return; }
```

## Quality Settings by Use Case
| Use Case | Quality | Format |
|---|---|---|
| Supabase storage | 0.72 | WebP ✅ |
| PDF embedding | 1.0 | PNG (jsPDF requires PNG) |
| Print output | 1.0 | PNG |

## Pen Smoothing
```javascript
ctx.lineJoin = 'round';
ctx.lineCap  = 'round';
ctx.lineWidth = 2.5;
ctx.strokeStyle = '#0F172A'; // Dark ink color
```
