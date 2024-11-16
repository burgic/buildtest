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
