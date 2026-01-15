/**
 * Loader module for tax bracket and deduction config files.
 * Provides functions to read federal and state tax data from config files.
 */

import { data as states2024 } from './states-2024.js';
import { data as states2025 } from './states-2025.js';

// Embedded JSON data for federal tax brackets and standard deductions
const federal2024 = {
  brackets: {
    single: [
      { rate: 0.1, min: 0, max: 1160000 },
      { rate: 0.12, min: 1160001, max: 4715000 },
      { rate: 0.22, min: 4715001, max: 10052500 },
      { rate: 0.24, min: 10052501, max: 19195000 },
      { rate: 0.32, min: 19195001, max: 24372500 },
      { rate: 0.35, min: 24372501, max: 60935000 },
      { rate: 0.37, min: 60935001, max: null },
    ],
    married_joint: [
      { rate: 0.1, min: 0, max: 2320000 },
      { rate: 0.12, min: 2320001, max: 9430000 },
      { rate: 0.22, min: 9430001, max: 20105000 },
      { rate: 0.24, min: 20105001, max: 38390000 },
      { rate: 0.32, min: 38390001, max: 48745000 },
      { rate: 0.35, min: 48745001, max: 73120000 },
      { rate: 0.37, min: 73120001, max: null },
    ],
    married_separate: [
      { rate: 0.1, min: 0, max: 1160000 },
      { rate: 0.12, min: 1160001, max: 4715000 },
      { rate: 0.22, min: 4715001, max: 10052500 },
      { rate: 0.24, min: 10052501, max: 19195000 },
      { rate: 0.32, min: 19195001, max: 24372500 },
      { rate: 0.35, min: 24372501, max: 36560000 },
      { rate: 0.37, min: 36560001, max: null },
    ],
    head_of_household: [
      { rate: 0.1, min: 0, max: 1655000 },
      { rate: 0.12, min: 1655001, max: 6310000 },
      { rate: 0.22, min: 6310001, max: 10050000 },
      { rate: 0.24, min: 10050001, max: 19195000 },
      { rate: 0.32, min: 19195001, max: 24370000 },
      { rate: 0.35, min: 24370001, max: 60935000 },
      { rate: 0.37, min: 60935001, max: null },
    ],
  },
  standardDeduction: {
    single: 1460000,
    married_joint: 2920000,
    married_separate: 1460000,
    head_of_household: 2190000,
  },
};

const federal2025 = {
  brackets: {
    single: [
      { rate: 0.1, min: 0, max: 1192500 },
      { rate: 0.12, min: 1192501, max: 4847500 },
      { rate: 0.22, min: 4847501, max: 10335000 },
      { rate: 0.24, min: 10335001, max: 19730000 },
      { rate: 0.32, min: 19730001, max: 25052500 },
      { rate: 0.35, min: 25052501, max: 62635000 },
      { rate: 0.37, min: 62635001, max: null },
    ],
    married_joint: [
      { rate: 0.1, min: 0, max: 2385000 },
      { rate: 0.12, min: 2385001, max: 9695000 },
      { rate: 0.22, min: 9695001, max: 20670000 },
      { rate: 0.24, min: 20670001, max: 39460000 },
      { rate: 0.32, min: 39460001, max: 50105000 },
      { rate: 0.35, min: 50105001, max: 75160000 },
      { rate: 0.37, min: 75160001, max: null },
    ],
    married_separate: [
      { rate: 0.1, min: 0, max: 1192500 },
      { rate: 0.12, min: 1192501, max: 4847500 },
      { rate: 0.22, min: 4847501, max: 10335000 },
      { rate: 0.24, min: 10335001, max: 19730000 },
      { rate: 0.32, min: 19730001, max: 25052500 },
      { rate: 0.35, min: 25052501, max: 62635000 },
      { rate: 0.37, min: 62635001, max: null },
    ],
    head_of_household: [
      { rate: 0.1, min: 0, max: 1700000 },
      { rate: 0.12, min: 1700001, max: 6485000 },
      { rate: 0.22, min: 6485001, max: 10335000 },
      { rate: 0.24, min: 10335001, max: 19730000 },
      { rate: 0.32, min: 19730001, max: 25050000 },
      { rate: 0.35, min: 25050001, max: 62635000 },
      { rate: 0.37, min: 62635001, max: null },
    ],
  },
  standardDeduction: {
    single: 1575000,
    married_joint: 3150000,
    married_separate: 1575000,
    head_of_household: 2362500,
  },
};

// Cache for config data
const federalCache = {
  2024: federal2024,
  2025: federal2025,
};

const statesCache = {
  2024: states2024,
  2025: states2025,
};

/**
 * Load federal tax brackets for a given year
 * @param {number} year - Tax year (2024 or 2025)
 * @returns {Object} Federal tax brackets for all filing statuses
 */
export function loadFederalBrackets(year) {
  const config = federalCache[year];
  if (!config) {
    throw new Error(`Invalid tax year: ${year}. Must be 2024 or 2025.`);
  }
  return config.brackets;
}

/**
 * Load federal standard deduction for a given year and filing status
 * @param {number} year - Tax year (2024 or 2025)
 * @param {string} filingStatus - Filing status (single, married_joint, married_separate, head_of_household)
 * @returns {number} Standard deduction in cents
 */
export function loadFederalStandardDeduction(year, filingStatus) {
  const config = federalCache[year];
  if (!config) {
    throw new Error(`Invalid tax year: ${year}. Must be 2024 or 2025.`);
  }
  return config.standardDeduction[filingStatus];
}

/**
 * Load state tax brackets for a given state and year
 * @param {string} stateCode - Two-letter state code (e.g., 'CA', 'NY', 'DC')
 * @param {number} year - Tax year (2024 or 2025)
 * @returns {Object} State tax brackets for all filing statuses
 */
export function loadStateBrackets(stateCode, year) {
  const upperState = stateCode.toUpperCase();

  // States with no income tax - return zero-rate brackets
  const noTaxStates = ['AK', 'FL', 'NV', 'SD', 'TN', 'TX', 'WA', 'WY', 'NH'];
  if (noTaxStates.includes(upperState)) {
    return {
      single: [{ rate: 0.0, min: 0, max: null }],
      married_joint: [{ rate: 0.0, min: 0, max: null }],
      married_separate: [{ rate: 0.0, min: 0, max: null }],
      head_of_household: [{ rate: 0.0, min: 0, max: null }],
    };
  }

  const stateData = statesCache[year][upperState];
  if (!stateData) {
    throw new Error(`No tax data found for state: ${upperState} in ${year}`);
  }

  return stateData.brackets;
}

/**
 * Load state standard deduction for a given state, year, and filing status
 * @param {string} stateCode - Two-letter state code (e.g., 'CA', 'NY', 'DC')
 * @param {number} year - Tax year (2024 or 2025)
 * @param {string} filingStatus - Filing status (single, married_joint, married_separate, head_of_household)
 * @returns {number} Standard deduction in cents
 */
export function loadStateStandardDeduction(stateCode, year, filingStatus) {
  const upperState = stateCode.toUpperCase();

  // States with no income tax - return 0
  const noTaxStates = ['AK', 'FL', 'NV', 'SD', 'TN', 'TX', 'WA', 'WY', 'NH'];
  if (noTaxStates.includes(upperState)) {
    return 0;
  }

  const stateData = statesCache[year][upperState];
  if (!stateData) {
    throw new Error(`No tax data found for state: ${upperState} in ${year}`);
  }

  return stateData.standardDeduction[filingStatus];
}
