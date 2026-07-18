/**
 * admin.js
 */

document.addEventListener('DOMContentLoaded', async () => {
  if (window.guardRoute) await window.guardRoute(['jefe']);
  
  const btnLogout = document.getElementById('btn-logout');
  if (btnLogout) btnLogout.addEventListener('click', () => window.handleLogout?.());
  
  const profile = await window.getCurrentProfile?.();
  const nameEl = document.getElementById('header-user-name');
  if (nameEl && profile) nameEl.textContent = profile.nombre;
  
  configurarTabs();
  await cargarUsuarios();
  await cargarFormulariosStats();
  
  if (window.subscribeToPresencia) {
    window.subscribeToPresencia(() => {
      cargarUsuariosOnline();
    });
    cargarUsuariosOnline();
  }
});

function configurarTabs() {
  const tabs = ['usuarios', 'online', 'formularios'];
  tabs.forEach(tab => {
    const btn = document.getElementById(`tab-${tab}`);
    if (btn) {
      btn.addEventListener('click', () => {
        tabs.forEach(t => {
          document.getElementById(`panel-${t}`).style.display = 'none';
          document.getElementById(`tab-${t}`).classList.remove('active');
        });
        document.getElementById(`panel-${tab}`).style.display = 'block';
        btn.classList.add('active');
      });
    }
  });
}

async function cargarUsuarios() {
  try {
    const { data, error } = await window.supabaseClient.from('profiles').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    
    const tbody = document.getElementById('users-table-body');
    if (!tbody) return;
    tbody.innerHTML = '';
    
    data.forEach(user => {
      const tr = document.createElement('tr');
      const isBloqueadoOBaneado = user.estado === 'bloqueado' || user.estado === 'baneado';
      
      let accionesHTML = '';
      if (isBloqueadoOBaneado) {
        accionesHTML = `<button onclick="desbloquearUsuario('${user.id}')">Desbloquear</button>`;
      } else {
        accionesHTML = `
          <button onclick="bloquearUsuario('${user.id}')">Bloquear</button>
          <button onclick="mostrarBanModal('${user.id}', '${user.nombre}')">Banear</button>
        `;
      }
      accionesHTML += ` <button onclick="eliminarUsuario('${user.id}')">Eliminar</button>`;
      
      let estadoText = user.estado;
      if (user.estado === 'baneado' && user.baneado_hasta) {
        estadoText += ` (hasta ${new Date(user.baneado_hasta).toLocaleDateString()})`;
      }

      tr.innerHTML = `
        <td>${user.nombre}</td>
        <td>${user.email}</td>
        <td>${user.rol}</td>
        <td>${estadoText}</td>
        <td>${accionesHTML}</td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error('Error cargando usuarios:', err);
  }
}

window.bloquearUsuario = async (id) => {
  try {
    const { error } = await window.supabaseClient.from('profiles').update({ estado: 'bloqueado' }).eq('id', id);
    if (error) throw error;
    await cargarUsuarios();
  } catch (err) {
    alert('Error al bloquear: ' + err.message);
  }
};

window.desbloquearUsuario = async (id) => {
  try {
    const { error } = await window.supabaseClient.from('profiles').update({ estado: 'activo', baneado_hasta: null }).eq('id', id);
    if (error) throw error;
    await cargarUsuarios();
  } catch (err) {
    alert('Error al desbloquear: ' + err.message);
  }
};

let userToBanId = null;
window.mostrarBanModal = (id, nombre) => {
  userToBanId = id;
  const modal = document.getElementById('ban-modal');
  if (modal) {
    document.getElementById('ban-modal-username').textContent = nombre;
    modal.style.display = 'block';
  }
};

document.getElementById('btn-cancel-ban')?.addEventListener('click', () => {
  document.getElementById('ban-modal').style.display = 'none';
  userToBanId = null;
});

document.getElementById('btn-confirm-ban')?.addEventListener('click', async () => {
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
    document.getElementById('ban-modal').style.display = 'none';
    await cargarUsuarios();
  } catch (err) {
    alert('Error al banear: ' + err.message);
  }
});

window.eliminarUsuario = async (id) => {
  if (confirm('¿Estás seguro de que quieres eliminar a este usuario permanentemente?')) {
    try {
      const { error } = await window.supabaseClient.from('profiles').delete().eq('id', id);
      if (error) throw error;
      await cargarUsuarios();
    } catch (err) {
      alert('Error al eliminar: ' + err.message);
    }
  }
};

async function cargarUsuariosOnline() {
  if (!window.getAllOnlineUsers) return;
  const users = await window.getAllOnlineUsers();
  const listEl = document.getElementById('online-users-list');
  if (!listEl) return;
  listEl.innerHTML = '';
  
  if (users.length === 0) {
    listEl.innerHTML = '<li>Nadie está en línea en este momento.</li>';
    return;
  }
  
  users.forEach(u => {
    const li = document.createElement('li');
    li.innerHTML = `🟢 ${u.profiles?.nombre || 'Desconocido'} (${u.profiles?.rol}) - Conectado desde: ${new Date(u.ultima_conexion).toLocaleTimeString()}`;
    listEl.appendChild(li);
  });
}

async function cargarFormulariosStats() {
  try {
    const { data: profiles, error: err1 } = await window.supabaseClient.from('profiles').select('id, nombre, rol').eq('rol', 'empleado');
    if (err1) throw err1;
    
    const container = document.getElementById('forms-stats-container');
    if (!container) return;
    container.innerHTML = '';
    
    for (const p of profiles) {
      const { count: c1 } = await window.supabaseClient.from('formularios_intervencion').select('*', { count: 'exact', head: true }).eq('usuario_id', p.id);
      const { count: c2 } = await window.supabaseClient.from('formularios_materiales').select('*', { count: 'exact', head: true }).eq('usuario_id', p.id);
      
      const total = (c1 || 0) + (c2 || 0);
      
      const div = document.createElement('div');
      div.className = 'stat-card';
      div.innerHTML = `
        <h3>${p.nombre}</h3>
        <p>Total formularios: ${total}</p>
        <button onclick="verFormulariosUsuario('${p.id}')">Ver Todos</button>
      `;
      container.appendChild(div);
    }
  } catch (err) {
    console.error('Error stats:', err);
  }
}

window.verFormulariosUsuario = (id) => {
  alert('Redirigiendo a vista de perfil para usuario: ' + id);
};
