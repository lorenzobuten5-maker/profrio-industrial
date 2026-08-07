/**
 * darkmode.js — ProFrio Industrial Dark Mode Engine v25
 * Toggle de Modo Oscuro con persistencia en localStorage
 * y soporte para preferencia de sistema.
 */

(function () {
  const STORAGE_KEY = 'pf_theme';

  function getSavedTheme() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return saved;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function applyTheme(theme) {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark-mode');
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark-mode');
      document.documentElement.setAttribute('data-theme', 'light');
    }
    updateToggleButtons(theme);
  }

  function updateToggleButtons(theme) {
    const btns = document.querySelectorAll('.dark-mode-toggle');
    btns.forEach(btn => {
      btn.innerHTML = theme === 'dark' ? '☀️ <span class="toggle-text">Claro</span>' : '🌙 <span class="toggle-text">Oscuro</span>';
      btn.setAttribute('aria-label', theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro');
    });
  }

  function toggleTheme() {
    const current = document.documentElement.classList.contains('dark-mode') ? 'dark' : 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    localStorage.setItem(STORAGE_KEY, next);
    applyTheme(next);
    if (window.hapticFeedback) window.hapticFeedback([40]);
  }

  // Apply saved theme immediately to prevent FOUC
  applyTheme(getSavedTheme());

  document.addEventListener('DOMContentLoaded', () => {
    applyTheme(getSavedTheme());
    document.querySelectorAll('.dark-mode-toggle').forEach(btn => {
      btn.addEventListener('click', toggleTheme);
    });
  });

  window.toggleDarkTheme = toggleTheme;
})();
