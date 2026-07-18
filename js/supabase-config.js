// Configuración de Supabase
const { createClient } = supabase;
const SUPABASE_URL = 'https://tiokuyziwnwbqysztpzb.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_Vap5YJd6IC8STJY8ewQwKQ_DIS27cVG';

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
