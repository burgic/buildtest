// src/pages/client/workflow/[id].tsx
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import ClientPortal from '../../../components/client/ClientPortal';
import { WorkflowService } from '../../../services/WorkflowService';
import { Loader } from 'lucide-react';

interface WorkflowData {
  id: string;
  title: string;
  sections: any[];
  status: string;
}

export default function WorkflowPage() {
  const router = useRouter();
  const { id } = router.query;
  const [workflow, setWorkflow] = useState<WorkflowData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadWorkflow() {
      if (!id) return;

      try {
        setLoading(true);
        // Verify the workflow link is valid
        const workflowData = await WorkflowService.getWorkflowByLinkId(id as string);
        setWorkflow(workflowData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load workflow');
        console.error('Error loading workflow:', err);
      } finally {
        setLoading(false);
      }
    }

    loadWorkflow();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader className="w-8 h-8 animate-spin text-blue-500" />
          <p className="text-gray-600">Loading workflow...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 text-red-800 rounded-lg p-6 max-w-md">
          <h2 className="text-lg font-semibold mb-2">Error</h2>
          <p>{error}</p>
          <button
            onClick={() => router.push('/')}
            className="mt-4 text-sm text-red-600 hover:text-red-800"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  if (!workflow) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-yellow-50 text-yellow-800 rounded-lg p-6 max-w-md">
          <h2 className="text-lg font-semibold mb-2">Workflow Not Found</h2>
          <p>The workflow you're looking for doesn't exist or has expired.</p>
          <button
            onClick={() => router.push('/')}
            className="mt-4 text-sm text-yellow-600 hover:text-yellow-800"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-gray-900">{workflow.title}</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Progress tracker */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">
                Status: {workflow.status}
              </span>
              <span className="text-sm text-gray-500">
                Last saved: {new Date().toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Client Portal Component */}
        <ClientPortal 
          workflowLinkId={id as string} 
          sections={workflow.sections}
          onSave={async (data) => {
            try {
              await WorkflowService.saveWorkflowResponse(id as string, data);
              // Show success message
            } catch (err) {
              // Show error message
              console.error('Error saving workflow:', err);
            }
          }}
        />
      </main>
    </div>
  );
}

// Optional: Add getServerSideProps for initial data loading
export async function getServerSideProps({ params, req }) {
  try {
    // Verify the workflow link and get initial data
    const workflowData = await WorkflowService.getWorkflowByLinkId(params.id);
    
    if (!workflowData) {
      return {
        notFound: true
      };
    }

    return {
      props: {
        initialData: workflowData
      }
    };
  } catch (error) {
    return {
      props: {
        error: 'Failed to load workflow'
      }
    };
  }
}