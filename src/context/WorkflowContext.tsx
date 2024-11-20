import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthProvider';
import { supabase } from '../lib/supabase';
import type { WorkflowSection } from '../types';

interface WorkflowData {
  id: string;
  title: string;
  advisor_id: string;
  status: 'draft' | 'active' | 'completed' | 'archived';
  sections: WorkflowSection[];
  created_at?: string;
  updated_at?: string;
}

interface WorkflowContextType {
  currentWorkflow: WorkflowData | null; // Use WorkflowData here
  setCurrentWorkflow: (workflow: any) => void;
  saveProgress: (sectionId: string, data: Record<string, any>) => Promise<void>;
  loading: boolean;
  error: Error | null;
}

// Define defaultSections first
const defaultSections: WorkflowSection[] = [
  {
    id: 'personal',
    title: 'Personal Details',
    type: 'personal',
    required: true,
    order: 1,
    fields: [
      { id: 'fullName', label: 'Full Name', type: 'text', required: true },
      { id: 'email', label: 'Email', type: 'email', required: true },
      { id: 'phone', label: 'Phone', type: 'tel', required: true },
      { id: 'address', label: 'Address', type: 'text', required: true }
    ], 
    data: {}
  },
  {
    id: 'employment',
    title: 'Employment & Income',
    type: 'financial',
    required: true,
    order: 2,
    fields: [
      { id: 'employer', label: 'Employer', type: 'text', required: true },
      { id: 'position', label: 'Position', type: 'text', required: true },
      { id: 'annualIncome', label: 'Annual Income', type: 'number', required: true },
      { id: 'yearsEmployed', label: 'Years Employed', type: 'number', required: true }
    ], 
    data: {}
  },
  {
    id: 'expenses',
    title: 'Monthly Expenses',
    type: 'financial',
    required: true,
    order: 3,
    fields: [
      { id: 'housing', label: 'Housing', type: 'number', required: true },
      { id: 'utilities', label: 'Utilities', type: 'number', required: true },
      { id: 'transportation', label: 'Transportation', type: 'number', required: true },
      { id: 'insurance', label: 'Insurance', type: 'number', required: true }
    ], 
    data: {}
  },
  {
    id: 'assets',
    title: 'Assets & Liabilities',
    type: 'financial',
    required: true,
    order: 4,
    fields: [
      { id: 'cashSavings', label: 'Cash & Savings', type: 'number', required: true },
      { id: 'investments', label: 'Investments', type: 'number', required: true },
      { id: 'propertyValue', label: 'Property Value', type: 'number', required: true },
      { id: 'totalDebt', label: 'Total Debt', type: 'number', required: true }
    ], 
    data: {}
  }
];

// Create context once
const WorkflowContext = createContext<WorkflowContextType | undefined>(undefined);

// Single Provider implementation
export function WorkflowProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [currentWorkflow, setCurrentWorkflow] = useState<WorkflowContextType['currentWorkflow']>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const initializeWorkflow = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const { data, error: fetchError } = await supabase
          .from('workflows')
          .select('*')
          .eq('advisor_id', user.id)
          .eq('status', 'active')
          .order('created_at', { ascending: false })

          if (fetchError || !data) {
            // Create new workflow with default sections
            const newWorkflow = {
              id: 'temp-' + Date.now(),
              title: 'Financial Profile',
              advisor_id: user.id,
              status: 'active' as 'active',
              sections: defaultSections // Use our complete sections
            };
  
            const { data: createdWorkflow, error: createError } = await supabase
              .from('workflows')
              .insert([newWorkflow])
              .select()
              .single();
  
            if (createError) throw createError;
            
            console.log('Created new workflow:', createdWorkflow);
            setCurrentWorkflow({
              ...createdWorkflow,
              sections: defaultSections // Ensure sections are complete
            });
          } else {
            console.log('Found existing workflow:', data);
            setCurrentWorkflow({
              ...data[0],
              sections: defaultSections
            });
          }
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to initialize workflow';
          console.error('Error in workflow initialization:', errorMessage);
          setError(err instanceof Error ? err : new Error(errorMessage));
          // Fallback to memory-only workflow if database fails
          setCurrentWorkflow({
            id: 'temp-' + Date.now(),
            title: 'Financial Profile',
            advisor_id: user.id,
            status: 'active',
            sections: defaultSections
          });
        } finally {
          setLoading(false);
        }
      };
  
      initializeWorkflow();
    }, [user]);

  const saveProgress = async (sectionId: string, data: Record<string, any>) => {
    if (!currentWorkflow?.id) {
      throw new Error('No active workflow');
    }

    try {
      const { error: saveError } = await supabase
        .from('form_responses')
        .insert({
          workflow_id: currentWorkflow.id,
          section_id: sectionId,
          data
        });

      if (saveError) throw saveError;

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
  
      console.log('Successfully saved progress:', { sectionId, data });
    } catch (err) {
      console.error('Error saving progress:', err);
      throw err;
    }
  };

  // Provide all values defined in WorkflowContextType
  return (
    <WorkflowContext.Provider 
      value={{
        currentWorkflow,
        setCurrentWorkflow,
        saveProgress,
        loading,
        error
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