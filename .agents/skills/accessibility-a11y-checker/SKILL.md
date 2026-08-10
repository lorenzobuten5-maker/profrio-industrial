---
name: accessibility-a11y-checker
description: Comprehensive WCAG 2.1 AA accessibility audit for ProFrio Industrial. Checks ARIA labels, keyboard navigation, color contrast, form labels, and semantic HTML. Activate when the user asks about accessibility or screen reader support.
---

# Accessibility A11y Checker — ProFrio Industrial

## WCAG 2.1 AA Checklist

### 1. Semantic HTML
- [ ] One `<h1>` per page (page title)
- [ ] `<nav>` with `aria-label="Navegación principal"`
- [ ] All `<input>` have a matching `<label for="id">`
- [ ] Buttons use `<button>` not `<div>` or `<span>`
- [ ] Tables have `<th scope="col">` headers

### 2. ARIA Labels
- [ ] Icon-only buttons: `aria-label="Descripción de la acción"`
- [ ] Loading spinners: `role="status" aria-label="Cargando..."`
- [ ] Modals: `role="dialog" aria-modal="true" aria-labelledby="modal-title"`
- [ ] Signature canvas: `aria-label="Área de firma digital"`
- [ ] Scroll-to-top: `aria-label="Volver al inicio de la página"` ✅ done

### 3. Color Contrast
- [ ] Normal text: ratio ≥ 4.5:1
- [ ] Large text (18pt+): ratio ≥ 3:1
- [ ] UI icons and borders: ratio ≥ 3:1

### 4. Keyboard Navigation
- [ ] All interactive elements reachable by `Tab` key
- [ ] Logical tab order (top → bottom, left → right)
- [ ] Modals trap focus when open
- [ ] `Escape` key closes modals and dropdowns

### 5. Forms
- [ ] Required fields: `aria-required="true"`
- [ ] Error messages linked to inputs: `aria-describedby="error-id"`
- [ ] Success messages: `role="alert"` or `role="status"`

### 6. Images & Canvas
- [ ] Informational images: descriptive `alt` text
- [ ] Decorative images: `alt=""`
- [ ] Canvas signature pad: `role="img" aria-label="Área de firma"`

## Quick ARIA Fixes
```html
<!-- Scroll to top -->
<button id="scroll-to-top-btn" aria-label="Volver al inicio">↑</button>

<!-- Modal -->
<div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
  <h3 id="modal-title">Título del Modal</h3>
</div>

<!-- Spinner -->
<div class="spinner" role="status" aria-label="Cargando datos..."></div>
```
