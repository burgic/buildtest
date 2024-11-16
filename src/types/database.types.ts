export interface Database {
    public: {
      Tables: {
        users: {
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
            full_name?: string;
          };
          Update: {
            email?: string;
            role?: 'advisor' | 'client';
            full_name?: string;
          };
        };
        // Add other table types...
      };
    };
  }

// src/types/database.types.ts
export interface User {
    id: string;
    email: string;
    role: 'advisor' | 'client';
    fullName: string;
    createdAt: Date;
  }
  
  export interface WorkflowLink {
    id: string;
    workflowId: string;
    clientEmail: string;
    status: 'pending' | 'in_progress' | 'completed';
    expiresAt: Date;
    createdAt: Date;
  }
  
  export interface FormResponse {
    id: string;
    workflowLinkId: string;
    sectionId: string;
    data: Record<string, any>;
    createdAt: Date;
  }