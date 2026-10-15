/**
 * historial-formularios.js
 * Gestión completa del historial de reportes y solicitudes
 */

let todosLosFormularios = [];
let perfilUsuario = null;
let mapaPerfiles = {};
let filtroTipoActual = 'todos';
let carpetaActual = 'pendiente'; // 'pendiente' | 'facturado' | 'todos'

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

  // Carpetas de trabajo (Pendientes / Por Facturar vs Facturados/Trabajados)
  document.getElementById('folder-tab-pendientes')?.addEventListener('click', () => setCarpetaActive('pendiente', 'folder-tab-pendientes'));
  document.getElementById('folder-tab-facturados')?.addEventListener('click', () => setCarpetaActive('facturado', 'folder-tab-facturados'));
  document.getElementById('folder-tab-todos')?.addEventListener('click', () => setCarpetaActive('todos', 'folder-tab-todos'));

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
          <option value="pendiente">Pendiente</option>
          <option value="facturado">Facturado / Enviado</option>
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

function setCarpetaActive(carpeta, activeTabId) {
  ['folder-tab-pendientes', 'folder-tab-facturados', 'folder-tab-todos'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.classList.remove('active');
      el.setAttribute('aria-selected', 'false');
    }
  });
  const activeEl = document.getElementById(activeTabId);
  if (activeEl) {
    activeEl.classList.add('active');
    activeEl.setAttribute('aria-selected', 'true');
  }
  carpetaActual = carpeta;
  filtrarYRenderizar();
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

    actualizarContadoresCarpetas();
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
   ESTADO (PENDIENTE VS FACTURADO/ENVIADO)
   ────────────────────────────────────────── */
function getFormEstado(f) {
  const localKey = `pf_status_${f._tipo}_${f.id}`;
  const local = localStorage.getItem(localKey);
  if (local) return local;

  const raw = (f.estado || f.status || '').toLowerCase().trim();
  if (raw === 'facturado' || raw === 'enviado' || raw === 'trabajado') return 'facturado';
  return 'pendiente';
}

function actualizarContadoresCarpetas() {
  let countPendientes = 0;
  let countFacturados = 0;

  todosLosFormularios.forEach(f => {
    const est = getFormEstado(f);
    if (est === 'facturado') countFacturados++;
    else countPendientes++;
  });

  const bPend = document.getElementById('badge-count-pendientes');
  if (bPend) bPend.textContent = countPendientes;

  const bFact = document.getElementById('badge-count-facturados');
  if (bFact) bFact.textContent = countFacturados;

  const bTodos = document.getElementById('badge-count-todos');
  if (bTodos) bTodos.textContent = todosLosFormularios.length;
}

async function toggleEstadoFormulario(tipo, id, nuevoEstado) {
  try {
    // 1. Guardar de inmediato en localStorage para respuesta instantánea
    const localKey = `pf_status_${tipo}_${id}`;
    localStorage.setItem(localKey, nuevoEstado);

    // 2. Actualizar en el array en memoria
    const form = todosLosFormularios.find(x => x._tipo === tipo && x.id === id);
    if (form) {
      form.estado = nuevoEstado;
    }

    // 3. Feedback táctil y visual
    if (window.hapticFeedback) window.hapticFeedback([40]);
    if (window.showToast) {
      const msg = nuevoEstado === 'facturado'
        ? '✅ Formulario marcado como ENVIADO YA / FACTURADO'
        : '↩️ Formulario movido de vuelta a PENDIENTES';
      window.showToast(msg, 'success');
    }

    // 4. Actualizar contadores y re-filtrar
    actualizarContadoresCarpetas();
    filtrarYRenderizar();

    // 5. Persistir en Supabase en segundo plano
    const tableName = tipo === 'intervencion' ? 'formularios_intervencion' : 'formularios_materiales';
    const { error } = await window.supabaseClient
      .from(tableName)
      .update({ estado: nuevoEstado })
      .eq('id', id);

    if (error) {
      console.warn('Nota: columna estado pendiente de migración en Supabase, guardado en almacenamiento local:', error.message);
    }
  } catch (err) {
    console.error('Error al cambiar estado:', err);
  }
}

