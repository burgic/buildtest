import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  }
);


export async function checkSupabaseConnection() {
  try {
    // First try to get the session
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) throw sessionError;
    
    // Then check if we can access the database
    const { error: dbError } = await supabase.from('user_profiles').select('count');
    if (dbError && dbError.code !== '42P01') { // Ignore table not found error
      throw dbError;
    }
    
    return true;
  } catch (error) {
    console.error('Supabase connection error:', error);
    // Only return false if it's a connection error, not a table not found error
    if (error.code === '42P01') {
      return true; // Table doesn't exist but connection is fine
    }
    return false;
  }
}