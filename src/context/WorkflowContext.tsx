import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthProvider';
import { supabase } from '../lib/supabase';
import type { WorkflowSection } from '../types';

interface WorkflowContextType {
  currentWorkflow: {
    id: string;
    title: string;
    advisor_id: string;
    status: 'draft' | 'active' | 'completed' | 'archived';
    sections: WorkflowSection[];
  } | null;
  setCurrentWorkflow: (workflow: any) => void;
  saveProgress: (sectionId: string, data: Record<string, any>) => Promise<void>;
  loading: boolean;
  error: Error | null;
}

const WorkflowContext = createContext<WorkflowContextType | undefined>(undefined);

export function WorkflowProvider({ children }: { children: React.ReactNode }) {
  const [currentWorkflow, setCurrentWorkflow] = useState<WorkflowContextType['currentWorkflow']>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const initializeWorkflow = async () => {
      try {
        const { data: { session }, error: authError } = await supabase.auth.getSession();
        
        if (authError) throw authError;
        if (!session?.user) {
          setLoading(false);
          return;
        }

        const { data: existingWorkflows, error: fetchError } = await supabase
          .from('workflows')
          .select('*')
          .eq('advisor_id', session.user.id)
          .eq('status', 'active')
          .order('created_at', { ascending: false });

        if (fetchError) throw fetchError;

        let workflow;
        
        if (existingWorkflows && existingWorkflows.length > 0) {
          workflow = existingWorkflows[0];
          
          if (existingWorkflows.length > 1) {
            const oldWorkflowIds = existingWorkflows
              .slice(1)
              .map(w => w.id);
            
            await supabase
              .from('workflows')
              .update({ status: 'archived' })
              .in('id', oldWorkflowIds);
          }
        } else {
          const newWorkflow = {
            title: 'Financial Information Workflow',
            advisor_id: session.user.id,
            status: 'active' as const,
            sections: [
              { id: 'personal', title: 'Personal Details', data: {} },
              { id: 'employment', title: 'Employment & Income', data: {} },
              { id: 'expenses', title: 'Monthly Expenses', data: {} },
              { id: 'assets', title: 'Assets & Liabilities', data: {} },
              { id: 'goals', title: 'Financial Goals', data: {} }
            ]
          };

          const { data: createdWorkflow, error: createError } = await supabase
            .from('workflows')
            .insert(newWorkflow)
            .select()
            .single();

          if (createError) throw createError;
          workflow = createdWorkflow;
        }

        setCurrentWorkflow(workflow);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to initialize workflow'));
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      initializeWorkflow();
    } else {
      setLoading(false);
    }
  }, [user]);

  const saveProgress = async (sectionId: string, data: Record<string, any>) => {
    if (!currentWorkflow?.id) {
      throw new Error('No active workflow');
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No active session');
      }

      const { data: response, error: saveError } = await supabase
        .from('form_responses')
        .insert({
          workflow_id: currentWorkflow.id,
          section_id: sectionId,
          data
        })
        .select()
        .single();

      if (saveError) throw saveError;

      setCurrentWorkflow(prev => prev ? {
        ...prev,
        sections: prev.sections.map(section =>
          section.id === sectionId
            ? { ...section, data: { ...(section.data || {}), ...data } }
            : section
        )
      } : null);

      return response;
    } catch (error) {
      console.error('Error in saveProgress:', error);
      throw error;
    }
  };

  const value = {
    currentWorkflow,
    setCurrentWorkflow,
    saveProgress,
    loading,
    error
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing workflow...</p>
        </div>
      </div>
    );
  }

  return (
    <WorkflowContext.Provider value={value}>
      {children}
    </WorkflowContext.Provider>
  );
}

export function useWorkflow() {
  const context = useContext(WorkflowContext);
  if (!context) {
    throw new Error('useWorkflow must be used within a WorkflowProvider');
  }
  return context;
}