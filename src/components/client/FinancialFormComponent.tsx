import { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { useWorkflow } from '../../context/WorkflowContext';
import type { SectionData  } from '../../types/finacialform.types';
import { FinancialFormService } from '../../services/FinancialForm';

const FORM_PAGES = {
  INCOME: 'income',
  EXPENSES: 'expenses',
  ASSETS: 'assets',
  HEALTH: 'health',
  GOALS: 'goals'
} as const;

type FormPage = typeof FORM_PAGES[keyof typeof FORM_PAGES];

const initialFormData: SectionData = {
  income: { salary: '', otherIncome: '', frequency: 'annually' },
  expenses: {
    housing: '',
    utilities: '',
    transport: '',
    food: '',
    insurance: '',
    entertainment: ''
  },
  assets: {
    property: '',
    savings: '',
    investments: '',
    pension: '',
    mortgages: '',
    loans: '',
    creditCards: ''
  },
  health: {
    conditions: '',
    smoker: false,
    alcohol: '',
    exercise: ''
  },
  goals: {
    shortTerm: '',
    mediumTerm: '',
    longTerm: '',
    retirementAge: '',
    riskTolerance: 'medium'
  }
};

export default function FinancialForm() {
  const { currentWorkflow } = useWorkflow();
  const [currentPage, setCurrentPage] = useState<FormPage>(FORM_PAGES.INCOME);
  const [formData, setFormData] = useState<SectionData>(initialFormData);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load existing responses
  useEffect(() => {
    async function loadResponses() {
      if (!currentWorkflow?.id) return;
      
      try {
        const responses = await FinancialFormService.getResponses(currentWorkflow.id);
        if (responses) {
          setFormData(prev => ({
            ...prev,
            ...responses
          }));
        }
      } catch (err) {
        console.error('Error loading responses:', err);
      }
    }

    loadResponses();
  }, [currentWorkflow?.id]);

  const handleInputChange = (section: FormPage, field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleNext = async () => {
    if (!currentWorkflow?.id) {
      setError('No active workflow found');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      // Save current section
      await FinancialFormService.saveSection(
        currentWorkflow.id,
        currentPage,
        formData[currentPage]
      );

      // Move to next section
      switch (currentPage) {
        case FORM_PAGES.INCOME:
          setCurrentPage(FORM_PAGES.EXPENSES);
          break;
        case FORM_PAGES.EXPENSES:
          setCurrentPage(FORM_PAGES.ASSETS);
          break;
        case FORM_PAGES.ASSETS:
          setCurrentPage(FORM_PAGES.HEALTH);
          break;
        case FORM_PAGES.HEALTH:
          setCurrentPage(FORM_PAGES.GOALS);
          break;
        case FORM_PAGES.GOALS:
          // Handle completion
          alert('Financial profile completed!');
          break;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save progress');
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    switch (currentPage) {
      case FORM_PAGES.EXPENSES:
        setCurrentPage(FORM_PAGES.INCOME);
        break;
      case FORM_PAGES.ASSETS:
        setCurrentPage(FORM_PAGES.EXPENSES);
        break;
      case FORM_PAGES.HEALTH:
        setCurrentPage(FORM_PAGES.ASSETS);
        break;
      case FORM_PAGES.GOALS:
        setCurrentPage(FORM_PAGES.HEALTH);
        break;
    }
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case FORM_PAGES.INCOME:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Income Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-200">Annual Salary</label>
                <input
                  type="number"
                  value={formData.income.salary}
                  onChange={(e) => handleInputChange('income', 'salary', e.target.value)}
                  className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-200">Other Income</label>
                <input
                  type="number"
                  value={formData.income.otherIncome}
                  onChange={(e) => handleInputChange('income', 'otherIncome', e.target.value)}
                  className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
                  placeholder="0"
                />
              </div>
            </div>
          </div>
        );

      case FORM_PAGES.EXPENSES:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Monthly Expenses</h2>
            <div className="grid grid-cols-2 gap-6">
              {Object.entries({
                housing: 'Housing (Rent/Mortgage)',
                utilities: 'Utilities',
                transport: 'Transportation',
                food: 'Food & Groceries',
                insurance: 'Insurance',
                entertainment: 'Entertainment'
              }).map(([key, label]) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-200">{label}</label>
                  <input
                    type="number"
                    value={formData.expenses[key as keyof typeof formData.expenses]}
                    onChange={(e) => handleInputChange('expenses', key, e.target.value)}
                    className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
                    placeholder="0"
                  />
                </div>
              ))}
            </div>
          </div>
        );

        case FORM_PAGES.ASSETS:
            return (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold">Monthly Expenses</h2>
                <div className="grid grid-cols-2 gap-6">
                  {Object.entries({
                    
                    property: 'Property Value',
                    savings: 'Savings',
                    investments: 'Investments',
                    pension: 'Pensions',
                    mortgages: 'Mortgages',
                    loans: 'Loans',
                    creditCards: 'Credit Cards'
                
                  }).map(([key, label]) => (
                    <div key={key}>
                      <label className="block text-sm font-medium text-gray-200">{label}</label>
                      <input
                        type="number"
                        value={formData.assets[key as keyof typeof formData.assets]}
                        onChange={(e) => handleInputChange('expenses', key, e.target.value)}
                        className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
                        placeholder="0"
                      />
                    </div>
                  ))}
                </div>
              </div>
            );

      // Similar pattern for other pages...
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-gray-800 rounded-lg p-6">
          {renderCurrentPage()}
          
          {error && (
            <div className="mt-4 p-3 bg-red-900/50 text-red-200 rounded-lg">
              {error}
            </div>
          )}

          <div className="mt-8 flex justify-between">
            {currentPage !== FORM_PAGES.INCOME && (
              <button
                onClick={handleBack}
                disabled={saving}
                className="flex items-center px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 disabled:opacity-50"
              >
                <ChevronLeft className="w-5 h-5 mr-2" />
                Back
              </button>
            )}
            <button
              onClick={handleNext}
              disabled={saving}
              className="flex items-center px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 ml-auto disabled:opacity-50"
            >
              {saving ? 'Saving...' : currentPage === FORM_PAGES.GOALS ? 'Complete' : 'Next'}
              {!saving && currentPage !== FORM_PAGES.GOALS && <ChevronRight className="w-5 h-5 ml-2" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}