window.toggleEstadoFormulario = toggleEstadoFormulario;

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
    const estadoForm = getFormEstado(f);

    // Filtro por Carpeta (Pendientes vs Facturados/Trabajados vs Todos)
    if (carpetaActual === 'pendiente' && estadoForm !== 'pendiente') return false;
    if (carpetaActual === 'facturado' && estadoForm !== 'facturado') return false;

    // Filtro tipo
    if (tipo !== 'todos' && f._tipo !== tipo) return false;

    // Filtro técnico
    if (tecnicoVal && f.usuario_id !== tecnicoVal) return false;

    // Filtro estado dropdown
    if (statusVal) {
      if (statusVal === 'pendiente' && estadoForm !== 'pendiente') return false;
      if (statusVal === 'facturado' && estadoForm !== 'facturado') return false;
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
      const estStr = estadoForm === 'facturado' ? 'facturado enviado trabajado' : 'pendiente';

      const textTarget = `${cliente} ${creadorNombre} ${numString} ${fechaString} ${tipoStr} ${estStr}`;
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
    if (emptyState) {
      const emptyTitle = emptyState.querySelector('h3');
      const emptyDesc = emptyState.querySelector('p');
      if (emptyTitle && emptyDesc) {
        if (carpetaActual === 'pendiente') {
          emptyTitle.textContent = '¡No hay formularios pendientes!';
          emptyDesc.textContent = 'Todo el trabajo pendiente ya ha sido enviado y facturado.';
        } else if (carpetaActual === 'facturado') {
          emptyTitle.textContent = 'No hay formularios facturados aún';
          emptyDesc.textContent = 'Marca los formularios como "Enviado ya" para archivarlos aquí.';
        } else {
          emptyTitle.textContent = 'No se encontraron formularios';
          emptyDesc.textContent = 'Cambia los parámetros de búsqueda o filtros.';
        }
      }
      emptyState.style.display = 'block';
    }
    listContainer.style.display = 'none';
    return;
  }

  if (emptyState) emptyState.style.display = 'none';
  listContainer.style.display = 'flex';
  listContainer.style.flexDirection = 'column';
  listContainer.style.gap = '1rem';

  const esJefe = perfilUsuario && perfilUsuario.rol === 'jefe';

  formularios.forEach(f => {
    const card = document.createElement('div');
    card.className = 'history-card';

    const estado = getFormEstado(f);
    const isFacturado = estado === 'facturado';

    if (isFacturado) {
      card.classList.add('card-facturado');
    }

    const strikethroughClass = isFacturado ? 'tachado' : '';

    const badgeStatusHTML = isFacturado
      ? `<span class="badge-status-facturado">✅ ENVIADO YA / FACTURADO</span>`
      : `<span class="badge-status-pendiente">⏳ PENDIENTE</span>`;

    // Botón de acción para el jefe: marcar/desmarcar
    let btnAccionEstado = '';
    if (esJefe) {
      btnAccionEstado = isFacturado
        ? `<button type="button" class="btn-toggle-facturado btn-desmarcar" onclick="window.toggleEstadoFormulario('${f._tipo}', '${f.id}', 'pendiente')" title="Mover de vuelta a la carpeta de Pendientes">↩ Desmarcar</button>`
        : `<button type="button" class="btn-toggle-facturado btn-marcar" onclick="window.toggleEstadoFormulario('${f._tipo}', '${f.id}', 'facturado')" title="Tachar y mover a Enviados / Facturados">✓ Marcar Enviado ya</button>`;
    }

    const fechaRelativa = window.timeAgo ? window.timeAgo(f.created_at || f._fechaObj) : f._fechaObj.toLocaleDateString('es-DO', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true
    });

    const isIntervencion = f._tipo === 'intervencion';
    const tipoLabel = isIntervencion ? 'Hoja de Intervención' : 'Solicitud de Materiales';
    const badgeClass = isIntervencion ? 'intervencion' : 'materiales';

    let creadorHTML = '';
    if (esJefe) {
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
          <strong class="${strikethroughClass}">#${f.numero || '—'}</strong>
          <span class="badge-tipo ${badgeClass}">${tipoLabel}</span>
          ${badgeStatusHTML}
        </div>
        <div class="card-meta-row">
          <div class="meta-item ${strikethroughClass}"><span>🏢</span><span>Cliente: <strong>${sCliente || 'Sin Cliente'}</strong></span></div>
          <div class="meta-item"><span>📅</span><span>${fechaRelativa}</span></div>
          ${creadorHTML}
        </div>
      </div>
      <div class="card-right-info">
        ${isIntervencion
          ? `<span class="badge" style="background:var(--primary-100);color:var(--primary-800);font-weight:600;font-size:0.75rem;">⚡ ${sTipoSrv}</span>`
          : `<span class="card-total ${strikethroughClass}">$ ${(parseFloat(f.total) || 0).toLocaleString('es-DO', { minimumFractionDigits: 2 })}</span>`
        }
        <div style="display:flex; gap:0.4rem; align-items:center; flex-wrap:wrap;">
          ${btnAccionEstado}
          <a href="formulario-${f._tipo}.html?id=${f.id}" class="btn btn-secondary" style="padding:0.45rem 0.9rem;font-size:0.8rem;border-radius:var(--radius-md);white-space:nowrap;">
            Ver / Editar 🔍
          </a>
        </div>
      </div>
    `;

    listContainer.appendChild(card);
  });
}
