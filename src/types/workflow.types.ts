// src/types/workflow.types.ts

export type WorkflowStatus = 'draft' | 'active' | 'completed' | 'archived';
export type FieldType = 'text' | 'number' | 'email' | 'tel' | 'select' | 'date' | 'file';

export interface FormField {
  id: string;
  label: string;
  type: FieldType;
  required: boolean;
  options?: string[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
}

export interface WorkflowSection {
  id: string;
  title: string;
  type: 'personal' | 'financial' | 'documents' | 'goals';
  fields: FormField[];
  required: boolean;
  order: number;
  data?: Record<string, any>;
}

export interface Workflow {
  id: string;
  title: string;
  advisor_id: string;
  sections: WorkflowSection[];
  status: WorkflowStatus;
  created_at?: string;
  updated_at?: string;
}

export interface FormResponse {
  id: string;
  workflow_id: string;
  section_id: string;
  data: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface WorkflowLink {
  id: string;
  workflow_id: string;
  client_email: string;
  status: 'pending' | 'active' | 'completed';
  expires_at: string;
  created_at: string;
}