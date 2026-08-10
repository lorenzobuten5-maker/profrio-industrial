---
name: responsive-inspector
description: Comprehensive checklist for inspecting and fixing responsive layout issues in ProFrio Industrial across mobile (320px-430px), tablet (768px), desktop (1024px+), and landscape orientation. Activate when the user reports UI layout issues on different screen sizes.
---

# Responsive Inspector — ProFrio Industrial

## Breakpoints
| Breakpoint | Width | Target |
|---|---|---|
| XS Mobile | 320px | iPhone SE |
| Mobile | 375–430px | iPhone 15 / Samsung S23 |
| Tablet | 768px | iPad |
| Desktop | 1024px+ | Laptop |
| Landscape Phone | height < 500px | Phone rotated |

## Mobile Checklist (Primary Target)
- [ ] Bottom nav not obscuring content → `padding-bottom: calc(90px + env(safe-area-inset-bottom))`
- [ ] Page scrolls vertically → `html, body { min-height: 100%; }` (NOT `height: 100%`)
- [ ] Form inputs don't zoom on focus → `font-size: 16px` minimum on inputs
- [ ] Touch targets are `min-height: 44px` and `min-width: 44px`
- [ ] No horizontal overflow → `overflow-x: hidden` on html and body
- [ ] Cards don't overflow container → `max-width: 100%; box-sizing: border-box`

## Landscape Phone Checklist
- [ ] Content fits within `max-height: 85vh` with `overflow-y: auto`
- [ ] Header compresses or hides non-essential elements
- [ ] Modals have `max-height: 85vh; overflow-y: auto`
- [ ] Bottom nav still visible and functional

## Desktop Checklist
- [ ] Sidebar (`.sidebar`) visible at `min-width: 1024px`
- [ ] Main content max width constrained to `1200px`
- [ ] Grid layouts use `@media (min-width: 768px)` not inline styles

## CSS Location Rules
- ALL responsive overrides → `css/responsive.css`
- No inline responsive styles in HTML files
- Mobile-first: base styles are mobile, use `@media (min-width: 768px)` to scale up

## Quick Fixes Pattern
```css
/* In css/responsive.css */
@media (max-height: 500px) and (orientation: landscape) {
  .top-header { padding: 0.5rem 1rem; }
  .main-wrapper { padding-top: 56px; }
}
@media (min-width: 768px) {
  .grid-mobile { grid-template-columns: repeat(2, 1fr); }
}
@media (min-width: 1024px) {
  .sidebar { display: flex; }
  .main-wrapper { margin-left: 240px; }
}
```
