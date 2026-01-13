/**
 * Tax Calculations - Pure functions for federal tax calculations
 * All values in cents unless noted otherwise
 * Based on IRS tax brackets for 2024 and 2025
 */

/**
 * Federal income tax brackets for 2024 and 2025
 * All values in cents
 */
const TAX_BRACKETS_2024 = {
  single: [
    { rate: 0.10,  min: 0,         max: 1160000 },
    { rate: 0.12,  min: 1160001,  max: 4715000 },
    { rate: 0.22,  min: 4715001,  max: 10052500 },
    { rate: 0.24,  min: 10052501, max: 19195000 },
    { rate: 0.32,  min: 19195001, max: 24372500 },
    { rate: 0.35,  min: 24372501, max: 60935000 },
    { rate: 0.37,  min: 60935001,  max: Infinity }
  ],
  married_joint: [
    { rate: 0.10,  min: 0,         max: 2320000 },
    { rate: 0.12,  min: 2320001,  max: 9430000 },
    { rate: 0.22,  min: 9430001,  max: 20105000 },
    { rate: 0.24,  min: 20105001, max: 38390000 },
    { rate: 0.32,  min: 38390001, max: 48745000 },
    { rate: 0.35,  min: 48745001, max: 73120000 },
    { rate: 0.37,  min: 73120001,  max: Infinity }
  ],
  married_separate: [
    { rate: 0.10,  min: 0,         max: 1160000 },
    { rate: 0.12,  min: 1160001,  max: 4715000 },
    { rate: 0.22,  min: 4715001,  max: 10052500 },
    { rate: 0.24,  min: 10052501, max: 19195000 },
    { rate: 0.32,  min: 19195001, max: 24372500 },
    { rate: 0.35,  min: 24372501, max: 36560000 },
    { rate: 0.37,  min: 36560001,  max: Infinity }
  ],
  head_of_household: [
    { rate: 0.10,  min: 0,         max: 1655000 },
    { rate: 0.12,  min: 1655001,  max: 6310000 },
    { rate: 0.22,  min: 6310001,  max: 10050000 },
    { rate: 0.24,  min: 10050001, max: 19195000 },
    { rate: 0.32,  min: 19195001, max: 24370000 },
    { rate: 0.35,  min: 24370001, max: 60935000 },
    { rate: 0.37,  min: 60935001,  max: Infinity }
  ]
};

const TAX_BRACKETS_2025 = {
  single: [
    { rate: 0.10,  min: 0,         max: 1192500 },
    { rate: 0.12,  min: 1192501,  max: 4847500 },
    { rate: 0.22,  min: 4847501,  max: 10335000 },
    { rate: 0.24,  min: 10335001, max: 19730000 },
    { rate: 0.32,  min: 19730001, max: 25052500 },
    { rate: 0.35,  min: 25052501, max: 62635000 },
    { rate: 0.37,  min: 62635001,  max: Infinity }
  ],
  married_joint: [
    { rate: 0.10,  min: 0,         max: 2385000 },
    { rate: 0.12,  min: 2385001,  max: 9695000 },
    { rate: 0.22,  min: 9695001,  max: 20670000 },
    { rate: 0.24,  min: 20670001, max: 39460000 },
    { rate: 0.32,  min: 39460001, max: 50105000 },
    { rate: 0.35,  min: 50105001, max: 75160000 },
    { rate: 0.37,  min: 75160001,  max: Infinity }
  ],
  married_separate: [
    { rate: 0.10,  min: 0,         max: 1192500 },
    { rate: 0.12,  min: 1192501,  max: 4847500 },
    { rate: 0.22,  min: 4847501,  max: 10335000 },
    { rate: 0.24,  min: 10335001, max: 19730000 },
    { rate: 0.32,  min: 19730001, max: 25052500 },
    { rate: 0.35,  min: 25052501, max: 62635000 },
    { rate: 0.37,  min: 62635001,  max: Infinity }
  ],
  head_of_household: [
    { rate: 0.10,  min: 0,         max: 1700000 },
    { rate: 0.12,  min: 1700001,  max: 6485000 },
    { rate: 0.22,  min: 6485001,  max: 10335000 },
    { rate: 0.24,  min: 10335001, max: 19730000 },
    { rate: 0.32,  min: 19730001, max: 25050000 },
    { rate: 0.35,  min: 25050001, max: 62635000 },
    { rate: 0.37,  min: 62635001,  max: Infinity }
  ]
};

