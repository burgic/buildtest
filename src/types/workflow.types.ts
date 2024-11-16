// src/types/workflow.types.ts
export interface Workflow {
    id: string;
    advisorId: string;
    title: string;
    sections: WorkflowSection[];
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface WorkflowSection {
    id: string;
    title: string;
    type: 'personal' | 'financial' | 'documents' | 'goals';
    fields: FormField[];
    required: boolean;
    order: number;
  }
  
  export interface FormField {
    id: string;
    label: string;
    type: 'text' | 'number' | 'date' | 'select' | 'file';
    required: boolean;
    options?: string[];
    validation?: {
      min?: number;
      max?: number;
      pattern?: string;
      message?: string;
    };
  }