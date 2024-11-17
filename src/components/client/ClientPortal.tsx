// src/components/client/ClientPortal.tsx
export interface ClientPortalProps {
    workflowId: string;
    sections: WorkflowSection[];
    onSave: (sectionId: string, data: any) => Promise<void>;
  }
  
  export function ClientPortal({ workflowId, sections, onSave }: ClientPortalProps) {
    // ... implementation
  }