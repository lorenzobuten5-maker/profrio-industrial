/**
 * Autenticación y gestión de usuarios
 */
const ADMIN_SECRET_CODE = 'PROFRIO_ADMIN_2024';
const MAX_EMPLEADOS = 8;
const MAX_JEFES = 2;

async function initAuth() {
  const { data: { session } } = await window.supabaseClient.auth.getSession();
  const currentPath = window.location.pathname;
  const isIndex = currentPath.endsWith('/') || currentPath.endsWith('index.html');
  
  if (!session && !isIndex) {
    window.authReady = true;
    window.location.href = 'index.html';
    return;
  }
  
  if (session && isIndex) {
    const profile = await getCurrentProfile();
    if (profile) {
      if (profile.estado === 'bloqueado' || profile.estado === 'baneado') {
         await handleLogout();
         alert('Tu cuenta está bloqueada o baneada.');
         return;
      }
      window.location.href = profile.rol === 'jefe' ? 'dashboard-jefe.html' : 'dashboard-empleado.html';
    }
    return;
  }

  // On dashboard pages — populate the header user name and wire common buttons
  if (session && !isIndex) {
    const profile = await getCurrentProfile();
    if (!profile) { window.location.href = 'index.html'; return; }

    // Check ban/block
    if (profile.baneado_hasta) {
      const baneadoHasta = new Date(profile.baneado_hasta);
      if (baneadoHasta > new Date()) {
        await handleLogout();
        return;
      } else {
        await window.supabaseClient.from('profiles').update({ estado: 'activo', baneado_hasta: null }).eq('id', profile.id);
      }
    }
    if (profile.estado === 'bloqueado' || profile.estado === 'baneado') {
      await handleLogout();
      return;
    }

    // Populate header name
    const nameEl = document.getElementById('header-user-name');
    if (nameEl) nameEl.textContent = profile.nombre || profile.email;

    // Wire logout button
    const btnLogout = document.getElementById('btn-logout');
    if (btnLogout) btnLogout.addEventListener('click', handleLogout);

    // Wire profile button on employee dashboard
    const btnPerfil = document.getElementById('btn-ir-perfil');
    if (btnPerfil) btnPerfil.addEventListener('click', () => { window.location.href = 'perfil.html'; });

    // Set user online on load
    if (window.setOnline) {
      await window.setOnline(profile.id);
    }

    // Store profile globally for other scripts
    window.currentProfile = profile;
    window.authReady = true;
  }
}

async function handleLogin(email, password) {
  // Set login button loading state
  const loginBtn = document.getElementById('btn-login');
  if (loginBtn) {
    loginBtn.disabled = true;
    loginBtn._originalText = 'Iniciar Sesión';
    loginBtn.innerHTML = `<span style="display:inline-flex;align-items:center;gap:0.5rem;">
      <svg style="animation:spin 0.8s linear infinite;width:16px;height:16px;flex-shrink:0;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
      </svg>
      Procesando...
    </span>`;
  }

  // Rate limit check
  if (window.loginRateLimiter) {
    const lockMsg = window.loginRateLimiter.isLocked();
    if (lockMsg) {
      const msgEl = document.getElementById('auth-message');
      if (msgEl) {
        msgEl.textContent = lockMsg;
        msgEl.className = 'visible';
      }
      if (loginBtn) { loginBtn.disabled = false; loginBtn.innerHTML = 'Iniciar Sesión'; }
      return;
    }
  }

  try {
    const { data, error } = await window.supabaseClient.auth.signInWithPassword({ email, password });
    if (error) {
      if (window.loginRateLimiter) window.loginRateLimiter.recordFail();
      throw error;
    }
    
    const profile = await getCurrentProfile();
    if (!profile) throw new Error("Perfil no encontrado");
    
    if (profile.baneado_hasta) {
       const baneadoHasta = new Date(profile.baneado_hasta);
       if (baneadoHasta > new Date()) {
          await window.supabaseClient.auth.signOut();
          if (window.loginRateLimiter) window.loginRateLimiter.recordFail();
          throw new Error(`Cuenta baneada hasta ${baneadoHasta.toLocaleString()}`);
       } else {
          await window.supabaseClient.from('profiles').update({ estado: 'activo', baneado_hasta: null }).eq('id', profile.id);
          profile.estado = 'activo';
       }
    }
    
    if (profile.estado === 'bloqueado' || profile.estado === 'baneado') {
      await window.supabaseClient.auth.signOut();
      if (window.loginRateLimiter) window.loginRateLimiter.recordFail();
      throw new Error("Cuenta bloqueada o baneada");
    }
    
    if (window.loginRateLimiter) window.loginRateLimiter.recordSuccess();
    if(window.setOnline) await window.setOnline(profile.id);
    window.location.href = profile.rol === 'jefe' ? 'dashboard-jefe.html' : 'dashboard-empleado.html';
  } catch (err) {
    const msgEl = document.getElementById('auth-message');
    if (msgEl) {
      msgEl.textContent = err.message;
      msgEl.className = 'visible';
    }
    // Reset login button loading state
    const loginBtn = document.getElementById('btn-login');
    if (loginBtn) {
      loginBtn.innerHTML = 'Iniciar Sesión';
      loginBtn.disabled = false;
    }
  }
}

