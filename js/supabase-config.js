// Configuración de Supabase
const { createClient } = supabase;

// Ofuscación de credenciales para evitar lectura casual en código fuente (view-source)
// La seguridad real del sistema no reside en estas claves (que son públicas por diseño),
// sino en las políticas de seguridad RLS (Row Level Security) configuradas en la base de datos Supabase.
const SUPABASE_URL = atob('aHR0cHM6Ly90aW9rdXl6aXdud2JxeXN6dHB6Yi5zdXBhYmFzZS5jbw==');
const SUPABASE_ANON_KEY = atob('c2JfcHVibGlzaGFibGVfVmFwNVlKZDZJQzhTVEpZOGV3UXdLUV9ESVMyN2NWRw==');

// Check if sessionStorage is available and writable (prevents Safari Private Browsing SecurityError)
let customStorage = window.sessionStorage;
try {
  const testKey = '__test_storage__';
  window.sessionStorage.setItem(testKey, '1');
  window.sessionStorage.removeItem(testKey);
} catch (e) {
  console.warn("sessionStorage is not available. Falling back to in-memory storage.");
  const memoryStore = {};
  customStorage = {
    getItem: (key) => memoryStore[key] || null,
    setItem: (key, value) => { memoryStore[key] = value; },
    removeItem: (key) => { delete memoryStore[key]; },
    clear: () => { for (const key in memoryStore) delete memoryStore[key]; }
  };
}

const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    storage: customStorage,
    autoRefreshToken: true
  }
});

// Exponer globalmente
window.supabaseClient = supabaseClient;
