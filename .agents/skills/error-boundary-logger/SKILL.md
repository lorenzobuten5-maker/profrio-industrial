---
name: error-boundary-logger
description: Implements and maintains the global JavaScript error boundary in ProFrio Industrial. Handles unhandled exceptions, promise rejections, and provides user-friendly error UI. Activate when debugging crashes or adding error handling.
---

# Error Boundary Logger — ProFrio Industrial

## Current Implementation (js/utils.js)
```javascript
window.addEventListener('error', (event) => {
  console.warn('[ProFrio Error]', event.message, '|', event.filename, ':', event.lineno);
});
window.addEventListener('unhandledrejection', (event) => {
  console.warn('[ProFrio Unhandled Promise]', event.reason);
});
```

## Enhanced Full-Screen Error Overlay
Use for critical failures (auth loss, corrupt state):
```javascript
function showCriticalError(message) {
  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position: fixed; inset: 0; z-index: 9999;
    background: rgba(15,23,42,0.88);
    display: flex; align-items: center; justify-content: center; padding: 2rem;
  `;
  overlay.innerHTML = `
    <div style="background:#fff;border-radius:20px;padding:2rem;max-width:340px;text-align:center">
      <p style="font-size:2.5rem;margin:0">⚠️</p>
      <h3 style="color:#1E3A8A;margin:0.5rem 0">Algo salió mal</h3>
      <p style="color:#64748B;font-size:0.9rem">${message}</p>
      <button onclick="location.reload()" style="
        margin-top:1.5rem; padding:0.75rem 2rem;
        background:linear-gradient(135deg,#1E3A8A,#2563EB);
        color:#fff; border:none; border-radius:12px; cursor:pointer; font-weight:600;
      ">Reintentar</button>
    </div>
  `;
  document.body.appendChild(overlay);
}
```

## Error Category Responses
| Category | Action |
|---|---|
| Network / offline | Toast: "Sin conexión — guardando offline" |
| Supabase auth error | Redirect to `index.html` |
| Form save error | Toast error, keep form data intact |
| Critical JS exception | Full-screen error overlay |
| PDF generation fail | Toast: "Error al generar PDF, intente de nuevo" |

## Best Practices
- Wrap every `supabase.*` call in `try/catch`
- Always destructure `{ data, error }` and check `if (error)`
- Use `window.showToast('❌ Mensaje', 'error')` for form errors
- Never call `alert()` — always use the toast system
- Log with `console.warn` not `console.log`
