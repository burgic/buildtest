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
  currentWorkflow: WorkflowData | null;
  setCurrentWorkflow: (workflow: WorkflowData | null) => void;
  saveProgress: (sectionId: string, data: Record<string, any>) => Promise<void>;
  loading: boolean;
  error: Error | null;
}

// Export the context
const WorkflowContext = createContext<WorkflowContextType | undefined>(undefined);

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
      { id: 'address', label: 'Address', type: 'text', required: true },
      { id: 'dateOfBirth', label: 'Date of Birth', type: 'date', required: true }
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
      { id: 'employmentStatus', label: 'Employment Status', type: 'select', required: true, 
        options: ['Full-time', 'Part-time', 'Self-employed', 'Retired', 'Other'] },
      { id: 'annualIncome', label: 'Annual Income', type: 'number', required: true },
      { id: 'yearsEmployed', label: 'Years Employed', type: 'number', required: true },
      { id: 'otherIncome', label: 'Other Income', type: 'number', required: false }
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
      { id: 'housing', label: 'Housing (Rent/Mortgage)', type: 'number', required: true },
      { id: 'utilities', label: 'Utilities', type: 'number', required: true },
      { id: 'transportation', label: 'Transportation', type: 'number', required: true },
      { id: 'insurance', label: 'Insurance', type: 'number', required: true },
      { id: 'food', label: 'Food & Groceries', type: 'number', required: true },
      { id: 'healthcare', label: 'Healthcare', type: 'number', required: true },
      { id: 'entertainment', label: 'Entertainment', type: 'number', required: false },
      { id: 'other', label: 'Other Expenses', type: 'number', required: false }
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
      { id: 'retirement', label: 'Retirement Accounts', type: 'number', required: true },
      { id: 'propertyValue', label: 'Property Value', type: 'number', required: true },
      { id: 'otherAssets', label: 'Other Assets', type: 'number', required: false },
      { id: 'mortgage', label: 'Mortgage Balance', type: 'number', required: false },
      { id: 'carLoan', label: 'Car Loan', type: 'number', required: false },
      { id: 'creditCard', label: 'Credit Card Debt', type: 'number', required: false },
      { id: 'studentLoan', label: 'Student Loans', type: 'number', required: false },
      { id: 'otherDebts', label: 'Other Debts', type: 'number', required: false }
    ],
    data: {}
  },
  {
    id: 'goals',
    title: 'Financial Goals',
    type: 'financial',
    required: true,
    order: 5,
    fields: [
      { 
        id: 'primaryGoal', 
        label: 'Primary Financial Goal', 
        type: 'select', 
        required: true,
        options: [
          'Retirement Planning',
          'Debt Reduction',
          'Savings',
          'Investment Growth',
          'Home Purchase',
          'Education Funding',
          'Business Start-up',
          'Other'
        ]
      },
      { id: 'timeframe', label: 'Goal Timeframe (years)', type: 'number', required: true },
      { id: 'targetAmount', label: 'Target Amount', type: 'number', required: true },
      { id: 'currentSavings', label: 'Current Monthly Savings', type: 'number', required: true },
      { 
        id: 'riskTolerance', 
        label: 'Investment Risk Tolerance', 
        type: 'select', 
        required: true,
        options: ['Conservative', 'Moderate', 'Aggressive'] 
      }
    ],
    data: {}
  }
];

export function WorkflowProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [currentWorkflow, setCurrentWorkflow] = useState<WorkflowData | null>(null);
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
          .order('created_at', { ascending: false });

        if (fetchError) throw fetchError;

        if (!data || data.length === 0) {
          const newWorkflow = {
            title: 'Financial Profile',
            advisor_id: user.id,
            status: 'active' as const,
            sections: defaultSections
          };

          const { data: createdWorkflow, error: createError } = await supabase
            .from('workflows')
            .insert([newWorkflow])
            .select()
            .single();

          if (createError) throw createError;

          setCurrentWorkflow({
            ...createdWorkflow,
            sections: defaultSections
          });
        } else {
          const workflow = data[0];
          const { data: responses } = await supabase
            .from('form_responses')
            .select('*')
            .eq('workflow_id', workflow.id);

          const sectionsWithData = defaultSections.map(section => ({
            ...section,
            data: responses?.find(r => r.section_id === section.id)?.data || {}
          }));

          setCurrentWorkflow({
            ...workflow,
            sections: sectionsWithData
          });
        }
      } catch (err) {
        console.error('Error in workflow initialization:', err);
        setError(err instanceof Error ? err : new Error('Failed to initialize workflow'));
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
      // Check for existing response
      const { data: existingResponse, error: fetchError } = await supabase
        .from('form_responses')
        .select()
        .eq('workflow_id', currentWorkflow.id)
        .eq('section_id', sectionId)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') { // Not found error
        throw fetchError;
      }

      if (existingResponse) {
        // Update existing response
        const { error: updateError } = await supabase
          .from('form_responses')
          .update({ data })
          .eq('id', existingResponse.id)

        if (updateError) throw updateError;

      } else {
        // Insert new response
        const { error: insertError } = await supabase
          .from('form_responses')
          .insert({
            workflow_id: currentWorkflow.id,
            section_id: sectionId,
            data
          })
          .select()
          .single();

        if (insertError) throw insertError;
        
      }

      // Update local state
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

    } catch (err) {
      console.error('Error saving progress:', err);
      throw err;
    }
  };

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
  if (context === undefined) {
    throw new Error('useWorkflow must be used within a WorkflowProvider');
  }
  return context;
}

// 6. Export the context
export { WorkflowContext };

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