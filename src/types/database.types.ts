// database.types.ts
export interface Database {
    public: {
      Tables: {
        workflows: {
          Row: {
            id: string;
            advisor_id: string;
            title: string;
            description?: string;
            status: 'draft' | 'active' | 'archived';
            sections: any[];
            created_at?: string;
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
            created_at?: string;
          };
        };
        form_responses: {
          Row: {
            id: string;
            workflow_link_id: string;
            section_id: string;
            data: any;
            created_at?: string;
            updated_at?: string;
          };
        };
      };
    };
  }