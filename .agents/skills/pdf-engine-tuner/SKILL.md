---
name: pdf-engine-tuner
description: Diagnoses and optimizes the jsPDF-based PDF generation in ProFrio Industrial. Covers multi-page layouts, image embedding, font rendering, and file size optimization. Activate when the user reports PDF generation issues or wants to improve PDF output.
---

# PDF Engine Tuner — ProFrio Industrial

## Generation Architecture
| Method | Quality | Speed | Use Case |
|---|---|---|---|
| CSS `@media print` + browser Print | ⭐⭐⭐⭐⭐ | Fast | **Primary method** — best quality |
| jsPDF + html2canvas | ⭐⭐⭐ | Slow | Email attachment fallback only |

## Common Issues & Fixes

### Blurry Signatures in PDF
Always use PNG (not WebP) when embedding in jsPDF:
```javascript
const sigPNG = canvas.toDataURL('image/png', 1.0); // Full quality for PDF
doc.addImage(sigPNG, 'PNG', x, y, width, height);
```

### Text Clipped in Print
```css
@media print {
  textarea { overflow: visible !important; height: auto !important; }
}
```
And expand in `beforeprint` via `js/print-pdf.js`:
```javascript
window.addEventListener('beforeprint', () => {
  document.querySelectorAll('textarea').forEach(ta => {
    ta.style.height = ta.scrollHeight + 8 + 'px';
  });
});
```

### Page Break Issues
```css
@media print {
  .no-break    { page-break-inside: avoid; break-inside: avoid; }
  .force-break { page-break-before: always; break-before: always; }
}
```

## jsPDF Template
```javascript
const { jsPDF } = window.jspdf;
const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });

doc.setFont('helvetica', 'bold');
doc.setFontSize(14);
doc.text('ProFrio Industrial', 10, 15);

doc.setFont('helvetica', 'normal');
doc.setFontSize(10);
doc.text(`Cliente: ${cliente}`, 10, 30);
doc.text(`Fecha: ${fecha}`, 10, 37);

// Add signature image:
doc.addImage(sigPNG, 'PNG', 10, 200, 80, 30);

doc.save(`intervencion-${numero}.pdf`);
```

## Page Setup
```javascript
// A4 dimensions in mm: 210 x 297
// Safe print area with 8mm margins: 194 x 281
const PAGE_W = 210, PAGE_H = 297, MARGIN = 8;
```
