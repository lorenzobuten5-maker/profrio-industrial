/**
 * historial-formularios.js
 * Gestión completa del historial de reportes y solicitudes
 */

let todosLosFormularios = [];
let perfilUsuario = null;
let mapaPerfiles = {};
let filtroTipoActual = 'todos';

/* ──────────────────────────────────────────
   INIT — espera a que auth.js esté listo
   ────────────────────────────────────────── */
async function iniciarHistorial() {
  // Esperar a que el perfil esté disponible
  perfilUsuario = window.currentProfile || await window.getCurrentProfile?.();
  if (!perfilUsuario) {
    // Si no hay sesión, redirigir al login
    window.location.href = 'index.html';
    return;
  }

  // Actualizar sidebar link según rol
  const dashLink = document.getElementById('sidebar-dash-link');
  if (dashLink) {
    dashLink.href = perfilUsuario.rol === 'jefe' ? 'dashboard-jefe.html' : 'dashboard-empleado.html';
  }

  // Header usuario
  const nameEl = document.getElementById('header-user-name');
  if (nameEl) nameEl.textContent = perfilUsuario.nombre || perfilUsuario.email;
  const avatarEl = document.getElementById('header-user-avatar');
  if (avatarEl) {
    avatarEl.textContent = perfilUsuario.rol === 'jefe' ? '👑' : '👷';
  }

  // Botón logout
  document.getElementById('btn-logout')?.addEventListener('click', () => window.handleLogout?.());

  // Mode jefe UI & dropdown initialization
  if (perfilUsuario.rol === 'jefe') {
    const banner = document.getElementById('admin-banner-view');
    if (banner) banner.style.display = 'flex';

    // Inject técnico dropdown into toolbar if not present
    let selectTecnico = document.getElementById('filter-tecnico');
    if (!selectTecnico) {
      const toolbarRow = document.querySelector('.toolbar-box .toolbar-row:last-child') || document.querySelector('.toolbar-box');
      if (toolbarRow) {
        const group = document.createElement('div');
        group.className = 'toolbar-group';
        group.id = 'group-filter-tecnico';
        group.innerHTML = `<label>Técnico</label><select id="filter-tecnico" class="form-input"><option value="">Todos los técnicos</option></select>`;
        toolbarRow.appendChild(group);
      }
    }
    await cargarMapaPerfiles();
  }

  // Inject status filter dropdown if not present in HTML
  let selectStatus = document.getElementById('filter-status');
  if (!selectStatus) {
    const toolbarRow = document.querySelector('.toolbar-box .toolbar-row:last-child') || document.querySelector('.toolbar-box');
    if (toolbarRow) {
      const group = document.createElement('div');
      group.className = 'toolbar-group';
      group.id = 'group-filter-status';
      group.innerHTML = `
        <label>Estado</label>
        <select id="filter-status" class="form-input">
          <option value="">Todos los estados</option>
          <option value="activo">Activo</option>
          <option value="pendiente">Pendiente</option>
          <option value="completado">Completado</option>
          <option value="aprobado">Aprobado</option>
          <option value="rechazado">Rechazado</option>
        </select>`;
      toolbarRow.appendChild(group);
    }
  }

  // Cargar datos
  await cargarHistorial();

  // Listeners de filtros y búsqueda (debounced)
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    const debouncedFilter = window.debounce ? window.debounce(filtrarYRenderizar, 300) : filtrarYRenderizar;
    searchInput.addEventListener('input', debouncedFilter);
  }

  document.getElementById('filter-tecnico')?.addEventListener('change', filtrarYRenderizar);
  document.getElementById('filter-status')?.addEventListener('change', filtrarYRenderizar);
  document.getElementById('filter-date-start')?.addEventListener('change', filtrarYRenderizar);
  document.getElementById('filter-date-end')?.addEventListener('change', filtrarYRenderizar);

  // Pills de tipo
  document.getElementById('pill-all')?.addEventListener('click', () => setPillActive('todos', 'pill-all'));
  document.getElementById('pill-intervencion')?.addEventListener('click', () => setPillActive('intervencion', 'pill-intervencion'));
  document.getElementById('pill-materiales')?.addEventListener('click', () => setPillActive('materiales', 'pill-materiales'));
}

