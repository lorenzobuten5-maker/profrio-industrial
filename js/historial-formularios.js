/**
 * historial-formularios.js
 * Completa y unificada gestión del historial de reportes y solicitudes
 */

let todosLosFormularios = [];
let perfilUsuario = null;
let mapaPerfiles = {}; // map uid -> name for Jefe view

/* ──────────────────────────────────────────
   INIT & LISTENERS
   ────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', async () => {
  if (window.guardRoute) await window.guardRoute(['empleado', 'jefe']);

  perfilUsuario = await window.getCurrentProfile?.();
  if (!perfilUsuario) return;

  // Sidebar link update
  const dashLink = document.getElementById('sidebar-dash-link');
  if (dashLink) {
    dashLink.href = perfilUsuario.rol === 'jefe' ? 'dashboard-jefe.html' : 'dashboard-empleado.html';
  }

  // Sidebar toggle
  const btnToggle = document.getElementById('btn-toggle-sidebar');
  const sidebar = document.querySelector('.sidebar');
  if (btnToggle && sidebar) {
    btnToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      sidebar.classList.toggle('open');
    });
    document.addEventListener('click', (e) => {
      if (sidebar.classList.contains('open') && !sidebar.contains(e.target) && e.target !== btnToggle) {
        sidebar.classList.remove('open');
      }
    });
  }

  // Header user info
  const nameEl = document.getElementById('header-user-name');
  if (nameEl) nameEl.textContent = perfilUsuario.nombre || perfilUsuario.email;
  const avatarEl = document.getElementById('header-user-avatar');
  if (avatarEl) {
    avatarEl.textContent = perfilUsuario.rol === 'jefe' ? '👑' : '👷';
  }

  // Logout
  document.getElementById('btn-logout')?.addEventListener('click', () => window.handleLogout?.());

  // Show admin banner
  if (perfilUsuario.rol === 'jefe') {
    const banner = document.getElementById('admin-banner-view');
    if (banner) banner.style.display = 'block';
    // Fetch employee names to map creators
    await cargarMapaPerfiles();
  }

  // Load records
  await cargarHistorial();

  // Search & Filter listeners
  const searchInput = document.getElementById('search-input');
  const dateStart = document.getElementById('filter-date-start');
  const dateEnd = document.getElementById('filter-date-end');

  if (searchInput) searchInput.addEventListener('input', filtrarYRenderizar);
  if (dateStart) dateStart.addEventListener('change', filtrarYRenderizar);
  if (dateEnd) dateEnd.addEventListener('change', filtrarYRenderizar);

  // Pills triggers
  const pillAll = document.getElementById('pill-all');
  const pillIntervencion = document.getElementById('pill-intervencion');
  const pillMateriales = document.getElementById('pill-materiales');
  
  let filtroTipo = 'todos';
  
  const setPillActive = (activePill, tipo) => {
    [pillAll, pillIntervencion, pillMateriales].forEach(p => p?.classList.remove('active'));
    activePill?.classList.add('active');
    filtroTipo = tipo;
    filtrarYRenderizar(tipo);
  };

  pillAll?.addEventListener('click', () => setPillActive(pillAll, 'todos'));
  pillIntervencion?.addEventListener('click', () => setPillActive(pillIntervencion, 'intervencion'));
  pillMateriales?.addEventListener('click', () => setPillActive(pillMateriales, 'materiales'));

  // Expose active filters helper
  window.obtenerFiltroTipoActual = () => filtroTipo;
});

/* ──────────────────────────────────────────
   CREATOR MAPPING (JEFE MODE)
   ────────────────────────────────────────── */
async function cargarMapaPerfiles() {
  try {
    const { data, error } = await window.supabaseClient
      .from('profiles')
      .select('id, nombre');
    if (!error && data) {
      data.forEach(p => {
        mapaPerfiles[p.id] = p.nombre;
      });
    }
  } catch (err) {
    console.error("Error cargando perfiles:", err);
  }
}

/* ──────────────────────────────────────────
   LOAD HISTORIAL RECORDS
   ────────────────────────────────────────── */
async function cargarHistorial() {
  const spinner = document.getElementById('loading-spinner');
  const listContainer = document.getElementById('history-list-container');
  if (spinner) spinner.style.display = 'block';
  if (listContainer) listContainer.style.display = 'none';

  try {
    let q1 = window.supabaseClient.from('formularios_intervencion').select('*');
    let q2 = window.supabaseClient.from('formularios_materiales').select('*');

    // If employee, limit to their own forms
    if (perfilUsuario.rol === 'empleado') {
      q1 = q1.eq('usuario_id', perfilUsuario.id);
      q2 = q2.eq('usuario_id', perfilUsuario.id);
    }

    const [res1, res2] = await Promise.all([
      q1.order('numero', { ascending: false }),
      q2.order('numero', { ascending: false })
    ]);

    if (res1.error) throw res1.error;
    if (res2.error) throw res2.error;

    const intervenciones = (res1.data || []).map(f => ({
      ...f,
      _tipo: 'intervencion',
      _fechaObj: new Date(f.created_at)
    }));

    const materiales = (res2.data || []).map(f => ({
      ...f,
      _tipo: 'materiales',
      _fechaObj: new Date(f.created_at)
    }));

    // Combine and sort descending by date
    todosLosFormularios = [...intervenciones, ...materiales].sort((a, b) => b._fechaObj - a._fechaObj);
    
    filtrarYRenderizar();
  } catch (err) {
    console.error("Error al cargar historial:", err);
    alert("Error cargando historial: " + err.message);
  } finally {
    if (spinner) spinner.style.display = 'none';
  }
}

