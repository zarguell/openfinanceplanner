/**
 * Tax Calculations - Pure functions for federal and state tax calculations
 * All values in cents unless noted otherwise
 * Based on IRS tax brackets for 2024 and 2025
 * Based on state tax brackets for 2024 and 2025
 */

import {
  calculateFederalTax,
  loadFederalBrackets,
  loadFederalStandardDeduction,
} from './tax/federal.js';
import {
  calculateStateTax,
  getStateTaxBrackets,
  getStateStandardDeduction,
  loadStateBrackets,
  loadStateStandardDeduction,
} from './tax/states.js';

// Re-export federal and state tax functions for backward compatibility
export {
  calculateFederalTax,
  loadFederalBrackets,
  loadFederalStandardDeduction,
} from './tax/federal.js';
export {
  calculateStateTax,
  getStateTaxBrackets,
  getStateStandardDeduction,
  loadStateBrackets,
  loadStateStandardDeduction,
};

/**
 * Get federal standard deduction for a given year and filing status
 * @param {number} year - Tax year (2024 or 2025)
 * @param {string} filingStatus - Filing status
 * @returns {number} Standard deduction in cents
 */
export function getStandardDeduction(year, filingStatus) {
  return loadFederalStandardDeduction(year, filingStatus);
}

/**
 * Calculate total income tax (federal + state)
 * @param {string} state - State abbreviation ('DC', 'CA', 'NY', or null)
 * @param {number} income - Gross income in cents
 * @param {string} filingStatus - Filing status
 * @param {number} year - Tax year
 * @returns {object} Tax breakdown with federal, state, and total
 */
export function calculateTotalTax(state, income, filingStatus, year = 2025) {
  const federalTax = calculateFederalTax(income, filingStatus, year);
  const stateTax = state ? calculateStateTax(state, income, filingStatus, year) : 0;

  return {
    federalTax,
    stateTax,
    totalTax: federalTax + stateTax,
  };
}

/**
 * Long-term capital gains tax brackets for 2024 and 2025
 * All values in cents
 */
const LTCG_BRACKETS_2024 = {
  single: [
    { rate: 0.0, min: 0, max: 4892500 },
    { rate: 0.15, min: 4892501, max: 51890000 },
    { rate: 0.2, min: 51890001, max: Infinity },
  ],
  married_joint: [
    { rate: 0.0, min: 0, max: 9785000 },
    { rate: 0.15, min: 9785001, max: 103780000 },
    { rate: 0.2, min: 103780001, max: Infinity },
  ],
  married_separate: [
    { rate: 0.0, min: 0, max: 4892500 },
    { rate: 0.15, min: 4892501, max: 51890000 },
    { rate: 0.2, min: 51890001, max: Infinity },
  ],
  head_of_household: [
    { rate: 0.0, min: 0, max: 7357500 },
    { rate: 0.15, min: 7357501, max: 77940000 },
    { rate: 0.2, min: 77940001, max: Infinity },
  ],
};

const LTCG_BRACKETS_2025 = {
  single: [
    { rate: 0.0, min: 0, max: 4920500 },
    { rate: 0.15, min: 4920501, max: 52305000 },
    { rate: 0.2, min: 52305001, max: Infinity },
  ],
  married_joint: [
    { rate: 0.0, min: 0, max: 9841000 },
    { rate: 0.15, min: 9841001, max: 104610000 },
    { rate: 0.2, min: 104610001, max: Infinity },
  ],
  married_separate: [
    { rate: 0.0, min: 0, max: 4920500 },
    { rate: 0.15, min: 4920501, max: 52305000 },
    { rate: 0.2, min: 52305001, max: Infinity },
  ],
  head_of_household: [
    { rate: 0.0, min: 0, max: 7381000 },
    { rate: 0.15, min: 7381001, max: 78340000 },
    { rate: 0.2, min: 78340001, max: Infinity },
  ],
};

/**
 * Calculate long-term capital gains tax
 * @param {number} gain - Capital gain in cents
 * @param {string} filingStatus - Filing status
 * @param {number} year - Tax year (2024 or 2025)
 * @returns {number} Long-term capital gains tax in cents
 */
export function calculateLongTermCapitalGainsTax(gain, filingStatus, year = 2025) {
  const brackets = year === 2024 ? LTCG_BRACKETS_2024 : LTCG_BRACKETS_2025;

  let totalTax = 0;
  let remainingGain = gain;

  for (const bracket of brackets[filingStatus]) {
    if (remainingGain <= 0) break;

    const taxableInBracket = Math.min(
      remainingGain,
      bracket.max === null ? remainingGain : bracket.max - bracket.min + 1
    );

    const taxInBracket = Math.round(taxableInBracket * bracket.rate);
    totalTax += taxInBracket;

    remainingGain -= taxableInBracket;
  }

  return totalTax;
}