function setPillActive(tipo, activePillId) {
  ['pill-all', 'pill-intervencion', 'pill-materiales'].forEach(id => {
    document.getElementById(id)?.classList.remove('active');
  });
  document.getElementById(activePillId)?.classList.add('active');
  filtroTipoActual = tipo;
  filtrarYRenderizar();
}

/* ──────────────────────────────────────────
   ARRANQUE — poll esperando que auth.js
   setee window.currentProfile
   ────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  let intentos = 0;
  const MAX_INTENTOS = 50; // 10 segundos máximo

  const esperar = setInterval(async () => {
    intentos++;

    // Esperar a que auth.js complete su ciclo (setea authReady = true)
    if (window.authReady || intentos >= MAX_INTENTOS) {
      clearInterval(esperar);

      if (!window.currentProfile) {
        window.location.href = 'index.html';
        return;
      }

      await iniciarHistorial();
    }
  }, 200);
});

/* ──────────────────────────────────────────
   MAPA DE PERFILES (MODO JEFE)
   ────────────────────────────────────────── */
async function cargarMapaPerfiles() {
  try {
    const { data, error } = await window.supabaseClient
      .from('profiles')
      .select('id, nombre, email');
    if (!error && data) {
      const selectTecnico = document.getElementById('filter-tecnico');
      if (selectTecnico) {
        selectTecnico.innerHTML = '<option value="">Todos los técnicos</option>';
      }
      data.forEach(p => {
        mapaPerfiles[p.id] = p.nombre || p.email;
        if (selectTecnico) {
          const opt = document.createElement('option');
          opt.value = p.id;
          opt.textContent = p.nombre || p.email || p.id;
          selectTecnico.appendChild(opt);
        }
      });
    }
  } catch (err) {
    console.error('Error cargando perfiles:', err);
  }
}

/* ──────────────────────────────────────────
   CARGAR HISTORIAL DESDE SUPABASE
   ────────────────────────────────────────── */
