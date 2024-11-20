import { useState, useEffect } from 'react';
import { useWorkflow } from '../context/WorkflowContext';
import { AlertCircle, CheckCircle, Wallet, CreditCard, DollarSign } from 'lucide-react';
import type { WorkflowSection } from '../types/workflow.types';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

interface SectionData {
  [key: string]: {
    data: {
      [key: string]: string;
    };
  };
}

type FormResponse = Database['public']['Tables']['form_responses']['Row'];

export default function ClientDashboard() {
  const { currentWorkflow } = useWorkflow();
  const [responses, setResponses] = useState<SectionData>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchResponses() {
      if (!currentWorkflow?.id) return;
      try {
        const { data, error } = await supabase
          .from('form_responses')
          .select('*')
          .eq('workflow_id', currentWorkflow.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Group responses by section_id
        const groupedResponses = (data || []).reduce((acc: SectionData, response: FormResponse) => {
          acc[response.section_id] = {
            data: response.data as { [key: string]: string }
          };
          return acc;
        }, {});

        setResponses(groupedResponses);
      } catch (error) {
        console.error('Error fetching responses:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchResponses();
  }, [currentWorkflow]);

  const calculateProgress = () => {
    if (!currentWorkflow?.sections) return 0;
    const completedSections = Object.keys(responses).length;
    return Math.round((completedSections / currentWorkflow.sections.length) * 100);
  };

  const getFinancialData = () => {
    const incomeData = responses?.employment?.data || {};
    const expenseData = responses?.expenses?.data || {};
    const assetData = responses?.assets?.data || {};

    const monthlyIncome = parseFloat(incomeData.annualIncome || '0') / 12;
    const monthlyExpenses = Object.values(expenseData).reduce((sum, val) => sum + (parseFloat(val as string) || 0), 0);
    const totalAssets = Object.values(assetData).reduce((sum, val) => sum + (parseFloat(val as string) || 0), 0);

    return {
      monthlyIncome,
      monthlyExpenses,
      totalAssets,
      monthlySavings: monthlyIncome - monthlyExpenses
    };
  };

  const { monthlyIncome, monthlyExpenses, totalAssets } = getFinancialData();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  const expenseBreakdown = [
    {
      name: 'Housing',
      value: parseFloat(responses?.expenses?.data?.housing || '0'),
      color: '#0088FE'
    },
    {
      name: 'Utilities', 
      value: parseFloat(responses?.expenses?.data?.utilities || '0'),
      color: '#00C49F'
    },
    {
      name: 'Transport',
      value: parseFloat(responses?.expenses?.data?.transportation || '0'),
      color: '#FFBB28'
    },
    {
      name: 'Insurance',
      value: parseFloat(responses?.expenses?.data?.insurance || '0'),
      color: '#FF8042'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Workflow Progress</h2>
        <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="absolute left-0 top-0 h-full bg-blue-500 transition-all duration-500"
            style={{ width: `${calculateProgress()}%` }}
          />
        </div>
        <div className="mt-2 text-sm text-gray-600">
          {calculateProgress()}% Complete
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Monthly Income</p>
              <p className="text-2xl font-bold">${monthlyIncome.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
            </div>
            <DollarSign className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Monthly Expenses</p>
              <p className="text-2xl font-bold">${monthlyExpenses.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
            </div>
            <CreditCard className="w-8 h-8 text-red-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Assets</p>
              <p className="text-2xl font-bold">${totalAssets.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
            </div>
            <Wallet className="w-8 h-8 text-blue-500" />
          </div>
        </div>
      </div>

      {/* Expense Breakdown */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Expense Breakdown</h3>
        <div className="grid grid-cols-2 gap-4">
          {expenseBreakdown.map((item) => (
            <div key={item.name} className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-sm text-gray-600">{item.name}</span>
              </div>
              <span className="text-sm font-medium">
                ${item.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Incomplete Sections */}
      {currentWorkflow?.sections && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Sections to Complete</h3>
          <div className="space-y-3">
            {currentWorkflow.sections.map((section: WorkflowSection) => {
              const isComplete = responses[section.id];
              return (
                <div key={section.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {isComplete ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-yellow-500" />
                    )}
                    <span className={`${isComplete ? 'text-gray-600' : 'text-gray-900'}`}>
                      {section.title}
                    </span>
                  </div>
                  {!isComplete && (
                    <button className="text-sm text-blue-600 hover:text-blue-800">
                      Complete Now
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
/*
import { useAuth } from '../context/AuthProvider';

export default function Dashboard() {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <button
              onClick={() => signOut()}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Sign Out
            </button>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="text-lg font-medium text-gray-900 mb-2">User Info</h2>
            <pre className="bg-white p-4 rounded overflow-auto">
              {JSON.stringify(user, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
  */