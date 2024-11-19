// src/types/workflow.types.ts

export interface WorkflowContextType {
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

export interface WorkflowSection {
  id: string;
  title: string;
  fields: Array<{
    id: string;
    label: string;
    type: string;
    required: boolean;
    options?: string[];
    validation?: {
      min?: number;
      max?: number;
      pattern?: string;
      message?: string;
    };
  }>;
  data?: any;
}


export interface FormField {
  id: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'number' | 'select' | 'date';
  required: boolean;
  options?: string[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
}

export interface WorkflowResponse {
  id: string;
  workflow_id: string;
  section_id: string;
  data: any;
  created_at: string;
  updated_at: string;
}