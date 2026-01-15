import { Income } from './Income.js';

/**
 * Plan - Core domain model for financial plans
 * Pure business logic with no UI dependencies
 */
export class Plan {
  constructor(name, currentAge, retirementAge, estimatedTaxRate = 0.25) {
    this.id = this.generateId();
    this.name = name;
    this.created = new Date().toISOString();
    this.lastModified = this.created;
    this.taxProfile = {
      currentAge,
      retirementAge,
      estimatedTaxRate, // MVP: User-estimated tax rate (federal + state combined)
      // Keep legacy fields for future advanced features
      filingStatus: 'single',
      federalTaxRate: 0.24,
      taxYear: 2025,
      state: null,
    };
    this.assumptions = {
      inflationRate: 0.03,
      equityGrowthRate: 0.07,
      bondGrowthRate: 0.04,
      equityVolatility: 0.12, // 12% annual volatility for stocks
      bondVolatility: 0.04, // 4% annual volatility for bonds
    };
    this.socialSecurity = {
      enabled: false,
      birthYear: new Date().getFullYear() - currentAge, // Rough estimate, user will override
      monthlyBenefit: 0, // Monthly benefit at FRA in today's dollars
      filingAge: 67, // Default to 67 (most common Full Retirement Age)
    };
    this.accounts = [];
    this.expenses = [];
    this.incomes = [];
    this.withdrawalStrategy = 'proportional';
    this.rothConversions = {
      enabled: false,
      strategy: 'fixed',
      annualAmount: 0,
      percentage: 0.05,
      bracketTop: 0,
    };
    this.qcdSettings = {
      enabled: false,
      strategy: 'fixed',
      annualAmount: 0,
      percentage: 0.1,
      marginalTaxRate: 0.24,
    };
    this.taxLossHarvesting = {
      enabled: false,
      strategy: 'all',
      threshold: 100000, // $1,000 minimum threshold (in cents)
    };
    this.backdoorRoth = {
      enabled: false,
      annualContribution: 6000,
      incomeThreshold: 129000,
      phaseOutEnd: 144000,
    };
    this.megaBackdoorRoth = {
      enabled: false,
      annualContribution: 15000,
      planSupportsAfterTax: true,
      planSupportsInServiceWithdrawal: true,
      employerMatchRate: 0.04,
      employeeDeferralLimit: 23500,
      total401kLimit: 69000,
    };
  }

  generateId() {
    return 'plan_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  addAccount(account) {
    this.accounts.push(account);
    this.touch();
  }

  removeAccount(accountId) {
    this.accounts = this.accounts.filter((acc) => acc.id !== accountId);
    this.touch();
  }

  addExpense(expense) {
    this.expenses.push(expense);
    this.touch();
  }

  removeExpense(expenseId) {
    this.expenses = this.expenses.filter((exp) => exp.id !== expenseId);
    this.touch();
  }

  addIncome(income) {
    this.incomes.push(income);
    this.touch();
  }

  removeIncome(incomeId) {
    this.incomes = this.incomes.filter((inc) => inc.id !== incomeId);
    this.touch();
  }

  touch() {
    this.lastModified = new Date().toISOString();
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      created: this.created,
      lastModified: this.lastModified,
      taxProfile: {
        ...this.taxProfile,
        state: this.taxProfile.state,
        taxYear: this.taxProfile.taxYear,
      },
      assumptions: { ...this.assumptions },
      socialSecurity: { ...this.socialSecurity },
      withdrawalStrategy: this.withdrawalStrategy,
      rothConversions: { ...this.rothConversions },
      qcdSettings: { ...this.qcdSettings },
      taxLossHarvesting: { ...this.taxLossHarvesting },
      backdoorRoth: { ...this.backdoorRoth },
      megaBackdoorRoth: { ...this.megaBackdoorRoth },
      accounts: this.accounts.map((acc) => (acc.toJSON ? acc.toJSON() : acc)),
      expenses: this.expenses.map((exp) => (exp.toJSON ? exp.toJSON() : exp)),
      incomes: this.incomes.map((inc) => (inc.toJSON ? inc.toJSON() : inc)),
    };
  }

  static fromJSON(data) {
    // Use estimatedTaxRate if available, otherwise default to 0.25
    const estimatedTaxRate =
      data.taxProfile.estimatedTaxRate !== undefined ? data.taxProfile.estimatedTaxRate : 0.25;
    const plan = new Plan(
      data.name,
      data.taxProfile.currentAge,
      data.taxProfile.retirementAge,
      estimatedTaxRate
    );
    plan.id = data.id;
    plan.created = data.created;
    plan.lastModified = data.lastModified;

    plan.taxProfile = { ...data.taxProfile }; // Copy all taxProfile data

    // Ensure legacy fields exist for backward compatibility
    if (plan.taxProfile.federalTaxRate === undefined) {
      plan.taxProfile.federalTaxRate = 0.24;
    }

    // Merge assumptions with defaults for backward compatibility
    plan.assumptions = {
      inflationRate: 0.03,
      equityGrowthRate: 0.07,
      bondGrowthRate: 0.04,
      equityVolatility: 0.12,
      bondVolatility: 0.04,
      ...data.assumptions, // Override with saved data
    };

    // Merge socialSecurity with defaults for backward compatibility
    plan.socialSecurity = {
      enabled: false,
      birthYear: new Date().getFullYear() - plan.taxProfile.currentAge,
      monthlyBenefit: 0,
      filingAge: plan.taxProfile.retirementAge,
      ...data.socialSecurity,
    };

    plan.rothConversions = {
      enabled: false,
      strategy: 'fixed',
      annualAmount: 0,
      percentage: 0.05,
      bracketTop: 0,
      ...data.rothConversions,
    };

    plan.qcdSettings = {
      enabled: false,
      strategy: 'fixed',
      annualAmount: 0,
      percentage: 0.1,
      marginalTaxRate: 0.24,
      ...data.qcdSettings,
    };

    plan.taxLossHarvesting = {
      enabled: false,
      strategy: 'all',
      threshold: 100000,
      ...data.taxLossHarvesting,
    };

    plan.backdoorRoth = {
      enabled: false,
      annualContribution: 6000,
      incomeThreshold: 129000,
      phaseOutEnd: 144000,
      ...data.backdoorRoth,
    };

    plan.megaBackdoorRoth = {
      enabled: false,
      annualContribution: 15000,
      planSupportsAfterTax: true,
      planSupportsInServiceWithdrawal: true,
      employerMatchRate: 0.04,
      employeeDeferralLimit: 23500,
      total401kLimit: 69000,
      ...data.megaBackdoorRoth,
    };

    plan.accounts = data.accounts || [];
    plan.expenses = data.expenses || [];
    plan.incomes = data.incomes
      ? data.incomes.map((inc) => (inc.fromJSON ? inc.fromJSON(inc) : Income.fromJSON(inc)))
      : [];
    return plan;
  }
}
