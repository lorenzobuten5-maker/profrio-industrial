/**
 * login-ui.js — ProFrio Industrial
 * Handles: show/hide password, password strength meter,
 *          requirements hints, loading states, field validation feedback.
 *
 * NOTE: auth.js handles the actual form submit events.
 *       This file ONLY enhances the UI, never prevents default on forms.
 */

document.addEventListener('DOMContentLoaded', () => {

  /* ────────────────────────────────────────────
     1. SHOW / HIDE PASSWORD (eye button toggle)
     ──────────────────────────────────────────── */
  function setupEyeToggle(eyeBtnId, inputId) {
    const btn   = document.getElementById(eyeBtnId);
    const input = document.getElementById(inputId);
    if (!btn || !input) return;

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isPassword = input.type === 'password';
      input.type = isPassword ? 'text' : 'password';
      btn.classList.toggle('showing', isPassword);
      btn.setAttribute('aria-label', isPassword ? 'Ocultar contraseña' : 'Mostrar contraseña');
      input.focus();
    });

    // iOS: prevent double-tap zoom
    btn.addEventListener('touchend', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const isPassword = input.type === 'password';
      input.type = isPassword ? 'text' : 'password';
      btn.classList.toggle('showing', isPassword);
    });
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
    { label: 'Muy débil',  cls: 's1', bars: 1 },
    { label: 'Débil',      cls: 's2', bars: 2 },
    { label: 'Moderada',   cls: 's3', bars: 3 },
    { label: 'Fuerte 💪',  cls: 's4', bars: 4 },
  ];

  function checkStrength(pw) {
    const rules = {
      length:  pw.length >= 8,
      upper:   /[A-Z]/.test(pw),
      number:  /[0-9]/.test(pw),
      special: /[^A-Za-z0-9]/.test(pw),
    };
    return { score: Object.values(rules).filter(Boolean).length, rules };
  }

  function updateHint(el, met) {
    if (el) el.classList.toggle('met', met);
  }

  function updateStrengthMeter(pw) {
    if (!pw) {
      if (strengthMeter) strengthMeter.style.display = 'none';
      if (hintsBox)      hintsBox.style.display      = 'none';
      return;
    }
    if (strengthMeter) strengthMeter.style.display = 'block';
    if (hintsBox)      hintsBox.style.display      = 'grid';

    const { score, rules } = checkStrength(pw);
    const level = LEVELS[Math.max(0, score - 1)];

    sbars.forEach((bar, i) => {
      bar.className = 'strength-bar';
      if (i < level.bars) bar.classList.add(`active-${level.bars}`);
    });

    if (strengthLabel) {
      strengthLabel.textContent = level.label;
      strengthLabel.className   = `strength-label ${level.cls}`;
    }

    updateHint(hintLength,  rules.length);
    updateHint(hintUpper,   rules.upper);
    updateHint(hintNumber,  rules.number);
    updateHint(hintSpecial, rules.special);
  }

  if (regPassInput) {
    regPassInput.addEventListener('input', () => updateStrengthMeter(regPassInput.value));
  }

  /* ────────────────────────────────────────────
     3. REAL-TIME EMAIL VALIDATION
     ──────────────────────────────────────────── */
  function setupEmailValidation(inputId, helpId) {
    const input = document.getElementById(inputId);
    if (!input) return;

    // Create helper text element
    let help = document.getElementById(helpId);
    if (!help) {
      help = document.createElement('div');
      help.id = helpId;
      help.className = 'field-hint';
      input.parentNode.appendChild(help);
    }

    let touched = false;
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    function validate() {
      const val = input.value.trim();
      if (!val) {
        input.classList.remove('input-valid', 'input-error');
        help.textContent = '';
        return;
      }
      const valid = emailRe.test(val);
      input.classList.toggle('input-valid', valid);
      input.classList.toggle('input-error', !valid);
      help.textContent  = valid ? '' : '✗ Ingresa un correo válido (ej: nombre@dominio.com)';
      help.className    = `field-hint ${valid ? '' : 'field-hint-error'}`;
    }

    input.addEventListener('blur',  () => { touched = true; validate(); });
    input.addEventListener('input', () => { if (touched) validate(); });
  }

  setupEmailValidation('input-login-email',  'login-email-hint');
  setupEmailValidation('input-reg-email',    'reg-email-hint');

  /* ────────────────────────────────────────────
     4. NOMBRE VALIDATION
     ──────────────────────────────────────────── */
  const nombreInput = document.getElementById('input-reg-nombre');
  if (nombreInput) {
    let touched = false;
    let help = document.createElement('div');
    help.className = 'field-hint';
    help.id = 'reg-nombre-hint';
    nombreInput.parentNode.appendChild(help);

    function validateNombre() {
      const val = nombreInput.value.trim();
      if (!val) { nombreInput.classList.remove('input-valid','input-error'); help.textContent=''; return; }
      const valid = val.length >= 3;
      nombreInput.classList.toggle('input-valid', valid);
      nombreInput.classList.toggle('input-error', !valid);
      help.textContent = valid ? '' : '✗ Ingresa al menos 3 caracteres';
      help.className = `field-hint ${valid ? '' : 'field-hint-error'}`;
    }

    nombreInput.addEventListener('blur', () => { touched = true; validateNombre(); });
    nombreInput.addEventListener('input', () => { if (touched) validateNombre(); });
  }

  /* ────────────────────────────────────────────
     5. LOADING STATE — triggered by form submit
        auth.js handles the actual submit,
        we just add the visual loading state
     ──────────────────────────────────────────── */
  function setupFormLoading(formId, btnId, originalText) {
    const form = document.getElementById(formId);
    const btn  = document.getElementById(btnId);
    if (!form || !btn) return;

    form.addEventListener('submit', () => {
      // Small delay to let auth.js run first (it calls e.preventDefault())
      btn.disabled = true;
      btn._originalText = originalText;
      btn.innerHTML = `<span style="display:inline-flex;align-items:center;gap:0.5rem;">
        <svg style="animation:spin 0.8s linear infinite;width:16px;height:16px;flex-shrink:0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
        </svg>
        Procesando...
      </span>`;
      // Always restore after 6s max as safety net
      setTimeout(() => {
        btn.disabled = false;
        btn.innerHTML = originalText;
      }, 6000);
    });
  }

  setupFormLoading('loginForm',    'btn-login',    'Iniciar Sesión');
  setupFormLoading('registerForm', 'btn-register', 'Crear Cuenta');

  /* ────────────────────────────────────────────
     6. ADMIN CODE SECTION TOGGLE
     ──────────────────────────────────────────── */
  const rolSelect        = document.getElementById('input-reg-rol');
  const adminCodeSection = document.getElementById('admin-code-section');

  if (rolSelect && adminCodeSection) {
    rolSelect.addEventListener('change', () => {
      const isJefe = rolSelect.value === 'jefe';
      adminCodeSection.style.display = isJefe ? 'block' : 'none';
      if (!isJefe) {
        const ac = document.getElementById('input-admin-code');
        if (ac) ac.value = '';
      }
    });
  }

  /* ────────────────────────────────────────────
     7. FORM TOGGLE (login ↔ register)
     ──────────────────────────────────────────── */
  const loginBox    = document.getElementById('login-box');
  const registerBox = document.getElementById('register-box');
  const authMsg     = document.getElementById('auth-message');

  function clearMsg() {
    if (authMsg) { authMsg.textContent = ''; authMsg.className = ''; }
  }

  function showLogin() {
    if (!loginBox || !registerBox) return;
    registerBox.style.display = 'none';
    loginBox.style.display    = 'block';
    clearMsg();
    updateStrengthMeter('');
    document.getElementById('input-login-email')?.focus();
  }

  function showRegister() {
    if (!loginBox || !registerBox) return;
    loginBox.style.display    = 'none';
    registerBox.style.display = 'block';
    clearMsg();
    document.getElementById('input-reg-nombre')?.focus();
  }

  document.getElementById('btn-to-register')?.addEventListener('click', showRegister);
  document.getElementById('btn-to-login')?.addEventListener('click', showLogin);

  /* ────────────────────────────────────────────
     8. ENTER KEY NAVIGATION BETWEEN FIELDS
     ──────────────────────────────────────────── */
  function enterNav(fromId, toId) {
    const from = document.getElementById(fromId);
    const to   = document.getElementById(toId);
    if (!from || !to) return;
    from.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); to.focus(); }
    });
  }
  enterNav('input-reg-nombre',   'input-reg-email');
  enterNav('input-reg-email',    'input-reg-password');

  /* ────────────────────────────────────────────
     9. AUTO-CLEAR MSG ON TYPING
     ──────────────────────────────────────────── */
  ['input-login-email','input-login-password',
   'input-reg-nombre','input-reg-email','input-reg-password'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', () => {
      if (authMsg && authMsg.textContent) clearMsg();
    });
  });

});
