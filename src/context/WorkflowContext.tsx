import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '../context/AuthProvider';
import { supabase } from '../lib/supabase';
import { v4 as uuidv4 } from 'uuid';

interface WorkflowContextType {
  currentWorkflow: any;
  setCurrentWorkflow: (workflow: any) => void;
  saveProgress: (sectionId: string, data: any) => Promise<void>;
  loading: boolean;
  error: Error | null;
}

const WorkflowContext = createContext<WorkflowContextType | undefined>(undefined);

export function WorkflowProvider({ children }: { children: React.ReactNode }) {
  const [currentWorkflow, setCurrentWorkflow] = useState<any>(null);
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

        // First, try to find any active workflows
        const { data: existingWorkflows, error: fetchError } = await supabase
          .from('workflows')
          .select('*')
          .eq('advisor_id', session.user.id)
          .eq('status', 'active')
          .order('created_at', { ascending: false }); // Get most recent first

        if (fetchError) {
          throw fetchError;
        }

        let workflow;
        
        if (existingWorkflows && existingWorkflows.length > 0) {
          // Use the most recent workflow
          workflow = existingWorkflows[0];
          
          // Optionally, mark other workflows as archived
          if (existingWorkflows.length > 1) {
            const oldWorkflowIds = existingWorkflows
              .slice(1)
              .map(w => w.id);
            
            const { error: archiveError } = await supabase
              .from('workflows')
              .update({ status: 'archived' })
              .in('id', oldWorkflowIds);

            if (archiveError) {
            }
          }
        } else {
          
          // Create new workflow
          const newWorkflow = {
            title: 'Financial Information Workflow',
            advisor_id: session.user.id,
            status: 'active',
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

          if (createError) {
            throw createError;
          }

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

  const saveProgress = async (sectionId: string, data: any) => {

    if (!currentWorkflow?.id) {
      throw new Error('No active workflow');
    }

    try {
      // First, check if we're still authenticated
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No active session');
      }

      // Save to form_responses table
      const { data: response, error } = await supabase
        .from('form_responses')
        .insert({
          workflow_id: currentWorkflow.id,
          section_id: sectionId,
          data: data
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Update local state
      setCurrentWorkflow(prev => ({
        ...prev,
        sections: prev.sections.map(section =>
          section.id === sectionId
            ? { ...section, data }
            : section
        )
      }));

      return response;
    } catch (error) {
      throw error;
    }
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

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-red-600 p-4">
          <p>Error: {error.message}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <WorkflowContext.Provider value={{
      currentWorkflow,
      setCurrentWorkflow,
      saveProgress,
      loading,
      error
    }}>
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