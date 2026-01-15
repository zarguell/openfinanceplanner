/**
 * Income - Domain model for income projections
 * Handles different types of income streams with appropriate tax treatment
 */
export class Income {
  constructor(name, annualAmountInDollars, startYear, type = 'salary') {
    this.id = this.generateId();
    this.name = name;
    this.baseAmount = annualAmountInDollars * 100; // Store in cents
    this.startYear = startYear; // Years from now (manual)
    this.endYear = null;
    this.isOneTime = false; // True for one-time income events
    this.type = type; // 'salary', 'business', 'pension', 'rental', 'dividends', 'interest', 'other'
    this.growthRate = 0.03; // Annual growth rate (raises, business growth, etc.)
    
    // Smart rule flags for dynamic start/end calculation
    this.startRule = 'manual'; // 'manual' | 'retirement' | 'age' | 'retirement-if-age'
    this.startRuleAge = null; // For 'age' and 'retirement-if-age' rules
    this.endRule = 'manual'; // 'manual' | 'retirement' | 'age'
    this.endRuleAge = null; // For 'age' rule
  }

  generateId() {
    return 'inc_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Get tax treatment based on income type
  getTaxTreatment() {
    const treatments = {
      'salary': 'earned',                    // Ordinary income tax rates
      'business': 'earned',                  // Ordinary income tax rates
      'pension': 'earned',                   // Ordinary income tax rates
      'rental': 'earned',                    // Ordinary income tax rates
      'dividends': 'qualified',              // Qualified dividend rates (lower than ordinary)
      'interest': 'passive',                 // Interest income (ordinary rates)
      'non-qualified-dividends': 'passive',  // Non-qualified dividends (ordinary rates)
      'other': 'earned'                      // Default to earned income
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
      isOneTime: this.isOneTime,
      type: this.type,
      growthRate: this.growthRate,
      startRule: this.startRule,
      startRuleAge: this.startRuleAge,
      endRule: this.endRule,
      endRuleAge: this.endRuleAge
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
    income.isOneTime = data.isOneTime || false;
    income.growthRate = data.growthRate !== undefined ? data.growthRate : 0.03;
    income.startRule = data.startRule || 'manual';
    income.startRuleAge = data.startRuleAge || null;
    income.endRule = data.endRule || 'manual';
    income.endRuleAge = data.endRuleAge || null;
    return income;
  }
}
