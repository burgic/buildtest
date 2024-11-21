import { useState, useEffect } from 'react';
import { useWorkflow } from '../context/WorkflowContext';
import { 
  TrendingUp, 
  TrendingDown, 
  Circle, 
  Wallet, 
  CreditCard, 
  DollarSign,
  FileText,
  CheckCircle2,
  ChevronRight,
  Clock
} from 'lucide-react';

import { supabase } from '../lib/supabase';
// import type { Database } from '../lib/database.types';
import type { WorkflowSection } from '../types/workflow.types'
// import { useAuth } from '@/context';
import { useNavigate } from 'react-router-dom';

interface SectionData {
  [key: string]: {
    data: {
      [key: string]: string;
    };
  };
}

// type FormResponse = Database['public']['Tables']['form_responses']['Row'];

export default function Dashboard() {
  const [responses, setResponses] = useState<SectionData>({});
  const [loading, setLoading] = useState(true);
  const { currentWorkflow } = useWorkflow();
  // const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchResponses() {
      if (!currentWorkflow?.id) return;
      
      try {
        // First get the workflow link
        const { error: linkError } = await supabase
          .from('form_responses')
          .select('id')
          .eq('workflow_id', currentWorkflow.id)
          .order('created_at', {ascending: false})

        

        // Then get responses for this link
        const { data, error } = await supabase
          .from('form_responses')
          .select('*')
          .eq('workflow_link_id', currentWorkflow.id)
          .order('created_at', { ascending: false });

          if (error) throw error;
          if (error) throw linkError;

          const groupedResponses = (data || []).reduce<SectionData>((acc, response) => ({
            ...acc,
            [response.section_id]: {
              data: response.data
            }
          }), {});
    
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
    const totalDebt = parseFloat(assetData.totalDebt || '0');

    return {
      monthlyIncome,
      monthlyExpenses,
      totalAssets,
      totalDebt,
      monthlySavings: monthlyIncome - monthlyExpenses,
      savingsRate: ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100
    };
  };

  const { monthlyIncome, monthlyExpenses, totalAssets, totalDebt, monthlySavings, savingsRate } = getFinancialData();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#111111]">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  const expenseBreakdown = [
    {
      name: 'Housing',
      value: parseFloat(responses?.expenses?.data?.housing || '0'),
      color: '#3291FF',
      icon: '🏠'
    },
    {
      name: 'Utilities', 
      value: parseFloat(responses?.expenses?.data?.utilities || '0'),
      color: '#7AC7C4',
      icon: '💡'
    },
    {
      name: 'Transport',
      value: parseFloat(responses?.expenses?.data?.transportation || '0'),
      color: '#F5A524',
      icon: '🚗'
    },
    {
      name: 'Insurance',
      value: parseFloat(responses?.expenses?.data?.insurance || '0'),
      color: '#C25FFF',
      icon: '🛡️'
    }
  ];

  const isProfileComplete = () => {
    if (!currentWorkflow?.sections) return false;
    return currentWorkflow.sections.every(section => 
      responses[section.id] && Object.keys(responses[section.id].data).length > 0
    );
  };

  if (!isProfileComplete()) {
    return (
      <div className="min-h-screen bg-[#111111] text-gray-100 p-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-semibold mb-4">Complete Your Profile</h2>
          <p className="text-gray-400 mb-8">
            Please complete your financial profile to view your dashboard
          </p>
          <button
            onClick={() => navigate('/workflow')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Complete Profile
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#111111] text-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-semibold text-white">Financial Dashboard</h1>
            <p className="text-gray-400 mt-1">Overview of your financial profile</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-400">Last updated: {new Date().toLocaleDateString()}</div>
          </div>
        </div>

        {/* Progress Card */}
        <div className="bg-[#1D1D1F] rounded-xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">Onboarding Progress</h2>
            <span className="text-sm text-gray-400">{calculateProgress()}% Complete</span>
          </div>
          <div className="relative h-2 bg-[#111111] rounded-full overflow-hidden">
            <div 
              className="absolute left-0 top-0 h-full bg-blue-500 transition-all duration-500"
              style={{ width: `${calculateProgress()}%` }}
            />
          </div>
          
          {/* Section Status */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentWorkflow?.sections.map((section: WorkflowSection) => {
              const isComplete = responses[section.id];
              return (
                <div 
                  key={section.id}
                  className="flex items-center justify-between p-3 bg-[#252528] rounded-lg hover:bg-[#2D2D30] transition-colors cursor-pointer"
                >
                  <div className="flex items-center space-x-3">
                    {isComplete ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    ) : (
                      <Circle className="w-5 h-5 text-gray-500" />
                    )}
                    <span className={isComplete ? 'text-gray-300' : 'text-gray-400'}>
                      {section.title}
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-500" />
                </div>
              );
            })}
          </div>
        </div>

        {/* Financial Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-[#1D1D1F] p-6 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <DollarSign className="w-5 h-5 text-green-500" />
              </div>
              <TrendingUp className="w-4 h-4 text-green-500" />
            </div>
            <p className="text-sm text-gray-400">Monthly Income</p>
            <p className="text-2xl font-semibold mt-1">
              ${monthlyIncome.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </p>
          </div>

          <div className="bg-[#1D1D1F] p-6 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-red-500/10 rounded-lg">
                <CreditCard className="w-5 h-5 text-red-500" />
              </div>
              {monthlySavings < 0 && <TrendingUp className="w-4 h-4 text-red-500" />}
            </div>
            <p className="text-sm text-gray-400">Monthly Expenses</p>
            <p className="text-2xl font-semibold mt-1">
              ${monthlyExpenses.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </p>
          </div>

          <div className="bg-[#1D1D1F] p-6 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Wallet className="w-5 h-5 text-blue-500" />
              </div>
            </div>
            <p className="text-sm text-gray-400">Total Assets</p>
            <p className="text-2xl font-semibold mt-1">
              ${totalAssets.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </p>
          </div>

          <div className="bg-[#1D1D1F] p-6 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-yellow-500/10 rounded-lg">
                <FileText className="w-5 h-5 text-yellow-500" />
              </div>
            </div>
            <p className="text-sm text-gray-400">Total Debt</p>
            <p className="text-2xl font-semibold mt-1">
              ${totalDebt.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </p>
          </div>
        </div>

        {/* Expense Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-[#1D1D1F] rounded-xl p-6">
            <h3 className="text-lg font-medium mb-4">Expense Breakdown</h3>
            <div className="space-y-4">
              {expenseBreakdown.map((item) => {
                const percentage = (item.value / monthlyExpenses) * 100;
                return (
                  <div key={item.name}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{item.icon}</span>
                        <span className="text-sm text-gray-400">{item.name}</span>
                      </div>
                      <span className="text-sm font-medium">
                        ${item.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </span>
                    </div>
                    <div className="relative h-2 bg-[#111111] rounded-full overflow-hidden">
                      <div 
                        className="absolute left-0 top-0 h-full transition-all duration-500"
                        style={{ 
                          width: `${percentage}%`,
                          backgroundColor: item.color 
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Savings Analysis */}
          <div className="bg-[#1D1D1F] rounded-xl p-6">
            <h3 className="text-lg font-medium mb-4">Savings Analysis</h3>
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Monthly Savings</span>
                  <span className={`text-lg font-medium ${monthlySavings >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    ${Math.abs(monthlySavings).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  {monthlySavings >= 0 ? (
                    <TrendingUp className="w-4 h-4 text-green-500" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-500" />
                  )}
                  <span className="text-gray-400">
                    {savingsRate.toFixed(1)}% of income
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-800">
                <div className="flex items-center space-x-2 mb-4">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <h4 className="text-sm font-medium">Recent Transactions</h4>
                </div>
                <div className="text-sm text-gray-400 text-center py-8">
                  Connect your bank account to see transactions
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
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