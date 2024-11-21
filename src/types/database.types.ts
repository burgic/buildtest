// src/lib/database.types.ts

export interface Database {
  public: {
    Tables: {
      workflows: {
        Row: {
          id: string;
          title: string;
          advisor_id: string;
          status: 'draft' | 'active' | 'completed' | 'archived';
          sections: any[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          advisor_id: string;
          status?: 'draft' | 'active' | 'completed' | 'archived';
          sections?: any[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          advisor_id?: string;
          status?: 'draft' | 'active' | 'completed' | 'archived';
          sections?: any[];
          updated_at?: string;
        };
      };
      workflow_links: {
        Row: {
          id: string;
          workflow_id: string;
          client_email: string;
          status: 'pending' | 'in_progress' | 'completed';
          expires_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          workflow_id: string;
          client_email: string;
          status?: 'pending' | 'in_progress' | 'completed';
          expires_at?: string;
          created_at?: string;
        };
        Update: {
          workflow_id?: string;
          client_email?: string;
          status?: 'pending' | 'in_progress' | 'completed';
          expires_at?: string;
        };
      };
      form_responses: {
        Row: {
          id: string;
          workflow_id: string;
          section_id: string;
          data: any;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          workflow_id: string;
          section_id: string;
          data: any;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          workflow_id?: string;
          section_id?: string;
          data?: any;
          updated_at?: string;
        };
      };
      user_profiles: {
        Row: {
          id: string;
          email: string;
          role: 'advisor' | 'client';
          full_name: string | null;
          created_at: string;
        };
        Insert: {
          email: string;
          role: 'advisor' | 'client';
          full_name?: string | null;
        };
        Update: {
          email?: string;
          role?: 'advisor' | 'client';
          full_name?: string | null;
        };
      };
      documents: {
        Row: {
          id: string;
          workflow_id: string;
          file_path: string;
          original_filename: string;
          document_type: string;
          status: 'uploading' | 'processing' | 'completed' | 'error';
          extracted_data: any;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          workflow_id: string;
          file_path: string;
          original_filename: string;
          document_type: string;
          status?: 'uploading' | 'processing' | 'completed' | 'error';
          extracted_data?: any;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          workflow_id?: string;
          file_path?: string;
          document_type?: string;
          status?: 'uploading' | 'processing' | 'completed' | 'error';
          extracted_data?: any;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

export type Tables = Database['public']['Tables'];
export type TableRow<T extends keyof Tables> = Tables[T]['Row'];
export type TableInsert<T extends keyof Tables> = Tables[T]['Insert'];
export type TableUpdate<T extends keyof Tables> = Tables[T]['Update'];