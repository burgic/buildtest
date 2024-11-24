import { createClient } from '@supabase/supabase-js'
import { Database } from './database.types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_DATABASE_URL || 'Not defined'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "Not defined"

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Anon Key:', supabaseAnonKey);

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables')
  throw new Error('Missing Supabase environment variables')
}

if (supabaseUrl === 'Not defined' || supabaseAnonKey === 'Not defined') {
  console.error('Supabase environment variables are missing.');
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
    flowType: 'pkce'
  }
})

export const auth = {
  signIn: async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      if (error) throw error
      console.error('Sigh in error:', error)
      return data
      } catch (err) {
        console.error('Authentication error:', err)
        throw err
      }
  },

  signOut: async () => {
    try {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('Error signing out:', error)
      throw error
    }
  } catch (err) {
    console.error('Sign out error:', err)
    throw err
  }
  },

  resetPassword: async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      })
      if (error) {
        console.error('Password reset error:', error)
        throw error
      }
    } catch (err) {
      console.error('Password reset error:', err)
      throw err
    }
  }
}