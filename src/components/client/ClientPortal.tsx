import React, { useState, useEffect } from 'react';
import { 
  Upload,
  ChevronRight,
  CheckCircle,
  AlertCircle 
} from 'lucide-react';
import { useWorkflow } from '../../context/WorkflowContext';
import { AutosaveForm } from '../forms/AutosaveForm';
import FormSection from '../forms/FormSection';
import type { WorkflowSection } from '../../types/workflow.types';

interface ClientPortalProps {
  sections?: WorkflowSection[];
  onSave?: (sectionId: string, data: Record<string, any>) => Promise<void>;
}

const ClientPortal: React.FC<ClientPortalProps> = ({ 
  sections = [], 
  onSave 
}) => {
  const { currentWorkflow, saveProgress } = useWorkflow();
  const [activeSection, setActiveSection] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [savingStates, setSavingStates] = useState<Record<string, boolean>>({});

  // Use either provided sections or sections from workflow context
  const workflowSections = sections.length > 0 
    ? sections 
    : currentWorkflow?.sections || [];

  useEffect(() => {
    if (workflowSections.length > 0 && !activeSection) {
      setActiveSection(workflowSections[0].id);
    }
  }, [workflowSections, activeSection]);

  const currentSection = workflowSections.find(s => s.id === activeSection);

  const handleSectionChange = (sectionId: string) => {
    setActiveSection(sectionId);
  };

  const handleSave = async (sectionId: string, data: Record<string, any>) => {
    try {
      setError(null);
      setSavingStates(prev => ({ ...prev, [sectionId]: true }));
      
      if (onSave) {
        await onSave(sectionId, data);
      } else if (saveProgress) {
        await saveProgress(sectionId, data);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save progress';
      setError(errorMessage);
      throw err;
    } finally {
      setSavingStates(prev => ({ ...prev, [sectionId]: false }));
    }
  };

  if (workflowSections.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#111111]">
        <div className="text-center">
          <p className="text-gray-400">No workflow sections available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#111111] text-gray-100">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-white mb-2">
            Financial Information
          </h2>
          <p className="text-gray-400">
            Complete all sections to proceed with your financial assessment
          </p>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Section Navigation */}
          <div className="col-span-3">
            <div className="space-y-1">
              {workflowSections.map((section) => {
                const isComplete = section.data && Object.keys(section.data).length > 0;
                const isActive = activeSection === section.id;

                return (
                  <button
                    key={section.id}
                    onClick={() => handleSectionChange(section.id)}
                    className={`w-full group flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all
                      ${isActive 
                        ? 'bg-[#1D1D1F] text-white' 
                        : 'text-gray-400 hover:bg-[#1D1D1F] hover:text-white'
                      }`}
                  >
                    <div className="flex items-center space-x-3">
                      {isComplete ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <div className={`w-4 h-4 rounded-full border ${isActive ? 'border-white' : 'border-gray-600'}`} />
                      )}
                      <span>{section.title}</span>
                    </div>
                    <ChevronRight className={`w-4 h-4 transition-transform ${isActive ? 'rotate-90' : 'rotate-0'}`} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form Section */}
          <div className="col-span-9">
            <div className="bg-[#1D1D1F] rounded-xl p-6">
              {currentSection && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-medium text-white">
                      {currentSection.title}
                    </h3>
                    {savingStates[currentSection.id] && (
                      <span className="text-sm text-gray-400">Saving...</span>
                    )}
                  </div>
                  
                  <AutosaveForm
                    sectionId={currentSection.id}
                    initialData={currentSection.data}
                    onSave={(data) => handleSave(currentSection.id, data)}
                  >
                    <div className="grid grid-cols-2 gap-6">
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
                <div className="mt-4 p-3 bg-red-900/50 text-red-200 rounded-lg flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>{error}</span>
                </div>
              )}

              {/* Document Upload */}
              <div className="mt-8 pt-6 border-t border-gray-800">
                <button 
                  className="flex items-center space-x-2 px-4 py-2 bg-[#2D2D2F] rounded-lg text-gray-300 hover:bg-[#3D3D3F] transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload Supporting Documents</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

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