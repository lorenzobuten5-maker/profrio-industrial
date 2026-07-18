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

    let help = document.getElementById(helpId);
    if (!help) {
      help = document.createElement('div');
      help.id = helpId;
      help.className = 'field-hint';
      input.parentNode.appendChild(help);
    }

    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    function validate() {
      const val = input.value;
      if (!val) {
        input.classList.remove('input-valid', 'input-error');
        help.textContent = '';
        return;
      }

      if (/\s/.test(val)) {
        input.classList.remove('input-valid');
        input.classList.add('input-error');
        help.textContent = '✗ El correo no debe contener espacios';
        help.className = 'field-hint field-hint-error';
        return;
      }

      if (!val.includes('@')) {
        input.classList.remove('input-valid');
        input.classList.add('input-error');
        help.textContent = '✗ Falta el símbolo @ en el correo';
        help.className = 'field-hint field-hint-error';
        return;
      }

      const parts = val.split('@');
      if (parts.length > 2) {
        input.classList.remove('input-valid');
        input.classList.add('input-error');
        help.textContent = '✗ El correo solo debe tener un símbolo @';
        help.className = 'field-hint field-hint-error';
        return;
      }

      if (parts[1] && !parts[1].includes('.')) {
        input.classList.remove('input-valid');
        input.classList.add('input-error');
        help.textContent = '✗ Falta el dominio (ej: .com, .es) después del @';
        help.className = 'field-hint field-hint-error';
        return;
      }

      const valid = emailRe.test(val.trim());
      input.classList.toggle('input-valid', valid);
      input.classList.toggle('input-error', !valid);
      help.textContent = valid ? '✓ Correo válido' : '✗ Completa el formato (ej: usuario@dominio.com)';
      help.className = `field-hint ${valid ? 'field-hint-ok' : 'field-hint-error'}`;
    }

    input.addEventListener('input', validate);
    input.addEventListener('blur', validate);
  }

  setupEmailValidation('input-login-email',  'login-email-hint');
  setupEmailValidation('input-reg-email',    'reg-email-hint');

  /* ────────────────────────────────────────────
     4. NOMBRE VALIDATION
     ──────────────────────────────────────────── */
  const nombreInput = document.getElementById('input-reg-nombre');
  if (nombreInput) {
    let help = document.createElement('div');
    help.className = 'field-hint';
    help.id = 'reg-nombre-hint';
    nombreInput.parentNode.appendChild(help);

    function validateNombre() {
      const val = nombreInput.value;
      if (!val) {
        nombreInput.classList.remove('input-valid', 'input-error');
        help.textContent = '';
        return;
      }

      // Check for invalid characters (numbers, special characters)
      const invalidChars = /[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g;
      if (invalidChars.test(val)) {
        nombreInput.classList.remove('input-valid');
        nombreInput.classList.add('input-error');
        help.textContent = '✗ El nombre solo debe contener letras y espacios';
        help.className = 'field-hint field-hint-error';
        return;
      }

      const valid = val.trim().length >= 3;
      nombreInput.classList.toggle('input-valid', valid);
      nombreInput.classList.toggle('input-error', !valid);
      help.textContent = valid ? '✓ Nombre válido' : '✗ El nombre debe tener al menos 3 letras';
      help.className = `field-hint ${valid ? 'field-hint-ok' : 'field-hint-error'}`;
    }

    nombreInput.addEventListener('input', validateNombre);
    nombreInput.addEventListener('blur', validateNombre);
  }

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
