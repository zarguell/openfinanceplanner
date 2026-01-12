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
    this.annualContribution = 0;
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
      annualContribution: this.annualContribution,
      withdrawalRate: this.withdrawalRate
    };
  }

  static fromJSON(data) {
    const account = new Account(data.name, data.type, data.balance / 100);
    account.id = data.id;
    account.annualContribution = data.annualContribution || 0;
    account.withdrawalRate = data.withdrawalRate || 0.04;
    return account;
  }
}
