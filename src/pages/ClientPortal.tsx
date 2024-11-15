import React, { useState } from 'react';
import { Upload, Save } from 'lucide-react';
import FormSection from '../components/FormSection';

const ClientPortal: React.FC = () => {
  const [activeSection, setActiveSection] = useState('personal');

  const sections = [
    { id: 'personal', title: 'Personal Details' },
    { id: 'employment', title: 'Employment & Income' },
    { id: 'expenses', title: 'Monthly Expenses' },
    { id: 'assets', title: 'Assets & Liabilities' },
    { id: 'goals', title: 'Financial Goals' },
  ];

  const renderPersonalDetails = () => (
    <div className="grid grid-cols-2 gap-6">
      <FormSection label="Full Name" placeholder="John Doe" />
      <FormSection label="Email" type="email" placeholder="john@example.com" />
      <FormSection label="Phone" type="tel" placeholder="+1 (555) 000-0000" />
      <FormSection label="Address" placeholder="123 Main St" />
    </div>
  );

  const renderEmployment = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <FormSection label="Employer" placeholder="Company Name" />
        <FormSection label="Position" placeholder="Job Title" />
        <FormSection label="Annual Income" type="number" placeholder="75000" />
        <FormSection label="Years Employed" type="number" placeholder="5" />
      </div>
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-800">Additional Income Sources</h3>
        <div className="grid grid-cols-2 gap-6">
          <FormSection label="Source" placeholder="Rental Income" />
          <FormSection label="Amount" type="number" placeholder="1000" />
        </div>
      </div>
    </div>
  );

  const renderExpenses = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <FormSection label="Housing" type="number" placeholder="2000" />
        <FormSection label="Utilities" type="number" placeholder="200" />
        <FormSection label="Transportation" type="number" placeholder="400" />
        <FormSection label="Insurance" type="number" placeholder="300" />
        <FormSection label="Food & Groceries" type="number" placeholder="600" />
        <FormSection label="Entertainment" type="number" placeholder="200" />
        <FormSection label="Healthcare" type="number" placeholder="300" />
        <FormSection label="Debt Payments" type="number" placeholder="500" />
      </div>
    </div>
  );

  const renderAssets = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-800">Assets</h3>
        <div className="grid grid-cols-2 gap-6">
          <FormSection label="Cash & Savings" type="number" placeholder="50000" />
          <FormSection label="Investments" type="number" placeholder="100000" />
          <FormSection label="Property Value" type="number" placeholder="500000" />
          <FormSection label="Vehicle Value" type="number" placeholder="25000" />
        </div>
      </div>
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-800">Liabilities</h3>
        <div className="grid grid-cols-2 gap-6">
          <FormSection label="Mortgage Balance" type="number" placeholder="400000" />
          <FormSection label="Car Loan" type="number" placeholder="20000" />
          <FormSection label="Credit Card Debt" type="number" placeholder="5000" />
          <FormSection label="Other Loans" type="number" placeholder="10000" />
        </div>
      </div>
    </div>
  );

  const renderGoals = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-800">Retirement Planning</h3>
        <div className="grid grid-cols-2 gap-6">
          <FormSection label="Target Retirement Age" type="number" placeholder="65" />
          <FormSection label="Desired Monthly Income" type="number" placeholder="5000" />
        </div>
      </div>
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-800">Other Goals</h3>
        <div className="grid grid-cols-2 gap-6">
          <FormSection label="Goal Description" placeholder="Buy a vacation home" />
          <FormSection label="Target Amount" type="number" placeholder="300000" />
          <FormSection label="Target Date" type="date" />
        </div>
      </div>
    </div>
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
          {renderActiveSection()}

          <div className="flex justify-between pt-6 border-t">
            <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
              <Upload className="w-4 h-4" />
              <span>Upload Documents</span>
            </button>
            <button className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              <Save className="w-4 h-4" />
              <span>Save Progress</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientPortal;