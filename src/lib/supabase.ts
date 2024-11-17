import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types.ts';

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Auth helper methods
export const auth = {
  signIn: async (email: string, password: string) => {
    return await supabase.auth.signInWithPassword({ email, password });
  },
  signOut: async () => {
    return await supabase.auth.signOut();
  },
  getSession: async () => {
    return await supabase.auth.getSession();
  }
};

// Database helper methods
export const database = {
  getWorkflow: async (workflowId: string) => {
    const { data, error } = await supabase
      .from('workflows')
      .select('*')
      .eq('id', workflowId)
      .single();
    
    if (error) throw error;
    return data;
  },
  
  subscribeToWorkflow: (workflowId: string, callback: (payload: any) => void) => {
    return supabase
      .channel(`workflow-${workflowId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'workflow_responses',
        filter: `workflow_id=eq.${workflowId}`
      }, callback)
      .subscribe();
  }
};

// Storage helper methods
export const storage = {
  uploadDocument: async (file: File, path: string) => {
    const { error } = await supabase.storage
      .from('documents')
      .upload(path, file);
      
    if (error) throw error;
  },
  
  getDocumentUrl: (path: string) => {
    return supabase.storage
      .from('documents')
      .getPublicUrl(path)
      .data.publicUrl;
  }
};