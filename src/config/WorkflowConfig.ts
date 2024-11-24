import type { WorkflowSection } from '../types/workflow.types';

export const defaultSections: WorkflowSection[] = [
    {
      id: 'personal',
      title: 'Personal Details',
      type: 'personal',
      required: true,
      order: 1,
      fields: [
        { id: 'fullName', label: 'Full Name', type: 'text', required: true },
        { id: 'email', label: 'Email', type: 'email', required: true },
        { id: 'phone', label: 'Phone Number', type: 'tel', required: true },
        { id: 'address', label: 'Address', type: 'text', required: false },
        { id: 'dateOfBirth', label: 'Date of Birth', type: 'date', required: true },
      ],
      data: {},
    },
    {
      id: 'employment',
      title: 'Employment Details',
      type: 'financial',
      required: true,
      order: 2,
      fields: [
        { id: 'employer', label: 'Employer', type: 'text', required: true },
        { id: 'annualIncome', label: 'Annual Income', type: 'number', required: true },
      ],
      data: {},
    },
    {
      id: 'expenses',
      title: 'Monthly Expenses',
      type: 'financial',
      required: true,
      order: 3,
      fields: [
        { id: 'housing', label: 'Housing (Rent/Mortgage)', type: 'number', required: true },
        { id: 'utilities', label: 'Utilities', type: 'number', required: true },
        { id: 'transportation', label: 'Transportation', type: 'number', required: true },
        { id: 'insurance', label: 'Insurance', type: 'number', required: true },
        { id: 'food', label: 'Food & Groceries', type: 'number', required: true },
        { id: 'healthcare', label: 'Healthcare', type: 'number', required: true },
        { id: 'entertainment', label: 'Entertainment', type: 'number', required: false },
        { id: 'other', label: 'Other Expenses', type: 'number', required: false }
      ],
      data: {}
    },
    {
      id: 'assets',
      title: 'Assets & Liabilities',
      type: 'financial',
      required: true,
      order: 4,
      fields: [
        { id: 'cashSavings', label: 'Cash & Savings', type: 'number', required: true },
        { id: 'investments', label: 'Investments', type: 'number', required: true },
        { id: 'retirement', label: 'Retirement Accounts', type: 'number', required: true },
        { id: 'propertyValue', label: 'Property Value', type: 'number', required: true },
        { id: 'otherAssets', label: 'Other Assets', type: 'number', required: false },
        { id: 'mortgage', label: 'Mortgage Balance', type: 'number', required: false },
        { id: 'carLoan', label: 'Car Loan', type: 'number', required: false },
        { id: 'creditCard', label: 'Credit Card Debt', type: 'number', required: false },
        { id: 'studentLoan', label: 'Student Loans', type: 'number', required: false },
        { id: 'otherDebts', label: 'Other Debts', type: 'number', required: false }
      ],
      data: {}
    },
    {
      id: 'goals',
      title: 'Financial Goals',
      type: 'financial',
      required: true,
      order: 5,
      fields: [
        { 
          id: 'primaryGoal', 
          label: 'Primary Financial Goal', 
          type: 'select', 
          required: true,
          options: [
            'Retirement Planning',
            'Debt Reduction',
            'Savings',
            'Investment Growth',
            'Home Purchase',
            'Education Funding',
            'Business Start-up',
            'Other'
          ]
        },
        { id: 'timeframe', label: 'Goal Timeframe (years)', type: 'number', required: true },
        { id: 'targetAmount', label: 'Target Amount', type: 'number', required: true },
        { id: 'currentSavings', label: 'Current Monthly Savings', type: 'number', required: true },
        { 
          id: 'riskTolerance', 
          label: 'Investment Risk Tolerance', 
          type: 'select', 
          required: true,
          options: ['Conservative', 'Moderate', 'Aggressive'] 
        }
      ],
      data: {}
    }
  ];
  