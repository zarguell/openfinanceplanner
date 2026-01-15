/**
 * Account - Domain model for financial accounts
 * Stores monetary values in cents (integers) to avoid floating-point issues
 */
export class Account {
  constructor(name, type, balanceInDollars) {
    this.id = this.generateId();
    this.name = name;
    this.type = type; // '401k', 'IRA', 'Roth', 'HSA', 'Taxable'
    this.balance = balanceInDollars * 100; // Store in cents
    this.costBasis = type === 'Taxable' ? balanceInDollars * 100 : undefined; // Track cost basis for Taxable accounts
    this.annualContribution = 0;
    this.contributionStartYear = 0; // Years from now when contributions start
    this.contributionEndYear = null; // Years from now when contributions end (null for ongoing)
    this.isOneTimeContribution = false; // True for one-time lump sum contributions
    this.withdrawalRate = 0.04;
  }

  generateId() {
    return 'acc_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      balance: this.balance,
      costBasis: this.costBasis,
      annualContribution: this.annualContribution,
      contributionStartYear: this.contributionStartYear,
      contributionEndYear: this.contributionEndYear,
      isOneTimeContribution: this.isOneTimeContribution,
      withdrawalRate: this.withdrawalRate
    };
  }

  static fromJSON(data) {
    const account = new Account(data.name, data.type, data.balance / 100);
    account.id = data.id;
    account.costBasis = data.costBasis !== undefined ? data.costBasis : data.balance;
    account.annualContribution = data.annualContribution || 0;
    account.contributionStartYear = data.contributionStartYear !== undefined ? data.contributionStartYear : 0;
    account.contributionEndYear = data.contributionEndYear || null;
    account.isOneTimeContribution = data.isOneTimeContribution || false;
    account.withdrawalRate = data.withdrawalRate || 0.04;
    return account;
  }
}
