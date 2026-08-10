---
name: toast-notification-pro
description: Provides animated floating toast notifications with clay shadow cards, success/error/warning states, auto-dismiss progress indicators, and haptic feedback. Activate when adding user alerts or form submission feedback.
---

# Toast Notification Pro — ProFrio Industrial

## Design Specifications
- **Position**: Top-right (Desktop) / Top-center (Mobile) with `z-index: 9999`
- **Style**: Floating Claymorphic pill with blur background and smooth slide-in
- **Duration**: Default `3000ms`, configurable

## CSS Toast Styling

```css
#toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 10px;
  pointer-events: none;
  max-width: 360px;
  width: calc(100vw - 40px);
}

.toast-item {
  pointer-events: auto;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(16px);
  border-radius: var(--radius-lg);
  padding: 0.9rem 1.25rem;
  box-shadow: 0 10px 30px rgba(37,99,235,0.2), 0 2px 8px rgba(0,0,0,0.05);
  border: 2px solid rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--clay-blue-900);
  animation: toastSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) both;
}

.toast-item.toast-success {
  border-left: 5px solid #10B981;
}

.toast-item.toast-error {
  border-left: 5px solid #EF4444;
}

.toast-item.toast-warning {
  border-left: 5px solid #F59E0B;
}

@keyframes toastSlideIn {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.92);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes toastSlideOut {
  from {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  to {
    opacity: 0;
    transform: translateY(-20px) scale(0.9);
  }
}
```

## JS Utility Pattern

```javascript
window.showToast = function(message, type = 'info', duration = 3000) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  };

  const toast = document.createElement('div');
  toast.className = `toast-item toast-${type}`;
  toast.innerHTML = `<span>${icons[type] || 'ℹ️'}</span> <div>${window.sanitizeHTML ? window.sanitizeHTML(message) : message}</div>`;

  container.appendChild(toast);

  if (window.hapticFeedback) {
    window.hapticFeedback(type === 'error' ? [50, 50, 50] : [30]);
  }

  setTimeout(() => {
    toast.style.animation = 'toastSlideOut 0.25s ease forwards';
    setTimeout(() => toast.remove(), 250);
  }, duration);
};
```
