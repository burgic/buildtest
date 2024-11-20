import { useState } from 'react';
import type { WorkflowSection } from '../../types/workflow.types';

interface ClientPortalProps {
  sections: WorkflowSection[];
  onSave: (sectionId: string, data: Record<string, any>) => Promise<void>;
}

function ClientPortal({ sections, onSave }: ClientPortalProps) {
  const [activeSection, setActiveSection] = useState(sections[0]?.id || '');

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
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap
                ${activeSection === section.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
            >
              {section.title}
            </button>
          ))}
        </div>

        {/* Display active section content */}
        {sections
          .filter((section) => section.id === activeSection)
          .map((section) => (
            <div key={section.id} className="space-y-4">
              <h3 className="text-lg font-medium">{section.title}</h3>
              {section.fields.map((field) => (
                <div key={field.id} className="form-field">
                  {/* Implement your form fields here */}
                </div>
              ))}
              <button
                onClick={() => onSave(section.id, { example: "data" })}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                Save Section
              </button>
            </div>
          ))}
      </div>
    </div>
  );
}

export default ClientPortal;

/*
import React, { useState, useEffect } from 'react';
import { Upload } from 'lucide-react';
import { useWorkflow } from '../../context/WorkflowContext';
import { AutosaveForm } from '../forms/AutosaveForm';
import FormSection from '../forms/FormSection';
import type { WorkflowSection } from '../../types/workflow.types';

interface ClientPortalProps {
  workflowId?: string;
  sections?: WorkflowSection[];
  onSave?: (sectionId: string, data: Record<string, any>) => Promise<void>;
}

const ClientPortal: React.FC<ClientPortalProps> = () => {
  const { currentWorkflow, saveProgress } = useWorkflow();
  const [activeSection, setActiveSection] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Set initial active section when workflow loads
  useEffect(() => {
    if (currentWorkflow?.sections && currentWorkflow.sections.length > 0 && !activeSection) {
      const firstSectionId = currentWorkflow.sections[0].id;
      console.log('Setting initial active section:', firstSectionId);
      setActiveSection(firstSectionId);
    }
  }, [currentWorkflow, activeSection]);

  if (!currentWorkflow || !currentWorkflow.sections) {
    console.log('No workflow data available');
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading workflow...</p>
        </div>
      </div>
    );
  }

  const currentSection = currentWorkflow.sections.find(s => s.id === activeSection);

  const handleSectionChange = (sectionId: string) => {
    console.log('Changing to section:', sectionId);
    setActiveSection(sectionId);
  };

  const handleSave = async (sectionId: string, data: Record<string, any>) => {
    console.log('Attempting to save section:', sectionId, 'with data:', data);
    try {
      setError(null);
      await saveProgress(sectionId, data);
      console.log('Save successful');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save progress';
      console.error('Save error:', errorMessage);
      setError(errorMessage);
      throw err;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Financial Information Form
        </h2>

        
        <div className="flex space-x-4 mb-8 overflow-x-auto pb-2">
          {currentWorkflow.sections.map((section) => (
            <button
              key={section.id}
              onClick={() => handleSectionChange(section.id)}
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

        
        {currentSection && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {currentSection.title}
            </h3>
            <AutosaveForm
              sectionId={currentSection.id}
              initialData={currentSection.data}
              onSave={(data) => handleSave(currentSection.id, data)}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {currentSection.fields?.map((field) => (
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
          </div>
        )}

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
};

export default ClientPortal;

*/