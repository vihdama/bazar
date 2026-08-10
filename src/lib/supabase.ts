import { createClient } from '@supabase/supabase-js';

const rawUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
// O SDK do Supabase requer a URL base da API (ex: https://xyz.supabase.co), sem o sufixo /rest/v1
export const supabaseUrl = rawUrl
  .replace(/\/rest\/v1\/?$/i, '')
  .replace(/\/+$/, '');

const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

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

