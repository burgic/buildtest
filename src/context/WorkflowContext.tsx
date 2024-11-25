import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthProvider';
import { supabase } from '../lib/supabase';
import { WorkflowService } from '../services/WorkflowService';
import type { WorkflowSection } from '../types/workflow.types';
// import { defaultSections } from '../config/WorkflowConfig';

// Define core interfaces
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

// Create the context
const WorkflowContext = createContext<WorkflowContextProps | undefined>(undefined);

export function WorkflowProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<WorkflowState>({
    currentWorkflow: null,
    currentWorkflowLink: null,
    responses: {},
    loading: true,
    error: null
  });

  const { user } = useAuth();

  // Initialize workflow when user is available
  useEffect(() => {
    let mounted = true;

    async function initializeWorkflow() {
      if (!user?.email) return;

      try {
        const workflows = await WorkflowService.initializeClientWorkflow(user.id, user.email);
        
        if (mounted && workflows.length > 0) {
          const activeWorkflow = workflows[0]; // Use the first workflow
          
          // Get the workflow responses
          const responses = await WorkflowService.getFormResponses(activeWorkflow.id);

          setState(prev => ({
            ...prev,
            currentWorkflow: activeWorkflow,
            currentWorkflowLink: activeWorkflow.id,
            responses,
            loading: false,
            error: null
          }));
        } else {
          setState(prev => ({
            ...prev,
            loading: false,
            error: new Error('No workflow available')
          }));
        }
      } catch (error) {
        console.error('Error initializing workflow:', error);
        if (mounted) {
          setState(prev => ({
            ...prev,
            error: error instanceof Error ? error : new Error('Failed to initialize workflow'),
            loading: false
          }));
        }
      }
    }

    initializeWorkflow();

    return () => {
      mounted = false;
    };
  }, [user]);


  // Save progress handler
  const saveProgress = async (sectionId: string, data: Record<string, any>) => {
    if (!state.currentWorkflow?.id) {
      throw new Error('No active workflow');
    }
  
    try {
      console.log('Saving progress:', { sectionId, data });
      
      // First check for existing response
      const { data: existingData, error: checkError } = await supabase
        .from('form_responses')
        .select('*')
        .eq('workflow_id', state.currentWorkflow.id)
        .eq('section_id', sectionId)
        .maybeSingle();
  
      if (checkError) {
        throw checkError;
      }
  
      if (existingData) {
        // Update existing response
        const { error: updateError } = await supabase
          .from('form_responses')
          .update({ 
            data,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingData.id);
  
        if (updateError) throw updateError;
  
      } else {
        // Insert new response
        const { error: insertError } = await supabase
          .from('form_responses')
          .insert({
            workflow_id: state.currentWorkflow.id,
            section_id: sectionId,
            data,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
  
        if (insertError) throw insertError;
      }
  
      // Update local state
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

  const setCurrentWorkflow = (workflow: Workflow | null) => {
    setState(prev => ({ ...prev, currentWorkflow: workflow }));
  };

  return (
    <WorkflowContext.Provider
      value={{
        ...state,
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