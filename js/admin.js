/**
 * admin.js — Panel de Administración ProFrio Industrial
 * Real-time online presence + full user management
 */

let userToBanId = null;
let userToDeleteId = null;
let presenceChannel = null;

/* ──────────────────────────────────────────
   INIT
   ────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', async () => {
  if (window.guardRoute) await window.guardRoute(['jefe']);

  // Logout
  document.getElementById('btn-logout')?.addEventListener('click', () => window.handleLogout?.());

  // Header name
  const profile = await window.getCurrentProfile?.();
  const nameEl = document.getElementById('header-user-name');
  if (nameEl && profile) nameEl.textContent = profile.nombre;

  // Sidebar toggle
  const btnToggle = document.getElementById('btn-toggle-sidebar');
  const sidebar   = document.querySelector('.sidebar');
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

  // Tabs
  configurarTabs();

  // Load all panels
  await cargarUsuarios();
  await cargarFormulariosStats();
  iniciarPresenciaRealtime();

  // Ban modal events
  document.getElementById('btn-cancel-ban')?.addEventListener('click', cerrarBanModal);
  document.getElementById('btn-confirm-ban')?.addEventListener('click', confirmarBan);

  // Delete modal events
  document.getElementById('btn-cancel-delete')?.addEventListener('click', cerrarDeleteModal);
  document.getElementById('btn-confirm-delete')?.addEventListener('click', confirmarDelete);
});

/* ──────────────────────────────────────────
   TABS
   ────────────────────────────────────────── */
function configurarTabs() {
  const tabNames = ['usuarios', 'online', 'formularios'];
  tabNames.forEach(tab => {
    document.getElementById(`tab-${tab}`)?.addEventListener('click', () => {
      tabNames.forEach(t => {
        document.getElementById(`tab-${t}`)?.classList.remove('active');
        const panel = document.getElementById(`panel-${t}`);
        if (panel) panel.style.display = 'none';
      });
      document.getElementById(`tab-${tab}`)?.classList.add('active');
      const activePanel = document.getElementById(`panel-${tab}`);
      if (activePanel) activePanel.style.display = 'block';

      // Refresh online list when switching to that tab
      if (tab === 'online') cargarUsuariosOnline();
    });
  });
}

/* ──────────────────────────────────────────
   GESTIÓN DE USUARIOS
   ────────────────────────────────────────── */
