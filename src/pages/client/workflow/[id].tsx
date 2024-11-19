import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ClientPortal from '../../../components/client/ClientPortal';
import { WorkflowService } from '../../../services/WorkflowService';
import type { WorkflowSection, Workflow } from '../../../types';

interface WorkflowData extends Omit<Workflow, 'sections'> {
  sections: WorkflowSection[];
}

const WorkflowPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [workflow, setWorkflow] = useState<WorkflowData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadWorkflow() {
      if (!id) {
        setError('No workflow ID provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const workflowData = await WorkflowService.getWorkflow(id);
        
        // Ensure sections have all required properties
        const processedWorkflow = {
          ...workflowData,
          sections: workflowData.sections?.map(section => ({
            ...section,
            fields: section.fields || [],
            data: section.data || {}
          })) || []
        };
        
        setWorkflow(processedWorkflow as WorkflowData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load workflow');
        console.error('Error loading workflow:', err);
      } finally {
        setLoading(false);
      }
    }

    loadWorkflow();
  }, [id]);


  const handleSave = async (sectionId: string, data: Record<string, any>) => {
    if (!workflow?.id) return;
    
    try {
      await WorkflowService.saveFormResponse(workflow.id, sectionId, data);
    } catch (err) {
      console.error('Error saving form:', err);
      throw err;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent" />
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
            onClick={() => navigate('/')}
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
            onClick={() => navigate('/')}
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
        <ClientPortal 
          sections={workflow.sections}
          onSave={handleSave}
        />
      </main>
    </div>
  );
}

export default WorkflowPage