import { useState } from 'react';
import { Upload } from 'lucide-react';
import type { WorkflowSection } from '../../types';
import { AutosaveForm } from '../forms/AutosaveForm';
import FormSection from '../common/FormSection';

export interface ClientPortalProps {
  workflowId: string;
  sections: WorkflowSection[];
  onSave: (sectionId: string, data: any) => Promise<void>;
}

export function ClientPortal({ workflowId, sections, onSave }: ClientPortalProps) {
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
            {currentSection.fields.map((field) => (
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