/**
 * Required Minimum Distribution (RMD) calculations
 * Implements IRS Uniform Lifetime Table per SECURE Act 2.0
 */

const UNIFORM_LIFETIME_TABLE = {
  72: 27.4,
  73: 26.5,
  74: 25.5,
  75: 24.6,
  76: 23.7,
  77: 22.9,
  78: 22.0,
  79: 21.1,
  80: 20.2,
  81: 19.4,
  82: 18.5,
  83: 17.7,
  84: 16.8,
  85: 16.0,
  86: 15.2,
  87: 14.4,
  88: 13.7,
  89: 12.9,
  90: 12.2,
  91: 11.5,
  92: 10.8,
  93: 10.1,
  94: 9.5,
  95: 8.9,
  96: 8.4,
  97: 7.8,
  98: 7.3,
  99: 6.8,
  100: 6.4,
  101: 6.0,
  102: 5.6,
  103: 5.2,
  104: 4.9,
  105: 4.6,
  106: 4.3,
  107: 4.0,
  108: 3.7,
  109: 3.5,
  110: 3.4,
  111: 3.3,
  112: 3.1,
  113: 3.0,
  114: 2.9,
  115: 2.8,
  116: 2.7,
  117: 2.5,
  118: 2.3,
  119: 2.1,
  120: 1.9
};

export function getLifeExpectancyFactor(age) {
  if (age < 72) {
    return null;
  }

  if (age > 120) {
    age = 120;
  }

  return UNIFORM_LIFETIME_TABLE[age] || null;
}

export function calculateRMD(accountBalance, age) {
  const factor = getLifeExpectancyFactor(age);

  if (!factor || factor <= 0) {
    return 0;
  }

  return accountBalance / factor;
}

export function mustTakeRMD(age, birthYear) {
  const currentYear = new Date().getFullYear();

  if (age < 72) {
    return false;
  }

  if (birthYear) {
    const age73Year = birthYear + 73;
    const turned72In2023 = birthYear === 1951;

    if (turned72In2023) {
      return age >= 72;
    }

    return currentYear >= age73Year;
  }

  return age >= 73;
}

export function getRMDStartAge(birthYear) {
  if (!birthYear) {
    return 73;
  }

  if (birthYear === 1951) {
    return 72;
  }

  return 73;
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
