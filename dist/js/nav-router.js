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

  const bottomNav = document.querySelector('.bottom-nav');

  // Si es jefe y la nav contiene un link a dashboard-empleado.html, reconstruir nav completa
  if (isJefe && bottomNav) {
    const hasEmpleadoHome = bottomNav.querySelector('a[href="dashboard-empleado.html"]');
    if (hasEmpleadoHome) {
      // Reconstruir nav para jefe: Admin, Intervención, Materiales, Historial, Perfil
      bottomNav.innerHTML = `
        <a href="dashboard-jefe.html" class="nav-item">
          <div class="nav-icon-wrap">🛡️</div>
          <span class="nav-label">Admin</span>
        </a>
        <a href="formulario-intervencion.html" class="nav-item">
          <div class="nav-icon-wrap">📋</div>
          <span class="nav-label">Intervención</span>
        </a>
        <a href="formulario-materiales.html" class="nav-item">
          <div class="nav-icon-wrap">📦</div>
          <span class="nav-label">Materiales</span>
        </a>
        <a href="historial-formularios.html" class="nav-item">
          <div class="nav-icon-wrap">📂</div>
          <span class="nav-label">Historial</span>
        </a>
        <a href="perfil.html" class="nav-item">
          <div class="nav-icon-wrap">👤</div>
          <span class="nav-label">Perfil</span>
        </a>
      `;
    }
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