async function cargarHistorial() {
  const spinner = document.getElementById('loading-spinner');
  const listContainer = document.getElementById('history-list-container');
  const emptyState = document.getElementById('empty-state');

  if (spinner) spinner.style.display = 'block';
  if (listContainer) listContainer.style.display = 'none';
  if (emptyState) emptyState.style.display = 'none';

  try {
    let q1 = window.supabaseClient.from('formularios_intervencion').select('*');
    let q2 = window.supabaseClient.from('formularios_materiales').select('*');

    // Empleado solo ve los suyos
    if (perfilUsuario.rol === 'empleado') {
      q1 = q1.eq('usuario_id', perfilUsuario.id);
      q2 = q2.eq('usuario_id', perfilUsuario.id);
    }

    const [res1, res2] = await Promise.all([
      q1.order('created_at', { ascending: false }),
      q2.order('created_at', { ascending: false })
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

    todosLosFormularios = [...intervenciones, ...materiales]
      .sort((a, b) => b._fechaObj - a._fechaObj);

    filtrarYRenderizar();
  } catch (err) {
    console.error('Error al cargar historial:', err);
    const listContainer = document.getElementById('history-list-container');
    if (listContainer) {
      listContainer.innerHTML = `
        <div style="text-align:center; padding:3rem; color:var(--danger);">
          <p style="font-size:2rem;">⚠️</p>
          <p>Error al cargar el historial.</p>
          <small>${err.message || ''}</small>
        </div>`;
      listContainer.style.display = 'flex';
    }
  } finally {
    if (spinner) spinner.style.display = 'none';
  }
}

/* ──────────────────────────────────────────
   FILTROS Y RENDERIZADO
   ────────────────────────────────────────── */
function filtrarYRenderizar() {
  const query = (document.getElementById('search-input')?.value || '').toLowerCase().trim();
  const dateStartVal = document.getElementById('filter-date-start')?.value || '';
  const dateEndVal = document.getElementById('filter-date-end')?.value || '';
  const tecnicoVal = document.getElementById('filter-tecnico')?.value || '';
  const statusVal = (document.getElementById('filter-status')?.value || '').toLowerCase();
  const tipo = filtroTipoActual;

  const filtrados = todosLosFormularios.filter(f => {
    if (tipo !== 'todos' && f._tipo !== tipo) return false;

    // Filtro técnico
    if (tecnicoVal && f.usuario_id !== tecnicoVal) return false;

    // Filtro estado
    if (statusVal) {
      const fStatus = (f.estado || f.status || 'completado').toLowerCase();
      if (fStatus !== statusVal) return false;
    }

    // Filtro rango de fecha
    if (dateStartVal) {
      const start = new Date(dateStartVal + 'T00:00:00');
      if (f._fechaObj < start) return false;
    }
    if (dateEndVal) {
      const end = new Date(dateEndVal + 'T23:59:59');
      if (f._fechaObj > end) return false;
    }

    // Búsqueda por texto (Fuzzy Match tolerante a errores ortográficos)
    if (query) {
      const creadorNombre = (mapaPerfiles[f.usuario_id] || '');
      const cliente = (f.cliente || '');
      const numString = String(f.numero || '');
      const fechaString = f._fechaObj.toLocaleDateString('es-DO');
      const tipoStr = f._tipo === 'intervencion' ? 'intervención' : 'materiales';

      const textTarget = `${cliente} ${creadorNombre} ${numString} ${fechaString} ${tipoStr}`;
      const coincide = window.fuzzyMatch ? window.fuzzyMatch(query, textTarget) : textTarget.toLowerCase().includes(query);

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
  listContainer.style.flexDirection = 'column';
  listContainer.style.gap = '1rem';

  formularios.forEach(f => {
    const card = document.createElement('div');
    card.className = 'history-card';

    const fechaRelativa = window.timeAgo ? window.timeAgo(f.created_at || f._fechaObj) : f._fechaObj.toLocaleDateString('es-DO', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true
    });

    const isIntervencion = f._tipo === 'intervencion';
    const tipoLabel = isIntervencion ? 'Hoja de Intervención' : 'Solicitud de Materiales';
    const badgeClass = isIntervencion ? 'intervencion' : 'materiales';

    let creadorHTML = '';
    if (perfilUsuario.rol === 'jefe') {
      const nombre = mapaPerfiles[f.usuario_id] || 'Técnico ProFrio';
      const sNombre = window.sanitizeHTML ? window.sanitizeHTML(nombre) : nombre;
      creadorHTML = `
        <div class="meta-item">
          <span>👤</span>
          <span>Téc: <strong>${sNombre}</strong></span>
        </div>`;
    }

    const sCliente = window.sanitizeHTML ? window.sanitizeHTML(f.cliente || '') : (f.cliente || 'Sin Cliente');
    const sTipoSrv = window.sanitizeHTML ? window.sanitizeHTML(f.tipo_servicio || '') : (f.tipo_servicio || 'Servicio');

    card.innerHTML = `
      <div class="card-main-info">
        <div class="card-title-row">
          <strong>#${f.numero || '—'}</strong>
          <span class="badge-tipo ${badgeClass}">${tipoLabel}</span>
        </div>
        <div class="card-meta-row">
          <div class="meta-item"><span>🏢</span><span>Cliente: <strong>${sCliente || 'Sin Cliente'}</strong></span></div>
          <div class="meta-item"><span>📅</span><span>${fechaRelativa}</span></div>
          ${creadorHTML}
        </div>
      </div>
      <div class="card-right-info">
        ${isIntervencion
          ? `<span class="badge" style="background:var(--primary-100);color:var(--primary-800);font-weight:600;font-size:0.75rem;">⚡ ${sTipoSrv}</span>`
          : `<span class="card-total">$ ${(parseFloat(f.total) || 0).toLocaleString('es-DO', { minimumFractionDigits: 2 })}</span>`
        }
        <a href="formulario-${f._tipo}.html?id=${f.id}" class="btn btn-secondary" style="padding:0.4rem 1rem;font-size:0.8rem;border-radius:var(--radius-sm);white-space:nowrap;">
          Ver / Editar 🔍
        </a>
      </div>
    `;

    listContainer.appendChild(card);
  });
}