async function handleRegister(nombre, email, password, rol, adminCode) {
  // Set register button loading state
  const regBtn = document.getElementById('btn-register');
  if (regBtn) {
    regBtn.disabled = true;
    regBtn._originalText = 'Crear Cuenta';
    regBtn.innerHTML = `<span style="display:inline-flex;align-items:center;gap:0.5rem;">
      <svg style="animation:spin 0.8s linear infinite;width:16px;height:16px;flex-shrink:0;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
      </svg>
      Procesando...
    </span>`;
  }

  try {
    if (rol === 'jefe' && adminCode !== ADMIN_SECRET_CODE) {
      throw new Error("Código de administrador inválido");
    }
    
    // Safety limit check (catches RLS errors if anonymous selection is blocked)
    let limitReached = false;
    try {
      const { count, error: countErr } = await window.supabaseClient
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('rol', rol);
        
      if (countErr) {
        console.warn("RLS block reading profiles count, skipping local count verification.", countErr);
      } else {
        if (rol === 'jefe'    && count >= MAX_JEFES)     limitReached = true;
        if (rol === 'empleado' && count >= MAX_EMPLEADOS) limitReached = true;
      }
    } catch (e) {
      console.warn("Could not check role limits, proceeding with registration.", e);
    }
    
    if (limitReached) {
      throw new Error(`Límite de cuentas para el rol '${rol === 'jefe' ? 'Jefe' : 'Empleado'}' alcanzado.`);
    }
    
    const { data, error } = await window.supabaseClient.auth.signUp({
      email, password, options: { data: { nombre, rol } }
    });
    if (error) throw error;
    
    // Reset register button
    const regBtn = document.getElementById('btn-register');
    if (regBtn) { regBtn.disabled = false; regBtn.innerHTML = 'Crear Cuenta'; }

    // Hide register form, show success card
    const registerBox = document.getElementById('register-box');
    if (registerBox) registerBox.style.display = 'none';

    const successCard = document.getElementById('register-success-card');
    const emailDisplay = document.getElementById('success-email-display');
    if (emailDisplay) emailDisplay.textContent = email;
    if (successCard) successCard.classList.add('visible');

    // Clear any old messages
    const msgEl = document.getElementById('auth-message');
    if (msgEl) { msgEl.textContent = ''; msgEl.className = ''; }

    // Wire the "Ir a Iniciar Sesión" button
    const btnSuccessLogin = document.getElementById('btn-success-login');
    if (btnSuccessLogin) {
      btnSuccessLogin.onclick = () => {
        if (successCard) successCard.classList.remove('visible');
        const loginBox = document.getElementById('login-box');
        if (loginBox) loginBox.style.display = 'block';
        const loginEmail = document.getElementById('input-login-email');
        if (loginEmail) loginEmail.value = email;
      };
    }

    // Auto-redirect countdown (4 seconds)
    let countdown = 4;
    const noteEl = document.querySelector('.success-redirect-note');
    const timer = setInterval(() => {
      countdown--;
      if (noteEl) noteEl.textContent = `Redirigiendo al login en ${countdown}...`;
      if (countdown <= 0) {
        clearInterval(timer);
        btnSuccessLogin?.click();
      }
    }, 1000);

  } catch (err) {
    const msgEl = document.getElementById('auth-message');
    if (msgEl) {
      msgEl.textContent = err.message;
      msgEl.className = 'visible';
    }
    // Reset register button
    const regBtn = document.getElementById('btn-register');
    if (regBtn) { regBtn.disabled = false; regBtn.innerHTML = 'Crear Cuenta'; }
  }
}

