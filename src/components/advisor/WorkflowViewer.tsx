import React, { useEffect, useState } from 'react';
import { database } from '../../lib/supabase';

interface WorkflowViewerProps {
  workflowId: string;
}

interface Response {
  id: string;
  data: any;
  created_at: string;
}

export function WorkflowViewer({ workflowId }: WorkflowViewerProps) {
  const [responses, setResponses] = useState<Response[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Initial fetch
    const fetchWorkflow = async () => {
      try {
        const data = await database.getWorkflow(workflowId);
        setResponses(data.responses || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load workflow');
      } finally {
        setLoading(false);
      }
    };

    fetchWorkflow();

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

  if (loading) {
    return <div className="py-4">Loading...</div>;
  }

  if (error) {
    return (
      <div className="py-4 text-red-600">
        Error: {error}
      </div>
    );
  }

  if (!responses.length) {
    return (
      <div className="py-4 text-gray-500">
        No responses yet
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {responses.map(response => (
        <div 
          key={response.id} 
          className="bg-white p-4 rounded-lg shadow"
        >
          <div className="text-sm text-gray-500">
            {new Date(response.created_at).toLocaleString()}
          </div>
          <pre className="mt-2 whitespace-pre-wrap">
            {JSON.stringify(response.data, null, 2)}
          </pre>
        </div>
      ))}
    </div>
  );
}