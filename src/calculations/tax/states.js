/**
 * State tax calculation functions using JSON config data.
 * All values in cents.
 */

import { loadStateBrackets, loadStateStandardDeduction } from './config/loader.js';

/**
 * Get state tax brackets for given state, year, and filing status
 * @param {string} state - State abbreviation (2-letter code or null)
 * @param {number} year - Tax year (2024 or 2025)
 * @param {string} filingStatus - Filing status
 * @returns {Array} State tax brackets
 */
export function getStateTaxBrackets(state, year, filingStatus) {
  if (!state) return null;

  const brackets = loadStateBrackets(state, year);
  return brackets[filingStatus];
}

/**
 * Get state standard deduction
 * @param {string} state - State abbreviation ('AL', 'AK', etc., or null)
 * @param {number} year - Tax year (2024 or 2025)
 * @param {string} filingStatus - Filing status
 * @returns {number} Standard deduction in cents
 */
export function getStateStandardDeduction(state, year, filingStatus) {
  if (!state) return 0;

  return loadStateStandardDeduction(state, year, filingStatus);
}

/**
 * Calculate state income tax
 * @param {string} state - State abbreviation ('DC', 'CA', 'NY', etc.)
 * @param {number} income - Taxable income in cents
 * @param {string} filingStatus - Filing status
 * @param {number} year - Tax year (2024 or 2025)
 * @returns {number} State tax liability in cents
 */
export function calculateStateTax(state, income, filingStatus, year = 2025) {
  if (!state) return 0;

  const brackets = getStateTaxBrackets(state, year, filingStatus);
  const deduction = getStateStandardDeduction(state, year, filingStatus);

  const taxableIncome = Math.max(0, income - deduction);

  let totalTax = 0;
  let remainingIncome = taxableIncome;

  for (const bracket of brackets) {
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

export { loadStateBrackets, loadStateStandardDeduction };
