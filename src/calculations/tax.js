/**
 * Tax Calculations - Pure functions for federal and state tax calculations
 * All values in cents unless noted otherwise
 * Based on IRS tax brackets for 2024 and 2025
 * Based on state tax brackets for 2024 and 2025 (DC, CA, NY)
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
 * District of Columbia (DC) Tax Brackets - 2024 & 2025
 * All values in cents
 */
const DC_TAX_BRACKETS_2024 = {
  single: [
    { rate: 0.04,  min: 0,         max: 1000000 },
    { rate: 0.06,  min: 1000001,  max: 4000000 },
    { rate: 0.065, min: 4000001,  max: 6000000 },
    { rate: 0.085, min: 6000001,  max: 25000000 },
    { rate: 0.0925, min: 25000001, max: 50000000 },
    { rate: 0.0975, min: 50000001, max: 100000000 },
    { rate: 0.1075, min: 100000001, max: Infinity }
  ],
  married_joint: [
    { rate: 0.04,  min: 0,         max: 1000000 },
    { rate: 0.06,  min: 1000001,  max: 4000000 },
    { rate: 0.065, min: 4000001,  max: 6000000 },
    { rate: 0.085, min: 6000001,  max: 25000000 },
    { rate: 0.0925, min: 25000001, max: 50000000 },
    { rate: 0.0975, min: 50000001, max: 100000000 },
    { rate: 0.1075, min: 100000001, max: Infinity }
  ],
  married_separate: [
    { rate: 0.04,  min: 0,         max: 1000000 },
    { rate: 0.06,  min: 1000001,  max: 4000000 },
    { rate: 0.065, min: 4000001,  max: 6000000 },
    { rate: 0.085, min: 6000001,  max: 25000000 },
    { rate: 0.0925, min: 25000001, max: 50000000 },
    { rate: 0.0975, min: 50000001, max: 100000000 },
    { rate: 0.1075, min: 100000001, max: Infinity }
  ],
  head_of_household: [
    { rate: 0.04,  min: 0,         max: 1000000 },
    { rate: 0.06,  min: 1000001,  max: 4000000 },
    { rate: 0.065, min: 4000001,  max: 6000000 },
    { rate: 0.085, min: 6000001,  max: 25000000 },
    { rate: 0.0925, min: 25000001, max: 50000000 },
    { rate: 0.0975, min: 50000001, max: 100000000 },
    { rate: 0.1075, min: 100000001, max: Infinity }
  ]
};

const DC_TAX_BRACKETS_2025 = DC_TAX_BRACKETS_2024; // Same brackets as 2024

/**
 * DC Standard Deductions - 2024 & 2025
 * All values in cents
 */
const DC_STANDARD_DEDUCTIONS_2024 = {
  single: 1500000,
  married_joint: 3000000,
  married_separate: 1500000,
  head_of_household: 2250000
};

const DC_STANDARD_DEDUCTIONS_2025 = {
  single: 1500000,
  married_joint: 3000000,
  married_separate: 1500000,
  head_of_household: 2250000
};

/**
 * California (CA) Tax Brackets - 2024 & 2025
 * Progressive rates: 1%, 2%, 4%, 6%, 8%, 9.3%, 10.3%, 11.3%, 12.3%
 * All values in cents
 */
