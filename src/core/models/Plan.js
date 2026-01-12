/**
 * Plan - Core domain model for financial plans
 * Pure business logic with no UI dependencies
 */
export class Plan {
  constructor(name, currentAge, retirementAge) {
    this.id = this.generateId();
    this.name = name;
    this.created = new Date().toISOString();
    this.lastModified = this.created;
    this.taxProfile = {
      currentAge,
      retirementAge,
      filingStatus: 'single',
      federalTaxRate: 0.22
    };
    this.assumptions = {
      inflationRate: 0.03,
      equityGrowthRate: 0.07,
      bondGrowthRate: 0.04
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
      taxProfile: { ...this.taxProfile },
      assumptions: { ...this.assumptions },
      accounts: this.accounts.map(acc => acc.toJSON ? acc.toJSON() : acc),
      expenses: this.expenses.map(exp => exp.toJSON ? exp.toJSON() : exp)
    };
  }

  static fromJSON(data) {
    const plan = new Plan(data.name, data.taxProfile.currentAge, data.taxProfile.retirementAge);
    plan.id = data.id;
    plan.created = data.created;
    plan.lastModified = data.lastModified;
    plan.taxProfile = data.taxProfile;
    plan.assumptions = data.assumptions;
    plan.accounts = data.accounts || [];
    plan.expenses = data.expenses || [];
    return plan;
  }
}
