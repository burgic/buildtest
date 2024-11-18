import React, { useState, useEffect } from 'react';
import { Upload, Save } from 'lucide-react';
import FormSection from '../components/forms/FormSection';
import { useWorkflow } from '../context/WorkflowContext';

const ClientPortal: React.FC = () => {
  const { currentWorkflow, saveProgress } = useWorkflow();
  const [activeSection, setActiveSection] = useState('personal');
  const [formData, setFormData] = useState<{ [key: string]: any }>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Load existing data when section changes
  useEffect(() => {
    if (currentWorkflow?.sections) {
      const section = currentWorkflow.sections.find((s: any) => s.id === activeSection);
      if (section?.data) {
        console.log('Loading existing section data:', section.data);
        setFormData(section.data);
      } else {
        setFormData({});
      }
    }
  }, [activeSection, currentWorkflow]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    const newValue = type === 'number' ? (value ? parseFloat(value) : '') : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));

    console.log('Form data updated:', {
      field: name,
      value: newValue,
      allData: {
        ...formData,
        [name]: newValue
      }
    });
  };

  const handleSave = async () => {
    console.log('Save initiated for section:', activeSection);
    console.log('Data to save:', formData);

    if (!Object.keys(formData).length) {
      console.log('No data to save');
      return;
    }

    try {
      setSaving(true);
      setSaveError(null);

      await saveProgress(activeSection, formData);
      console.log('Save successful');
      
      // Show success message
      alert('Progress saved successfully!');
    } catch (error) {
      console.error('Error saving form:', error);
      setSaveError(error instanceof Error ? error.message : 'Failed to save progress');
      alert('Failed to save progress. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const renderFormField = (label: string, name: string, type: string = 'text', placeholder: string = '') => (
    <FormSection
      label={label}
      name={name}
      type={type}
      placeholder={placeholder}
      value={formData[name] || ''}
      onChange={handleInputChange}
    />
  );

  const renderPersonalDetails = () => (
    <form id="personal-form" className="grid grid-cols-2 gap-6">
      {renderFormField('Full Name', 'fullName', 'text', 'John Doe')}
      {renderFormField('Email', 'email', 'email', 'john@example.com')}
      {renderFormField('Phone', 'phone', 'tel', '+1 (555) 000-0000')}
      {renderFormField('Address', 'address', 'text', '123 Main St')}
    </form>
  );

  const renderEmployment = () => (
    <form id="employment-form" className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        {renderFormField('Employer', 'employer', 'text', 'Company Name')}
        {renderFormField('Position', 'position', 'text', 'Job Title')}
        {renderFormField('Annual Income', 'annualIncome', 'number', '75000')}
        {renderFormField('Years Employed', 'yearsEmployed', 'number', '5')}
      </div>
    </form>
  );

  const renderExpenses = () => (
    <form id="expenses-form" className="grid grid-cols-2 gap-6">
      {renderFormField('Housing', 'housing', 'number', '2000')}
      {renderFormField('Utilities', 'utilities', 'number', '200')}
      {renderFormField('Transportation', 'transportation', 'number', '400')}
      {renderFormField('Insurance', 'insurance', 'number', '300')}
    </form>
  );

  const renderAssets = () => (
    <form id="assets-form" className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        {renderFormField('Cash & Savings', 'cashSavings', 'number', '50000')}
        {renderFormField('Investments', 'investments', 'number', '100000')}
        {renderFormField('Property Value', 'propertyValue', 'number', '500000')}
        {renderFormField('Vehicle Value', 'vehicleValue', 'number', '25000')}
      </div>
    </form>
  );

  const renderGoals = () => (
    <form id="goals-form" className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        {renderFormField('Target Retirement Age', 'retirementAge', 'number', '65')}
        {renderFormField('Monthly Income Goal', 'monthlyIncomeGoal', 'number', '5000')}
        {renderFormField('Goal Description', 'goalDescription', 'text', 'Buy a vacation home')}
        {renderFormField('Target Amount', 'targetAmount', 'number', '300000')}
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

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Financial Information Form</h2>
        
        <div className="flex space-x-4 mb-8 overflow-x-auto pb-2">
          {currentWorkflow?.sections?.map((section: any) => (
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