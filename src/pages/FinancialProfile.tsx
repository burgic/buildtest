// src/pages/FinancialProfile.tsx
import React, { useState, useEffect } from 'react';
import { useWorkflow } from '../context/WorkflowContext';
import type { WorkflowSection, FormField } from '../types/workflow.types';

interface FormData {
  [key: string]: Record<string, any>;
}

export default function FinancialProfile() {
  const { currentWorkflow, loading, saveProgress } = useWorkflow();
  const [activeSection, setActiveSection] = useState<string>('');
  const [formData, setFormData] = useState<FormData>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (currentWorkflow?.sections && currentWorkflow.sections.length > 0) {
      const initialData = currentWorkflow.sections.reduce<FormData>((acc, section: WorkflowSection) => ({
        ...acc,
        [section.id]: section.data || {}
      }), {});
      setFormData(initialData);
      setActiveSection(currentWorkflow.sections[0].id);
    }
  }, [currentWorkflow]);

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    const newValue = type === 'number' ? (value ? parseFloat(value) : '') : value;
    
    setFormData(prev => ({
      ...prev,
      [activeSection]: {
        ...(prev[activeSection] || {}),
        [name]: newValue
      }
    }));

    try {
      setSaving(true);
      await saveProgress(activeSection, {
        ...(formData[activeSection] || {}),
        [name]: newValue
      });
    } catch (error) {
      console.error('Error saving form data:', error);
    } finally {
      setSaving(false);
    }
  };

  const currentSection = currentWorkflow?.sections.find((s: WorkflowSection) => s.id === activeSection);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#111111] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#111111] text-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Financial Profile</h1>

        <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
          {currentWorkflow?.sections.map((section: WorkflowSection) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`px-4 py-2 rounded whitespace-nowrap ${
                activeSection === section.id 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {section.title}
            </button>
          ))}
        </div>

        {currentSection && (
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">{currentSection.title}</h2>
            <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
              {currentSection.fields.map((field: FormField) => (
                <div key={field.id} className="space-y-1">
                  <label 
                    htmlFor={field.id}
                    className="block text-sm font-medium text-gray-300"
                  >
                    {field.label}
                    {field.required && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </label>
                  <input
                    type={field.type}
                    id={field.id}
                    name={field.id}
                    value={formData[activeSection]?.[field.id] || ''}
                    onChange={handleInputChange}
                    required={field.required}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-2 text-white"
                  />
                </div>
              ))}
            </form>
          </div>
        )}

        {saving && (
          <div className="mt-4 text-sm text-gray-400">
            Saving changes...
          </div>
        )}
      </div>
    </div>
  );
}