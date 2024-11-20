// src/pages/FinancialProfile.tsx
import { useState } from 'react';
import { useWorkflow } from '../context/WorkflowContext';

export default function FinancialProfile() {
  const { currentWorkflow } = useWorkflow();
  const [activeSection, setActiveSection] = useState<string>('');

  // Debug logging
  console.log('Current Workflow:', currentWorkflow);

  if (!currentWorkflow?.sections) {
    return <div className="text-white">Loading workflow...</div>;
  }

  // Set initial active section if none selected
  if (!activeSection && currentWorkflow.sections.length > 0) {
    setActiveSection(currentWorkflow.sections[0].id);
  }

  const currentSection = currentWorkflow.sections.find(s => s.id === activeSection);
  console.log('Current Section:', currentSection);

  return (
    <div className="min-h-screen bg-[#111111] text-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Financial Profile</h1>

        {/* Section Tabs */}
        <div className="flex space-x-2 mb-6">
          {currentWorkflow.sections.map(section => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`px-4 py-2 rounded ${
                activeSection === section.id 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-800 text-gray-300'
              }`}
            >
              {section.title}
            </button>
          ))}
        </div>

        {/* Form Section */}
        {currentSection && (
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">{currentSection.title}</h2>
            <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
              {currentSection.fields.map(field => (
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
                    required={field.required}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              ))}
            </form>
          </div>
        )}

        {/* Debug Info */}
        <div className="mt-8 p-4 bg-gray-800 rounded">
          <h3 className="text-sm font-semibold mb-2">Debug Info:</h3>
          <pre className="text-xs">
            {JSON.stringify({ currentSection, activeSection }, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}