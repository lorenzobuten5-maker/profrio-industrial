---
name: print-layout-perfector
description: Expert skill for perfecting CSS print layouts in ProFrio Industrial. Use when the user asks to fix print output, PDF generation, page breaks, or the @media print layout of intervention or materials forms.
---

# Print Layout Perfector — ProFrio Industrial

## Core Print Rules

### Page Setup
```css
@page { margin: 8mm 10mm; }
```

### Typography for Print
```css
@media print {
  body { font-size: 9pt; font-family: 'Inter', Arial, sans-serif; }
  h2   { font-size: 11pt; font-weight: 700; }
  label, th { font-size: 8pt; }
}
```

### Page Break Rules
```css
@media print {
  .no-break    { page-break-inside: avoid; break-inside: avoid; }
  .force-break { page-break-before: always; break-before: always; }
  .firma-container, .temp-table, .observaciones-box { page-break-inside: avoid; }
}
```

### 2-Column Firma Layout
```css
@media print {
  .firma-container {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0;
    page-break-inside: avoid;
  }
  .firma-card { border: 0.8pt solid #1E3A8A; padding: 4mm; }
  .firma-line { border-bottom: 1pt solid #0F172A; min-height: 11mm; }
}
```

### 2-Column Observaciones + Pedido
```css
@media print {
  .print-two-col {
    display: grid;
    grid-template-columns: 1fr 1fr;
    border: 0.8pt solid #1E3A8A;
    break-inside: avoid;
  }
  .print-two-col > div { padding: 4mm; }
  .print-two-col > div:first-child { border-right: 0.8pt solid #1E3A8A; }
}
```

### Auto-Expand Textareas (js/print-pdf.js)
The `beforeprint` event must:
1. Loop all `textarea` elements
2. Set `height = scrollHeight + 8` px
3. On `afterprint`, restore original height

## Verification Steps
1. DevTools → More Tools → Rendering → Emulate CSS media → Print
2. Check signatures aren't cut across pages
3. Check all textarea text is fully visible
4. Print preview to verify 1-page or 2-page layout fits cleanly
