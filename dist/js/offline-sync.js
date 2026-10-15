/**
 * offline-sync.js — ProFrio Industrial Offline Sync Manager v25.2
 * Almacena formularios en IndexedDB cuando falla la red o está offline,
 * y los sincroniza automáticamente con Supabase al recuperar la conexión.
 */

const OfflineSync = {
  DB_NAME: 'ProFrioOfflineDB',
  DB_VERSION: 1,
  STORE_NAME: 'pending_forms',
  db: null,

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);
      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(this.STORE_NAME)) {
          db.createObjectStore(this.STORE_NAME, { keyPath: 'id', autoIncrement: true });
        }
      };
      request.onsuccess = (e) => {
        this.db = e.target.result;
        this.checkPendingAndSync();
        resolve(this.db);
      };
      request.onerror = (e) => {
        console.warn('[OfflineSync] Error iniciando IndexedDB:', e.target.error);
        resolve(null);
      };
    });
  },

  async savePendingForm(tabla, datos) {
    if (!this.db) await this.init();
    if (!this.db) return false;

    return new Promise((resolve) => {
      const tx = this.db.transaction(this.STORE_NAME, 'readwrite');
      const store = tx.objectStore(this.STORE_NAME);
      const record = {
        tabla,
        datos,
        created_at: new Date().toISOString()
      };
      const req = store.add(record);
      req.onsuccess = () => {
        console.info('[OfflineSync] Formulario guardado en cola offline');
        if (window.hapticFeedback) window.hapticFeedback([50, 100, 50]);
        resolve(true);
      };
      req.onerror = () => resolve(false);
    });
  },

  async getPendingCount() {
    if (!this.db) await this.init();
    if (!this.db) return 0;

    return new Promise((resolve) => {
      const tx = this.db.transaction(this.STORE_NAME, 'readonly');
      const store = tx.objectStore(this.STORE_NAME);
      const req = store.count();
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(0);
    });
  },

  async checkPendingAndSync() {
    if (!navigator.onLine || !window.supabaseClient) return;
    if (!this.db) return;

    const tx = this.db.transaction(this.STORE_NAME, 'readonly');
    const store = tx.objectStore(this.STORE_NAME);
    const req = store.getAll();

    req.onsuccess = async () => {
      const pending = req.result || [];
      if (pending.length === 0) return;

      console.info(`[OfflineSync] Sincronizando ${pending.length} formularios pendientes...`);
      for (const item of pending) {
        try {
          const { error } = await window.supabaseClient.from(item.tabla).insert(item.datos);
          if (!error) {
            await this.deletePendingItem(item.id);
            console.info(`[OfflineSync] Formulario #${item.id} sincronizado con éxito`);
          }
        } catch (err) {
          console.warn('[OfflineSync] Error al sincronizar item:', err);
        }
      }
    };
  },

  async deletePendingItem(id) {
    return new Promise((resolve) => {
      const tx = this.db.transaction(this.STORE_NAME, 'readwrite');
      const store = tx.objectStore(this.STORE_NAME);
      const req = store.delete(id);
      req.onsuccess = () => resolve(true);
      req.onerror = () => resolve(false);
    });
  }
};

window.addEventListener('online', () => {
  console.info('[OfflineSync] Conexión restablecida. Sincronizando datos...');
  OfflineSync.checkPendingAndSync();
});

document.addEventListener('DOMContentLoaded', () => {
  OfflineSync.init();
});

window.OfflineSync = OfflineSync;
