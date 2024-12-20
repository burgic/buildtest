import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { Database } from '../../lib/database.types';

type WorkflowResponse = Database['public']['Tables']['form_responses']['Row'];

interface WorkflowViewerProps {
  workflowId: string;
}

export function WorkflowViewer({ workflowId }: WorkflowViewerProps) {
  const [responses, setResponses] = useState<WorkflowResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResponses = async () => {
      try {
        const { data, error } = await supabase
          .from('form_responses')
          .select('*')
          .eq('workflow_id', workflowId)
          .order('created_at', { ascending: true });

        if (error) throw error;
        setResponses(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load responses');
      } finally {
        setLoading(false);
      }
    };

    fetchResponses();

    const subscription = supabase
      .channel(`workflow-${workflowId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'form_responses',
        filter: `workflow_id=eq.${workflowId}`
      }, (payload: any) => {
        if (payload.eventType === 'INSERT') {
          setResponses(current => [...current, payload.new as WorkflowResponse]);
        } else if (payload.eventType === 'UPDATE') {
          setResponses(current =>
            current.map(response =>
              response.id === payload.new.id ? payload.new as WorkflowResponse : response
            )
          );
        } else if (payload.eventType === 'DELETE') {
          setResponses(current =>
            current.filter(response => response.id !== payload.old.id)
          );
        }
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [workflowId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        Error: {error}
      </div>
    );
  }

  if (!responses.length) {
    return (
      <div className="text-center py-8 text-gray-500">
        No responses yet
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {responses.map(response => (
        <div 
          key={response.id} 
          className="bg-white shadow rounded-lg p-4"
        >
          <div className="flex justify-between items-start mb-2">
            <div>
              <span className="text-sm font-medium text-gray-900">
                Section: {response.section_id}
              </span>
              <span className="text-sm text-gray-500 ml-4">
                {new Date(response.created_at).toLocaleString()}
              </span>
            </div>
            <div className="text-sm text-gray-500">
              Last Updated: {new Date(response.updated_at).toLocaleString()}
            </div>
          </div>
          <div className="bg-gray-50 rounded p-3 text-sm">
            <pre className="whitespace-pre-wrap font-mono">
              {JSON.stringify(response.data, null, 2)}
            </pre>
          </div>
          <div className="mt-2 flex justify-end">
            <button 
              className="text-sm text-blue-600 hover:text-blue-800"
              onClick={() => {
                // Add functionality to handle response actions
                console.log('Response action:', response.id);
              }}
            >
              View Details
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}