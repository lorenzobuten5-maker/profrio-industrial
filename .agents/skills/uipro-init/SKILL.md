---
name: uipro-init
description: Initializes or refreshes the ProFrio Industrial UI design system tokens, color palettes, typography scales, and component library. Equivalent to running 'uipro init --ai antigravity'. Activate when starting a new page, redesigning a section, or adding new UI components.
---

# UIPro Init — ProFrio Industrial Design System

## Color Palette (Cryo-Blue Claymorphism)

```css
:root {
  --clay-blue-900: #0F172A;  /* Darkest — headings in print */
  --clay-blue-800: #1E3A8A;  /* Primary brand color */
  --clay-blue-700: #1D4ED8;  /* Hover states */
  --clay-blue-600: #2563EB;  /* Buttons, accents */
  --clay-blue-400: #60A5FA;  /* Light accent */

  --clay-bg:       #F0F7FF;  /* Page background */
  --clay-white:    #FFFFFF;  /* Card surfaces */
  --clay-off-white:#F8FAFC;  /* Subtle section backgrounds */

  --gray-900: #0F172A;  /* Body text */
  --gray-500: #64748B;  /* Secondary text */
  --gray-300: #CBD5E1;  /* Borders */
  --gray-100: #F1F5F9;  /* Background fills */
}
```

## Shadow System (Neumorphic Clay)

```css
:root {
  --clay-shadow-white:
    8px 10px 22px rgba(37,99,235,0.18),
    -4px -4px 12px rgba(255,255,255,1),
    inset -4px -4px 10px rgba(255,255,255,0.8),
    inset 4px 4px 10px rgba(37,99,235,0.08);

  --clay-shadow-input:
    inset 3px 3px 8px rgba(37,99,235,0.12),
    inset -3px -3px 8px rgba(255,255,255,1);

  --shadow-sm:  0 2px 8px rgba(37,99,235,0.12);
  --shadow-md:  0 4px 16px rgba(37,99,235,0.18);
  --shadow-lg:  0 8px 32px rgba(37,99,235,0.24);
}
```

## Typography Scale (Inter)

```css
--text-xs:   0.75rem;   /* 12px — badges, labels */
--text-sm:   0.875rem;  /* 14px — secondary text */
--text-base: 1rem;      /* 16px — body */
--text-lg:   1.125rem;  /* 18px — card titles */
--text-xl:   1.25rem;   /* 20px — section headers */
--text-2xl:  1.5rem;    /* 24px — page titles */
```

## Border Radius Scale

```css
--radius-sm:   8px;
--radius-md:   12px;
--radius-lg:   20px;
--radius-xl:   28px;
--radius-full: 9999px;
```

## Gradient Library

```css
--grad-primary: linear-gradient(135deg, #1E3A8A 0%, #2563EB 100%);
--grad-accent:  linear-gradient(135deg, #2563EB 0%, #60A5FA 100%);
--grad-hero:    linear-gradient(145deg, #0F172A 0%, #1E3A8A 55%, #2563EB 100%);
--grad-success: linear-gradient(135deg, #027A48 0%, #12B76A 100%);
--grad-danger:  linear-gradient(135deg, #BE123C 0%, #F43F5E 100%);
--grad-bg:      linear-gradient(160deg, #F0F7FF 0%, #E0F2FE 50%, #F8FAFC 100%);
```

## New Component Template

```html
<div class="card" style="
  padding: 1.5rem;
  border-radius: var(--radius-lg);
  box-shadow: var(--clay-shadow-white);
  background: white;
">
  <h3 style="font-size: var(--text-lg); font-weight: 700; color: var(--clay-blue-800);">
    Título del Componente
  </h3>
  <p style="color: var(--gray-500); font-size: var(--text-sm);">Descripción</p>
</div>
```

## Button Classes Reference

| Class | Usage |
|---|---|
| `btn btn-primary` | Main actions (Guardar, Enviar) |
| `btn btn-secondary` | Secondary actions (Cancelar, Volver) |
| `btn btn-danger` | Destructive (Eliminar, Cerrar Sesión) |
| `btn btn-outline` | Ghost buttons on dark backgrounds |
| `btn btn-sm` | Compact toolbar buttons |
