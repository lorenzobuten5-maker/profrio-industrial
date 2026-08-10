---
name: bundle-size-analyzer
description: Analyzes JavaScript and CSS file sizes in ProFrio Industrial to identify heavy files and suggest optimizations. Activate when the user asks about performance, load speed, or file sizes.
---

# Bundle Size Analyzer — ProFrio Industrial

## File Size Targets
| File | Max Size |
|---|---|
| css/global.css | 30 KB |
| css/dashboard.css | 15 KB |
| css/formularios.css | 20 KB |
| js/utils.js | 10 KB |
| js/auth.js | 15 KB |
| Any single JS module | 30 KB |

## CDN Dependencies (External — Cached by Browser)
| Library | Size | CDN |
|---|---|---|
| Supabase JS v2 | ~250 KB | cdn.jsdelivr.net |
| jsPDF 2.5.1 | ~300 KB | cdnjs.cloudflare.com |
| EmailJS | ~30 KB | cdn.jsdelivr.net |

## Analysis Steps
1. List all JS and CSS files with their sizes
2. Identify files over their target limit
3. Grep for functions defined but never called
4. Check for utility functions duplicated across files

## Optimization Strategies

### 1. Dead Code Removal
Use the `code-refactor-pro` skill to clean up unused functions.

### 2. Defer Non-Critical Scripts
```html
<!-- Change from: -->
<script src="js/email.js?v=25"></script>
<!-- To: -->
<script src="js/email.js?v=25" defer></script>
```

### 3. Consolidate Small Files
If any CSS file is under 2 KB, merge it into `css/global.css`.

### 4. Signature Compression
Ensure all canvas saves use `compressCanvas(canvas, 0.72)` — saves ~65% vs PNG.

## Quick Size Check (PowerShell)
```powershell
Get-ChildItem "js\","css\" -Recurse -File |
  Select-Object Name, @{N='KB';E={[math]::Round($_.Length/1KB,1)}} |
  Sort-Object KB -Descending
```
