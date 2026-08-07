/**
 * nav-router.js — ProFrio Industrial
 * Gestión modular de navegación y enrutamiento dinámico según el rol (Jefe / Empleado)
 */

function setupRoleNavigation() {
  const profile = window.currentProfile;
  if (!profile) return;

  const isJefe = profile.rol === 'jefe';
  const currentPath = window.location.pathname;

  // Si un Jefe entra a dashboard-empleado.html, redirigir a su panel administrativo
  if (isJefe && currentPath.endsWith('dashboard-empleado.html')) {
    window.location.href = 'dashboard-jefe.html';
    return;
  }

  // Actualizar todos los enlaces de "Inicio" / "Panel Principal" en el sidebar y bottom-nav
  const homeLinks = document.querySelectorAll('a[href="dashboard-empleado.html"], a[href="dashboard-jefe.html"], #sidebar-dash-link');
  const targetDash = isJefe ? 'dashboard-jefe.html' : 'dashboard-empleado.html';

  homeLinks.forEach(link => {
    link.href = targetDash;
  });

  // Si es jefe, actualizar la etiqueta en el Bottom Nav si dice "Inicio"
  if (isJefe) {
    const bottomNavHome = document.querySelector('.bottom-nav a[href="' + targetDash + '"] .nav-label');
    if (bottomNavHome) bottomNavHome.textContent = 'Admin';
    const bottomNavIcon = document.querySelector('.bottom-nav a[href="' + targetDash + '"] .nav-icon-wrap');
    if (bottomNavIcon) bottomNavIcon.textContent = '🛡️';
  }

  // Resaltar ícono activo en Bottom Nav según la página actual
  const bottomNavItems = document.querySelectorAll('.bottom-nav .nav-item');
  bottomNavItems.forEach(item => {
    const href = item.getAttribute('href');
    if (href && currentPath.endsWith(href)) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });

  // Actualizar avatar del usuario con emoji del rol
  const userAvatar = document.querySelector('.user-avatar');
  if (userAvatar && !userAvatar.textContent.trim()) {
    userAvatar.textContent = isJefe ? '👑' : (profile.nombre ? profile.nombre.charAt(0).toUpperCase() : '👷');
  }

  // Actualizar badge de rol en perfil si aplica
  const roleBadge = document.getElementById('profile-role');
  if (roleBadge) {
    roleBadge.textContent = isJefe ? '👑 Jefe / Administrador' : '👷 Empleado';
  }
}

// Iniciar cuando el perfil de auth esté disponible
document.addEventListener('DOMContentLoaded', () => {
  let attempts = 0;
  const timer = setInterval(() => {
    attempts++;
    if (window.authReady || window.currentProfile || attempts > 30) {
      clearInterval(timer);
      setupRoleNavigation();
    }
  }, 150);
});

window.setupRoleNavigation = setupRoleNavigation;
