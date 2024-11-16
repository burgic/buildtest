
// Add 'export' to make the interface available outside this module
export interface Workflow {
  id: string;
  advisorId: string;
  title: string;
  sections: WorkflowSection[];
  createdAt: Date;
  updatedAt: Date;
  status: WorkflowStatus;
}

// Export the status type
export type WorkflowStatus = 'draft' | 'active' | 'completed' | 'archived';

// Export the section interface
export interface WorkflowSection {
  id: string;
  title: string;
  type: 'personal' | 'financial' | 'documents' | 'goals';
  fields: FormField[];
  required: boolean;
  order: number;
  data?: any; // Add this to support the data property used in context
}

// Export the field interface
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

// Export a type for workflow responses
export interface WorkflowResponse {
  id: string;
  workflowId: string;
  sectionId: string;
  data: any;
  createdAt: string;
  updatedAt: string;
}