async function cargarUsuarios() {
  try {
    const { data, error } = await window.supabaseClient
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;

    const tbody = document.getElementById('users-table-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (!data || data.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:var(--gray-400);padding:2rem;">No hay usuarios registrados.</td></tr>`;
      return;
    }

    data.forEach(user => {
      const tr = document.createElement('tr');
      const isBloqueado = user.estado === 'bloqueado' || user.estado === 'baneado';
      const fechaReg = user.created_at ? new Date(user.created_at).toLocaleDateString('es-DO') : '—';

      let estadoHTML = '';
      if (user.estado === 'activo') {
        estadoHTML = `<span class="badge badge-online">Activo</span>`;
      } else if (user.estado === 'bloqueado') {
        estadoHTML = `<span class="badge badge-bloqueado">Bloqueado</span>`;
      } else if (user.estado === 'baneado') {
        const hasta = user.baneado_hasta ? ` hasta ${new Date(user.baneado_hasta).toLocaleDateString('es-DO')}` : '';
        estadoHTML = `<span class="badge badge-baneado">Baneado${hasta}</span>`;
      } else {
        estadoHTML = `<span class="badge badge-offline">${user.estado || 'Desconocido'}</span>`;
      }

      const rolBadge = user.rol === 'jefe'
        ? `<span class="badge" style="background:var(--primary-100);color:var(--primary-800);">👑 Jefe</span>`
        : `<span class="badge" style="background:var(--gray-100);color:var(--gray-600);">👷 Empleado</span>`;

      let accionesHTML = `<div class="table-actions">`;
      if (isBloqueado) {
        accionesHTML += `<button class="btn-icon btn-block" title="Desbloquear" onclick="desbloquearUsuario('${user.id}')">🔓</button>`;
      } else {
        accionesHTML += `
          <button class="btn-icon btn-block" title="Bloquear" onclick="bloquearUsuario('${user.id}')">🔒</button>
          <button class="btn-icon btn-ban" title="Banear" onclick="abrirBanModal('${user.id}','${user.nombre}')">🚫</button>
        `;
      }
      accionesHTML += `<button class="btn-icon btn-delete" title="Eliminar" onclick="abrirDeleteModal('${user.id}','${user.nombre}')">🗑️</button>`;
      accionesHTML += `</div>`;

      tr.innerHTML = `
        <td>
          <div style="display:flex;align-items:center;gap:0.6rem;">
            <div class="user-avatar-sm">${(user.nombre || 'U').substring(0, 2).toUpperCase()}</div>
            <span style="font-weight:600;">${user.nombre}</span>
          </div>
        </td>
        <td style="color:var(--gray-600);font-size:0.85rem;">${user.email}</td>
        <td>${rolBadge}</td>
        <td>${estadoHTML}</td>
        <td style="color:var(--gray-600);font-size:0.83rem;">${fechaReg}</td>
        <td>${accionesHTML}</td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error('Error cargando usuarios:', err);
    showToast('Error cargando usuarios: ' + err.message, 'error');
  }
}

window.bloquearUsuario = async (id) => {
  try {
    const { error } = await window.supabaseClient.from('profiles').update({ estado: 'bloqueado' }).eq('id', id);
    if (error) throw error;
    showToast('Usuario bloqueado correctamente.', 'success');
    await cargarUsuarios();
  } catch (err) {
    showToast('Error al bloquear: ' + err.message, 'error');
  }
};

window.desbloquearUsuario = async (id) => {
  try {
    const { error } = await window.supabaseClient.from('profiles').update({ estado: 'activo', baneado_hasta: null }).eq('id', id);
    if (error) throw error;
    showToast('Usuario desbloqueado correctamente.', 'success');
    await cargarUsuarios();
  } catch (err) {
    showToast('Error al desbloquear: ' + err.message, 'error');
  }
};

/* ──────────────────────────────────────────
   MODAL: BAN
   ────────────────────────────────────────── */
window.abrirBanModal = (id, nombre) => {
  userToBanId = id;
  document.getElementById('ban-modal-username').textContent = nombre;
  document.getElementById('ban-modal').classList.add('active');
};

function cerrarBanModal() {
  document.getElementById('ban-modal').classList.remove('active');
  userToBanId = null;
}

async function confirmarBan() {
  if (!userToBanId) return;
  const dias = parseInt(document.getElementById('ban-duration-days').value) || 1;
  const baneado_hasta = new Date();
  baneado_hasta.setDate(baneado_hasta.getDate() + dias);
  try {
    const { error } = await window.supabaseClient.from('profiles').update({
      estado: 'baneado',
      baneado_hasta: baneado_hasta.toISOString()
    }).eq('id', userToBanId);
    if (error) throw error;
    cerrarBanModal();
    showToast(`Usuario baneado por ${dias} día(s).`, 'success');
    await cargarUsuarios();
  } catch (err) {
    showToast('Error al banear: ' + err.message, 'error');
  }
}

/* ──────────────────────────────────────────
   MODAL: DELETE
   ────────────────────────────────────────── */
window.abrirDeleteModal = (id, nombre) => {
  userToDeleteId = id;
  const el = document.getElementById('delete-modal-username');
  if (el) el.textContent = nombre;
  document.getElementById('delete-modal').classList.add('active');
};

function cerrarDeleteModal() {
  document.getElementById('delete-modal').classList.remove('active');
  userToDeleteId = null;
}

async function confirmarDelete() {
  if (!userToDeleteId) return;
  try {
    const { error } = await window.supabaseClient.from('profiles').delete().eq('id', userToDeleteId);
    if (error) throw error;
    cerrarDeleteModal();
    showToast('Usuario eliminado permanentemente.', 'success');
    await cargarUsuarios();
  } catch (err) {
    showToast('Error al eliminar: ' + err.message, 'error');
  }
}

/* ──────────────────────────────────────────
   USUARIOS EN LÍNEA — TIEMPO REAL
   ────────────────────────────────────────── */
function iniciarPresenciaRealtime() {
  cargarUsuariosOnline();

  // Subscribe to changes in presencia table
  if (window.supabaseClient) {
    presenceChannel = window.supabaseClient
      .channel('admin-presencia')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'presencia' }, () => {
        cargarUsuariosOnline();
      })
      .subscribe();
  }
}

async function cargarUsuariosOnline() {
  try {
    const { data, error } = await window.supabaseClient
      .from('presencia')
      .select('id, online, ultima_conexion, profiles(nombre, email, rol)')
      .eq('online', true);

    if (error) throw error;

    const listEl = document.getElementById('online-users-list');
    const countBadge = document.getElementById('online-count-badge');
    if (!listEl) return;

    const users = data || [];

    // Update tab badge
    if (countBadge) {
      countBadge.textContent = users.length;
      countBadge.style.display = users.length > 0 ? 'inline-flex' : 'none';
    }

    listEl.innerHTML = '';

    if (users.length === 0) {
      listEl.innerHTML = `
        <div class="online-empty">
          <div style="font-size:2.5rem;margin-bottom:0.5rem;">💤</div>
          <p>Nadie está en línea en este momento.</p>
        </div>`;
      return;
    }

    users.forEach(u => {
      const prof = u.profiles || {};
      const nombre = prof.nombre || 'Desconocido';
      const email  = prof.email  || '';
      const rol    = prof.rol    || 'empleado';
      const initials = nombre.substring(0, 2).toUpperCase();
      const connectedAt = u.ultima_conexion
        ? new Date(u.ultima_conexion).toLocaleTimeString('es-DO', { hour: '2-digit', minute: '2-digit' })
        : '—';
      const rolLabel = rol === 'jefe' ? '👑 Jefe' : '👷 Empleado';

      const card = document.createElement('div');
      card.className = 'online-card';
      card.innerHTML = `
        <div class="online-avatar">${initials}</div>
        <div class="online-card-info">
          <strong>${nombre}</strong>
          <span class="online-email">${email}</span>
          <div class="online-meta">
            <span class="online-rol">${rolLabel}</span>
            <span class="online-time">⏱ Desde las ${connectedAt}</span>
          </div>
        </div>
        <div class="status-dot"></div>
      `;
      listEl.appendChild(card);
    });
  } catch (err) {
    console.error('Error cargando usuarios online:', err);
  }
}

/* ──────────────────────────────────────────
   FORMULARIOS STATS
   ────────────────────────────────────────── */
async function cargarFormulariosStats() {
  try {
    const { data: profiles, error } = await window.supabaseClient
      .from('profiles')
      .select('id, nombre, rol, email')
      .eq('rol', 'empleado')
      .order('nombre');
    if (error) throw error;

    const container = document.getElementById('forms-stats-container');
    if (!container) return;
    container.innerHTML = '';

    if (!profiles || profiles.length === 0) {
      container.innerHTML = `<p style="color:var(--gray-400);text-align:center;padding:2rem;">No hay empleados registrados.</p>`;
      return;
    }

    for (const p of profiles) {
      const { count: c1 } = await window.supabaseClient
        .from('formularios_intervencion')
        .select('*', { count: 'exact', head: true })
        .eq('usuario_id', p.id);

      const { count: c2 } = await window.supabaseClient
        .from('formularios_materiales')
        .select('*', { count: 'exact', head: true })
        .eq('usuario_id', p.id);

      const totalInterv  = c1 || 0;
      const totalMat     = c2 || 0;
      const totalForms   = totalInterv + totalMat;
      const initials     = (p.nombre || 'U').substring(0, 2).toUpperCase();

      const div = document.createElement('div');
      div.className = 'forms-stat-card';
      div.innerHTML = `
        <div class="forms-stat-avatar">${initials}</div>
        <div class="forms-stat-info">
          <strong>${p.nombre}</strong>
          <span class="forms-stat-email">${p.email}</span>
        </div>
        <div class="forms-stat-counts">
          <div class="forms-stat-count">
            <span class="count-number">${totalInterv}</span>
            <span class="count-label">Intervenciones</span>
          </div>
          <div class="forms-stat-count">
            <span class="count-number">${totalMat}</span>
            <span class="count-label">Materiales</span>
          </div>
        </div>
        <a href="perfil.html?uid=${p.id}" class="btn btn-secondary btn-ver-perfil">Ver Perfil →</a>
      `;
      container.appendChild(div);
    }
  } catch (err) {
    console.error('Error stats formularios:', err);
    showToast('Error cargando estadísticas.', 'error');
  }
}

/* ──────────────────────────────────────────
   TOAST NOTIFICATIONS
   ────────────────────────────────────────── */
function showToast(message, type = 'success') {
  let toast = document.getElementById('admin-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'admin-toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.className = `toast toast-${type} show`;
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('show'), 3500);
}
