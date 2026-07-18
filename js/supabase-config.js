// Configuración de Supabase con persistSession: false
const { createClient } = supabase;
const SUPABASE_URL = 'https://tiokuyziwnwbqysztpzb.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_Vap5YJd6IC8STJY8ewQwKQ_DIS27cVG';
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    storage: window.sessionStorage,
    autoRefreshToken: true
  }
});
// Exponer globalmente
window.supabaseClient = supabaseClient;
