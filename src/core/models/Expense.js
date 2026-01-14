/**
 * Expense - Domain model for expense projections
 * Handles inflation-adjusted expense streams
 */
export class Expense {
  constructor(name, annualAmountInDollars, startYear, inflationAdjusted = true) {
    this.id = this.generateId();
    this.name = name;
    this.baseAmount = annualAmountInDollars * 100; // Store in cents
    this.startYear = startYear; // Years from now
    this.endYear = null;
    this.isOneTime = false; // True for one-time expenses
    this.inflationAdjusted = inflationAdjusted;
  }

  generateId() {
    return 'exp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      baseAmount: this.baseAmount,
      startYear: this.startYear,
      endYear: this.endYear,
      isOneTime: this.isOneTime,
      inflationAdjusted: this.inflationAdjusted
    };
  }

  static fromJSON(data) {
    const expense = new Expense(
      data.name,
      data.baseAmount / 100,
      data.startYear,
      data.inflationAdjusted
    );
    expense.id = data.id;
    expense.endYear = data.endYear || null;
    expense.isOneTime = data.isOneTime || false;
    return expense;
  }
}
