# ProFrio Industrial — Project Rules for Antigravity

## Tech Stack
- Vanilla HTML, CSS, JavaScript (no frameworks)
- Supabase JS v2 for backend (`window.supabaseClient`)
- Cloudflare Workers for hosting
- jsPDF for PDF generation (CDN)

## Coding Standards
- ALWAYS use `?v=25` on all CSS and JS resource imports in HTML files
- NEVER add dark mode — always maintain Light Mode Claymorphism design
- ALL new JS utilities go in `js/utils.js` as `window.*` exports
- Use `window.supabaseClient` for all Supabase calls (never import directly)
- Always use `count: 'exact'` in Supabase queries that display counts
- Draft auto-save goes via `localStorage` with `pf_draft_*` key prefix
- All signature canvas data must use `compressCanvas(canvas, 0.72)` (WebP) before saving
- No `console.log` debug statements in committed code — use `console.warn` / `console.error`

## Design System (Cryo-Blue Claymorphism)
- Primary palette: `#0F172A`, `#1E3A8A`, `#2563EB`, `#F0F7FF`
- Font: Inter via Google Fonts (preloaded in `<head>`)
- Card shadows: `var(--clay-shadow-white)` and `var(--clay-shadow-light)` only
- Border radius: `var(--radius-lg)` for cards, `var(--radius-md)` for inputs
- Mobile-first: base styles are mobile, tablet/desktop extend with `@media (min-width: 768px)`
- Bottom nav clearance: `padding-bottom: calc(90px + env(safe-area-inset-bottom))`
- `html, body` must use `min-height: 100%` NOT `height: 100%` (to allow page scroll)

## Navigation (Role-Based)
- Nav is injected dynamically by `js/nav-router.js` — do NOT hardcode nav in HTML
- `jefe` role: Admin, Intervención, Materiales, Historial, Perfil
- `empleado` role: Inicio, Intervención, Materiales, Historial, Perfil

## Security
- `js/supabase-config.js` holds the anon key — this is OK (anon key is intentionally public)
- NEVER put `SERVICE_ROLE_KEY` in any client-side file
- Always call `window.guardRoute(['empleado','jefe'])` at start of every protected page
- Auto-logout after 30 min inactivity via `initAutoLogout(handleLogout)` in `utils.js`

## Print Layouts
- Signature section: 2 columns 50/50, `page-break-inside: avoid`
- Observaciones + Pedido: 2 columns 50/50, enmarcado con borde `0.8pt solid #1E3A8A`
- Textareas must auto-expand on `beforeprint` event in `js/print-pdf.js`
- `@page { margin: 8mm 10mm; }` — standard margins for all forms

## New File Checklist
- [ ] New HTML: include manifest, preload font, utils.js, correct CSS ?v=25
- [ ] New JS module: export via `window.*`, add `<script>` tag to relevant HTML files
- [ ] New CSS: add to appropriate CSS file, no standalone single-use stylesheets
- [ ] Version bump: when deploying, update all `?v=N` to `?v=N+1` in all 7 HTML files
