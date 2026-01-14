/**
 * Roth Conversion Strategy Module
 *
 * Implements various Roth conversion strategies for tax-efficient retirement planning.
 * Roth conversions allow moving funds from traditional retirement accounts (tax-deferred)
 * to Roth IRAs (tax-free growth and withdrawals) by paying taxes now.
 *
 * Key Concepts:
 * - Conversions taxed as ordinary income in year of conversion
 * - 5-year rule: Converted funds penalty-free after 5 years AND age 59½
 * - Cannot convert RMD amounts (must withdraw, then re-deposit if desired)
 * - Backdoor Roth: After-tax contributions converted to Roth
 * - Conversion Ladder: Strategic conversions in low-income years
 */

/**
 * Calculate tax impact of Roth conversion
 *
 * @param {number} conversionAmount - Amount to convert in cents
 * @param {number} currentTaxableIncome - Current taxable income before conversion (cents)
 * @param {number} marginalTaxRate - Current marginal tax rate (decimal, e.g., 0.24)
 * @param {number} totalTaxRate - Estimated total tax rate (federal + state, decimal)
 * @returns {object} Tax impact details
 */
export function calculateConversionTax(conversionAmount, currentTaxableIncome, marginalTaxRate, totalTaxRate) {
  const effectiveTaxRate = marginalTaxRate || totalTaxRate;
  const taxOnConversion = Math.round(conversionAmount * effectiveTaxRate);

  return {
    conversionAmount,
    taxOnConversion,
    effectiveTaxRate,
    afterTaxCost: conversionAmount + taxOnConversion
  };
}

/**
 * Calculate bracket-filling conversion amount
 *
 * Strategy: Convert just enough to fill up to the top of the current tax bracket
 *
 * @param {number} currentTaxableIncome - Current taxable income (cents)
 * @param {number} bracketTop - Top of current tax bracket (cents)
 * @param {number} traditionalBalance - Available traditional balance (cents)
 * @returns {number} Conversion amount in cents
 */
export function calculateBracketFillConversion(currentTaxableIncome, bracketTop, traditionalBalance) {
  const spaceInBracket = bracketTop - currentTaxableIncome;
  const maxConversion = Math.min(spaceInBracket, traditionalBalance);

  return Math.max(0, maxConversion);
}

/**
 * Fixed annual conversion strategy
 *
 * Strategy: Convert the same amount every year (if available)
 *
 * @param {number} annualConversionAmount - Target conversion amount (cents)
 * @param {number} traditionalBalance - Available traditional balance (cents)
 * @param {number} age - Current age
 * @param {boolean} mustTakeRMD - Whether RMD required this year
 * @returns {number} Conversion amount in cents
 */
export function calculateFixedConversion(annualConversionAmount, traditionalBalance, age, mustTakeRMD) {
  if (mustTakeRMD) {
    return Math.min(annualConversionAmount, traditionalBalance);
  }

  return Math.min(annualConversionAmount, traditionalBalance);
}

/**
 * Percentage-based conversion strategy
 *
 * Strategy: Convert a fixed percentage of traditional balance each year
 *
 * @param {number} conversionPercentage - Percentage to convert (decimal, e.g., 0.10 for 10%)
 * @param {number} traditionalBalance - Available traditional balance (cents)
 * @param {number} maxConversionAmount - Maximum annual conversion limit (cents)
 * @returns {number} Conversion amount in cents
 */
export function calculatePercentageConversion(conversionPercentage, traditionalBalance, maxConversionAmount = Infinity) {
  const percentageAmount = Math.round(traditionalBalance * conversionPercentage);
  return Math.min(percentageAmount, maxConversionAmount);
}

/**
 * Backdoor Roth conversion strategy
 *
 * Strategy: Convert after-tax contributions (basis) to Roth
 * This is tax-free since taxes already paid on the money
 *
 * @param {number} afterTaxBasis - After-tax basis in traditional account (cents)
 * @param {number} traditionalBalance - Total traditional balance (cents)
 * @returns {number} Conversion amount in cents
 */
export function calculateBackdoorRothConversion(afterTaxBasis, traditionalBalance) {
  return Math.min(afterTaxBasis, traditionalBalance);
}

/**
 * Calculate pro-rata basis for traditional IRA with mixed pre-tax and after-tax contributions
 *
 * When a traditional IRA contains both pre-tax and after-tax contributions,
 * any conversion includes a pro-rata amount of basis (tax-free)
 *
 * Formula: (Basis / Total Balance) * Conversion Amount = Taxable Amount
 *
 * @param {number} afterTaxBasis - After-tax basis in traditional account (cents)
 * @param {number} totalTraditionalBalance - Total traditional balance (cents)
 * @param {number} conversionAmount - Amount converting to Roth (cents)
 * @returns {object} Pro-rata breakdown
 */
export function calculateProRataBasis(afterTaxBasis, totalTraditionalBalance, conversionAmount) {
  if (totalTraditionalBalance === 0) {
    return {
      conversionAmount,
      taxableAmount: 0,
      nonTaxableAmount: 0
    };
  }

  const basisRatio = afterTaxBasis / totalTraditionalBalance;
  const nonTaxableAmount = Math.round(conversionAmount * basisRatio);
  const taxableAmount = conversionAmount - nonTaxableAmount;

  return {
    conversionAmount,
    taxableAmount,
    nonTaxableAmount,
    basisRatio
  };
}

