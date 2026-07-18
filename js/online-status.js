/**
 * online-status.js
 * Gestión del estado en línea de los usuarios
 */

async function setOnline(userId) {
  try {
    const { error } = await window.supabaseClient
      .from('presencia')
      .upsert({ id: userId, online: true, ultima_conexion: new Date().toISOString() });
    if (error) throw error;
  } catch (err) {
    console.error("Error al establecer estado online:", err);
  }
}

async function setOffline(userId) {
  try {
    const { error } = await window.supabaseClient
      .from('presencia')
      .update({ online: false, ultima_desconexion: new Date().toISOString() })
      .eq('id', userId);
    if (error) throw error;
  } catch (err) {
    console.error("Error al establecer estado offline:", err);
  }
}

function subscribeToPresencia(callback) {
  return window.supabaseClient
    .channel('presencia-channel')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'presencia' },
      payload => callback(payload)
    )
    .subscribe();
}

async function getAllOnlineUsers() {
  try {
    const { data, error } = await window.supabaseClient
      .from('presencia')
      .select(`
        id, online, ultima_conexion, ultima_desconexion,
        profiles (nombre, email, rol)
      `)
      .eq('online', true);
    if (error) throw error;
    return data;
  } catch (err) {
    console.error("Error al obtener usuarios online:", err);
    return [];
  }
}

window.addEventListener('beforeunload', async () => {
  const user = await window.getCurrentUser?.();
  if (user) {
    setOffline(user.id);
  }
});

window.setOnline = setOnline;
window.setOffline = setOffline;
window.subscribeToPresencia = subscribeToPresencia;
window.getAllOnlineUsers = getAllOnlineUsers;
