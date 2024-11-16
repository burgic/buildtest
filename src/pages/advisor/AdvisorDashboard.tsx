// src/pages/AdvisorDashboard.tsx
import React, { useEffect, useState } from 'react';
import { Send, UserCheck, Clock, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Workflow {
  id: string;
  title: string;
  status: string;
  client_email: string;
  last_update: string;
}

const AdvisorDashboard: React.FC = () => {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchWorkflows();
  }, []);

  const fetchWorkflows = async () => {
    try {
      const { data, error } = await supabase
        .from('workflows')
        .select(`
          id,
          title,
          status,
          workflow_links (
            client_email,
            status,
            created_at
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        setWorkflows(data);
      }
    } catch (err) {
      console.error('Error fetching workflows:', err);
      setError(err instanceof Error ? err.message : 'Error fetching workflows');
    } finally {
      setLoading(false);
    }
  };

  const createNewWorkflow = async () => {
    try {
      const { data, error } = await supabase
        .from('workflows')
        .insert({
          title: 'New Financial Review',
          status: 'draft',
          sections: [{
            id: 'personal',
            title: 'Personal Details',
            fields: [
              { id: 'name', type: 'text', label: 'Full Name', required: true },
              { id: 'email', type: 'email', label: 'Email', required: true }
            ]
          }]
        })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setWorkflows(prev => [data, ...prev]);
      }
    } catch (err) {
      console.error('Error creating workflow:', err);
      // Handle error (show notification, etc.)
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <UserCheck className="w-5 h-5 text-green-500" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'in_progress':
        return <AlertCircle className="w-5 h-5 text-blue-500" />;
      default:
        return null;
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Advisor Dashboard</h2>
        <button
          onClick={createNewWorkflow}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Send className="w-4 h-4" />
          <span>Create New Workflow</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Workflows</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Update
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {workflows.map((workflow) => (
                  <tr key={workflow.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {workflow.title}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(workflow.status)}
                        <span className="ml-2 text-sm text-gray-500">
                          {workflow.status.charAt(0).toUpperCase() + workflow.status.slice(1)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {new Date(workflow.last_update).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-blue-600 hover:text-blue-900">
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvisorDashboard;