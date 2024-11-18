import { useState } from 'react';
import { Upload } from 'lucide-react';
import type { WorkflowSection, FormField } from '../../types';
import { AutosaveForm } from '../forms/AutosaveForm';
import FormSection from '..components/forms/FormSection';

export interface ClientPortalProps {
  sections: WorkflowSection[];
  onSave: (sectionId: string, data: any) => Promise<void>;
}

export function ClientPortal({ sections, onSave }: ClientPortalProps) {
  const [activeSection, setActiveSection] = useState<string>(
    sections[0]?.id || ''
  );
  const [error, setError] = useState<string | null>(null);

  const handleSave = async (sectionId: string, data: any) => {
    try {
      setError(null);
      await onSave(sectionId, data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save progress');
      throw err;
    }
  };

  if (!sections.length) {
    return (
      <div className="text-center py-8 text-gray-500">
        No sections available
      </div>
    );
  }

  const currentSection = sections.find(s => s.id === activeSection) || sections[0];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Financial Information Form
        </h2>

        <div className="flex space-x-4 mb-8 overflow-x-auto pb-2">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                activeSection === section.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {section.title}
            </button>
          ))}
        </div>

        <AutosaveForm
          sectionId={currentSection.id}
          initialData={currentSection.data}
          onSave={(data) => handleSave(currentSection.id, data)}
        >
          <div className="grid grid-cols-2 gap-6">
            {currentSection.fields.map((field: FormField) => (
              <FormSection
                key={field.id}
                label={field.label}
                name={field.id}
                type={field.type}
                required={field.required}
                options={field.options}
                validation={field.validation}
              />
            ))}
          </div>
        </AutosaveForm>

        {error && (
          <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <div className="mt-6 border-t pt-6">
          <button 
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Supporting Documents</span>
          </button>
        </div>
      </div>
    </div>
  );
}
/*

import React, { useState } from 'react';
import { Upload, Save } from 'lucide-react';
import FormSection from '../components/FormSection';
import { AutosaveForm } from '../components/forms/AutosaveForm';
import { DocumentUpload } from '../components/client/DocumentUpload';
import { useWorkflow } from '../context/WorkflowContext';
import { WorkflowService } from '../services/WorkflowService';
import { AutosaveWorkflowForm } from '../components/forms/AutosaveWorkflowForm';


interface ClientPortalProps {
  workflowLinkId: string;
}

export const ClientPortal({ workflowLinkId }: ClientPortalProps) {
  const { currentWorkflow, setCurrentWorkflow, error } = useWorkflow();

  useEffect(() => {
    async function loadWorkflow() {
      try {
        const workflow = await WorkflowService.getWorkflowByLinkId(workflowLinkId);
        setCurrentWorkflow(workflow);
      } catch (err) {
        console.error('Error loading workflow:', err);
      }
    }

    loadWorkflow();
  }, [workflowLinkId, setCurrentWorkflow]);

  if (!currentWorkflow) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {currentWorkflow.sections.map((section) => (
        <div key={section.id} className="bg-white shadow rounded-lg p-6">
          <AutosaveWorkflowForm
            workflowId={currentWorkflow.id}
            section={section}
            initialData={section.data}
            onError={(error) => console.error('Form save error:', error)}
          />
        </div>
      ))}
    </div>
  );
}



interface Section {
  id: string;
  title: string;
  fields: Array<{
    name: string;
    label: string;
    type: string;
    placeholder?: string;
  }>;
}

const ClientPortal: React.FC = () => {
  const [activeSection, setActiveSection] = useState('personal');
  const { currentWorkflow, setCurrentWorkflow, error } = useWorkflow();

  const sections: Section[] = [
    {
      id: 'personal',
      title: 'Personal Details',
      fields: [
        { name: 'fullName', label: 'Full Name', type: 'text', placeholder: 'John Doe' },
        { name: 'email', label: 'Email', type: 'email', placeholder: 'john@example.com' },
        { name: 'phone', label: 'Phone', type: 'tel', placeholder: '+1 (555) 000-0000' },
        { name: 'address', label: 'Address', type: 'text', placeholder: '123 Main St' }
      ]
    },
    {
      id: 'employment',
      title: 'Employment & Income',
      fields: [
        { name: 'employer', label: 'Employer', type: 'text', placeholder: 'Company Name' },
        { name: 'position', label: 'Position', type: 'text', placeholder: 'Job Title' },
        { name: 'annualIncome', label: 'Annual Income', type: 'number', placeholder: '75000' },
        { name: 'yearsEmployed', label: 'Years Employed', type: 'number', placeholder: '5' }
      ]
    },
    // ... other sections defined similarly
  ];

  const renderSection = (section: Section) => (
    <AutosaveForm 
      sectionId={section.id}
      onSave={(data) => {
        console.log(`Saved ${section.id} data:`, data);
      }}
    >
      <div className="grid grid-cols-2 gap-6">
        {section.fields.map((field) => (
          <FormSection
            key={field.name}
            name={field.name}
            label={field.label}
            type={field.type}
            placeholder={field.placeholder}
          />
        ))}
      </div>
    </AutosaveForm>
  );

  const activeContent = sections.find(s => s.id === activeSection);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Financial Information Form</h2>
        
        <div className="flex space-x-4 mb-8 overflow-x-auto pb-2">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                activeSection === section.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {section.title}
            </button>
          ))}
        </div>

        <div className="space-y-6">
          {activeContent && renderSection(activeContent)}

          <div className="mt-8 border-t pt-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Supporting Documents</h3>
              <DocumentUpload
                workflowId="current-workflow-id"
                onUploadComplete={(doc) => {
                  console.log('Document uploaded:', doc);
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientPortal;

*/