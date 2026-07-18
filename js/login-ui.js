/**
 * login-ui.js — ProFrio Industrial
 * Handles: show/hide password, password strength meter,
 *          requirements hints, form transitions, loading states.
 */

document.addEventListener('DOMContentLoaded', () => {

  /* ────────────────────────────────────────────
     1. SHOW / HIDE PASSWORD (eye button toggle)
     ──────────────────────────────────────────── */
  function setupEyeToggle(eyeBtnId, inputId) {
    const btn   = document.getElementById(eyeBtnId);
    const input = document.getElementById(inputId);
    if (!btn || !input) return;

    btn.addEventListener('click', () => {
      const isPassword = input.type === 'password';
      input.type = isPassword ? 'text' : 'password';
      btn.classList.toggle('showing', isPassword);
      btn.setAttribute('aria-label', isPassword ? 'Ocultar contraseña' : 'Mostrar contraseña');

      // Keep focus on input for accessibility
      input.focus();
    });

    // Prevent double-tap zoom on iOS
    btn.addEventListener('touchend', (e) => { e.preventDefault(); btn.click(); });
  }

  setupEyeToggle('eye-login',    'input-login-password');
  setupEyeToggle('eye-register', 'input-reg-password');
  setupEyeToggle('eye-admin',    'input-admin-code');

  /* ────────────────────────────────────────────
     2. PASSWORD STRENGTH METER (register only)
     ──────────────────────────────────────────── */
  const regPassInput  = document.getElementById('input-reg-password');
  const strengthMeter = document.getElementById('strength-meter');
  const hintsBox      = document.getElementById('password-hints');
  const sbars         = [1,2,3,4].map(i => document.getElementById(`sb${i}`));
  const strengthLabel = document.getElementById('strength-label');

  const hintLength  = document.getElementById('hint-length');
  const hintUpper   = document.getElementById('hint-upper');
  const hintNumber  = document.getElementById('hint-number');
  const hintSpecial = document.getElementById('hint-special');

  const LEVELS = [
    { label: 'Muy débil',   cls: 's1', bars: 1 },
    { label: 'Débil',       cls: 's2', bars: 2 },
    { label: 'Moderada',    cls: 's3', bars: 3 },
    { label: 'Fuerte 💪',   cls: 's4', bars: 4 },
  ];

  function checkStrength(password) {
    const rules = {
      length:  password.length >= 8,
      upper:   /[A-Z]/.test(password),
      number:  /[0-9]/.test(password),
      special: /[^A-Za-z0-9]/.test(password),
    };
    const score = Object.values(rules).filter(Boolean).length;
    return { score, rules };
  }

  function updateHint(el, met) {
    if (!el) return;
    el.classList.toggle('met', met);
  }

  function updateStrengthMeter(password) {
    if (!password) {
      if (strengthMeter) strengthMeter.style.display = 'none';
      if (hintsBox) hintsBox.style.display = 'none';
      return;
    }

    if (strengthMeter) strengthMeter.style.display = 'block';
    if (hintsBox) hintsBox.style.display = 'grid';

    const { score, rules } = checkStrength(password);
    const level = LEVELS[Math.max(0, score - 1)];

    // Update bars
    sbars.forEach((bar, i) => {
      bar.className = 'strength-bar';
      if (i < level.bars) bar.classList.add(`active-${level.bars}`);
    });

    // Update label
    if (strengthLabel) {
      strengthLabel.textContent = level.label;
      strengthLabel.className = `strength-label ${level.cls}`;
    }

    // Update hints
    updateHint(hintLength,  rules.length);
    updateHint(hintUpper,   rules.upper);
    updateHint(hintNumber,  rules.number);
    updateHint(hintSpecial, rules.special);
  }

  if (regPassInput) {
    regPassInput.addEventListener('input', () => updateStrengthMeter(regPassInput.value));
    regPassInput.addEventListener('focus', () => {
      if (regPassInput.value.length > 0) {
        if (strengthMeter) strengthMeter.style.display = 'block';
        if (hintsBox) hintsBox.style.display = 'grid';
      }
    });
    regPassInput.addEventListener('blur', () => {
      // Keep visible so user sees result
    });
  }

  /* ────────────────────────────────────────────
     3. REAL-TIME EMAIL VALIDATION FEEDBACK
     ──────────────────────────────────────────── */
  function setupEmailValidation(inputId) {
    const input = document.getElementById(inputId);
    if (!input) return;
    let touched = false;

    input.addEventListener('blur', () => { touched = true; validate(); });
    input.addEventListener('input', () => { if (touched) validate(); });

    function validate() {
      const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim());
      input.classList.toggle('input-valid', valid && input.value.length > 0);
      input.classList.toggle('input-error', !valid && input.value.length > 0);
    }
  }

  setupEmailValidation('input-login-email');
  setupEmailValidation('input-reg-email');

  /* ────────────────────────────────────────────
     4. FORM TOGGLE (login ↔ register)
     ──────────────────────────────────────────── */
  const loginBox    = document.getElementById('login-box');
  const registerBox = document.getElementById('register-box');
  const authMsg     = document.getElementById('auth-message');

  function showLogin() {
    if (!loginBox || !registerBox) return;
    registerBox.style.display = 'none';
    loginBox.style.display    = 'block';
    if (authMsg) authMsg.textContent = '';
    // Reset strength meter
    updateStrengthMeter('');
    // Scroll to top of card on mobile
    loginBox.closest('.auth-card')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    document.getElementById('input-login-email')?.focus();
  }

  function showRegister() {
    if (!loginBox || !registerBox) return;
    loginBox.style.display    = 'none';
    registerBox.style.display = 'block';
    if (authMsg) authMsg.textContent = '';
    registerBox.closest('.auth-card')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    document.getElementById('input-reg-nombre')?.focus();
  }

  document.getElementById('btn-to-register')?.addEventListener('click', showRegister);
  document.getElementById('btn-to-login')?.addEventListener('click', showLogin);

  /* ────────────────────────────────────────────
     5. ADMIN CODE SECTION TOGGLE
     ──────────────────────────────────────────── */
  const rolSelect        = document.getElementById('input-reg-rol');
  const adminCodeSection = document.getElementById('admin-code-section');

  if (rolSelect && adminCodeSection) {
    rolSelect.addEventListener('change', () => {
      const isJefe = rolSelect.value === 'jefe';
      adminCodeSection.style.display = isJefe ? 'block' : 'none';
      if (!isJefe) {
        const adminInput = document.getElementById('input-admin-code');
        if (adminInput) adminInput.value = '';
      }
    });
  }

  /* ────────────────────────────────────────────
     6. LOADING STATE ON FORM SUBMIT
     ──────────────────────────────────────────── */
  function setLoadingState(btnId, isLoading) {
    const btn = document.getElementById(btnId);
    if (!btn) return;
    btn.disabled = isLoading;
    if (isLoading) {
      btn._originalText = btn.textContent;
      btn.innerHTML = `<span style="display:inline-flex;align-items:center;gap:0.5rem;">
        <svg style="animation:spin 1s linear infinite;width:16px;height:16px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
        </svg>
        Procesando...
      </span>`;
    } else {
      btn.innerHTML = btn._originalText || btn.textContent;
    }
  }

  document.getElementById('loginForm')?.addEventListener('submit', () => {
    setLoadingState('btn-login', true);
    // Auth.js handles the real submission; reset after 5s fallback
    setTimeout(() => setLoadingState('btn-login', false), 5000);
  });

  document.getElementById('registerForm')?.addEventListener('submit', () => {
    setLoadingState('btn-register', true);
    setTimeout(() => setLoadingState('btn-register', false), 5000);
  });

  /* ────────────────────────────────────────────
     7. ENTER KEY NAVIGATION BETWEEN FIELDS
     ──────────────────────────────────────────── */
  function handleEnterNav(inputId, nextInputId) {
    const input = document.getElementById(inputId);
    const next  = document.getElementById(nextInputId);
    if (!input || !next) return;
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        next.focus();
      }
    });
  }

  handleEnterNav('input-reg-nombre', 'input-reg-email');
  handleEnterNav('input-reg-email',  'input-reg-password');

  /* ────────────────────────────────────────────
     8. AUTO-CLEAR AUTH MESSAGE ON INPUT
     ──────────────────────────────────────────── */
  ['input-login-email', 'input-login-password', 'input-reg-nombre',
   'input-reg-email', 'input-reg-password'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', () => {
      if (authMsg && authMsg.textContent) authMsg.textContent = '';
    });
  });

});
