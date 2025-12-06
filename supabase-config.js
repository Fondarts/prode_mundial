// Configuración de Supabase
const SUPABASE_CONFIG = {
    url: 'https://tzxbupkvxcxehrtqekay.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6eGJ1cGt2eGN4ZWhydHFla2F5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUwMTUyNDEsImV4cCI6MjA4MDU5MTI0MX0.C2_Wg592fNxGyGh8nwXGUA27budgcE3q4F8kDby_038'
};

// Inicializar cliente de Supabase
let supabaseClient = null;

// Función para inicializar Supabase
function inicializarSupabase() {
    if (typeof supabase !== 'undefined' && SUPABASE_CONFIG.url !== 'TU_SUPABASE_URL') {
        supabaseClient = supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
        console.log('Supabase inicializado correctamente');
        return true;
    } else {
        console.log('Supabase no configurado, usando localStorage');
        return false;
    }
}

// Verificar si Supabase está disponible
function usarSupabase() {
    return supabaseClient !== null && typeof supabaseClient !== 'undefined';
}

