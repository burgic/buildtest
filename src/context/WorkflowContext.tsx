import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthProvider';
import { supabase } from '../lib/supabase';
import type { WorkflowSection } from '../types';

// Define Workflow Data Types
interface WorkflowData {
  id: string;
  title: string;
  advisor_id: string;
  status: 'draft' | 'active' | 'completed' | 'archived';
  sections: WorkflowSection[];
  created_at?: string;
  updated_at?: string;
}

interface WorkflowContextProps {
  currentWorkflow: WorkflowData | null;
  setCurrentWorkflow: (workflow: WorkflowData | null) => void;
  saveProgress: (sectionId: string, data: Record<string, any>) => Promise<void>;
  loading: boolean;
  error: Error | null;
}

// Create Context
const WorkflowContext = createContext<WorkflowContextProps | undefined>(undefined);

// Default Sections Template
const defaultSections: WorkflowSection[] = [
  {
    id: 'personal',
    title: 'Personal Details',
    type: 'personal', // Add the 'type' field
    required: true, // Add the 'required' field
    order: 1, // Add the 'order' field
    fields: [
      { id: 'fullName', label: 'Full Name', type: 'text', required: true },
      { id: 'email', label: 'Email', type: 'email', required: true },
      // Add more fields as needed
    ],
    data: {}, // Default empty data
  },
  // Add more sections following the same pattern
];

export const WorkflowProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [currentWorkflow, setCurrentWorkflow] = useState<WorkflowData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Initialize Workflow
  const initializeWorkflow = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      // Fetch active workflow for the advisor
      const { data, error: fetchError } = await supabase
        .from('workflows')
        .select('*')
        .eq('advisor_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      if (!data || data.length === 0) {
        // Create a new workflow if none exist
        const newWorkflow = {
          title: 'Financial Profile',
          advisor_id: user.id,
          status: 'active' as const,
          sections: defaultSections,
        };

        const { data: createdWorkflow, error: createError } = await supabase
          .from('workflows')
          .insert([newWorkflow])
          .select()
          .single();

        if (createError) throw createError;

        setCurrentWorkflow({ ...createdWorkflow, sections: defaultSections });
      } else {
        // Load existing workflow and responses
        const workflow = data[0];
        const { data: responses } = await supabase
          .from('form_responses')
          .select('*')
          .eq('workflow_id', workflow.id);

        const sectionsWithData = defaultSections.map((section) => ({
          ...section,
          data: responses?.find((r) => r.section_id === section.id)?.data || {},
        }));

        setCurrentWorkflow({ ...workflow, sections: sectionsWithData });
      }
    } catch (err) {
      console.error('Error initializing workflow:', err);
      setError(err instanceof Error ? err : new Error('Failed to initialize workflow'));
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    initializeWorkflow();
  }, [initializeWorkflow]);

  // Save Progress
  const saveProgress = useCallback(
    async (sectionId: string, data: Record<string, any>) => {
      if (!currentWorkflow?.id) {
        throw new Error('No active workflow');
      }

      try {
        // Check if a response exists for this section
        const { data: existingResponse, error: fetchError } = await supabase
          .from('form_responses')
          .select('*')
          .eq('workflow_id', currentWorkflow.id)
          .eq('section_id', sectionId)
          .single();

        if (fetchError && fetchError.code !== 'PGRST116') {
          throw fetchError; // Throw if not a "not found" error
        }

        if (existingResponse) {
          // Update the existing response
          const { error: updateError } = await supabase
            .from('form_responses')
            .update({ data })
            .eq('id', existingResponse.id);

          if (updateError) throw updateError;
        } else {
          // Insert a new response
          const { error: insertError } = await supabase
            .from('form_responses')
            .insert({
              workflow_id: currentWorkflow.id,
              section_id: sectionId,
              data,
            })
            .select()
            .single();

          if (insertError) throw insertError;
        }

        // Update local state optimistically
        setCurrentWorkflow((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            sections: prev.sections.map((section) =>
              section.id === sectionId ? { ...section, data } : section
            ),
          };
        });
      } catch (err) {
        console.error('Error saving progress:', err);
        throw err;
      }
    },
    [currentWorkflow]
  );

  return (
    <WorkflowContext.Provider
      value={{
        currentWorkflow,
        setCurrentWorkflow,
        saveProgress,
        loading,
        error,
      }}
    >
      {children}
    </WorkflowContext.Provider>
  );
};

// Custom Hook for Workflow Context
export const useWorkflow = () => {
  const context = useContext(WorkflowContext);
  if (!context) {
    throw new Error('useWorkflow must be used within a WorkflowProvider');
  }
  return context;
};


/*

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