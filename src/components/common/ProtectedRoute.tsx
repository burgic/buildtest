// src/pages/_app.tsx
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import Navigation from '../components/Navigation';
import { ErrorBoundary } from '../components/common/ErrorBoundary';
import { WorkflowProvider } from '../context/WorkflowContext';
import { AuthProvider } from '../context/AuthProvider';
import '../index.css';

function App({ Component, pageProps }) {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <WorkflowProvider>
          <BrowserRouter>
            <div className="min-h-screen bg-gray-50">
              <Navigation />
              <div className="container mx-auto px-4 py-8">
                <Component {...pageProps} />
              </div>
            </div>
          </BrowserRouter>
        </WorkflowProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;

// src/context/AuthProvider.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: any | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const value = {
    user,
    loading,
    signIn: async (email: string, password: string) => {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (error) throw error;
    },
    signOut: async () => {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    }
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// src/context/WorkflowContext.tsx
import React, { createContext, useContext, useState } from 'react';
import type { Workflow, WorkflowSection } from '../types/workflow.types';

interface WorkflowContextType {
  currentWorkflow: Workflow | null;
  setCurrentWorkflow: (workflow: Workflow | null) => void;
  saveProgress: (sectionId: string, data: any) => Promise<void>;
}

const WorkflowContext = createContext<WorkflowContextType | undefined>(undefined);

export function WorkflowProvider({ children }: { children: React.ReactNode }) {
  const [currentWorkflow, setCurrentWorkflow] = useState<Workflow | null>(null);

  const saveProgress = async (sectionId: string, data: any) => {
    try {
      if (!currentWorkflow) return;
      
      await WorkflowService.saveFormResponse(currentWorkflow.id, sectionId, data);
      
      // Update local state if needed
      setCurrentWorkflow(prev => {
        if (!prev) return null;
        return {
          ...prev,
          sections: prev.sections.map(section =>
            section.id === sectionId
              ? { ...section, data }
              : section
          )
        };
      });
    } catch (error) {
      console.error('Error saving progress:', error);
      throw error;
    }
  };

  const value = {
    currentWorkflow,
    setCurrentWorkflow,
    saveProgress
  };

  return (
    <WorkflowContext.Provider value={value}>
      {children}
    </WorkflowContext.Provider>
  );
}

export const useWorkflow = () => {
  const context = useContext(WorkflowContext);
  if (context === undefined) {
    throw new Error('useWorkflow must be used within a WorkflowProvider');
  }
  return context;
};

// src/components/common/ProtectedRoute.tsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthProvider';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'advisor' | 'client';
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}