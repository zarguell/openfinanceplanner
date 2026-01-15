/**
 * Federal tax calculation functions using JSON config data.
 * All values in cents.
 */

import { loadFederalBrackets, loadFederalStandardDeduction } from './config/loader.js';

/**
 * Calculate federal income tax
 * @param {number} income - Taxable income in cents
 * @param {string} filingStatus - Filing status
 * @param {number} year - Tax year (2024 or 2025)
 * @returns {number} Federal tax liability in cents
 */
export function calculateFederalTax(income, filingStatus, year = 2025) {
  const brackets = loadFederalBrackets(year);
  const deduction = loadFederalStandardDeduction(year, filingStatus);

  const taxableIncome = Math.max(0, income - deduction);

  let totalTax = 0;
  let remainingIncome = taxableIncome;

  for (const bracket of brackets[filingStatus]) {
    if (remainingIncome <= 0) break;

    const taxableInBracket = Math.min(
      remainingIncome,
      bracket.max === null ? remainingIncome : bracket.max - bracket.min + 1
    );

    const taxInBracket = Math.round(taxableInBracket * bracket.rate);
    totalTax += taxInBracket;

    remainingIncome -= taxableInBracket;
  }

  return totalTax;
}

export { calculateFederalTax, loadFederalBrackets, loadFederalStandardDeduction };
