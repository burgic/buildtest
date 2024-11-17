import React, { useState, useEffect } from 'react';
import { Upload, Save } from 'lucide-react';
import FormSection from '../components/FormSection';
import { useWorkflow } from '../context/WorkflowContext';

const ClientPortal: React.FC = () => {
  const { currentWorkflow, saveProgress } = useWorkflow();
  const [activeSection, setActiveSection] = useState('personal');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  
  const sections = [
    { id: 'personal', title: 'Personal Details' },
    { id: 'employment', title: 'Employment & Income' },
    { id: 'expenses', title: 'Monthly Expenses' },
    { id: 'assets', title: 'Assets & Liabilities' },
    { id: 'goals', title: 'Financial Goals' }
  ];


  const handleSectionChange = (sectionId: string) => {
    setActiveSection(sectionId);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {

  };

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    

    if (!currentWorkflow?.id) {
      console.error('No active workflow found');
      setSaveError('No active workflow available');
      return;
    }

    try {
      setSaving(true);
      setSaveError(null);

      const formElement = document.querySelector(`#${activeSection}-form`) as HTMLFormElement;
      if (!formElement) {
        throw new Error('Form element not found');
      }

      const formData = new FormData(formElement);
      const data = Object.fromEntries(formData.entries());
    

      await saveProgress(activeSection, data);
      
      // Show success message
      alert('Progress saved successfully!');
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Failed to save progress');
      alert('Failed to save progress. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Render functions remain the same...
  const renderPersonalDetails = () => (
    <form id="personal-form" className="grid grid-cols-2 gap-6">
      <FormSection 
        label="Full Name" 
        name="fullName"
        placeholder="John Doe" 
        onChange={handleInputChange}
      />
      <FormSection 
        label="Email" 
        name="email"
        type="email" 
        placeholder="john@example.com" 
        onChange={handleInputChange}
      />
      <FormSection 
        label="Phone" 
        name="phone"
        type="tel" 
        placeholder="+1 (555) 000-0000" 
        onChange={handleInputChange}
      />
      <FormSection 
        label="Address" 
        name="address"
        placeholder="123 Main St" 
        onChange={handleInputChange}
      />
    </form>
  );

  const renderEmployment = () => (
    <form id="employment-form" className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <FormSection 
          label="Employer" 
          name="employer"
          placeholder="Company Name" 
          onChange={handleInputChange}
        />
        <FormSection 
          label="Position" 
          name="position"
          placeholder="Job Title" 
          onChange={handleInputChange}
        />
        <FormSection 
          label="Annual Income" 
          name="annualIncome"
          type="number" 
          placeholder="75000" 
          onChange={handleInputChange}
        />
        <FormSection 
          label="Years Employed" 
          name="yearsEmployed"
          type="number" 
          placeholder="5" 
          onChange={handleInputChange}
        />
      </div>
    </form>
  );

  const renderExpenses = () => (
    <form id="expenses-form" className="grid grid-cols-2 gap-6">
      <FormSection label="Housing" name="housing" type="number" placeholder="2000" onChange={handleInputChange} />
      <FormSection label="Utilities" name="utilities" type="number" placeholder="200" onChange={handleInputChange} />
      <FormSection label="Transportation" name="transportation" type="number" placeholder="400" onChange={handleInputChange} />
      <FormSection label="Insurance" name="insurance" type="number" placeholder="300" onChange={handleInputChange} />
    </form>
  );

  const renderAssets = () => (
    <form id="assets-form" className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <FormSection label="Cash & Savings" name="cashSavings" type="number" placeholder="50000" onChange={handleInputChange} />
        <FormSection label="Investments" name="investments" type="number" placeholder="100000" onChange={handleInputChange} />
        <FormSection label="Property Value" name="propertyValue" type="number" placeholder="500000" onChange={handleInputChange} />
        <FormSection label="Vehicle Value" name="vehicleValue" type="number" placeholder="25000" onChange={handleInputChange} />
      </div>
    </form>
  );

  const renderGoals = () => (
    <form id="goals-form" className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <FormSection label="Target Retirement Age" name="retirementAge" type="number" placeholder="65" onChange={handleInputChange} />
        <FormSection label="Monthly Income Goal" name="monthlyIncomeGoal" type="number" placeholder="5000" onChange={handleInputChange} />
        <FormSection label="Goal Description" name="goalDescription" placeholder="Buy a vacation home" onChange={handleInputChange} />
        <FormSection label="Target Amount" name="targetAmount" type="number" placeholder="300000" onChange={handleInputChange} />
      </div>
    </form>
  );

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'personal':
        return renderPersonalDetails();
      case 'employment':
        return renderEmployment();
      case 'expenses':
        return renderExpenses();
      case 'assets':
        return renderAssets();
      case 'goals':
        return renderGoals();
      default:
        return null;
    }
  };

  if (!currentWorkflow) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-gray-600">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p>Loading workflow...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Financial Information Form</h2>
        
        <div className="flex space-x-4 mb-8 overflow-x-auto pb-2">
          {sections.map((section) => (
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

        <div className="space-y-6">
          {renderActiveSection()}

          <div className="flex justify-between pt-6 border-t">
            <button 
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              disabled={saving}
            >
              <Upload className="w-4 h-4" />
              <span>Upload Documents</span>
            </button>
            <button 
              onClick={handleSave}
              disabled={saving}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                saving 
                  ? 'bg-blue-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700'
              } text-white`}
            >
              {saving ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>{saving ? 'Saving...' : 'Save Progress'}</span>
            </button>
          </div>

          {saveError && (
            <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg">
              {saveError}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientPortal;
/*

import React, { useState } from 'react';
import { Upload, Save } from 'lucide-react';
import FormSection from '../components/FormSection';
import { AutosaveForm } from '../components/forms/AutosaveForm';
import { DocumentUpload } from '../components/client/DocumentUpload';
import { useWorkflow } from '../context/WorkflowContext';
import { WorkflowService } from '../services/WorkflowService';
import { AutosaveWorkflowForm } from '../components/forms/AutosaveWorkflowForm';


interface ClientPortalProps {
  workflowLinkId: string;
}

export const ClientPortal({ workflowLinkId }: ClientPortalProps) {
  const { currentWorkflow, setCurrentWorkflow, error } = useWorkflow();

  useEffect(() => {
    async function loadWorkflow() {
      try {
        const workflow = await WorkflowService.getWorkflowByLinkId(workflowLinkId);
        setCurrentWorkflow(workflow);
      } catch (err) {
        console.error('Error loading workflow:', err);
      }
    }

    loadWorkflow();
  }, [workflowLinkId, setCurrentWorkflow]);

  if (!currentWorkflow) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {currentWorkflow.sections.map((section) => (
        <div key={section.id} className="bg-white shadow rounded-lg p-6">
          <AutosaveWorkflowForm
            workflowId={currentWorkflow.id}
            section={section}
            initialData={section.data}
            onError={(error) => console.error('Form save error:', error)}
          />
        </div>
      ))}
    </div>
  );
}



interface Section {
  id: string;
  title: string;
  fields: Array<{
    name: string;
    label: string;
    type: string;
    placeholder?: string;
  }>;
}

const ClientPortal: React.FC = () => {
  const [activeSection, setActiveSection] = useState('personal');
  const { currentWorkflow, setCurrentWorkflow, error } = useWorkflow();

  const sections: Section[] = [
    {
      id: 'personal',
      title: 'Personal Details',
      fields: [
        { name: 'fullName', label: 'Full Name', type: 'text', placeholder: 'John Doe' },
        { name: 'email', label: 'Email', type: 'email', placeholder: 'john@example.com' },
        { name: 'phone', label: 'Phone', type: 'tel', placeholder: '+1 (555) 000-0000' },
        { name: 'address', label: 'Address', type: 'text', placeholder: '123 Main St' }
      ]
    },
    {
      id: 'employment',
      title: 'Employment & Income',
      fields: [
        { name: 'employer', label: 'Employer', type: 'text', placeholder: 'Company Name' },
        { name: 'position', label: 'Position', type: 'text', placeholder: 'Job Title' },
        { name: 'annualIncome', label: 'Annual Income', type: 'number', placeholder: '75000' },
        { name: 'yearsEmployed', label: 'Years Employed', type: 'number', placeholder: '5' }
      ]
    },
    // ... other sections defined similarly
  ];

  const renderSection = (section: Section) => (
    <AutosaveForm 
      sectionId={section.id}
      onSave={(data) => {
        console.log(`Saved ${section.id} data:`, data);
      }}
    >
      <div className="grid grid-cols-2 gap-6">
        {section.fields.map((field) => (
          <FormSection
            key={field.name}
            name={field.name}
            label={field.label}
            type={field.type}
            placeholder={field.placeholder}
          />
        ))}
      </div>
    </AutosaveForm>
  );

  const activeContent = sections.find(s => s.id === activeSection);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Financial Information Form</h2>
        
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

        <div className="space-y-6">
          {activeContent && renderSection(activeContent)}

          <div className="mt-8 border-t pt-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Supporting Documents</h3>
              <DocumentUpload
                workflowId="current-workflow-id"
                onUploadComplete={(doc) => {
                  console.log('Document uploaded:', doc);
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientPortal;

*/