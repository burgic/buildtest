/*
import React, { createContext, useEffect, useContext, useState } from 'react';
import { useAuth } from './AuthProvider';
import { WorkflowService } from '../services/WorkflowService';
import type { WorkflowSection } from '../types/workflow.types';
import { defaultSections } from '../config/WorkflowConfig'
// import { Database } from '../lib/database.types'


// Define WorkflowData interface
interface Workflow {
  id: string;
  title: string;
  advisor_id: string;
  status: 'draft' | 'active' | 'completed' | 'archived';
  sections: WorkflowSection[];
  created_at?: string;
  updated_at?: string;
}

interface WorkflowState {
  currentWorkflow: Workflow | null;
  currentWorkflowLink: string | null;
  responses: Record<string, any>;
  loading: boolean;
  error: Error | null;
}

interface WorkflowContextProps extends WorkflowState {
  setCurrentWorkflow: (workflow: Workflow | null) => void;
  saveProgress: (sectionId: string, data: Record<string, any>) => Promise<void>;
}



// Default Sections Template

// Handle the existing form response correctly
const { data: existingResponses, error: fetchError } = await supabase
  .from('form_responses')
  .select('id')
  .eq('workflow_id', workflowId)
  .eq('section_id', sectionId);

if (fetchError) throw fetchError;

// Assuming we only want to use the first existing response
if (existingResponses && existingResponses.length > 0) {
  const existing = existingResponses[0];
  const { error: updateError } = await supabase
    .from('form_responses')
    .update({ data })
    .eq('id', existing.id);

  if (updateError) throw updateError;
}


// /*

export function WorkflowProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<WorkflowState>({
    currentWorkflow: null,
    currentWorkflowLink: null,
    responses: {},
    loading: true,
    error: null
  });

  const { user } = useAuth();

  const setCurrentWorkflow = (workflow: Workflow | null) => {
    setState(prev => ({ ...prev, currentWorkflow: workflow }));
  };

  const saveProgress = async (sectionId: string, data: Record<string, any>) => {
    if (!state.currentWorkflow?.id) {
      throw new Error('No active workflow');
    }

    try {
      await WorkflowService.saveFormResponse(
        state.currentWorkflow.id,
        sectionId,
        data
      );

      setState(prev => ({
        ...prev,
        responses: {
          ...prev.responses,
          [sectionId]: data
        }
      }));
    } catch (error) {
      console.error('Error saving progress:', error);
      throw error;
    }
  };

  useEffect(() => {
    let mounted = true;
  
    async function initializeWorkflow() {
      if (!user?.email) return;
  
      try {
        const workflows = await WorkflowService.initializeClientWorkflows(user.id, user.email);
        
        if (workflows.length > 0) {
          return workflows[0]; // Return the first workflow or apply logic to pick the right one
        }

        if (mounted) {
          setState(prev => ({
            ...prev,
            currentWorkflow: workflows.length > 0 ? workflows[0] : null, // Set the first workflow or null if none
            currentWorkflowLink: workflows.length > 0 ? workflows[0].id : null, // Use the id of the first workflow or null
            loading: false,
            error: null,
          }));
        }
      } catch (error) {
        console.error('Error initializing workflow:', error);
        if (mounted) {
          setState(prev => ({
            ...prev,
            error: error instanceof Error ? error : new Error('Failed to initialize workflow'),
            loading: false,
          }));
        }
      }
    }
  
    initializeWorkflow();
  
    return () => {
      mounted = false;
    };
  }, [user]);
  
  return (
    <WorkflowContext.Provider 
      value={{
        currentWorkflow: state.currentWorkflow,
        currentWorkflowLink: state.currentWorkflowLink,
        responses: state.responses,
        loading: state.loading,
        error: state.error,
        setCurrentWorkflow,
        saveProgress
      }}
    >
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




interface WorkflowContextType {
  currentWorkflow: {
    id: string;
    title: string;
    advisor_id: string;
    status: 'draft' | 'active' | 'completed' | 'archived';
    sections: WorkflowSection[];
  } | null;
  setCurrentWorkflow: (workflow: any) => void;
  saveProgress: (sectionId: string, data: Record<string, any>) => Promise<any>;
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
            sections: defaultSections  // Use defaultSections instead of the simple array
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

  const value: WorkflowContextType = {
    currentWorkflow,
    setCurrentWorkflow,
    saveProgress,
    loading,
    error
  };

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

*/