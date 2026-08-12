/**
 * utils.js — ProFrio Industrial Shared Utilities v25
 * Funciones compartidas: debounce, fechas relativas, contadores animados,
 * cache de perfil, haptic feedback, scroll-to-top, transiciones de página,
 * error boundary global.
 */

/* ═══════════════════════════════════
   DEBOUNCE
   ═══════════════════════════════════ */
function debounce(fn, delay = 300) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

/* ═══════════════════════════════════
   TIEMPO RELATIVO (hace X días...)
   ═══════════════════════════════════ */
function timeAgo(dateInput) {
  if (!dateInput) return '';
  const date = new Date(dateInput);
  const now  = new Date();
  const diff = Math.floor((now - date) / 1000);

  if (isNaN(diff) || diff < 0) return date.toLocaleDateString('es-VE');
  if (diff < 60)      return 'hace un momento';
  if (diff < 3600)    return `hace ${Math.floor(diff / 60)} min`;
  if (diff < 86400)   return `hace ${Math.floor(diff / 3600)} h`;
  if (diff < 172800)  return 'ayer';
  if (diff < 604800)  return `hace ${Math.floor(diff / 86400)} días`;
  if (diff < 2592000) return `hace ${Math.floor(diff / 604800)} sem`;
  if (diff < 31536000)return `hace ${Math.floor(diff / 2592000)} meses`;
  return date.toLocaleDateString('es-VE');
}

/* ═══════════════════════════════════
   CONTADOR ANIMADO
   ═══════════════════════════════════ */
function animateCounter(el, from, to, duration = 900) {
  if (!el) return;
  const start  = performance.now();
  const update = (time) => {
    const progress = Math.min((time - start) / duration, 1);
    const eased    = 1 - Math.pow(1 - progress, 3); // cubic ease-out
    el.textContent = Math.round(from + (to - from) * eased);
    if (progress < 1) requestAnimationFrame(update);
  };
  requestAnimationFrame(update);
}

/* ═══════════════════════════════════
   HAPTIC FEEDBACK
   ═══════════════════════════════════ */
function hapticFeedback(pattern = [50]) {
  try { if (navigator.vibrate) navigator.vibrate(pattern); } catch (_) {}
}

/* ═══════════════════════════════════
   PROFILE CACHE (sessionStorage, TTL 5 min)
   ═══════════════════════════════════ */
const ProfileCache = {
  KEY: 'pf_profile_v1',
  TTL: 5 * 60 * 1000,

  set(profile) {
    try {
      sessionStorage.setItem(this.KEY, JSON.stringify({ profile, ts: Date.now() }));
    } catch (_) {}
  },

  get() {
    try {
      const raw = sessionStorage.getItem(this.KEY);
      if (!raw) return null;
      const { profile, ts } = JSON.parse(raw);
      if (Date.now() - ts > this.TTL) { this.clear(); return null; }
      return profile;
    } catch (_) { return null; }
  },

  clear() {
    try { sessionStorage.removeItem(this.KEY); } catch (_) {}
  }
};

/* ═══════════════════════════════════
   SCROLL TO TOP
   ═══════════════════════════════════ */
