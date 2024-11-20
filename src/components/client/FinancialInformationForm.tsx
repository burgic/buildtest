import React, { useState } from 'react';
import { Upload } from 'lucide-react';
import type { WorkflowSection, FormField } from '../../types/workflow.types';

export interface FinancialFormProps {
  sections: WorkflowSection[];
  onSave?: (sectionId: string, data: Record<string, any>) => Promise<void>;
}

function FinancialInformationForm({ sections, onSave }: FinancialFormProps) {
    const [activeSection, setActiveSection] = useState(sections[0]?.id || '');
    const [formData, setFormData] = useState<Record<string, any>>({});
    const [saving, setSaving] = useState(false);
    
  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const newValue = type === 'number' ? parseFloat(value) : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));

    if (onSave && activeSection) {
      setSaving(true);
      try {
        await onSave(activeSection, {
          ...formData,
          [name]: newValue
        });
      } catch (error) {
        console.error('Error saving form:', error);
      } finally {
        setSaving(false);
      }
    }
  };

  const currentSection = sections.find(s => s.id === activeSection);

  const renderField = (field: FormField) => {
    const baseClassName = "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm";

    if (field.type === 'select' && field.options) {
      return (
        <select
          id={field.id}
          name={field.id}
          value={formData[field.id] || ''}
          onChange={handleInputChange}
          className={baseClassName}
          required={field.required}
        >
          <option value="">Select...</option>
          {field.options.map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      );
    }

    return (
      <input
        type={field.type}
        id={field.id}
        name={field.id}
        value={formData[field.id] || ''}
        onChange={handleInputChange}
        className={baseClassName}
        required={field.required}
      />
    );
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Financial Information Form
      </h2>

      {/* Section Navigation */}
      <div className="flex space-x-4 mb-8 overflow-x-auto pb-2">
        {sections.map(section => (
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

      {/* Form Fields */}
      {currentSection && (
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {currentSection.title}
          </h3>
          
          <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {currentSection.fields.map(field => (
              <div key={field.id}>
                <label
                  htmlFor={field.id}
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                {renderField(field)}
              </div>
            ))}
          </form>
        </div>
      )}

      {/* Document Upload Section */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
          <Upload className="w-4 h-4" />
          <span>Upload Supporting Documents</span>
        </button>
      </div>

      {/* Save Status */}
      {saving && (
        <div className="mt-4 text-sm text-gray-500">
          Saving changes...
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="mt-6 flex justify-between">
        <button
          onClick={() => {
            const currentIndex = sections.findIndex(s => s.id === activeSection);
            if (currentIndex > 0) {
              setActiveSection(sections[currentIndex - 1].id);
            }
          }}
          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          disabled={activeSection === sections[0].id}
        >
          Previous
        </button>
        
        <button
          onClick={() => {
            const currentIndex = sections.findIndex(s => s.id === activeSection);
            if (currentIndex < sections.length - 1) {
              setActiveSection(sections[currentIndex + 1].id);
            }
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          disabled={activeSection === sections[sections.length - 1].id}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default FinancialInformationForm;