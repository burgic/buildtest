// src/lib/database.types.ts
export interface Database {
  public: {
    Tables: {
      workflow_links: {
        Row: {
          id: string;
          workflow_id: string;
          client_email: string;
          status: 'pending' | 'in_progress' | 'completed';
          expires_at: string;
          created_at?: string;
        };
        Insert: {
          workflow_id: string;
          client_email: string;
          status?: 'pending' | 'in_progress' | 'completed';
          expires_at?: string;
          created_at?: string;
        };
      };
      form_responses: {
        Row: {
          id: string;
          workflow_id: string;
          section_id: string;
          data: any;
          created_at?: string;
          updated_at?: string;
        };
        Insert: {
          workflow_id: string;
          section_id: string;
          data: any;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}