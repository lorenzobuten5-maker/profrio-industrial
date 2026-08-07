/**
 * perfil.js
 */

let todosLosFormularios = [];

async function iniciarPerfil() {
  // Determine which profile to show
  const urlParams = new URLSearchParams(window.location.search);
  const targetUid = urlParams.get('uid');     // admin viewing another user
  const myProfile = window.currentProfile || await window.getCurrentProfile?.();
  if (!myProfile) {
    window.location.href = 'index.html';
    return;
  }

  // If uid param is present, load that user (only jefe can do this)
  let profile = myProfile;
  let isAdminView = false;
  if (targetUid && myProfile.rol === 'jefe' && targetUid !== myProfile.id) {
    try {
      const { data, error } = await window.supabaseClient
        .from('profiles')
        .select('*')
        .eq('id', targetUid)
        .single();
      if (!error && data) { profile = data; isAdminView = true; }
    } catch (_) {}
  }

  // Populate header
  const initialsEl = document.getElementById('avatar-initials');
  if (initialsEl) initialsEl.textContent = (profile.nombre || 'U').substring(0, 2).toUpperCase();
  document.getElementById('profile-name')  && (document.getElementById('profile-name').textContent  = profile.nombre);
  document.getElementById('profile-email') && (document.getElementById('profile-email').textContent = profile.email);
  const roleEl = document.getElementById('profile-role');
  if (roleEl) roleEl.textContent = profile.rol === 'jefe' ? '👑 Jefe' : '👷 Empleado';

  // Admin view banner
  if (isAdminView) {
    const banner = document.createElement('div');
    banner.style.cssText = 'background:var(--primary-50);border:1px solid var(--primary-200);border-radius:var(--radius-md);padding:0.6rem 1rem;margin-bottom:1rem;font-size:0.85rem;color:var(--primary-800);display:flex;align-items:center;gap:0.5rem;';
    banner.innerHTML = `🛡️ <strong>Vista de Administrador</strong> — Viendo perfil de ${window.sanitizeHTML ? window.sanitizeHTML(profile.nombre) : profile.nombre}`;
    document.querySelector('main.container')?.insertBefore(banner, document.querySelector('.card'));
  }

  // Back button
  const btnBack = document.getElementById('btn-back');
  if (btnBack) btnBack.addEventListener('click', () => {
    if (isAdminView) {
      window.location.href = 'dashboard-jefe.html';
    } else {
      window.location.href = myProfile.rol === 'jefe' ? 'dashboard-jefe.html' : 'dashboard-empleado.html';
    }
  });

  const btnLogout = document.getElementById('btn-logout');
  if (btnLogout) btnLogout.addEventListener('click', () => window.handleLogout?.());

  await cargarFormularios(profile.id);

  const searchInput = document.getElementById('search-input');
  const btnSearch = document.getElementById('btn-search');
  if (btnSearch && searchInput) {
    btnSearch.addEventListener('click', () => aplicarFiltros());
    searchInput.addEventListener('keyup', (e) => { if (e.key === 'Enter') aplicarFiltros(); });
  }

  document.getElementById('filter-all')?.addEventListener('click', () => setFiltroTipo('todos'));
  document.getElementById('filter-intervencion')?.addEventListener('click', () => setFiltroTipo('intervencion'));
  document.getElementById('filter-materiales')?.addEventListener('click', () => setFiltroTipo('materiales'));
}

document.addEventListener('DOMContentLoaded', () => {
  let intentos = 0;
  const MAX_INTENTOS = 50;

  const esperar = setInterval(async () => {
    intentos++;
    if (window.authReady || intentos >= MAX_INTENTOS) {
      clearInterval(esperar);
      if (!window.currentProfile) {
        window.location.href = 'index.html';
        return;
      }
      await iniciarPerfil();
    }
  }, 200);
});

let filtroTipoActual = 'todos';

async function cargarFormularios(usuarioId) {
  const loadingEl = document.getElementById('forms-loading');
  if (loadingEl) loadingEl.style.display = 'block';
  
  try {
    const { data: intervenciones, count: countInt, error: err1 } = await window.supabaseClient
      .from('formularios_intervencion')
      .select('*', { count: 'exact' })
      .eq('usuario_id', usuarioId)
      .order('numero', { ascending: false })
      .range(0, 999);
      
    const { data: materiales, count: countMat, error: err2 } = await window.supabaseClient
      .from('formularios_materiales')
      .select('*', { count: 'exact' })
      .eq('usuario_id', usuarioId)
      .order('numero', { ascending: false })
      .range(0, 999);
      
    if (err1) throw err1;
    if (err2) throw err2;
    
    document.getElementById('stat-intervencion').textContent = countInt ?? (intervenciones || []).length;
    document.getElementById('stat-materiales').textContent = countMat ?? (materiales || []).length;

    
    const mapeadosIntervencion = (intervenciones || []).map(f => ({
      ...f,
      _tipo: 'intervencion',
      _fecha: new Date(f.created_at).toLocaleDateString()
    }));
    
    const mapeadosMateriales = (materiales || []).map(f => ({
      ...f,
      _tipo: 'materiales',
      _fecha: new Date(f.created_at).toLocaleDateString()
    }));
    
    todosLosFormularios = [...mapeadosIntervencion, ...mapeadosMateriales].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    
    aplicarFiltros();
  } catch (err) {
    console.error('Error cargando formularios:', err);
  } finally {
    if (loadingEl) loadingEl.style.display = 'none';
  }
}

function setFiltroTipo(tipo) {
  filtroTipoActual = tipo;
  aplicarFiltros();
}

function aplicarFiltros() {
  const searchQuery = (document.getElementById('search-input')?.value || '').toLowerCase();
  
  const filtrados = todosLosFormularios.filter(f => {
    const coincideTipo = filtroTipoActual === 'todos' || f._tipo === filtroTipoActual;
    const textoBuscar = `${f.numero} ${f.cliente} ${f._fecha}`.toLowerCase();
    const coincideBusqueda = textoBuscar.includes(searchQuery);
    return coincideTipo && coincideBusqueda;
  });
  
  renderizarFormularios(filtrados);
}

function renderizarFormularios(formularios) {
  const listEl = document.getElementById('forms-list');
  if (!listEl) return;
  listEl.innerHTML = '';
  
  if (formularios.length === 0) {
    listEl.innerHTML = '<p style="color:var(--gray-600);text-align:center;padding:1.5rem 0;">No se encontraron formularios.</p>';
    return;
  }
  
  formularios.forEach(f => {
    const div = document.createElement('div');
    div.className = 'form-item';
    const tipoLabel = f._tipo === 'intervencion' ? 'Intervención' : 'Materiales';
    const badgeClass = f._tipo === 'intervencion' ? 'intervencion' : 'materiales';
    const sCliente = window.sanitizeHTML ? window.sanitizeHTML(f.cliente) : (f.cliente || 'Sin cliente');
    div.innerHTML = `
      <div class="form-item-info">
        <strong>#${f.numero}<span class="badge-tipo ${badgeClass}">${tipoLabel}</span></strong>
        <small>${sCliente} &bull; ${f._fecha}</small>
      </div>
      <a href="formulario-${f._tipo}.html?id=${f.id}" class="btn btn-secondary" style="flex-shrink:0;padding:0.4rem 0.9rem;font-size:0.82rem;">Ver</a>
    `;
    listEl.appendChild(div);
  });
}