/**
 * Check if Roth conversion qualifies for penalty-free withdrawal
 *
 * 5-Year Rule: Converted funds are penalty-free when BOTH conditions are met:
 * 1. 5 years have passed since conversion
 * 2. Account owner is age 59½ or older
 *
 * @param {number} conversionYear - Year when conversion occurred
 * @param {number} currentYear - Current year
 * @param {number} currentAge - Current age
 * @returns {boolean} True if penalty-free
 */
export function isPenaltyFree(conversionYear, currentYear, currentAge) {
  const yearsSinceConversion = currentYear - conversionYear;
  const meetsFiveYearRule = yearsSinceConversion >= 5;
  const meetsAgeRule = currentAge >= 59.5;

  return meetsFiveYearRule && meetsAgeRule;
}

/**
 * Optimize Roth conversions across multiple years
 *
 * Strategy: Calculate optimal conversion amounts for a sequence of years
 * considering changing tax brackets, traditional balance depletion, and total tax impact
 *
 * This is a simplified optimization. Advanced optimization would consider:
 * - Future RMD requirements
 * - Social Security taxation phase-in
 * - Medicare premium surcharges (IRMAA)
 * - Variable market returns
 *
 * @param {object} plan - Retirement plan object
 * @param {number} yearsToProject - Number of years to analyze
 * @param {string} strategy - Conversion strategy: 'bracket-fill' | 'fixed' | 'percentage'
 * @returns {array} Array of conversion recommendations per year
 */
export function optimizeConversionsAcrossYears(plan, yearsToProject, strategy = 'bracket-fill') {
  const conversions = [];
  const startYear = new Date().getFullYear();

  for (let i = 0; i < yearsToProject; i++) {
    const year = startYear + i;
    const age = plan.taxProfile.currentAge + i;

    const traditionalAccounts = plan.accounts.filter(acc =>
      acc.type === '401k' || acc.type === 'IRA'
    );

    const totalTraditionalBalance = traditionalAccounts.reduce((sum, acc) => sum + acc.balance, 0);

    if (totalTraditionalBalance <= 0) {
      conversions.push({
        year,
        age,
        conversionAmount: 0,
        reason: 'No traditional balance remaining'
      });
      continue;
    }

    let conversionAmount = 0;
    let reason = '';

    switch (strategy) {
      case 'bracket-fill':
        const bracketTop = 89450 * 100;
        const taxableIncome = 100000 * 100;
        conversionAmount = calculateBracketFillConversion(taxableIncome, bracketTop, totalTraditionalBalance);
        reason = 'Fill up to top of tax bracket';
        break;

      case 'fixed':
        const annualAmount = 10000 * 100;
        const rmdRequired = age >= 73;
        conversionAmount = calculateFixedConversion(annualAmount, totalTraditionalBalance, age, rmdRequired);
        reason = 'Fixed annual conversion';
        break;

      case 'percentage':
        const percentage = 0.10;
        conversionAmount = calculatePercentageConversion(percentage, totalTraditionalBalance);
        reason = '10% of traditional balance';
        break;

      default:
        conversionAmount = 0;
        reason = 'No conversion strategy selected';
    }

    conversions.push({
      year,
      age,
      conversionAmount,
      reason,
      strategy
    });
  }

  return conversions;
}

/**
 * Calculate conversion recommendation with tax analysis
 *
 * Provides detailed analysis of a proposed conversion including:
 * - Tax impact
 * - Effective tax rate
 * - Net Roth growth potential
 *
 * @param {object} conversionPlan - Proposed conversion plan
 * @param {object} taxContext - Tax bracket and rate information
 * @returns {object} Detailed conversion analysis
 */
export function analyzeConversion(conversionPlan, taxContext) {
  const { conversionAmount } = conversionPlan;
  const { currentTaxableIncome, marginalTaxRate, totalTaxRate, assumedGrowthRate } = taxContext;

  const taxImpact = calculateConversionTax(
    conversionAmount,
    currentTaxableIncome,
    marginalTaxRate,
    totalTaxRate
  );

  const yearsInRoth = conversionPlan.yearsInRoth || 30;
  const rothGrowthFactor = Math.pow(1 + (assumedGrowthRate || 0.07), yearsInRoth);
  const rothFinalValue = Math.round(conversionAmount * rothGrowthFactor);

  const traditionalGrowthFactor = rothGrowthFactor;
  const traditionalFinalValue = Math.round(conversionAmount * traditionalGrowthFactor);
  const futureTaxOnWithdrawal = Math.round(traditionalFinalValue * (taxContext.futureTaxRate || totalTaxRate));
  const traditionalAfterTax = traditionalFinalValue - futureTaxOnWithdrawal;

  const netBenefit = rothFinalValue - (taxImpact.afterTaxCost + traditionalAfterTax);

  return {
    conversionAmount,
    taxOnConversion: taxImpact.taxOnConversion,
    effectiveTaxRate: taxImpact.effectiveTaxRate,
    rothFinalValue,
    traditionalAfterTax,
    netBenefit,
    yearsInRoth,
    recommendation: netBenefit > 0 ? 'Convert' : 'Do Not Convert',
    reasoning: netBenefit > 0
      ? `Tax savings: $${(netBenefit / 100).toLocaleString('en-US')} by converting now`
      : `Not beneficial: $${(Math.abs(netBenefit) / 100).toLocaleString('en-US')} loss by converting now`
  };
}
