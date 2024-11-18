import { useState } from 'react';
import type { WorkflowSection, FormField } from '../../types/workflow.types';
import FormSection from '../forms/FormSection';

export interface ClientPortalProps {
  sections: WorkflowSection[];
  onSave: (sectionId: string, data: any) => Promise<void>;
}

export function ClientPortal({ sections, onSave }: ClientPortalProps) {
  const [activeSection, setActiveSection] = useState<string>(sections[0]?.id || '');
  const [formData, setFormData] = useState<Record<string, any>>({});

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const processedValue = type === 'number' ? (value ? Number(value) : '') : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }));
  };

  const currentSection = sections.find(s => s.id === activeSection) || sections[0];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-6">Client Information</h2>

        <div className="flex space-x-4 mb-8">
          {sections.map(section => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`px-4 py-2 rounded-lg ${
                activeSection === section.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {section.title}
            </button>
          ))}
        </div>

        <form 
          className="space-y-6"
          onSubmit={async (e) => {
            e.preventDefault();
            await onSave(currentSection.id, formData);
          }}
        >
          {currentSection.fields.map(field => (
            <FormSection
              key={field.id}
              name={field.id}
              label={field.label}
              type={field.type as 'text' | 'email' | 'tel' | 'number' | 'select' | 'date'}
              value={formData[field.id]}
              onChange={handleInputChange}
              required={field.required}
              options={field.options}
              validation={field.validation}
            />
          ))}

          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Save Progress
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}