const CA_TAX_BRACKETS_2024 = {
  single: [
    { rate: 0.01,  min: 0,         max: 1107900 },
    { rate: 0.02,  min: 1107901,  max: 2626400 },
    { rate: 0.04,  min: 2626401,  max: 4145200 },
    { rate: 0.06,  min: 4145201,  max: 5754200 },
    { rate: 0.08,  min: 5754201,  max: 7272400 },
    { rate: 0.093, min: 7272401,  max: 37147900 },
    { rate: 0.103, min: 37147901, max: 44577100 },
    { rate: 0.113, min: 44577101, max: 74295300 },
    { rate: 0.123, min: 74295301, max: Infinity }
  ],
  married_joint: [
    { rate: 0.01,  min: 0,         max: 2215800 },
    { rate: 0.02,  min: 2215801,  max: 5252800 },
    { rate: 0.04,  min: 5252801,  max: 8290400 },
    { rate: 0.06,  min: 8290401,  max: 11508400 },
    { rate: 0.08,  min: 11508401, max: 14544800 },
    { rate: 0.093,  min: 14544801, max: 74295800 },
    { rate: 0.103, min: 74295801, max: 89154200 },
    { rate: 0.113, min: 89154201, max: 148590600 },
    { rate: 0.123, min: 148590601, max: Infinity }
  ],
  married_separate: [
    { rate: 0.01,  min: 0,         max: 1107900 },
    { rate: 0.02,  min: 1107901,  max: 2626400 },
    { rate: 0.04,  min: 2626401,  max: 4145200 },
    { rate: 0.06,  min: 4145201,  max: 5754200 },
    { rate: 0.08,  min: 5754201,  max: 7272400 },
    { rate: 0.093,  min: 7272401,  max: 37147900 },
    { rate: 0.103, min: 37147901, max: 44577100 },
    { rate: 0.113, min: 44577101, max: 74295300 },
    { rate: 0.123, min: 74295301, max: Infinity }
  ],
  head_of_household: [
    { rate: 0.01,  min: 0,         max: 2215800 },
    { rate: 0.02,  min: 2215801,  max: 5252800 },
    { rate: 0.04,  min: 5252801,  max: 8290400 },
    { rate: 0.06,  min: 8290401,  max: 11508400 },
    { rate: 0.08,  min: 11508401, max: 14544800 },
    { rate: 0.093,  min: 14544801, max: 74295800 },
    { rate: 0.103, min: 74295801, max: 89154200 },
    { rate: 0.113, min: 89154201, max: 148590600 },
    { rate: 0.123, min: 148590601, max: Infinity }
  ]
};

const CA_TAX_BRACKETS_2025 = {
  single: [
    { rate: 0.01,  min: 0,         max: 1192500 },
    { rate: 0.02,  min: 1192501,  max: 2826400 },
    { rate: 0.04,  min: 2826401,  max: 4145200 },
    { rate: 0.06,  min: 4145201,  max: 5786400 },
    { rate: 0.08,  min: 5786401,  max: 7283200 },
    { rate: 0.093,  min: 7283201,  max: 37591000 },
    { rate: 0.103, min: 37591001, max: 49125200 },
    { rate: 0.113, min: 49125201, max: 61175700 },
    { rate: 0.123, min: 61175701, max: Infinity }
  ],
  married_joint: [
    { rate: 0.01,  min: 0,         max: 2385000 },
    { rate: 0.02,  min: 2385001,  max: 5652800 },
    { rate: 0.04,  min: 5652801,  max: 8904000 },
    { rate: 0.06,  min: 8904001,  max: 12574800 },
    { rate: 0.08,  min: 12574801, max: 15610800 },
    { rate: 0.093,  min: 15610801, max: 80491700 },
    { rate: 0.103, min: 80491701, max: 100843700 },
    { rate: 0.113, min: 100843701, max: 148590600 },
    { rate: 0.123, min: 148590601, max: Infinity }
  ],
  married_separate: [
    { rate: 0.01,  min: 0,         max: 1192500 },
    { rate: 0.02,  min: 1192501,  max: 2826400 },
    { rate: 0.04,  min: 2826401,  max: 4145200 },
    { rate: 0.06,  min: 4145201,  max: 5786400 },
    { rate: 0.08,  min: 5786401,  max: 7283200 },
    { rate: 0.093,  min: 7283201,  max: 37591000 },
    { rate: 0.103, min: 37591001, max: 49125200 },
    { rate: 0.113, min: 49125201, max: 74295800 },
    { rate: 0.123, min: 74295301, max: Infinity }
  ],
  head_of_household: [
    { rate: 0.01,  min: 0,         max: 2230800 },
    { rate: 0.02,  min: 2230801,  max: 5287200 },
    { rate: 0.04,  min: 5287201,  max: 8337200 },
    { rate: 0.06,  min: 8337201,  max: 11827600 },
    { rate: 0.08,  min: 11827601, max: 14609600 },
    { rate: 0.093,  min: 14609601, max: 75347100 },
    { rate: 0.103, min: 75347101, max: 100601600 },
    { rate: 0.113, min: 100601601, max: 148590600 },
    { rate: 0.123, min: 148590601, max: Infinity }
  ]
};

