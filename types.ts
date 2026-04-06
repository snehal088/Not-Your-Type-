export interface BusinessTemplate {
  name: string;
  icon: string;
  description: string;
  image: string;
  defaultCosts: { category: string; amount: number }[];
  suggestedLoan: {
    bankName: string;
    interestRate: number;
    tenure: number;
  };
}

export interface BusinessCost {
  id: string;
  category: string;
  amount: number;
}

export interface LoanOption {
  bankName: string;
  interestRate: number; // Annual percentage
  maxTenure: number; // In months
}

export interface FinanceAnalysis {
  totalRequired: number;
  availableCapital: number;
  gap: number;
  selectedLoan?: {
    bankName: string;
    interestRate: number;
    tenure: number;
    emi: number;
    totalRepayment: number;
    totalInterest: number;
  };
}

export interface AISuggestion {
  title: string;
  advice: string;
  impact: 'low' | 'medium' | 'high';
}
