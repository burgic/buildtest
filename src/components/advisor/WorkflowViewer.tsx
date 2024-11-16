
// src/components/advisor/WorkflowViewer.tsx
import { useEffect, useState } from 'react';
import { database } from '../../lib/supabase';

export function WorkflowViewer({ workflowId }: { workflowId: string }) {
  const [responses, setResponses] = useState<any[]>([]);

  useEffect(() => {
    // Initial fetch
    database.getWorkflow(workflowId).then(data => {
      setResponses(data.responses || []);
    });

    // Subscribe to real-time updates
    const subscription = database.subscribeToWorkflow(
      workflowId,
      (payload) => {
        // Update responses when new data comes in
        setResponses(current => [...current, payload.new]);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [workflowId]);

  return (
    <div>
      {responses.map(response => (
        <div key={response.id}>
          {/* Render response data */}
        </div>
      ))}
    </div>
  );
}