/**
 * CA Standard Deductions - 2024 & 2025
 * California uses standard deduction tables for incomes under $100,000
 * For incomes over $100,000, use tax rate schedules
 * All values in cents
 */
const CA_STANDARD_DEDUCTIONS_2024 = {
  single: 5272000,      // $5,272
  married_joint: 10544000, // $10,544
  married_separate: 5272000, // $5,272
  head_of_household: 7944000   // $7,944
};

const CA_STANDARD_DEDUCTIONS_2025 = {
  single: 5392000,      // $5,392
  married_joint: 10784000, // $10,784
  married_separate: 5392000, // $5,392
  head_of_household: 8130000   // $8,130
};

/**
 * New York State Tax Brackets - 2024 & 2025
 * Progressive rates: 4% to 10.9%
 * All values in cents
 */
const NY_TAX_BRACKETS_2024 = {
  single: [
    { rate: 0.04,  min: 0,         max: 8500000 },
    { rate: 0.045, min: 8500001,  max: 11700000 },
    { rate: 0.0525, min: 11700001, max: 13900000 },
    { rate: 0.055,  min: 13900001, max: 16155000 },
    { rate: 0.06,  min: 16155001, max: 32320000 },
    { rate: 0.0685, min: 32320001, max: 21540000 },
    { rate: 0.0965, min: 21540001, max: 107650000 },
    { rate: 0.1033, min: 107650001, max: 500000000 },
    { rate: 0.109,  min: 500000001, max: Infinity }
  ],
  married_joint: [
    { rate: 0.04,  min: 0,         max: 17150000 },
    { rate: 0.045, min: 17150001, max: 23400000 },
    { rate: 0.0525, min: 23400001, max: 27800000 },
    { rate: 0.055,  min: 27800001, max: 32310000 },
    { rate: 0.06,  min: 32310001, max: 64640000 },
    { rate: 0.0685, min: 64640001, max: 43080000 },
    { rate: 0.0965, min: 43080001, max: 215300000 },
    { rate: 0.1033, min: 215300001, max: 1000000000 },
    { rate: 0.109,  min: 1000000001, max: Infinity }
  ],
  married_separate: [
    { rate: 0.04,  min: 0,         max: 8500000 },
    { rate: 0.045, min: 8500001,  max: 11700000 },
    { rate: 0.0525, min: 11700001, max: 13900000 },
    { rate: 0.055, min: 13900001, max: 16155000 },
    { rate: 0.06,  min: 16155001, max: 32320000 },
    { rate: 0.0685, min: 32320001, max: 21540000 },
    { rate: 0.0965, min: 21540001, max: 107650000 },
    { rate: 0.1033, min: 107650001, max: 500000000 },
    { rate: 0.109,  min: 500000001, max: Infinity }
  ],
  head_of_household: [
    { rate: 0.04,  min: 0,         max: 12760000 },
    { rate: 0.045, min: 12760001, max: 17550000 },
    { rate: 0.0525, min: 17550001, max: 20700000 },
    { rate: 0.055, min: 20700001, max: 24232500 },
    { rate: 0.06,  min: 24232501, max: 48480000 },
    { rate: 0.0685, min: 48480001, max: 32295000 },
    { rate: 0.0965, min: 32295001, max: 161475000 },
    { rate: 0.1033, min: 161475001, max: 750000000 },
    { rate: 0.109,  min: 750000001, max: Infinity }
  ]
};

