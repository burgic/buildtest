import { useState, ChangeEvent } from 'react';
import type { WorkflowSection } from '../../types/workflow.types';
import FormSection from '../forms/FormSection';
import { Upload } from 'lucide-react';
import { AutosaveForm } from '../forms/AutosaveForm';


interface ClientPortalProps {
  workflowId: string;
  sections?: WorkflowSection[];
  onSave: (sectionId: string, data: any) => Promise<void>;
}

export function ClientPortal({ workflowId, sections = [], onSave }: ClientPortalProps) {
  const [activeSection, setActiveSection] = useState<string>(
    sections[0]?.id || ''
  );
  const [error, setError] = useState<string | null>(null);

  // Handle loading state
  if (!sections || sections.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading workflow sections...</p>
        </div>
      </div>
    );
  }

  const currentSection = sections.find(s => s.id === activeSection) || sections[0];

  const handleSave = async (sectionId: string, data: any) => {
    try {
      setError(null);
      await onSave(sectionId, data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save progress');
      throw err;
    }
  };

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

        {currentSection && (
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
}