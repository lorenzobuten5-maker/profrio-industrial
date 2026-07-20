/**
 * security.js — ProFrio Industrial Security Module v1.0
 * ─────────────────────────────────────────────────────
 * Handles:
 *   1. XSS Sanitization
 *   2. Session Inactivity Timeout (30 min)
 *   3. Login Rate Limiting (5 attempts → 1 min lockout)
 *   4. Console suppression in production
 *   5. Redirect guard (force HTTPS)
 */

/* ══════════════════════════════════════════
   1. XSS SANITIZER
   All user-generated content that goes into
   innerHTML MUST pass through this function.
   ══════════════════════════════════════════ */
window.sanitizeHTML = function(str) {
  if (str === null || str === undefined) return '';
  const temp = document.createElement('div');
  temp.textContent = String(str);
  return temp.innerHTML;
};

/* ══════════════════════════════════════════
   2. SESSION INACTIVITY TIMEOUT
   Automatically logs out the user after
   30 minutes of no interaction.
   ══════════════════════════════════════════ */
const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
let inactivityTimer = null;

function resetInactivityTimer() {
  if (inactivityTimer) clearTimeout(inactivityTimer);
  inactivityTimer = setTimeout(async () => {
    const currentPath = window.location.pathname;
    const isAuthPage = currentPath.endsWith('index.html') || currentPath.endsWith('/');
    if (!isAuthPage) {
      if (window.handleLogout) {
        await window.handleLogout();
      } else {
        window.location.href = 'index.html';
      }
    }
  }, INACTIVITY_TIMEOUT_MS);
}

['mousemove', 'mousedown', 'keypress', 'scroll', 'touchstart', 'click'].forEach(evt => {
  document.addEventListener(evt, resetInactivityTimer, { passive: true });
});

// Start timer on page load
resetInactivityTimer();

/* ══════════════════════════════════════════
   3. LOGIN RATE LIMITER
   Blocks login after 5 failed attempts for
   60 seconds using sessionStorage persistence.
   ══════════════════════════════════════════ */
const LOGIN_MAX_ATTEMPTS = 5;
const LOGIN_LOCKOUT_MS   = 60000; // 60 seconds

window.loginRateLimiter = {
  _key: 'pf_login_attempts',
  _lockKey: 'pf_login_locked_until',

  _getAttempts() {
    try { return parseInt(sessionStorage.getItem(this._key) || '0', 10); } catch(e) { return 0; }
  },
  _getLocked() {
    try { return parseInt(sessionStorage.getItem(this._lockKey) || '0', 10); } catch(e) { return 0; }
  },
  _setAttempts(n) {
    try { sessionStorage.setItem(this._key, String(n)); } catch(e) {}
  },
  _setLocked(ts) {
    try { sessionStorage.setItem(this._lockKey, String(ts)); } catch(e) {}
  },

  isLocked() {
    const lockedUntil = this._getLocked();
    if (Date.now() < lockedUntil) {
      const remaining = Math.ceil((lockedUntil - Date.now()) / 1000);
      return `Demasiados intentos fallidos. Espera ${remaining} segundo${remaining !== 1 ? 's' : ''} e intenta de nuevo.`;
    }
    return null;
  },

  recordFail() {
    const attempts = this._getAttempts() + 1;
    this._setAttempts(attempts);
    if (attempts >= LOGIN_MAX_ATTEMPTS) {
      this._setLocked(Date.now() + LOGIN_LOCKOUT_MS);
      this._setAttempts(0);
    }
  },

  recordSuccess() {
    try {
      sessionStorage.removeItem(this._key);
      sessionStorage.removeItem(this._lockKey);
    } catch(e) {}
  }
};

/* ══════════════════════════════════════════
   4. CONSOLE SUPPRESSION (PRODUCTION)
   Prevents sensitive internal data leaking
   through browser developer tools in prod.
   ══════════════════════════════════════════ */
(function() {
  const isLocal = window.location.hostname === 'localhost'
    || window.location.hostname === '127.0.0.1'
    || window.location.hostname.includes('.local');

  if (!isLocal) {
    const noop = function() {};
    window.console.log   = noop;
    window.console.debug = noop;
    window.console.info  = noop;
    // Keep warn and error for critical visibility
  }
})();

/* ══════════════════════════════════════════
   5. HTTPS ENFORCEMENT
   Redirect to HTTPS if user is on HTTP
   (extra layer on top of Cloudflare).
   ══════════════════════════════════════════ */
if (window.location.protocol === 'http:' && window.location.hostname !== 'localhost') {
  window.location.replace('https://' + window.location.host + window.location.pathname + window.location.search);
}