const NY_TAX_BRACKETS_2025 = {
  single: [
    { rate: 0.04,  min: 0,         max: 8580000 },
    { rate: 0.045, min: 8580001,  max: 11700000 },
    { rate: 0.0525, min: 11700001, max: 13900000 },
    { rate: 0.055,  min: 13900001, max: 16165000 },
    { rate: 0.06,  min: 16165001, max: 32340000 },
    { rate: 0.0685, min: 32340001, max: 21560000 },
    { rate: 0.0965, min: 21560001, max: 107900000 },
    { rate: 0.1033, min: 107900001, max: 505000000 },
    { rate: 0.109,  min: 505000001, max: Infinity }
  ],
  married_joint: [
    { rate: 0.04,  min: 0,         max: 17160000 },
    { rate: 0.045, min: 17160001, max: 23400000 },
    { rate: 0.0525, min: 23400001, max: 27900000 },
    { rate: 0.055, min: 27900001, max: 32330000 },
    { rate: 0.06,  min: 32330001, max: 64680000 },
    { rate: 0.0685, min: 64680001, max: 43080000 },
    { rate: 0.0965, min: 43080001, max: 215800000 },
    { rate: 0.1033, min: 215800001, max: 1010000000 },
    { rate: 0.109,  min: 1010000001, max: Infinity }
  ],
  married_separate: [
    { rate: 0.04,  min: 0,         max: 8580000 },
    { rate: 0.045, min: 8580001,  max: 11700000 },
    { rate: 0.0525, min: 11700001, max: 13900000 },
    { rate: 0.055, min: 13900001, max: 16165000 },
    { rate: 0.06,  min: 16165001, max: 32340000 },
    { rate: 0.0685, min: 32340001, max: 21560000 },
    { rate: 0.0965, min: 21560001, max: 107900000 },
    { rate: 0.1033, min: 107900001, max: 505000000 },
    { rate: 0.109,  min: 505000001, max: Infinity }
  ],
  head_of_household: [
    { rate: 0.04,  min: 0,         max: 12840000 },
    { rate: 0.045, min: 12840001, max: 17640000 },
    { rate: 0.0525, min: 17640001, max: 20920000 },
    { rate: 0.055, min: 20920001, max: 24350000 },
    { rate: 0.06,  min: 24350001, max: 48600000 },
    { rate: 0.0685, min: 48600001, max: 32450000 },
    { rate: 0.0965, min: 32450001, max: 162000000 },
    { rate: 0.1033, min: 162000001, max: 755000000 },
    { rate: 0.109,  min: 755000001, max: Infinity }
  ]
};

/**
 * NY Standard Deductions - 2024 & 2025
 * All values in cents
 */
const NY_STANDARD_DEDUCTIONS_2024 = {
  single: 8000000,       // $8,000
  married_joint: 16000000,  // $16,000
  married_separate: 8000000,  // $8,000
  head_of_household: 12000000  // $12,000
};

const NY_STANDARD_DEDUCTIONS_2025 = {
  single: 8000000,       // $8,000
  married_joint: 16000000,  // $16,000
  married_separate: 8000000,  // $8,000
  head_of_household: 12000000  // $12,000
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

  const lifeExpectancyFactor = RMD_LIFE_EXPECTANCY_FACTORS[age];

  if (!lifeExpectancyFactor) {
    throw new Error(`No life expectancy factor available for age ${age}`);
  }

  const rmdAmount = accountBalance / lifeExpectancyFactor;
  return Math.round(rmdAmount);
}

/**
 * Get state tax brackets for given state, year, and filing status
 * @param {string} state - State abbreviation ('DC', 'CA', 'NY', or null)
 * @param {number} year - Tax year (2024 or 2025)
 * @param {string} filingStatus - Filing status
 * @returns {Array} State tax brackets
 */
