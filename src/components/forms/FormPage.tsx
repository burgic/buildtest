import { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { useWorkflow } from '../../context/WorkflowContext';

const FORM_PAGES = {
  INCOME: 'income',
  EXPENSES: 'expenses',
  ASSETS: 'assets',
  HEALTH: 'health',
  GOALS: 'goals'
} as const;

type FormPage = typeof FORM_PAGES[keyof typeof FORM_PAGES];

interface FormData {
  [FORM_PAGES.INCOME]: {
    salary: string;
    otherIncome: string;
    frequency: 'annually' | 'monthly';
  };
  [FORM_PAGES.EXPENSES]: {
    housing: string;
    utilities: string;
    transport: string;
    food: string;
    insurance: string;
    entertainment: string;
  };
  [FORM_PAGES.ASSETS]: {
    property: string;
    savings: string;
    investments: string;
    pension: string;
    mortgages: string;
    loans: string;
    creditCards: string;
  };
  [FORM_PAGES.HEALTH]: {
    conditions: string;
    smoker: boolean;
    alcohol: string;
    exercise: string;
  };
  [FORM_PAGES.GOALS]: {
    shortTerm: string;
    mediumTerm: string;
    longTerm: string;
    retirementAge: string;
    riskTolerance: 'low' | 'medium' | 'high';
  };
}

export default function FinancialFormPages() {
  const { currentWorkflow, saveProgress, responses, loading: contextLoading } = useWorkflow();
  const [currentPage, setCurrentPage] = useState<FormPage>(FORM_PAGES.INCOME);
  const [formData, setFormData] = useState<FormData>({
    income: { salary: '', otherIncome: '', frequency: 'annually' },
    expenses: { housing: '', utilities: '', transport: '', food: '', insurance: '', entertainment: '' },
    assets: { property: '', savings: '', investments: '', pension: '', mortgages: '', loans: '', creditCards: '' },
    health: { conditions: '', smoker: false, alcohol: '', exercise: '' },
    goals: { shortTerm: '', mediumTerm: '', longTerm: '', retirementAge: '', riskTolerance: 'medium' }
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load existing responses when component mounts
  useEffect(() => {
    if (responses) {
      const updatedFormData = { ...formData };
      Object.keys(responses).forEach((sectionId) => {
        if (sectionId in FORM_PAGES) {
          updatedFormData[sectionId as FormPage] = responses[sectionId];
        }
      });
      setFormData(updatedFormData);
    }
  }, [responses]);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [currentPage]: {
        ...prev[currentPage],
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
      await saveProgress(currentPage, formData[currentPage]);
      
      // Move to next page
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
          if (currentWorkflow) {
            // You might want to update workflow status here
            alert('Financial profile completed!');
          }
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

  const renderIncomePage = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Income Information</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-200">Annual Salary</label>
          <input
            type="number"
            value={formData.income.salary}
            onChange={(e) => handleInputChange('salary', e.target.value)}
            className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
            placeholder="0"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-200">Other Income</label>
          <input
            type="number"
            value={formData.income.otherIncome}
            onChange={(e) => handleInputChange('otherIncome', e.target.value)}
            className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
            placeholder="0"
          />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-200">Income Frequency</label>
          <select
            value={formData.income.frequency}
            onChange={(e) => handleInputChange('frequency', e.target.value)}
            className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
          >
            <option value="annually">Annually</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderExpensesPage = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Monthly Expenses</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-200">Housing (Rent/Mortgage)</label>
          <input
            type="number"
            value={formData.expenses.housing}
            onChange={(e) => handleInputChange('housing', e.target.value)}
            className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
            placeholder="0"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-200">Utilities</label>
          <input
            type="number"
            value={formData.expenses.utilities}
            onChange={(e) => handleInputChange('utilities', e.target.value)}
            className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
            placeholder="0"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-200">Transportation</label>
          <input
            type="number"
            value={formData.expenses.transport}
            onChange={(e) => handleInputChange('transport', e.target.value)}
            className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
            placeholder="0"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-200">Food & Groceries</label>
          <input
            type="number"
            value={formData.expenses.food}
            onChange={(e) => handleInputChange('food', e.target.value)}
            className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
            placeholder="0"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-200">Insurance</label>
          <input
            type="number"
            value={formData.expenses.insurance}
            onChange={(e) => handleInputChange('insurance', e.target.value)}
            className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
            placeholder="0"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-200">Entertainment</label>
          <input
            type="number"
            value={formData.expenses.entertainment}
            onChange={(e) => handleInputChange('entertainment', e.target.value)}
            className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
            placeholder="0"
          />
        </div>
      </div>
    </div>
  );

  const renderAssetsPage = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Assets & Liabilities</h2>
      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-medium text-gray-300 mb-4">Assets</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-200">Property Value</label>
              <input
                type="number"
                value={formData.assets.property}
                onChange={(e) => handleInputChange('property', e.target.value)}
                className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-200">Savings</label>
              <input
                type="number"
                value={formData.assets.savings}
                onChange={(e) => handleInputChange('savings', e.target.value)}
                className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-200">Investments</label>
              <input
                type="number"
                value={formData.assets.investments}
                onChange={(e) => handleInputChange('investments', e.target.value)}
                className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-200">Pension</label>
              <input
                type="number"
                value={formData.assets.pension}
                onChange={(e) => handleInputChange('pension', e.target.value)}
                className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
                placeholder="0"
              />
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-300 mb-4">Liabilities</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-200">Mortgages</label>
              <input
                type="number"
                value={formData.assets.mortgages}
                onChange={(e) => handleInputChange('mortgages', e.target.value)}
                className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-200">Loans</label>
              <input
                type="number"
                value={formData.assets.loans}
                onChange={(e) => handleInputChange('loans', e.target.value)}
                className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-200">Credit Cards</label>
              <input
                type="number"
                value={formData.assets.creditCards}
                onChange={(e) => handleInputChange('creditCards', e.target.value)}
                className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
                placeholder="0"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );


  const renderHealthPage = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Health Information</h2>
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-200">Medical Conditions</label>
          <textarea
            value={formData.health.conditions}
            onChange={(e) => handleInputChange('conditions', e.target.value)}
            className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white h-24"
            placeholder="List any relevant medical conditions..."
          />
        </div>
        <div>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.health.smoker}
              onChange={(e) => handleInputChange('smoker', e.target.checked)}
              className="rounded bg-gray-700 border-gray-600 text-blue-600"
            />
            <span className="text-sm font-medium text-gray-200">Smoker</span>
          </label>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-200">Alcohol Consumption</label>
          <select
            value={formData.health.alcohol}
            onChange={(e) => handleInputChange('alcohol', e.target.value)}
            className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
          >
            <option value="">Select...</option>
            <option value="none">None</option>
            <option value="occasional">Occasional</option>
            <option value="moderate">Moderate</option>
            <option value="regular">Regular</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-200">Exercise Frequency</label>
          <select
            value={formData.health.exercise}
            onChange={(e) => handleInputChange('exercise', e.target.value)}
            className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
          >
            <option value="">Select...</option>
            <option value="none">None</option>
            <option value="occasional">Occasional</option>
            <option value="regular">Regular</option>
            <option value="frequent">Frequent</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderGoalsPage = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Financial Goals</h2>
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-200">Short Term Goals (1-2 years)</label>
          <textarea
            value={formData.goals.shortTerm}
            onChange={(e) => handleInputChange('shortTerm', e.target.value)}
            className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white h-24"
            placeholder="What are your short term financial goals?"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-200">Medium Term Goals (2-5 years)</label>
          <textarea
            value={formData.goals.mediumTerm}
            onChange={(e) => handleInputChange('mediumTerm', e.target.value)}
            className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white h-24"
            placeholder="What are your medium term financial goals?"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-200">Long Term Goals (5+ years)</label>
          <textarea
            value={formData.goals.longTerm}
            onChange={(e) => handleInputChange('longTerm', e.target.value)}
            className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white h-24"
            placeholder="What are your long term financial goals?"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-200">Target Retirement Age</label>
            <input
              type="number"
              value={formData.goals.retirementAge}
              onChange={(e) => handleInputChange('retirementAge', e.target.value)}
              className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
              min="45"
              max="100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-200">Risk Tolerance</label>
            <select
              value={formData.goals.riskTolerance}
              onChange={(e) => handleInputChange('riskTolerance', e.target.value)}
              className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
            >
              <option value="low">Low - Preserve Capital</option>
              <option value="medium">Medium - Balanced Growth</option>
              <option value="high">High - Maximum Growth</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCurrentPage = () => {
    switch (currentPage) {
      case FORM_PAGES.INCOME:
        return renderIncomePage();
      case FORM_PAGES.EXPENSES:
        return renderExpensesPage();
      case FORM_PAGES.ASSETS:
        return renderAssetsPage();
      case FORM_PAGES.HEALTH:
        return renderHealthPage();
      case FORM_PAGES.GOALS:
        return renderGoalsPage();
      default:
        return null;
    }

  }

  if (contextLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-gray-800 rounded-lg p-6">
          {/* Current page content */}
          <div className="space-y-6">
            {/* Income Page */}
            {currentPage === FORM_PAGES.INCOME && (
              <>
                <h2 className="text-xl font-semibold">Income Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                  {renderCurrentPage()}
                    <label className="block text-sm font-medium text-gray-200">Annual Salary</label>
                    <input
                      type="number"
                      value={formData.income.salary}
                      onChange={(e) => handleInputChange('salary', e.target.value)}
                      className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600"
                    />
                  </div>
                  {/* Add other income fields */}
                </div>
              </>
            )}

            {/* Add other page sections similarly */}
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-900/50 text-red-200 rounded-lg">
              {error}
            </div>
          )}

          {/* Navigation */}
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