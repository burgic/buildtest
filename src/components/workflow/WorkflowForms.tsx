import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, CheckCircle2 } from 'lucide-react';
import { useWorkflow } from '../../context/WorkflowContext';
import { AutosaveForm } from '../forms/AutosaveForm';
import FormSection from '../forms/FormSection';
import type { WorkflowSection, FormField } from '../../types/workflow.types';

interface Section extends WorkflowSection {
  data?: Record<string, any>;
}

export function WorkflowForms() {
  const { currentWorkflow, saveProgress } = useWorkflow();
  const [activeSection, setActiveSection] = useState<string>('');
  const navigate = useNavigate();

  const handleSave = async (sectionId: string, data: Record<string, any>) => {
    try {
      await saveProgress(sectionId, data);
    } catch (error) {
      console.error('Error saving form:', error);
    }
  };

  if (!currentWorkflow?.sections) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#111111]">
        <div className="text-gray-400">No workflow sections available</div>
      </div>
    );
  }

  const sections: Section[] = currentWorkflow.sections;
  const currentSection = sections.find(s => s.id === activeSection) || sections[0];

  if (!currentSection && sections.length > 0) {
    setActiveSection(sections[0].id);
  }

  const handleSectionComplete = (sectionId: string) => {
    const currentIndex = sections.findIndex(s => s.id === sectionId);
    const nextSection = sections[currentIndex + 1];
    
    if (nextSection) {
      setActiveSection(nextSection.id);
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-[#111111] text-gray-100">
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-white mb-2">Complete Your Profile</h2>
          <p className="text-gray-400">
            Fill out the following sections to complete your financial profile
          </p>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Section Navigation */}
          <div className="col-span-3">
            <div className="space-y-1">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg text-sm font-medium
                    ${activeSection === section.id 
                      ? 'bg-[#1D1D1F] text-white' 
                      : 'text-gray-400 hover:bg-[#1D1D1F]'
                    }`}
                >
                  <span>{section.title}</span>
                  {section.data ? (
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Form Section */}
          <div className="col-span-9">
            <div className="bg-[#1D1D1F] rounded-xl p-6">
              {currentSection && (
                <>
                  <h3 className="text-lg font-medium text-white mb-6">
                    {currentSection.title}
                  </h3>
                  <AutosaveForm
                    sectionId={currentSection.id}
                    initialData={currentSection.data}
                    onSave={(data) => {
                      handleSave(currentSection.id, data);
                      handleSectionComplete(currentSection.id);
                    }}
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
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}