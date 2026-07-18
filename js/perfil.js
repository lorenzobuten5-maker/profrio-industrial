/**
 * perfil.js
 */

let todosLosFormularios = [];

document.addEventListener('DOMContentLoaded', async () => {
  if (window.guardRoute) await window.guardRoute(['empleado', 'jefe']);
  
  const profile = await window.getCurrentProfile?.();
  if (!profile) return;
  
  const initialsEl = document.getElementById('avatar-initials');
  if (initialsEl) initialsEl.textContent = (profile.nombre || 'U').substring(0, 2).toUpperCase();
  
  const nameEl = document.getElementById('profile-name');
  if (nameEl) nameEl.textContent = profile.nombre;
  
  const emailEl = document.getElementById('profile-email');
  if (emailEl) emailEl.textContent = profile.email;
  
  const roleEl = document.getElementById('profile-role');
  if (roleEl) roleEl.textContent = profile.rol;
  
  const btnBack = document.getElementById('btn-back');
  if (btnBack) btnBack.addEventListener('click', () => {
    window.location.href = profile.rol === 'jefe' ? 'dashboard-jefe.html' : 'dashboard-empleado.html';
  });
  
  const btnLogout = document.getElementById('btn-logout');
  if (btnLogout) btnLogout.addEventListener('click', () => window.handleLogout?.());
  
  await cargarFormularios(profile.id);
  
  const searchInput = document.getElementById('search-input');
  const btnSearch = document.getElementById('btn-search');
  if (btnSearch && searchInput) {
    btnSearch.addEventListener('click', () => aplicarFiltros());
    searchInput.addEventListener('keyup', (e) => {
      if (e.key === 'Enter') aplicarFiltros();
    });
  }
  
  document.getElementById('filter-all')?.addEventListener('click', () => setFiltroTipo('todos'));
  document.getElementById('filter-intervencion')?.addEventListener('click', () => setFiltroTipo('intervencion'));
  document.getElementById('filter-materiales')?.addEventListener('click', () => setFiltroTipo('materiales'));
});

let filtroTipoActual = 'todos';

async function cargarFormularios(usuarioId) {
  const loadingEl = document.getElementById('forms-loading');
  if (loadingEl) loadingEl.style.display = 'block';
  
  try {
    const { data: intervenciones, error: err1 } = await window.supabaseClient
      .from('formularios_intervencion')
      .select('*')
      .eq('usuario_id', usuarioId)
      .order('numero', { ascending: false });
      
    const { data: materiales, error: err2 } = await window.supabaseClient
      .from('formularios_materiales')
      .select('*')
      .eq('usuario_id', usuarioId)
      .order('numero', { ascending: false });
      
    if (err1) throw err1;
    if (err2) throw err2;
    
    document.getElementById('stat-intervencion').textContent = (intervenciones || []).length;
    document.getElementById('stat-materiales').textContent = (materiales || []).length;
    
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
    listEl.innerHTML = '<li>No se encontraron formularios.</li>';
    return;
  }
  
  formularios.forEach(f => {
    const li = document.createElement('li');
    li.innerHTML = `
      <div>
        <strong>#${f.numero}</strong> - ${f._tipo === 'intervencion' ? 'Intervención' : 'Materiales'}
        <br>
        <small>Cliente: ${f.cliente || 'N/A'} | Fecha: ${f._fecha}</small>
      </div>
      <div>
        <a href="formulario-${f._tipo}.html?id=${f.id}" class="btn-ver">Ver</a>
      </div>
    `;
    listEl.appendChild(li);
  });
}
