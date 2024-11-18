import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, AuthError } from '@supabase/supabase-js';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';

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
  const navigate = useNavigate();
  const location = useLocation();

  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
    message: null,
  });

  // Define auth functions

  const signIn = async (email: string, password: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;

      setState(prev => ({
        ...prev,
        session: data.session,
        user: data.session?.user ?? null,
        loading: false,
      }));
      navigate('/dashboard', { replace: true });
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error as AuthError,
        loading: false,
      }));
      throw error;
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      console.log('Starting signup process')
      const baseUrl = import.meta.env.VITE_APP_URL || 'http://localhost:5173';

      const redirectTo = `${getSiteURL()}/auth/callback`;
      console.log('Redirect URL:', redirectTo)

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectTo,
          data: {
            role: 'client' // Default role
          }
        }
      });

      if (error) throw error;

      console.log('Signup response:', data);

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
      setState(prev => ({ ...prev, loading: true, error: null }));
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setState(prev => ({
        ...prev,
        user: null,
        session: null,
        loading: false,
      }));
      
      navigate('/auth/login', {
        state: { from: { pathname: location.pathname, search: location.search } },
        replace: true,
      });
    } catch (error) {
      console.error("Sign out error:", error)
      setState(prev => ({
        ...prev,
        error: error as AuthError,
        loading: false,
      }));
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const baseUrl = import.meta.env.VITE_APP_URL || 'http://localhost:5173';
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${baseUrl}/auth/reset-password`,
      });
      
      if (error) throw error;

      setState(prev => ({
        ...prev,
        message: 'Password reset instructions sent to your email',
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


  useEffect(() => {
    let mounted = true;

    async function initializeAuth() {
      try {
        // Get initial session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) throw error;
        
        if (mounted) {
          setState(prev => ({
            ...prev,
            session,
            user: session?.user ?? null,
            loading: false,
          }));
        }

        // Set up auth listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            
            if (mounted) {
              setState(prev => ({
                ...prev,
                session,
                user: session?.user ?? null,
                loading: false,
              }));

              // Handle navigation based on auth state
              switch (event) {
                case 'SIGNED_IN':
                  navigate('/dashboard');
                  break;
                case 'SIGNED_OUT':
                  navigate('/auth/login');
                  break;
                case 'USER_UPDATED':
                  // Refresh the session
                  const { data: { session: refreshedSession } } = await supabase.auth.getSession();
                  if (mounted && refreshedSession) {
                    setState(prev => ({
                      ...prev,
                      session: refreshedSession,
                      user: refreshedSession.user,
                    }));
                  }
                  break;
              }
            }
          }
        );

        return () => {
          mounted = false;
          subscription.unsubscribe();
        };
      } catch (error) {
        if (mounted) {
          setState(prev => ({
            ...prev,
            error: error as AuthError,
            loading: false,
          }));
        }
      }
    }

    initializeAuth();
  }, []);

  const value = {
    ...state,
    signIn,
    signOut,
    signUp,
    resetPassword,
    clearMessage: () => setState(prev => ({ ... prev, message: null})),
  };

  if (state.loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent" />
      </div>
    );
  }

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