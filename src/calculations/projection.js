/**
 * Projection calculations - Pure functions for financial projections
 * No side effects, no state mutations, testable in isolation
 */

/**
 * Get growth rate for account type based on assumptions
 * @param {string} accountType - Account type (401k, IRA, Roth, etc.)
 * @param {object} assumptions - Growth rate assumptions
 * @returns {number} Annual growth rate as decimal
 */
export function getAccountGrowthRate(accountType, assumptions) {
  const rates = {
    '401k': assumptions.equityGrowthRate,
    'IRA': assumptions.equityGrowthRate,
    'Roth': assumptions.equityGrowthRate,
    'Taxable': assumptions.equityGrowthRate * 0.8, // Lower due to annual taxes
    'HSA': assumptions.equityGrowthRate
  };
  return rates[accountType] || assumptions.equityGrowthRate;
}

/**
 * Calculate inflation-adjusted expense for a given year
 * @param {object} expense - Expense object
 * @param {number} yearOffset - Years from now
 * @param {number} inflationRate - Annual inflation rate
 * @returns {number} Expense amount in dollars for that year
 */
export function calculateExpenseForYear(expense, yearOffset, inflationRate) {
  if (yearOffset < expense.startYear) {
    return 0;
  }

  if (expense.endYear && yearOffset > expense.endYear) {
    return 0;
  }

  const baseAmount = expense.baseAmount / 100; // Convert cents to dollars
  const inflationMultiplier = expense.inflationAdjusted
    ? Math.pow(1 + inflationRate, yearOffset)
    : 1;

  return baseAmount * inflationMultiplier;
}

/**
 * Calculate total expenses for all expense items in a given year
 * @param {Array} expenses - Array of expense objects
 * @param {number} yearOffset - Years from now
 * @param {number} inflationRate - Annual inflation rate
 * @returns {number} Total expenses in dollars
 */
export function calculateTotalExpenses(expenses, yearOffset, inflationRate) {
  return expenses.reduce((total, expense) => {
    return total + calculateExpenseForYear(expense, yearOffset, inflationRate);
  }, 0);
}

/**
 * Project a financial plan year by year
 * @param {object} plan - Plan object with accounts, expenses, taxProfile, assumptions
 * @param {number} yearsToProject - Number of years to project
 * @returns {Array} Array of yearly projection results
 */
export function project(plan, yearsToProject = 40) {
  const results = [];
  const accountSnapshots = plan.accounts.map(acc => ({
    ...acc,
    balance: acc.balance
  }));

  const startYear = new Date().getFullYear();
  const startAge = plan.taxProfile.currentAge;

  for (let year = 0; year <= yearsToProject; year++) {
    const currentYear = startYear + year;
    const age = startAge + year;
    const isRetired = age >= plan.taxProfile.retirementAge;

    // Calculate total expenses for this year
    const totalExpense = calculateTotalExpenses(
      plan.expenses,
      year,
      plan.assumptions.inflationRate
    );

    // Apply growth and contributions/distributions
    let totalBalance = 0;
    for (let i = 0; i < accountSnapshots.length; i++) {
      let balance = accountSnapshots[i].balance / 100;

      if (!isRetired) {
        // Accumulation phase: add contributions
        balance += plan.accounts[i].annualContribution || 0;
      } else {
        // Distribution phase: withdraw proportionally from accounts
        balance -= totalExpense / plan.accounts.length;
      }

      // Apply investment growth
      const growthRate = getAccountGrowthRate(
        plan.accounts[i].type,
        plan.assumptions
      );
      balance *= (1 + growthRate);

      accountSnapshots[i].balance = balance * 100;
      totalBalance += balance;
    }

    results.push({
      year: currentYear,
      age: age,
      isRetired: isRetired,
      totalBalance: totalBalance,
      totalExpense: totalExpense,
      accountBalances: accountSnapshots.map(acc => acc.balance / 100)
    });
  }

  return results;
}
