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
      state: null
    };
    this.assumptions = {
      inflationRate: 0.03,
      equityGrowthRate: 0.07,
      bondGrowthRate: 0.04,
      equityVolatility: 0.12, // 12% annual volatility for stocks
      bondVolatility: 0.04    // 4% annual volatility for bonds
    };
    this.socialSecurity = {
      enabled: false,
      birthYear: new Date().getFullYear() - currentAge, // Rough estimate, user will override
      monthlyBenefit: 0, // Monthly benefit at FRA in today's dollars
      filingAge: retirementAge // Default to retirement age
    };
    this.accounts = [];
    this.expenses = [];
  }

  generateId() {
    return 'plan_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  addAccount(account) {
    this.accounts.push(account);
    this.touch();
  }

  removeAccount(accountId) {
    this.accounts = this.accounts.filter(acc => acc.id !== accountId);
    this.touch();
  }

  addExpense(expense) {
    this.expenses.push(expense);
    this.touch();
  }

  removeExpense(expenseId) {
    this.expenses = this.expenses.filter(exp => exp.id !== expenseId);
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
      taxProfile: { ...this.taxProfile, state: this.taxProfile.state, taxYear: this.taxProfile.taxYear },
      assumptions: { ...this.assumptions },
      socialSecurity: { ...this.socialSecurity },
      accounts: this.accounts.map(acc => acc.toJSON ? acc.toJSON() : acc),
      expenses: this.expenses.map(exp => exp.toJSON ? exp.toJSON() : exp)
    };
  }

  static fromJSON(data) {
    // Use estimatedTaxRate if available, otherwise default to 0.25
    const estimatedTaxRate = data.taxProfile.estimatedTaxRate !== undefined ? data.taxProfile.estimatedTaxRate : 0.25;
    const plan = new Plan(data.name, data.taxProfile.currentAge, data.taxProfile.retirementAge, estimatedTaxRate);
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
      ...data.assumptions // Override with saved data
    };

    // Merge socialSecurity with defaults for backward compatibility
    plan.socialSecurity = {
      enabled: false,
      birthYear: new Date().getFullYear() - plan.taxProfile.currentAge,
      monthlyBenefit: 0,
      filingAge: plan.taxProfile.retirementAge,
      ...data.socialSecurity // Override with saved data
    };

    plan.accounts = data.accounts || [];
    plan.expenses = data.expenses || [];
    return plan;
  }
}
