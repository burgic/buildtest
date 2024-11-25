// import type { Database } from '../lib/database.types';

// type FormResponse = Database['public']['Tables']['form_responses']['Row'];

export type SectionData = {
  income: {
    salary: string;
    otherIncome: string;
    frequency: 'annually' | 'monthly';
  };
  expenses: {
    housing: string;
    utilities: string;
    transport: string;
    food: string;
    insurance: string;
    entertainment: string;
  };
  assets: {
    property: string;
    savings: string;
    investments: string;
    pension: string;
    mortgages: string;
    loans: string;
    creditCards: string;
  };
  health: {
    conditions: string;
    smoker: boolean;
    alcohol: string;
    exercise: string;
  };
  goals: {
    shortTerm: string;
    mediumTerm: string;
    longTerm: string;
    retirementAge: string;
    riskTolerance: 'low' | 'medium' | 'high';
  };
};

export type SectionId = keyof SectionData;