/**
 * Standard deduction amounts for 2024 and 2025
 * All values in cents
 */
const STANDARD_DEDUCTIONS = {
  2024: {
    single: 1460000,
    married_joint: 2920000,
    married_separate: 1460000,
    head_of_household: 2190000
  },
  2025: {
    single: 1575000,
    married_joint: 3150000,
    married_separate: 1575000,
    head_of_household: 2362500
  }
};

/**
 * Social Security wage base limits
 * All values in cents
 */
const SS_WAGE_BASE = {
  2024: 16860000,
  2025: 17610000
};

/**
 * Get tax brackets for a given year and filing status
 * @param {number} year - Tax year (2024 or 2025)
 * @param {string} filingStatus - Filing status ('single', 'married_joint', 'married_separate', 'head_of_household')
 * @returns {Array} Tax brackets for the year and status
 */
export function getTaxBrackets(year, filingStatus) {
  const brackets = year === 2024 ? TAX_BRACKETS_2024 : TAX_BRACKETS_2025;

  if (!brackets || !brackets[filingStatus]) {
    throw new Error(`Invalid filing status or year: ${filingStatus}, ${year}`);
  }

  return brackets[filingStatus];
}

/**
 * Get standard deduction for a given year and filing status
 * @param {number} year - Tax year (2024 or 2025)
 * @param {string} filingStatus - Filing status
 * @returns {number} Standard deduction in cents
 */
export function getStandardDeduction(year, filingStatus) {
  const deductions = year === 2024 ? STANDARD_DEDUCTIONS[2024] : STANDARD_DEDUCTIONS[2025];

  if (!deductions || !deductions[filingStatus]) {
    throw new Error(`Invalid filing status or year: ${filingStatus}, ${year}`);
  }

  return deductions[filingStatus];
}

/**
 * Calculate federal income tax using progressive brackets
 * @param {number} income - Taxable income in cents
 * @param {string} filingStatus - Filing status
 * @param {number} year - Tax year (2024 or 2025)
 * @returns {number} Tax liability in cents
 */
export function calculateFederalTax(income, filingStatus, year = 2025) {
  const brackets = getTaxBrackets(year, filingStatus);
  const standardDeduction = getStandardDeduction(year, filingStatus);

  const taxableIncome = Math.max(0, income - standardDeduction);

  let totalTax = 0;
  let remainingIncome = taxableIncome;

  for (const bracket of brackets) {
    if (remainingIncome <= 0) break;

    const taxableInBracket = Math.min(
      remainingIncome,
      bracket.max === Infinity ? remainingIncome : (bracket.max - bracket.min + 1)
    );

    const taxInBracket = taxableInBracket * bracket.rate;
    totalTax += taxInBracket;

    remainingIncome -= taxableInBracket;
  }

  return Math.round(totalTax);
}

/**
 * Calculate effective tax rate
 * @param {number} tax - Total tax in cents
 * @param {number} income - Gross income in cents
 * @returns {number} Effective tax rate as decimal
 */
export function calculateEffectiveTaxRate(tax, income) {
  if (income <= 0) return 0;
  return tax / income;
}

/**
 * Calculate marginal tax rate for a given income
 * @param {number} income - Taxable income in cents
 * @param {string} filingStatus - Filing status
 * @param {number} year - Tax year (2024 or 2025)
 * @returns {number} Marginal tax rate as decimal
 */
export function getMarginalTaxRate(income, filingStatus, year = 2025) {
  const brackets = getTaxBrackets(year, filingStatus);
  const standardDeduction = getStandardDeduction(year, filingStatus);
  const taxableIncome = Math.max(0, income - standardDeduction);

  for (const bracket of brackets) {
    if (taxableIncome >= bracket.min && (taxableIncome <= bracket.max || bracket.max === Infinity)) {
      return bracket.rate;
    }
  }

  return 0.37;
}

/**
 * Calculate Social Security tax (6.2% on wages up to wage base)
 * @param {number} wages - Wages in cents
 * @param {number} year - Tax year (2024 or 2025)
 * @returns {number} Social Security tax in cents
 */
export function calculateSocialSecurityTax(wages, year = 2025) {
  const wageBase = SS_WAGE_BASE[year] || SS_WAGE_BASE[2025];
  const taxableWages = Math.min(wages, wageBase);
  return Math.round(taxableWages * 0.062);
}

