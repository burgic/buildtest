import React, { createContext, useContext, useState } from 'react';
import { Workflow, WorkflowSection } from '../types/workflow.types';
import { WorkflowService } from '../services/WorkflowService';

interface WorkflowContextType {
  currentWorkflow: Workflow | null;
  setCurrentWorkflow: (workflow: Workflow | null) => void;
  saveProgress: (workflowId: string, sectionId: string, data: any) => Promise<void>;
  loading: boolean;
  error: Error | null;
}

const WorkflowContext = createContext<WorkflowContextType | undefined>(undefined);

interface WorkflowProviderProps {
  children: React.ReactNode;
}

export function WorkflowProvider({ children }: WorkflowProviderProps) {
  const [currentWorkflow, setCurrentWorkflow] = useState<Workflow | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const saveProgress = async (workflowId: string, sectionId: string, data: any) => {
    try {
      setLoading(true);
      setError(null);

      await WorkflowService.saveFormResponse(workflowId, sectionId, data);

      // Update the local workflow state
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
      const error = err instanceof Error ? err : new Error('Failed to save progress');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
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
  if (context === undefined) {
    throw new Error('useWorkflow must be used within a WorkflowProvider');
  }
  return context;
}