export function getStateTaxBrackets(state, year, filingStatus) {
  if (!state) return null;

  const upperState = state.toUpperCase();

  if (upperState === 'DC') {
    const dcBrackets = year === 2024 ? DC_TAX_BRACKETS_2024 : DC_TAX_BRACKETS_2025;
    if (!dcBrackets || !dcBrackets[filingStatus]) {
      throw new Error(`Invalid filing status for DC: ${filingStatus}`);
    }
    return dcBrackets[filingStatus];
  }

  if (upperState === 'CA') {
    const caBrackets = year === 2024 ? CA_TAX_BRACKETS_2024 : CA_TAX_BRACKETS_2025;
    if (!caBrackets || !caBrackets[filingStatus]) {
      throw new Error(`Invalid filing status for CA: ${filingStatus}`);
    }
    return caBrackets[filingStatus];
  }

  if (upperState === 'NY') {
    const nyBrackets = year === 2024 ? NY_TAX_BRACKETS_2024 : NY_TAX_BRACKETS_2025;
    if (!nyBrackets || !nyBrackets[filingStatus]) {
      throw new Error(`Invalid filing status for NY: ${filingStatus}`);
    }
    return nyBrackets[filingStatus];
  }

  throw new Error(`Unsupported state: ${state}. Supported states: DC, CA, NY`);
}

/**
 * Get state standard deduction
 * @param {string} state - State abbreviation ('DC', 'CA', 'NY', or null)
 * @param {number} year - Tax year (2024 or 2025)
 * @param {string} filingStatus - Filing status
 * @returns {number} Standard deduction in cents
 */
export function getStateStandardDeduction(state, year, filingStatus) {
  if (!state) return 0;

  const upperState = state.toUpperCase();

  if (upperState === 'DC') {
    const dcDeductions = year === 2024 ? DC_STANDARD_DEDUCTIONS_2024 : DC_STANDARD_DEDUCTIONS_2025;
    if (!dcDeductions || !dcDeductions[filingStatus]) {
      throw new Error(`Invalid filing status for DC: ${filingStatus}`);
    }
    return dcDeductions[filingStatus];
  }

  if (upperState === 'CA') {
    const caDeductions = year === 2024 ? CA_STANDARD_DEDUCTIONS_2024 : CA_STANDARD_DEDUCTIONS_2025;
    if (!caDeductions || !caDeductions[filingStatus]) {
      throw new Error(`Invalid filing status for CA: ${filingStatus}`);
    }
    return caDeductions[filingStatus];
  }

  if (upperState === 'NY') {
    const nyDeductions = year === 2024 ? NY_STANDARD_DEDUCTIONS_2024 : NY_STANDARD_DEDUCTIONS_2025;
    if (!nyDeductions || !nyDeductions[filingStatus]) {
      throw new Error(`Invalid filing status for NY: ${filingStatus}`);
    }
    return nyDeductions[filingStatus];
  }

  throw new Error(`Unsupported state: ${state}. Supported states: DC, CA, NY`);
}

/**
 * Calculate state income tax
 * @param {string} state - State abbreviation ('DC', 'CA', 'NY', or null)
 * @param {number} income - Taxable income in cents
 * @param {string} filingStatus - Filing status
 * @param {number} year - Tax year (2024 or 2025)
 * @returns {number} State tax liability in cents
 */
export function calculateStateTax(state, income, filingStatus, year = 2025) {
  if (!state) return 0;

  const brackets = getStateTaxBrackets(state, year, filingStatus);
  const standardDeduction = getStateStandardDeduction(state, year, filingStatus);

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
 * Calculate total income tax (federal + state)
 * @param {string} state - State abbreviation ('DC', 'CA', 'NY', or null)
 * @param {number} income - Gross income in cents
 * @param {string} filingStatus - Filing status
 * @param {number} year - Tax year (2024 or 2025)
 * @returns {object} Tax breakdown with federal, state, and total
 */
export function calculateTotalTax(state, income, filingStatus, year = 2025) {
  const federalTax = calculateFederalTax(income, filingStatus, year);
  const stateTax = calculateStateTax(state, income, filingStatus, year);

  return {
    federalTax,
    stateTax,
    totalTax: federalTax + stateTax
  };
}