/**
 * Calculate Medicare tax (1.45% on all wages + 0.9% additional on wages over threshold)
 * @param {number} wages - Wages in cents
 * @param {string} filingStatus - Filing status for additional Medicare threshold
 * @param {number} year - Tax year (2024 or 2025)
 * @returns {number} Total Medicare tax in cents
 */
export function calculateMedicareTax(wages, filingStatus, year = 2025) {
  const additionalMedicareThresholds = {
    single: 20000000,
    married_joint: 25000000,
    married_separate: 12500000,
    head_of_household: 20000000
  };

  const threshold = additionalMedicareThresholds[filingStatus] || additionalMedicareThresholds.single;
  const additionalMedicareTaxable = Math.max(0, wages - threshold);
  const additionalMedicareTax = Math.round(additionalMedicareTaxable * 0.009);

  const standardMedicareTax = Math.round(wages * 0.0145);

  return standardMedicareTax + additionalMedicareTax;
}

/**
 * Calculate total FICA tax (Social Security + Medicare)
 * @param {number} wages - Wages in cents
 * @param {string} filingStatus - Filing status
 * @param {number} year - Tax year (2024 or 2025)
 * @returns {object} Object with ssTax, medicareTax, and totalFicaTax
 */
export function calculateFicaTax(wages, filingStatus, year = 2025) {
  const ssTax = calculateSocialSecurityTax(wages, year);
  const medicareTax = calculateMedicareTax(wages, filingStatus, year);

  return {
    ssTax,
    medicareTax,
    totalFicaTax: ssTax + medicareTax
  };
}

/**
 * Long-term capital gains tax brackets and thresholds
 * All values in cents
 */
const LT_CAPITAL_GAINS_2024 = {
  single: [
    { rate: 0.00,  min: 0,         max: 4702500 },
    { rate: 0.15,  min: 4702501,  max: 51890000 },
    { rate: 0.20,  min: 51890001,  max: Infinity }
  ],
  married_joint: [
    { rate: 0.00,  min: 0,         max: 9405000 },
    { rate: 0.15,  min: 9405001,  max: 58375000 },
    { rate: 0.20,  min: 58375001,  max: Infinity }
  ]
};

const LT_CAPITAL_GAINS_2025 = {
  single: [
    { rate: 0.00,  min: 0,         max: 4835000 },
    { rate: 0.15,  min: 4835001,  max: 53340000 },
    { rate: 0.20,  min: 53340001,  max: Infinity }
  ],
  married_joint: [
    { rate: 0.00,  min: 0,         max: 9670000 },
    { rate: 0.15,  min: 9670001,  max: 60005000 },
    { rate: 0.20,  min: 60005001,  max: Infinity }
  ]
};

/**
 * Net Investment Income Tax (NIIT) thresholds
 * All values in cents
 */
const NIIT_THRESHOLDS = {
  single: 20000000,
  married_joint: 25000000,
  married_separate: 12500000,
  head_of_household: 20000000
};

const RMD_AGE_REQUIREMENTS = {
  'before_1950': 70.5,
  '1950-1951': 72,
  '1951-1959': 73,
  '1960_or_later': 75
};

/**
 * Calculate long-term capital gains tax
 * @param {number} gains - Capital gains amount in cents
 * @param {string} filingStatus - Filing status ('single', 'married_joint')
 * @param {number} year - Tax year (2024 or 2025)
 * @returns {number} Capital gains tax in cents
 */
export function calculateLongTermCapitalGainsTax(gains, filingStatus, year = 2025) {
  const brackets = year === 2024 ? LT_CAPITAL_GAINS_2024 : LT_CAPITAL_GAINS_2025;

  if (!brackets || !brackets[filingStatus]) {
    throw new Error(`Invalid filing status or year: ${filingStatus}, ${year}`);
  }

  let totalTax = 0;
  let remainingGains = gains;

  for (const bracket of brackets[filingStatus]) {
    if (remainingGains <= 0) break;

    const taxableInBracket = Math.min(
      remainingGains,
      bracket.max === Infinity ? remainingGains : (bracket.max - bracket.min + 1)
    );

    const taxInBracket = taxableInBracket * bracket.rate;
    totalTax += taxInBracket;

    remainingGains -= taxableInBracket;
  }

  return Math.round(totalTax);
}

