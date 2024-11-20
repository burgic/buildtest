// src/pages/FinancialProfile.tsx
import { useState, useEffect } from 'react';
import { useWorkflow } from '../context/WorkflowContext';


export default function FinancialProfile() {
  const { currentWorkflow, loading, saveProgress: saveWorkflowProgress } = useWorkflow();
  const [activeSection, setActiveSection] = useState<string>('');
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);

  // Set initial active section when workflow loads
  useEffect(() => {
    if (currentWorkflow?.sections && currentWorkflow.sections.length > 0) {
        const firstSection = currentWorkflow.sections[0]; // Define firstSection
        setActiveSection(firstSection.id);
        setFormData(firstSection.data || {});
    }
  }, [currentWorkflow]);

    // Update form data when switching sections
    useEffect(() => {
        if (currentWorkflow?.sections) {
          const section = currentWorkflow.sections.find(s => s.id === activeSection);
          if (section) {
            setFormData(section.data || {});
          }
        }
      }, [activeSection, currentWorkflow]);
    
      // Handle input changes
      const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        const newValue = type === 'number' ? (value ? parseFloat(value) : '') : value;
        
        // Update local state
        const newFormData = {
          ...formData,
          [name]: newValue
        };
        setFormData(newFormData);
    
        // Save to backend
        try {
          setSaving(true);
          await saveWorkflowProgress(activeSection, newFormData);
          console.log('Saved form data:', newFormData);
        } catch (error) {
          console.error('Error saving form data:', error);
        } finally {
          setSaving(false);
        }
      };

  // Debug logging
  console.log('Current Workflow:', currentWorkflow);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#111111] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  // Show message if no workflow or sections
  if (!currentWorkflow?.sections?.length) {
    return (
      <div className="min-h-screen bg-[#111111] flex items-center justify-center text-white">
        <div className="text-center">
          <p>No sections available</p>
        </div>
      </div>
    );
  }

  const currentSection = activeSection 
    ? currentWorkflow.sections.find(s => s.id === activeSection)
    : currentWorkflow.sections[0];

  // Debug logging for current section
  console.log('Current section fields:', currentSection?.fields);

  return (
    <div className="min-h-screen bg-[#111111] text-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Financial Profile</h1>

        {/* Section Tabs */}
        <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
          {currentWorkflow.sections.map(section => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`px-4 py-2 rounded whitespace-nowrap ${
                (activeSection || currentWorkflow.sections[0].id) === section.id 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
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
          {!currentSection.fields ? (
            <div className="text-red-500">No fields defined for this section</div>
          ) : (
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
                    value={formData[field.id] || ''}
                    onChange={handleInputChange}
                    required={field.required}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              ))}
            </form>
          )}
        </div>
      )}

        {/* Debug Info */}
        <div className="mt-8 p-4 bg-gray-800 rounded">
          <h3 className="text-sm font-semibold mb-2">Debug Info:</h3>
          <pre className="text-xs text-gray-300">
            {JSON.stringify({
              workflowId: currentWorkflow?.id,
              sectionCount: currentWorkflow?.sections?.length,
              activeSection,
              currentSection,
              formData, 
              isSaving: saving
            }, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}