async function handleLogout() {
  const user = await getCurrentUser();
  if (user && window.setOffline) {
    await window.setOffline(user.id);
  }
  await window.supabaseClient.auth.signOut();
  window.location.href = 'index.html';
}

async function getCurrentUser() {
  const { data: { user } } = await window.supabaseClient.auth.getUser();
  return user;
}

async function getCurrentProfile() {
  const user = await getCurrentUser();
  if (!user) return null;
  
  let { data, error } = await window.supabaseClient.from('profiles').select('*').eq('id', user.id).single();
  
  if (error) {
    // Only attempt auto-creation if the row is literally not found (PGRST116)
    if (error.code === 'PGRST116') {
      console.warn("Perfil no encontrado en base de datos. Auto-creando desde metadatos...");
      const nombre = user.user_metadata?.nombre || user.email.split('@')[0];
      const rol = user.user_metadata?.rol || 'empleado';
      
      const { data: newProfile, error: insertError } = await window.supabaseClient
        .from('profiles')
        .insert({
          id: user.id,
          nombre: nombre,
          email: user.email,
          rol: rol,
          estado: 'activo'
        })
        .select()
        .single();
        
      if (insertError) {
        throw new Error(`Error de registro en base de datos: ${insertError.message} (Código: ${insertError.code})`);
      }
      data = newProfile;
    } else {
      // It's some other database error (e.g. RLS block or syntax error)
      throw new Error(`Error de base de datos al leer perfil: ${error.message} (Código: ${error.code})`);
    }
  }
  
  return data;
}

async function guardRoute(allowedRoles) {
  const profile = await getCurrentProfile();
  if (!profile) {
    window.location.href = 'index.html';
    return;
  }
  
  if (profile.baneado_hasta) {
     const baneadoHasta = new Date(profile.baneado_hasta);
     if (baneadoHasta > new Date()) {
        await handleLogout();
        return;
     } else {
        await window.supabaseClient.from('profiles').update({ estado: 'activo', baneado_hasta: null }).eq('id', profile.id);
        profile.estado = 'activo';
     }
  }
  
  if (profile.estado === 'bloqueado' || profile.estado === 'baneado') {
    await handleLogout();
    return;
  }
  
  if (!allowedRoles.includes(profile.rol)) {
    window.location.href = profile.rol === 'jefe' ? 'dashboard-jefe.html' : 'dashboard-empleado.html';
  }
}

window.initAuth = initAuth;
window.handleLogin = handleLogin;
window.handleRegister = handleRegister;
window.handleLogout = handleLogout;
window.getCurrentUser = getCurrentUser;
window.getCurrentProfile = getCurrentProfile;
window.guardRoute = guardRoute;

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('input-login-email').value;
      const password = document.getElementById('input-login-password').value;
      handleLogin(email, password);
    });
  }

  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const nombre = document.getElementById('input-reg-nombre').value;
      const email = document.getElementById('input-reg-email').value;
      const password = document.getElementById('input-reg-password').value;
      const rol = document.getElementById('input-reg-rol').value;
      const adminCode = document.getElementById('input-admin-code')?.value || '';
      handleRegister(nombre, email, password, rol, adminCode);
    });
  }

  // Unified Mobile Sidebar & Backdrop Handler
  const btnToggle = document.getElementById('btn-toggle-sidebar');
  const sidebar = document.querySelector('.sidebar');
  if (btnToggle && sidebar) {
    let backdrop = document.querySelector('.sidebar-backdrop');
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.className = 'sidebar-backdrop';
      document.body.appendChild(backdrop);
    }

    const toggleSidebar = (show) => {
      sidebar.classList.toggle('open', show);
      backdrop.classList.toggle('visible', show);
    };

    btnToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = sidebar.classList.contains('open');
      toggleSidebar(!isOpen);
    });

    backdrop.addEventListener('click', () => toggleSidebar(false));
    document.addEventListener('click', (e) => {
      if (sidebar.classList.contains('open') && !sidebar.contains(e.target) && e.target !== btnToggle) {
        toggleSidebar(false);
      }
    });
  }

  // Verificar sesión al cargar
  initAuth();
});
