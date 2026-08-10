---
name: lighthouse-ci-auditor
description: Measures and improves Google Lighthouse Core Web Vitals metrics for ProFrio Industrial. Provides specific fixes for LCP, CLS, INP, and TTFB. Activate when the user asks about performance scores, Core Web Vitals, or Google ranking.
---

# Lighthouse CI Auditor — ProFrio Industrial

## Core Web Vitals Targets
| Metric | Target | Description |
|---|---|---|
| LCP | < 2.5s | Largest Contentful Paint |
| CLS | < 0.1 | Cumulative Layout Shift |
| INP | < 200ms | Interaction to Next Paint |
| TTFB | < 800ms | Time to First Byte |

## LCP Fixes
- `<link rel="preload">` for Inter font ✅ already in v25
- Hero card must render within first 2.5s — no heavy JS blocking render
- Add `loading="lazy"` to photos/images below the fold
- Avoid large uncompressed images in cards

## CLS Prevention
- Always set explicit `width` and `height` on `<img>` tags
- Reserve space for dynamically injected nav with CSS `min-height`
- Never insert elements above existing content dynamically
- Skeleton loaders ✅ prevent layout shift during data load

## INP Improvement
- Debounce all search inputs at 300ms ✅ already done in v25
- Use `requestAnimationFrame()` for visual DOM updates
- Keep event handler functions under 50ms execution time
- Avoid synchronous loops over large arrays in click handlers

## TTFB (Cloudflare Workers)
- Cloudflare Workers cold start < 5ms ✅ already excellent
- All static CSS/JS assets cached at Cloudflare edge
- Add cache-control headers in `_headers` file:
```
/js/*
  Cache-Control: public, max-age=31536000, immutable
/css/*
  Cache-Control: public, max-age=31536000, immutable
```

## Running Lighthouse
1. Open Chrome DevTools (`F12`)
2. Navigate to **Lighthouse** tab
3. Select: Mobile, Performance, Best Practices, SEO
4. Click **Analyze page load**
5. Target score: Performance > 90, Best Practices > 95
