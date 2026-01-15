/**
 * Loader module for tax bracket and deduction JSON config files.
 * Provides functions to read federal and state tax data from JSON files.
 */

import federal2024 from './federal-2024.json' assert { type: 'json' };
import federal2025 from './federal-2025.json' assert { type: 'json' };
import states2024 from './states-2024.json' assert { type: 'json' };
import states2025 from './states-2025.json' assert { type: 'json' };

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

  const config = statesCache[year];
  if (!config) {
    throw new Error(`Invalid tax year: ${year}. Must be 2024 or 2025.`);
  }

  const stateData = config[upperState];
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

  const config = statesCache[year];
  if (!config) {
    throw new Error(`Invalid tax year: ${year}. Must be 2024 or 2025.`);
  }

  const stateData = config[upperState];
  if (!stateData) {
    throw new Error(`No tax data found for state: ${upperState} in ${year}`);
  }

  return stateData.standardDeduction[filingStatus];
}
