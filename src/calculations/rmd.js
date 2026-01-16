/**
 * Required Minimum Distribution (RMD) calculations
 * Implements IRS Uniform Lifetime Table per SECURE Act 2.0
 */

import { getLifeExpectancyFactor, getRMDStartAge } from '../../config/loader.js';

// Re-export for convenience
export { getLifeExpectancyFactor, getRMDStartAge };

export function calculateRMD(accountBalance, age) {
  const factor = getLifeExpectancyFactor(age);

  if (!factor || factor <= 0) {
    return 0;
  }

  return accountBalance / factor;
}

export function mustTakeRMD(age, birthYear) {
  const currentYear = new Date().getFullYear();
  const rmdStartAge = birthYear ? getRMDStartAge(birthYear) : getRMDStartAge();

  if (age < rmdStartAge) {
    return false;
  }

  if (birthYear) {
    const ageStartYear = birthYear + rmdStartAge;
    const turned72In2023 = birthYear === 1951;

    if (turned72In2023) {
      return age >= getRMDStartAge(1951);
    }

    return currentYear >= ageStartYear;
  }

  return age >= getRMDStartAge();
}

export function calculateRMDForAccount(account, age) {
  if (!mustTakeRMD(age)) {
    return 0;
  }

  const accountBalance = account.balance || 0;
  const accountType = account.type;

  if (accountType === 'Roth' || accountType === 'HSA' || accountType === 'Taxable') {
    return 0;
  }

  return calculateRMD(accountBalance, age);
}

export function calculateTotalRMD(accounts, age) {
  return accounts.reduce((total, account) => {
    return total + calculateRMDForAccount(account, age);
  }, 0);
}

export function getRMDDeadline(age, birthYear) {
  if (!mustTakeRMD(age, birthYear)) {
    return null;
  }

  const currentYear = new Date().getFullYear();
  const rmdStartAge = getRMDStartAge(birthYear);

  if (age === rmdStartAge) {
    return 'April 1 of the year after turning ' + rmdStartAge;
  }

  return 'December 31 of current year';
}
