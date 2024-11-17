import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, AuthError } from '@supabase/supabase-js';
import { supabase, checkSupabaseConnection } from '../lib/supabase';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: AuthError | null;
  message: string | null;
}

interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  clearMessage: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
    message: null,
  });

  const clearMessage = () => {
    setState(prev => ({ ...prev, message: null}));
  };

  // Define auth functions
  const signIn = async (email: string, password: string) => {
    try {
      setState(prev => ({ ...prev, error: null }));
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error as AuthError,
      }));
      throw error;
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      setState(prev => ({ ...prev, error: null, loading: true }));
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;

      setState(prev => ({
        ...prev,
        message: 'Please check your email for confirmation link',
        loading: false,
      }));

    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error as AuthError,
        loading: false,
      }));
      
      throw error;
    }
  };

  const signOut = async () => {
    try {
      setState(prev => ({ ...prev, error: null }));
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error as AuthError,
      }));
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setState(prev => ({ ...prev, error: null }));
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error as AuthError,
      }));
      throw error;
    }
  };

  useEffect(() => {
    async function initializeAuth() {
      try {
        // Check Supabase connection
        const isConnected = await checkSupabaseConnection();
        if (!isConnected) {
          throw new Error('Unable to connect to Supabase');
        }

        // Check active session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;

        setState(prev => ({
          ...prev,
          user: session?.user ?? null,
          loading: false,
        }));

        // Listen for auth changes
        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
          setState(prev => ({
            ...prev,
            user: session?.user ?? null,
            loading: false,
          }));
        });

        return () => subscription.unsubscribe();
      } catch (error) {
        console.error('Auth initialization error:', error);
        setState(prev => ({
          ...prev,
          error: error as AuthError,
          loading: false,
        }));
      }
    }

    initializeAuth();
  }, []);

  // Show loading state
  if (state.loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  // Show error state if there's a connection error
  if (state.error && !state.loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-50 text-red-700 p-4 rounded-lg max-w-md">
          <h3 className="font-bold">Connection Error</h3>
          <p>{state.error.message}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-red-100 text-red-700 px-4 py-2 rounded hover:bg-red-200"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  const value = {
    ...state,
    signIn,
    signOut,
    signUp,
    resetPassword,
    clearMessage,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}