/* ──────────────────────────────────────────
   LOCAL FILTER & RENDER
   ────────────────────────────────────────── */
function filtrarYRenderizar(tipoParam) {
  const query = (document.getElementById('search-input')?.value || '').toLowerCase().trim();
  const dateStartVal = document.getElementById('filter-date-start')?.value || '';
  const dateEndVal = document.getElementById('filter-date-end')?.value || '';
  
  // Use param or active pill
  const tipoFiltro = typeof tipoParam === 'string' ? tipoParam : (window.obtenerFiltroTipoActual ? window.obtenerFiltroTipoActual() : 'todos');

  // Filter list
  const filtrados = todosLosFormularios.filter(f => {
    // 1. Filter by Form Type
    if (tipoFiltro !== 'todos' && f._tipo !== tipoFiltro) return false;

    // 2. Filter by Date range
    if (dateStartVal) {
      const start = new Date(dateStartVal + 'T00:00:00');
      if (f._fechaObj < start) return false;
    }
    if (dateEndVal) {
      const end = new Date(dateEndVal + 'T23:59:59');
      if (f._fechaObj > end) return false;
    }

    // 3. Filter by search input (client, number, date, creator name)
    if (query) {
      const creadorNombre = (mapaPerfiles[f.usuario_id] || '').toLowerCase();
      const cliente = (f.cliente || '').toLowerCase();
      const numString = String(f.numero);
      const fechaString = f._fechaObj.toLocaleDateString('es-DO').toLowerCase();
      const tipoString = f._tipo === 'intervencion' ? 'intervención' : 'materiales';
      
      const coincide = 
        cliente.includes(query) || 
        numString.includes(query) || 
        fechaString.includes(query) || 
        tipoString.includes(query) ||
        creadorNombre.includes(query);
      
      if (!coincide) return false;
    }

    return true;
  });

  renderCards(filtrados);
}

function renderCards(formularios) {
  const listContainer = document.getElementById('history-list-container');
  const emptyState = document.getElementById('empty-state');
  if (!listContainer) return;

  listContainer.innerHTML = '';

  if (formularios.length === 0) {
    if (emptyState) emptyState.style.display = 'block';
    listContainer.style.display = 'none';
    return;
  }

  if (emptyState) emptyState.style.display = 'none';
  listContainer.style.display = 'flex';

  formularios.forEach(f => {
    const card = document.createElement('div');
    card.className = 'history-card';

    const fechaFmt = f._fechaObj.toLocaleDateString('es-DO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    const isIntervencion = f._tipo === 'intervencion';
    const tipoLabel = isIntervencion ? 'Hoja de Intervención' : 'Solicitud de Materiales';
    const badgeClass = isIntervencion ? 'intervencion' : 'materiales';
    
    // Creator name (only relevant for Jefe view)
    let creadorHTML = '';
    if (perfilUsuario.rol === 'jefe') {
      const nombreCreador = mapaPerfiles[f.usuario_id] || 'Técnico ProFrio';
      creadorHTML = `
        <div class="meta-item">
          <span>👤</span>
          <span>Téc: <strong>${nombreCreador}</strong></span>
        </div>
      `;
    }

    // Right info (total display for materials, service type for intervention)
    let rightInfoHTML = '';
    if (isIntervencion) {
      rightInfoHTML = `
        <span class="badge" style="background:var(--primary-100); color:var(--primary-800); font-weight:600; font-size:0.75rem;">
          ⚡ ${f.tipo_servicio || 'Servicio'}
        </span>
      `;
    } else {
      const totalVal = parseFloat(f.total) || 0;
      rightInfoHTML = `<span class="card-total">$ ${totalVal.toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>`;
    }

    card.innerHTML = `
      <div class="card-main-info">
        <div class="card-title-row">
          <strong>#${f.numero}</strong>
          <span class="badge-tipo ${badgeClass}">${tipoLabel}</span>
        </div>
        <div class="card-meta-row">
          <div class="meta-item">
            <span>🏢</span>
            <span>Cliente: <strong>${f.cliente || 'Sin Cliente'}</strong></span>
          </div>
          <div class="meta-item">
            <span>📅</span>
            <span>${fechaFmt}</span>
          </div>
          ${creadorHTML}
        </div>
      </div>
      <div class="card-right-info">
        ${rightInfoHTML}
        <a href="formulario-${f._tipo}.html?id=${f.id}" class="btn btn-secondary" style="padding:0.4rem 1rem; font-size:0.8rem; border-radius:var(--radius-sm);">
          Ver / Editar 🔍
        </a>
      </div>
    `;

    listContainer.appendChild(card);
  });
}
