import { Database } from '../lib/database.types'

export interface AutosaveFormProps {
  sectionId: string;
  initialData?: any;
  children: React.ReactNode;
  onSave?: (data: any) => void;
}

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

export type Tables = Database['public']['Tables']
export type TableRow<T extends keyof Tables> = Tables[T]['Row']