/**
 * Calculate short-term capital gains tax (taxed as ordinary income)
 * @param {number} gains - Capital gains amount in cents
 * @param {string} filingStatus - Filing status
 * @param {number} year - Tax year (2024 or 2025)
 * @returns {number} Capital gains tax in cents
 */
export function calculateShortTermCapitalGainsTax(gains, filingStatus, year = 2025) {
  return calculateFederalTax(gains, filingStatus, year);
}

/**
 * Calculate capital gains tax based on holding period
 * @param {number} gains - Capital gains amount in cents
 * @param {number} holdingPeriodMonths - Months held (<=12 = short-term, >12 = long-term)
 * @param {string} filingStatus - Filing status
 * @param {number} year - Tax year (2024 or 2025)
 * @returns {number} Capital gains tax in cents
 */
export function calculateCapitalGainsTax(gains, holdingPeriodMonths, filingStatus, year = 2025) {
  if (holdingPeriodMonths <= 12) {
    return calculateShortTermCapitalGainsTax(gains, filingStatus, year);
  }
  return calculateLongTermCapitalGainsTax(gains, filingStatus, year);
}

/**
 * Calculate Net Investment Income Tax (NIIT) - 3.8% on investment income over threshold
 * @param {number} netInvestmentIncome - Net investment income in cents
 * @param {string} filingStatus - Filing status
 * @param {number} year - Tax year (2024 or 2025)
 * @returns {number} NIIT in cents
 */
export function calculateNIIT(netInvestmentIncome, filingStatus, year = 2025) {
  const threshold = NIIT_THRESHOLDS[filingStatus] || NIIT_THRESHOLDS.single;
  const incomeOverThreshold = Math.max(0, netInvestmentIncome - threshold);
  return Math.round(incomeOverThreshold * 0.038);
}

/**
 * Get RMD age requirement based on birth year
 * @param {number} birthYear - Birth year
 * @returns {number} RMD age requirement
 */
export function getRmdAgeRequirement(birthYear) {
  if (birthYear < 1950) return RMD_AGE_REQUIREMENTS['before_1950'];
  if (birthYear < 1951) return RMD_AGE_REQUIREMENTS['1950-1951'];
  if (birthYear < 1960) return RMD_AGE_REQUIREMENTS['1951-1959'];
  return RMD_AGE_REQUIREMENTS['1960_or_later'];
}

/**
 * IRS Uniform Lifetime Table for RMD calculations (2024)
 * Based on life expectancy factors by age
 */
const RMD_LIFE_EXPECTANCY_FACTORS = {
  72: 27.4,
  73: 26.5,
  74: 25.5,
  75: 24.7,
  76: 23.8,
  77: 23.1,
  78: 22.4,
  79: 21.7,
  80: 21.1,
  81: 20.5,
  82: 19.9,
  83: 19.3,
  84: 18.7,
  85: 18.0,
  86: 17.3,
  87: 16.6,
  88: 15.9,
  89: 15.2,
  90: 14.4,
  91: 13.7,
  92: 13.1,
  93: 12.5,
  94: 11.9,
  95: 11.4,
  96: 10.9,
  97: 10.4,
  98: 9.9,
  99: 9.4,
  100: 8.9,
  101: 8.4,
  102: 7.9,
  103: 7.5,
  104: 7.1,
  105: 6.7,
  106: 6.4,
  107: 6.0,
  108: 5.7,
  109: 5.4,
  110: 5.1,
  111: 4.8,
  112: 4.6,
  113: 4.4,
  114: 4.2,
  115: 4.0
};

/**
 * Calculate Required Minimum Distribution (RMD) for a given year and account balance
 * @param {number} accountBalance - Account balance at end of previous year (cents)
 * @param {number} age - Account owner's age
 * @param {number} year - Tax year
 * @returns {number} RMD amount in cents
 */
export function calculateRMD(accountBalance, age, year = 2025) {
  if (age < 72) {
    return 0;
  }

  const rmdAge = getRmdAgeRequirement(2026 - age);
  const lifeExpectancyFactor = RMD_LIFE_EXPECTANCY_FACTORS[rmdAge];

  if (!lifeExpectancyFactor) {
    throw new Error(`No life expectancy factor available for age ${rmdAge}`);
  }

  const rmdAmount = accountBalance / lifeExpectancyFactor;
  return Math.round(rmdAmount);
}

