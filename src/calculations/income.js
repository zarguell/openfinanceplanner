/**
 * Income calculation functions - Pure functions for income projections
 * Handles different types of income streams with appropriate growth patterns
 */

/**
 * Calculate income amount for a given year
 * @param {object} income - Income object
 * @param {number} yearOffset - Years from now
 * @param {number} inflationRate - Annual inflation rate
 * @returns {number} Income amount in dollars for that year
 */
export function calculateIncomeForYear(income, yearOffset, inflationRate) {
  if (yearOffset < income.startYear) {
    return 0;
  }

  // For one-time income, only appears in start year
  if (income.isOneTime) {
    return yearOffset === income.startYear ? income.baseAmount / 100 : 0;
  }

  // For recurring income, check end year
  if (income.endYear && yearOffset > income.endYear) {
    return 0;
  }

  const baseAmount = income.baseAmount / 100; // Convert cents to dollars

  // Apply income-specific growth rate (raises, business growth, etc.)
  // Growth is relative to start year, not from year 0
  const yearsSinceStart = yearOffset - income.startYear;
  const growthMultiplier = yearsSinceStart > 0 ? Math.pow(1 + income.growthRate, yearsSinceStart) : 1;

  return baseAmount * growthMultiplier;
}

/**
 * Calculate total income for all income items in a given year
 * @param {Array} incomes - Array of income objects
 * @param {number} yearOffset - Years from now
 * @param {number} inflationRate - Annual inflation rate
 * @returns {number} Total income in dollars
 */
export function calculateTotalIncome(incomes, yearOffset, inflationRate) {
  return incomes.reduce((total, income) => {
    return total + calculateIncomeForYear(income, yearOffset, inflationRate);
  }, 0);
}

/**
 * Calculate taxable income from all sources for a given year
 * @param {Array} incomes - Array of income objects
 * @param {number} yearOffset - Years from now
 * @param {number} inflationRate - Annual inflation rate
 * @returns {object} { totalIncome, earnedIncome, passiveIncome, qualifiedDividends }
 */
export function calculateTaxableIncome(incomes, yearOffset, inflationRate) {
  let totalIncome = 0;
  let earnedIncome = 0;
  let passiveIncome = 0;
  let qualifiedDividends = 0;

  incomes.forEach(income => {
    const amount = calculateIncomeForYear(income, yearOffset, inflationRate);
    totalIncome += amount;

    switch (income.getTaxTreatment()) {
      case 'earned':
        earnedIncome += amount;
        break;
      case 'qualified':
        qualifiedDividends += amount;
        break;
      default:
        passiveIncome += amount;
        break;
    }
  });

  return {
    totalIncome,
    earnedIncome,
    passiveIncome,
    qualifiedDividends
  };
}