/**
 * Calculate short-term capital gains tax (taxed as ordinary income)
 * @param {number} gain - Capital gain in cents
 * @param {string} filingStatus - Filing status
 * @param {number} year - Tax year (2024 or 2025)
 * @returns {number} Short-term capital gains tax in cents
 */
export function calculateShortTermCapitalGainsTax(gain, filingStatus, year = 2025) {
  // Short-term capital gains are taxed as ordinary income
  return calculateFederalTax(gain, filingStatus, year);
}

/**
 * Calculate Net Investment Income Tax (NIIT) - 3.8% on investment income over MAGI thresholds
 * @param {number} investmentIncome - Total investment income in cents
 * @param {number} magi - Modified Adjusted Gross Income in cents
 * @param {string} filingStatus - Filing status
 * @param {number} year - Tax year (2024 or 2025)
 * @returns {number} NIIT tax liability in cents
 */
export function calculateNetInvestmentIncomeTax(investmentIncome, magi, filingStatus, year = 2025) {
  // NIIT thresholds (same for 2024 and 2025)
  const thresholds = {
    single: 20000000, // $200,000
    married_joint: 25000000, // $250,000
    married_separate: 12500000, // $125,000
    head_of_household: 20000000, // $200,000
  };

  const threshold = thresholds[filingStatus];
  if (!threshold) {
    throw new Error(`Invalid filing status for NIIT: ${filingStatus}`);
  }

  // NIIT applies if MAGI exceeds threshold
  if (magi <= threshold) {
    return 0;
  }

  // NIIT rate is 3.8%
  const niitRate = 0.038;

  // NIIT applies to the lesser of:
  // 1. Net investment income, or
  // 2. MAGI exceeding the threshold
  const taxableAmount = Math.min(investmentIncome, magi - threshold);

  return Math.round(taxableAmount * niitRate);
}

/**
 * Calculate total capital gains tax (long-term + short-term + NIIT)
 * @param {number} longTermGain - Long-term capital gain in cents
 * @param {number} shortTermGain - Short-term capital gain in cents
 * @param {number} magi - Modified Adjusted Gross Income in cents
 * @param {string} filingStatus - Filing status
 * @param {number} year - Tax year (2024 or 2025)
 * @returns {object} Capital gains tax breakdown with ordinary tax, niit, and total
 */
export function calculateCapitalGainsTax(
  longTermGain,
  shortTermGain,
  magi,
  filingStatus,
  year = 2025
) {
  const longTermTax = calculateLongTermCapitalGainsTax(longTermGain, filingStatus, year);
  const shortTermTax = calculateShortTermCapitalGainsTax(shortTermGain, filingStatus, year);

  // NIIT applies to net capital gains
  const totalCapitalGains = longTermGain + shortTermGain;
  const niit = calculateNetInvestmentIncomeTax(totalCapitalGains, magi, filingStatus, year);

  const ordinaryTax = longTermTax + shortTermTax;

  return {
    ordinaryTax,
    niit,
    totalTax: ordinaryTax + niit,
  };
}

/**
 * Calculate Social Security tax (6.2% on wages up to $176,100 in 2025)
 * @param {number} wages - Wages in cents
 * @param {number} year - Tax year
 * @returns {number} Social Security tax in cents
 */
export function calculateSocialSecurityTax(wages, year = 2025) {
  const ssWageBase = year === 2024 ? 16860000 : 17610000; // $168,600 for 2024, $176,100 for 2025
  const taxableWages = Math.min(wages, ssWageBase);
  return Math.round(taxableWages * 0.062);
}

/**
 * Calculate Medicare tax (1.45% + additional 0.9% for high earners)
 * @param {number} wages - Wages in cents
 * @param {string} filingStatus - Filing status
 * @param {number} year - Tax year
 * @returns {number} Medicare tax in cents
 */
export function calculateMedicareTax(wages, filingStatus, year = 2025) {
  const baseRate = 0.0145;
  const additionalRate = 0.009;

  // Additional Medicare tax threshold (same for all filing statuses in 2024/2025)
  const threshold = 20000000; // $200,000

  const baseTax = Math.round(wages * baseRate);
  const additionalTax = wages > threshold ? Math.round((wages - threshold) * additionalRate) : 0;

  return baseTax + additionalTax;
}

/**
 * Calculate total FICA tax (Social Security + Medicare)
 * @param {number} wages - Wages in cents
 * @param {string} filingStatus - Filing status
 * @param {number} year - Tax year
 * @returns {object} FICA tax breakdown with ssTax, medicareTax, and totalFicaTax
 */
export function calculateFicaTax(wages, filingStatus, year = 2025) {
  const ssTax = calculateSocialSecurityTax(wages, year);
  const medicareTax = calculateMedicareTax(wages, filingStatus, year);

  return {
    ssTax,
    medicareTax,
    totalFicaTax: ssTax + medicareTax,
  };
}
