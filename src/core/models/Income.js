/**
 * Income - Domain model for income projections
 * Handles different types of income streams with appropriate tax treatment
 */
export class Income {
  constructor(name, annualAmountInDollars, startYear, type = 'salary') {
    this.id = this.generateId();
    this.name = name;
    this.baseAmount = annualAmountInDollars * 100; // Store in cents
    this.startYear = startYear; // Years from now
    this.endYear = null;
    this.type = type; // 'salary', 'business', 'pension', 'rental', 'dividends', 'other'
    this.growthRate = 0.03; // Annual growth rate (raises, business growth, etc.)
  }

  generateId() {
    return 'inc_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Get tax treatment based on income type
  getTaxTreatment() {
    const treatments = {
      'salary': 'earned',      // Ordinary income tax rates
      'business': 'earned',    // Ordinary income tax rates
      'pension': 'earned',     // Ordinary income tax rates
      'rental': 'earned',      // Ordinary income tax rates
      'dividends': 'qualified', // Qualified dividend rates (lower than ordinary)
      'other': 'earned'        // Default to earned income
    };
    return treatments[this.type] || 'earned';
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      baseAmount: this.baseAmount,
      startYear: this.startYear,
      endYear: this.endYear,
      type: this.type,
      growthRate: this.growthRate
    };
  }

  static fromJSON(data) {
    const income = new Income(
      data.name,
      data.baseAmount / 100,
      data.startYear,
      data.type
    );
    income.id = data.id;
    income.endYear = data.endYear || null;
    income.growthRate = data.growthRate !== undefined ? data.growthRate : 0.03;
    return income;
  }
}