function initScrollToTop() {
  const btn = document.getElementById('scroll-to-top-btn');
  if (!btn) return;

  const onScroll = () => {
    btn.classList.toggle('stt-visible', window.scrollY > 320);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  btn.addEventListener('click', () => {
    hapticFeedback([30]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ═══════════════════════════════════
   TRANSICIÓN DE PÁGINA
   ═══════════════════════════════════ */
function navigateTo(url) {
  hapticFeedback([30]);
  document.body.classList.add('page-exit');
  setTimeout(() => { window.location.href = url; }, 220);
}

function initPageTransitions() {
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href]');
    if (!link) return;
    const href = link.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('mailto:') ||
        href.startsWith('tel:') || href.startsWith('http') ||
        link.hasAttribute('target') || e.metaKey || e.ctrlKey) return;
    e.preventDefault();
    navigateTo(href);
  });
}

/* ═══════════════════════════════════
   COMPRESIÓN DE CANVAS (WebP + PNG Fallback)
   ═══════════════════════════════════ */
function compressCanvas(canvas, quality = 0.72) {
  if (!canvas) return '';
  try {
    const ctx = canvas.getContext('2d');
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let hasPixels = false;
    // Check alpha channel for non-transparent pixels
    for (let i = 3; i < imgData.data.length; i += 4) {
      if (imgData.data[i] > 10) {
        hasPixels = true;
        break;
      }
    }
    if (!hasPixels) return '';

    const webp = canvas.toDataURL('image/webp', quality);
    if (webp && webp.startsWith('data:image/webp') && webp.length > 50) {
      return webp;
    }
  } catch (_) {}

  try {
    const png = canvas.toDataURL('image/png');
    return (png && png.length > 50) ? png : '';
  } catch (_) {
    return '';
  }
}

/* ═══════════════════════════════════
   ERROR BOUNDARY GLOBAL
   ═══════════════════════════════════ */
window.addEventListener('error', (event) => {
  console.warn('[ProFrio Error]', event.message, '|', event.filename, ':', event.lineno);
});

window.addEventListener('unhandledrejection', (event) => {
  console.warn('[ProFrio Unhandled Promise]', event.reason);
});

/* ═══════════════════════════════════
   INACTIVIDAD — AUTO-LOGOUT (30 min)
   ═══════════════════════════════════ */
function initAutoLogout(logoutFn, timeoutMs = 30 * 60 * 1000) {
  let timer;
  const reset = () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      console.info('[ProFrio] Sesión expirada por inactividad');
      logoutFn?.();
    }, timeoutMs);
  };
  ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click'].forEach(ev => {
    window.addEventListener(ev, reset, { passive: true });
  });
  reset();
}

/* ═══════════════════════════════════
   SKELETON LOADER HELPER
   ═══════════════════════════════════ */
function showSkeleton(containerId, count = 4) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = Array.from({ length: count }, () => `
    <div class="skeleton-card">
      <div class="skeleton-line skeleton-title"></div>
      <div class="skeleton-line skeleton-subtitle"></div>
      <div class="skeleton-line skeleton-body"></div>
    </div>
  `).join('');
}

/* ═══════════════════════════════════
   INIT EN DOMContentLoaded
   ═══════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  initScrollToTop();
  initPageTransitions();

  document.body.classList.add('page-enter');
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      document.body.classList.remove('page-enter');
    });
  });
});

/* ═══════════════════════════════════
   TOAST NOTIFICATION SYSTEM
   ═══════════════════════════════════ */
function showToast(message, type = 'info', duration = 3200) {
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
  toast.innerHTML = `<span style="font-size:1.1rem;line-height:1;">${icons[type] || 'ℹ️'}</span> <div style="flex:1;">${window.sanitizeHTML ? window.sanitizeHTML(message) : message}</div>`;

  container.appendChild(toast);

  if (window.hapticFeedback) {
    window.hapticFeedback(type === 'error' ? [50, 50, 50] : [30]);
  }

  setTimeout(() => {
    toast.style.animation = 'toastSlideOut 0.25s cubic-bezier(0.4, 0, 1, 1) forwards';
    setTimeout(() => toast.remove(), 250);
  }, duration);
}

/* ═══════════════════════════════════
   EXPORTS GLOBALES
   ═══════════════════════════════════ */
window.debounce          = debounce;
window.timeAgo           = timeAgo;
window.animateCounter    = animateCounter;
window.hapticFeedback    = hapticFeedback;
window.ProfileCache      = ProfileCache;
window.initScrollToTop   = initScrollToTop;
window.navigateTo        = navigateTo;
window.compressCanvas    = compressCanvas;
window.initAutoLogout    = initAutoLogout;
window.showSkeleton      = showSkeleton;
window.showToast         = showToast;

