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
  }
}

async function handleLogin(email, password) {
  try {
    const { data, error } = await window.supabaseClient.auth.signInWithPassword({ email, password });
    if (error) throw error;
    
    const profile = await getCurrentProfile();
    if (!profile) throw new Error("Perfil no encontrado");
    
    if (profile.baneado_hasta) {
       const baneadoHasta = new Date(profile.baneado_hasta);
       if (baneadoHasta > new Date()) {
          await window.supabaseClient.auth.signOut();
          throw new Error(`Cuenta baneada hasta ${baneadoHasta.toLocaleString()}`);
       } else {
          await window.supabaseClient.from('profiles').update({ estado: 'activo', baneado_hasta: null }).eq('id', profile.id);
          profile.estado = 'activo';
       }
    }
    
    if (profile.estado === 'bloqueado' || profile.estado === 'baneado') {
      await window.supabaseClient.auth.signOut();
      throw new Error("Cuenta bloqueada o baneada");
    }
    
    if(window.setOnline) await window.setOnline(profile.id);
    window.location.href = profile.rol === 'jefe' ? 'dashboard-jefe.html' : 'dashboard-empleado.html';
  } catch (err) {
    const msgEl = document.getElementById('auth-message');
    if(msgEl) msgEl.textContent = err.message;
    else alert(err.message);
  }
}

async function handleRegister(nombre, email, password, rol, adminCode) {
  try {
    if (rol === 'jefe' && adminCode !== ADMIN_SECRET_CODE) {
      throw new Error("Código de administrador inválido");
    }
    
    const { count, error: countErr } = await window.supabaseClient
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('rol', rol);
      
    if (countErr) throw countErr;
    if (rol === 'jefe' && count >= MAX_JEFES) throw new Error("Límite de jefes alcanzado");
    if (rol === 'empleado' && count >= MAX_EMPLEADOS) throw new Error("Límite de empleados alcanzado");
    
    const { data, error } = await window.supabaseClient.auth.signUp({
      email, password, options: { data: { nombre, rol } }
    });
    if (error) throw error;
    
    const user = data.user;
    if (user) {
      const { error: profileErr } = await window.supabaseClient.from('profiles').insert({
        id: user.id, nombre, email, rol, estado: 'activo'
      });
      if (profileErr) throw profileErr;
      
      const { error: presErr } = await window.supabaseClient.from('presencia').insert({
        id: user.id, online: false
      });
      if (presErr) throw presErr;
    }
    
    alert("Registro exitoso. Ahora puedes iniciar sesión.");
    document.getElementById('btn-to-login')?.click();
  } catch (err) {
    const msgEl = document.getElementById('auth-message');
    if(msgEl) msgEl.textContent = err.message;
    else alert(err.message);
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
  const { data, error } = await window.supabaseClient.from('profiles').select('*').eq('id', user.id).single();
  if (error) return null;
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
  if (document.getElementById('btn-login')) {
    initAuth();
  }
});
