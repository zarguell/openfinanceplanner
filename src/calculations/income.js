/**
 * Income calculation functions - Pure functions for income projections
 * Handles different types of income streams with appropriate growth patterns
 * Supports smart rules for dynamic start/end calculation based on retirement age
 */

export function evaluateStartYear(income, currentAge, retirementAge) {
  if (income.startRule === 'manual') {
    return income.startYear;
  }

  if (income.startRule === 'retirement') {
    return retirementAge - currentAge;
  }

  if (income.startRule === 'age' && income.startRuleAge !== null) {
    return income.startRuleAge - currentAge;
  }

  if (income.startRule === 'retirement-if-age' && income.startRuleAge !== null) {
    const expectedRetirementYear = retirementAge - currentAge;
    const expectedAgeYear = income.startRuleAge - currentAge;
    
    return retirementAge >= income.startRuleAge ? expectedRetirementYear : expectedAgeYear;
  }

  return income.startYear;
}

export function evaluateEndYear(income, currentAge, retirementAge, startYearEvaluated) {
  if (income.endRule === 'manual') {
    return income.endYear;
  }

  if (income.endRule === 'retirement') {
    return retirementAge - currentAge;
  }

  if (income.endRule === 'age' && income.endRuleAge !== null) {
    return income.endRuleAge - currentAge;
  }

  return income.endYear;
}

/**
 * Calculate income amount for a given year
 * @param {object} income - Income object
 * @param {number} yearOffset - Years from now
 * @param {number} inflationRate - Annual inflation rate
 * @param {object} planContext - Plan context (currentAge, retirementAge)
 * @returns {number} Income amount in dollars for that year
 */
export function calculateIncomeForYear(income, yearOffset, inflationRate, planContext) {
  const evaluatedStartYear = evaluateStartYear(
    income,
    planContext.currentAge,
    planContext.retirementAge
  );

  if (yearOffset < evaluatedStartYear) {
    return 0;
  }

  const evaluatedEndYear = evaluateEndYear(
    income,
    planContext.currentAge,
    planContext.retirementAge,
    evaluatedStartYear
  );

  // For one-time income, only appears in start year
  if (income.isOneTime) {
    return yearOffset === evaluatedStartYear ? income.baseAmount / 100 : 0;
  }

  // For recurring income, check end year
  if (evaluatedEndYear && yearOffset >= evaluatedEndYear) {
    return 0;
  }

  const baseAmount = income.baseAmount / 100; // Convert cents to dollars

  // Apply income-specific growth rate (raises, business growth, etc.)
  // Growth is relative to start year, not from year 0
  const yearsSinceStart = yearOffset - evaluatedStartYear;
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
export function calculateTotalIncome(incomes, yearOffset, inflationRate, planContext) {
  return incomes.reduce((total, income) => {
    return total + calculateIncomeForYear(income, yearOffset, inflationRate, planContext);
  }, 0);
}

/**
 * Calculate taxable income from all sources for a given year
 * @param {Array} incomes - Array of income objects
 * @param {number} yearOffset - Years from now
 * @param {number} inflationRate - Annual inflation rate
 * @returns {object} { totalIncome, earnedIncome, passiveIncome, qualifiedDividends }
 */
export function calculateTaxableIncome(incomes, yearOffset, inflationRate, planContext) {
  let totalIncome = 0;
  let earnedIncome = 0;
  let passiveIncome = 0;
  let qualifiedDividends = 0;

  incomes.forEach(income => {
    const amount = calculateIncomeForYear(income, yearOffset, inflationRate, planContext);
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
