import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'https://seu-projeto.supabase.co' &&
  !supabaseUrl.includes('seu-projeto')
);

// Se não estiver configurado, cria o cliente com strings dummy para evitar crash de inicialização,
// mas a aplicação usará a checagem de isSupabaseConfigured para chavear o fallback do localStorage.
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);
