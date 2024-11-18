import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, AuthError, Session  } from '@supabase/supabase-js';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';

interface AuthState {
  user: User | null;
  session: Session | null;
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
  // const location = useLocation();
  
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    error: null,
    message: null,
  });

  const signIn = async (email: string, password: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      console.log('Attempting sign in for:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;

      console.log('Sign in successful:', data);
      
      setState(prev => ({
        ...prev,
        user: data.user,
        session: data.session,
        loading: false,
      }));
      
      navigate('/dashboard', { replace: true });
    } catch (error) {
      console.error('Sign in error:', error);
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
      console.log('Starting signup process...');
      
      const siteUrl = import.meta.env.VITE_SITE_URL || window.location.origin;
      const redirectTo = `${siteUrl}/auth/callback`;
      console.log('Redirect URL:', redirectTo);

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectTo,
          data: {
            role: 'client'
          }
        }
      });

      if (error) {
        console.error('Signup error:', error);
        throw error;
      }

      console.log('Signup response:', data);

      if (data?.user?.identities?.length === 0) {
        setState(prev => ({
          ...prev,
          loading: false,
          message: 'This email is already registered. Please sign in instead.',
        }));
        return;
      }

      setState(prev => ({
        ...prev,
        message: 'Please check your email for confirmation link',
        loading: false,
      }));

    } catch (error) {
      console.error('Signup error:', error);
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
      
      navigate('/auth/login', { replace: true });
    } catch (error) {
      console.error('Sign out error:', error);
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
      
      const siteUrl = import.meta.env.VITE_SITE_URL || window.location.origin;
      const redirectTo = `${siteUrl}/auth/reset-password`;
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo,
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
        console.log('Initializing auth...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) throw error;
        
        if (mounted) {
          setState(prev => ({
            ...prev,
            user: session?.user ?? null,
            session: session ?? null,
            loading: false,
          }));
        }

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            console.log('Auth state change:', event);
            
            if (mounted) {
              setState(prev => ({
                ...prev,
                user: session?.user ?? null,
                session: session ?? null,
                loading: false,
              }));

              switch (event) {
                case 'SIGNED_IN':
                  navigate('/dashboard');
                  break;
                case 'SIGNED_OUT':
                  navigate('/auth/login');
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
        console.error('Auth initialization error:', error);
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
  }, [navigate]);

  const contextValue: AuthContextType = {
    ...state,
    signIn,
    signOut,
    signUp,
    resetPassword,
    clearMessage: () => setState(prev => ({ ...prev, message: null })),
  };

  if (state.loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={contextValue}>
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