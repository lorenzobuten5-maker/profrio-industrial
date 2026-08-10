---
name: antigravity-ui-audit
description: Performs a comprehensive UI/UX audit of ProFrio Industrial pages. Checks visual hierarchy, color contrast, typography, spacing, animation quality and premium design. Activate when the user asks for a UI review, design improvements, or wants to know what to fix visually.
---

# Antigravity UI Audit — ProFrio Industrial

## Audit Categories

### 1. Visual Hierarchy
- [ ] Each page has one clear `<h1>` or `.page-title`
- [ ] Primary CTA uses `var(--grad-primary)` gradient button
- [ ] Secondary actions use `btn-secondary` outline style
- [ ] Destructive actions use `btn-danger` red gradient

### 2. Color Contrast (WCAG AA)
- [ ] White text on blue background → ratio ≥ 4.5:1
- [ ] Dark text on white cards → ratio ≥ 7:1
- [ ] Placeholder text → `var(--gray-400)` minimum

### 3. Typography Consistency
- [ ] Font: Inter (loaded from Google Fonts)
- [ ] Card titles: `font-weight: 600`, `font-size: 1rem`
- [ ] Section headers: `font-weight: 700`, `font-size: 1.1rem`
- [ ] Body text: `font-weight: 400`, `font-size: 0.9rem`
- [ ] No system fonts (Arial, sans-serif) used outside print

### 4. Spacing Consistency
- [ ] Card padding: `1.25rem 1.5rem`
- [ ] Section gap: `1.25rem`
- [ ] Button padding: `0.75rem 1.5rem`
- [ ] Form input padding: `0.75rem 1rem`

### 5. Micro-Animations
- [ ] Button hover: `transform: translateY(-1px)` + shadow enhancement
- [ ] Page entry: `body.page-enter` opacity fade-in via `utils.js`
- [ ] Checkbox check: `transform: scale(1.1)` on `:checked`
- [ ] Scroll-to-top button: smooth `opacity` transition

### 6. Premium Feel Checklist
- [ ] Cards use `var(--clay-shadow-white)` neumorphic shadows
- [ ] Gradients are diagonal 135deg — not flat backgrounds
- [ ] Bottom nav uses `backdrop-filter: blur(24px)` glass effect
- [ ] Skeleton loaders visible during Supabase data load
- [ ] Toast notifications for success/error feedback

## Output Format
Report results as:
- ✅ Passes: X items
- ⚠️ Warnings: List with fix suggestions
- ❌ Failures: List with exact CSS/HTML fix needed
