export interface WorkflowSection {
    id: string;
    title: string;
    type: 'personal' | 'financial' | 'documents' | 'goals';
    fields: FormField[];
    required: boolean;
    order: number;
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
    workflowId: string;
    sectionId: string;
    data: any;
    createdAt: string;
    updatedAt: string;
  }