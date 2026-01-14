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
 * ALABAMA - 2025 Tax Brackets
 * Progressive rates: 2%, 4%, 5%
 * All values in cents
 */
const AL_TAX_BRACKETS_2025 = {
  single: [
    { rate: 0.02, min: 0,       max: 50000 },
    { rate: 0.04, min: 50001,   max: 300000 },
    { rate: 0.05, min: 300001,  max: Infinity }
  ],
  married_joint: [
    { rate: 0.02, min: 0,       max: 100000 },
    { rate: 0.04, min: 100001,  max: 600000 },
    { rate: 0.05, min: 600001,  max: Infinity }
  ],
  married_separate: [
    { rate: 0.02, min: 0,       max: 50000 },
    { rate: 0.04, min: 50001,   max: 300000 },
    { rate: 0.05, min: 300001,  max: Infinity }
  ],
  head_of_household: [
    { rate: 0.02, min: 0,       max: 50000 },
    { rate: 0.04, min: 50001,   max: 300000 },
    { rate: 0.05, min: 300001,  max: Infinity }
  ]
};

const AL_STANDARD_DEDUCTIONS_2025 = {
  single: 300000,
  married_joint: 850000,
  married_separate: 425000,
  head_of_household: 520000
};

/**
 * ARKANSAS - 2025 Tax Brackets
 * Progressive rates: 0%, 2%, 3%, 3.4%, 3.9%
 * All values in cents
 */
const AR_TAX_BRACKETS_2025 = {
  single: [
    { rate: 0.00, min: 0,       max: 549900 },
    { rate: 0.02, min: 549901,  max: 1089900 },
    { rate: 0.03, min: 1089901, max: 1559900 },
    { rate: 0.034, min: 1559901, max: 2569900 },
    { rate: 0.039, min: 2569901, max: 92300000 }
  ],
  married_joint: [
    { rate: 0.00, min: 0,       max: 549900 },
    { rate: 0.02, min: 549901,  max: 1089900 },
    { rate: 0.03, min: 1089901, max: 1559900 },
    { rate: 0.034, min: 1559901, max: 2569900 },
    { rate: 0.039, min: 2569901, max: 92300000 }
  ],
  married_separate: [
    { rate: 0.00, min: 0,       max: 549900 },
    { rate: 0.02, min: 549901,  max: 1089900 },
    { rate: 0.03, min: 1089901, max: 1559900 },
    { rate: 0.034, min: 1559901, max: 2569900 },
    { rate: 0.039, min: 2569901, max: 92300000 }
  ],
  head_of_household: [
    { rate: 0.00, min: 0,       max: 549900 },
    { rate: 0.02, min: 549901,  max: 1089900 },
    { rate: 0.03, min: 1089901, max: 1559900 },
    { rate: 0.034, min: 1559901, max: 2569900 },
    { rate: 0.039, min: 2569901, max: 92300000 }
  ]
};

const AR_STANDARD_DEDUCTIONS_2025 = {
  single: 241000,
  married_joint: 482000,
  married_separate: 241000,
  head_of_household: 241000
};

/**
 * COLORADO - 2025 Tax Brackets
 * Flat rate: 4.4%
 * All values in cents
 */
const CO_TAX_BRACKETS_2025 = {
  single: [{ rate: 0.044, min: 0, max: Infinity }],
  married_joint: [{ rate: 0.044, min: 0, max: Infinity }],
  married_separate: [{ rate: 0.044, min: 0, max: Infinity }],
  head_of_household: [{ rate: 0.044, min: 0, max: Infinity }]
};

const CO_STANDARD_DEDUCTIONS_2025 = {
  single: 1460000,
  married_joint: 2920000,
  married_separate: 1460000,
  head_of_household: 2190000
};

/**
 * CONNECTICUT - 2025 Tax Brackets
 * Progressive rates: 2%-6.99%
 * All values in cents
 */
const CT_TAX_BRACKETS_2025 = {
  single: [
    { rate: 0.02, min: 0, max: 2000000 },
    { rate: 0.024, min: 2000001, max: 10000000 },
    { rate: 0.033, min: 10000001, max: 20000000 },
    { rate: 0.035, min: 20000001, max: 40000000 },
    { rate: 0.039, min: 40000001, max: 60000000 },
    { rate: 0.043, min: 60000001, max: 80000000 },
    { rate: 0.049, min: 80000001, max: 100000000 },
    { rate: 0.05, min: 100000001, max: 150000000 },
    { rate: 0.052, min: 150000001, max: 200000000 },
    { rate: 0.054, min: 200000001, max: 250000000 },
    { rate: 0.055, min: 250000001, max: 500000000 },
    { rate: 0.0699, min: 500000001, max: Infinity }
  ],
  married_joint: [
    { rate: 0.02, min: 0, max: 4000000 },
    { rate: 0.024, min: 4000001, max: 20000000 },
    { rate: 0.033, min: 20000001, max: 40000000 },
    { rate: 0.035, min: 40000001, max: 80000000 },
    { rate: 0.039, min: 80000001, max: 120000000 },
    { rate: 0.043, min: 120000001, max: 160000000 },
    { rate: 0.049, min: 160000001, max: 200000000 },
    { rate: 0.05, min: 200000001, max: 300000000 },
    { rate: 0.052, min: 300000001, max: 400000000 },
    { rate: 0.054, min: 400000001, max: 500000000 },
    { rate: 0.055, min: 500000001, max: 1000000000 },
    { rate: 0.0699, min: 1000000001, max: Infinity }
  ],
  married_separate: [
    { rate: 0.02, min: 0, max: 2000000 },
    { rate: 0.024, min: 2000001, max: 10000000 },
    { rate: 0.033, min: 10000001, max: 20000000 },
    { rate: 0.035, min: 20000001, max: 40000000 },
    { rate: 0.039, min: 40000001, max: 60000000 },
    { rate: 0.043, min: 60000001, max: 80000000 },
    { rate: 0.049, min: 80000001, max: 100000000 },
    { rate: 0.05, min: 100000001, max: 150000000 },
    { rate: 0.052, min: 150000001, max: 200000000 },
    { rate: 0.054, min: 200000001, max: 250000000 },
    { rate: 0.055, min: 250000001, max: 500000000 },
    { rate: 0.0699, min: 500000001, max: Infinity }
  ],
  head_of_household: [
    { rate: 0.02, min: 0, max: 3200000 },
    { rate: 0.024, min: 3200001, max: 16000000 },
    { rate: 0.033, min: 16000001, max: 32000000 },
    { rate: 0.035, min: 32000001, max: 64000000 },
    { rate: 0.039, min: 64000001, max: 96000000 },
    { rate: 0.043, min: 96000001, max: 128000000 },
    { rate: 0.049, min: 128000001, max: 160000000 },
    { rate: 0.05, min: 160000001, max: 240000000 },
    { rate: 0.052, min: 240000001, max: 320000000 },
    { rate: 0.054, min: 320000001, max: 400000000 },
    { rate: 0.055, min: 400000001, max: 800000000 },
    { rate: 0.0699, min: 800000001, max: Infinity }
  ]
};

const CT_STANDARD_DEDUCTIONS_2025 = {
  single: 1275000,
  married_joint: 2550000,
  married_separate: 1275000,
  head_of_household: 1912500
};

/**
 * DELAWARE - 2025 Tax Brackets
 * Progressive rates: 2.2%-6.6%
 * All values in cents
 */
const DE_TAX_BRACKETS_2025 = {
  single: [
    { rate: 0.022, min: 0, max: 2000000 },
    { rate: 0.039, min: 2000001, max: 5000000 },
    { rate: 0.048, min: 5000001, max: 10000000 },
    { rate: 0.052, min: 10000001, max: 20000000 },
    { rate: 0.055, min: 20000001, max: 60000000 },
    { rate: 0.066, min: 60000001, max: Infinity }
  ],
  married_joint: [
    { rate: 0.022, min: 0, max: 2000000 },
    { rate: 0.039, min: 2000001, max: 5000000 },
    { rate: 0.048, min: 5000001, max: 10000000 },
    { rate: 0.052, min: 10000001, max: 20000000 },
    { rate: 0.055, min: 20000001, max: 60000000 },
    { rate: 0.066, min: 60000001, max: Infinity }
  ],
  married_separate: [
    { rate: 0.022, min: 0, max: 2000000 },
    { rate: 0.039, min: 2000001, max: 5000000 },
    { rate: 0.048, min: 5000001, max: 10000000 },
    { rate: 0.052, min: 10000001, max: 20000000 },
    { rate: 0.055, min: 20000001, max: 60000000 },
    { rate: 0.066, min: 60000001, max: Infinity }
  ],
  head_of_household: [
    { rate: 0.022, min: 0, max: 2000000 },
    { rate: 0.039, min: 2000001, max: 5000000 },
    { rate: 0.048, min: 5000001, max: 10000000 },
    { rate: 0.052, min: 10000001, max: 20000000 },
    { rate: 0.055, min: 20000001, max: 60000000 },
    { rate: 0.066, min: 60000001, max: Infinity }
  ]
};

const DE_STANDARD_DEDUCTIONS_2025 = {
  single: 325000,
  married_joint: 325000,
  married_separate: 325000,
  head_of_household: 325000
};

/**
 * GEORGIA - 2025 Tax Brackets
 * Flat rate: 5.39% (reduced to 5.19% July 1, 2025)
 * All values in cents
 */
const GA_TAX_BRACKETS_2025 = {
  single: [{ rate: 0.0539, min: 0, max: Infinity }],
  married_joint: [{ rate: 0.0539, min: 0, max: Infinity }],
  married_separate: [{ rate: 0.0539, min: 0, max: Infinity }],
  head_of_household: [{ rate: 0.0539, min: 0, max: Infinity }]
};

const GA_STANDARD_DEDUCTIONS_2025 = {
  single: 1200000,
  married_joint: 2400000,
  married_separate: 1200000,
  head_of_household: 1200000
};

/**
 * HAWAII - 2025 Tax Brackets
 * Progressive rates: 1.4%-11%
 * All values in cents
 */
const HI_TAX_BRACKETS_2025 = {
  single: [
    { rate: 0.014, min: 0, max: 240000 },
    { rate: 0.032, min: 240001, max: 560000 },
    { rate: 0.055, min: 560001, max: 880000 },
    { rate: 0.072, min: 880001, max: 1280000 },
    { rate: 0.093, min: 1280001, max: 2520000 },
    { rate: 0.10, min: 2520001, max: 20000000 },
    { rate: 0.11, min: 20000001, max: Infinity }
  ],
  married_joint: [
    { rate: 0.014, min: 0, max: 480000 },
    { rate: 0.032, min: 480001, max: 1120000 },
    { rate: 0.055, min: 1120001, max: 1760000 },
    { rate: 0.072, min: 1760001, max: 2560000 },
    { rate: 0.093, min: 2560001, max: 5040000 },
    { rate: 0.10, min: 5040001, max: 40000000 },
    { rate: 0.11, min: 40000001, max: Infinity }
  ],
  married_separate: [
    { rate: 0.014, min: 0, max: 240000 },
    { rate: 0.032, min: 240001, max: 560000 },
    { rate: 0.055, min: 560001, max: 880000 },
    { rate: 0.072, min: 880001, max: 1280000 },
    { rate: 0.093, min: 1280001, max: 2520000 },
    { rate: 0.10, min: 2520001, max: 20000000 },
    { rate: 0.11, min: 20000001, max: Infinity }
  ],
  head_of_household: [
    { rate: 0.014, min: 0, max: 360000 },
    { rate: 0.032, min: 360001, max: 840000 },
    { rate: 0.055, min: 840001, max: 1320000 },
    { rate: 0.072, min: 1320001, max: 1920000 },
    { rate: 0.093, min: 1920001, max: 3780000 },
    { rate: 0.10, min: 3780001, max: 30000000 },
    { rate: 0.11, min: 30000001, max: Infinity }
  ]
};

const HI_STANDARD_DEDUCTIONS_2025 = {
  single: 440000,
  married_joint: 880000,
  married_separate: 440000,
  head_of_household: 660000
};

/**
 * IDAHO - 2025 Tax Brackets
 * Flat rate: 5.3%
 * All values in cents
 */
const ID_TAX_BRACKETS_2025 = {
  single: [{ rate: 0.053, min: 0, max: Infinity }],
  married_joint: [{ rate: 0.053, min: 0, max: Infinity }],
  married_separate: [{ rate: 0.053, min: 0, max: Infinity }],
  head_of_household: [{ rate: 0.053, min: 0, max: Infinity }]
};

const ID_STANDARD_DEDUCTIONS_2025 = {
  single: 1460000,
  married_joint: 2920000,
  married_separate: 1460000,
  head_of_household: 2190000
};

/**
 * ILLINOIS - 2025 Tax Brackets
 * Flat rate: 4.95%
 * All values in cents
 */
const IL_TAX_BRACKETS_2025 = {
  single: [{ rate: 0.0495, min: 0, max: Infinity }],
  married_joint: [{ rate: 0.0495, min: 0, max: Infinity }],
  married_separate: [{ rate: 0.0495, min: 0, max: Infinity }],
  head_of_household: [{ rate: 0.0495, min: 0, max: Infinity }]
};

const IL_STANDARD_DEDUCTIONS_2025 = {
  single: 1460000,
  married_joint: 2920000,
  married_separate: 1460000,
  head_of_household: 2190000
};

/**
 * INDIANA - 2025 Tax Brackets
 * Flat rate: 3.0%
 * All values in cents
 */
const IN_TAX_BRACKETS_2025 = {
  single: [{ rate: 0.03, min: 0, max: Infinity }],
  married_joint: [{ rate: 0.03, min: 0, max: Infinity }],
  married_separate: [{ rate: 0.03, min: 0, max: Infinity }],
  head_of_household: [{ rate: 0.03, min: 0, max: Infinity }]
};

const IN_STANDARD_DEDUCTIONS_2025 = {
  single: 1460000,
  married_joint: 2920000,
  married_separate: 1460000,
  head_of_household: 2190000
};

/**
 * IOWA - 2025 Tax Brackets
 * Flat rate: 3.8%
 * All values in cents
 */
const IA_TAX_BRACKETS_2025 = {
  single: [{ rate: 0.038, min: 0, max: Infinity }],
  married_joint: [{ rate: 0.038, min: 0, max: Infinity }],
  married_separate: [{ rate: 0.038, min: 0, max: Infinity }],
  head_of_household: [{ rate: 0.038, min: 0, max: Infinity }]
};

const IA_STANDARD_DEDUCTIONS_2025 = {
  single: 1460000,
  married_joint: 2920000,
  married_separate: 1460000,
  head_of_household: 2190000
};

/**
 * KANSAS - 2025 Tax Brackets
 * Progressive rates: 5.2%, 5.58%
 * All values in cents
 */
const KS_TAX_BRACKETS_2025 = {
  single: [
    { rate: 0.052, min: 0, max: 2300000 },
    { rate: 0.0558, min: 2300001, max: Infinity }
  ],
  married_joint: [
    { rate: 0.052, min: 0, max: 4600000 },
    { rate: 0.0558, min: 4600001, max: Infinity }
  ],
  married_separate: [
    { rate: 0.052, min: 0, max: 2300000 },
    { rate: 0.0558, min: 2300001, max: Infinity }
  ],
  head_of_household: [
    { rate: 0.052, min: 0, max: 2300000 },
    { rate: 0.0558, min: 2300001, max: Infinity }
  ]
};

const KS_STANDARD_DEDUCTIONS_2025 = {
  single: 360500,
  married_joint: 824000,
  married_separate: 412000,
  head_of_household: 618000
};

/**
 * KENTUCKY - 2025 Tax Brackets
 * Flat rate: 4.0% (reducing to 3.5% in 2026)
 * All values in cents
 */
const KY_TAX_BRACKETS_2025 = {
  single: [{ rate: 0.04, min: 0, max: Infinity }],
  married_joint: [{ rate: 0.04, min: 0, max: Infinity }],
  married_separate: [{ rate: 0.04, min: 0, max: Infinity }],
  head_of_household: [{ rate: 0.04, min: 0, max: Infinity }]
};

const KY_STANDARD_DEDUCTIONS_2025 = {
  single: 327000,
  married_joint: 654000,
  married_separate: 327000,
  head_of_household: 327000
};

/**
 * LOUISIANA - 2025 Tax Brackets
 * Flat rate: 3.0%
 * All values in cents
 */
const LA_TAX_BRACKETS_2025 = {
  single: [{ rate: 0.03, min: 0, max: Infinity }],
  married_joint: [{ rate: 0.03, min: 0, max: Infinity }],
  married_separate: [{ rate: 0.03, min: 0, max: Infinity }],
  head_of_household: [{ rate: 0.03, min: 0, max: Infinity }]
};

const LA_STANDARD_DEDUCTIONS_2025 = {
  single: 1250000,
  married_joint: 2500000,
  married_separate: 1250000,
  head_of_household: 1250000
};

/**
 * MAINE - 2025 Tax Brackets
 * Progressive rates: 5.8%-7.15%
 * All values in cents
 */
const ME_TAX_BRACKETS_2025 = {
  single: [
    { rate: 0.058, min: 0, max: 2605000 },
    { rate: 0.0675, min: 2605001, max: 6160000 },
    { rate: 0.0715, min: 6160001, max: Infinity }
  ],
  married_joint: [
    { rate: 0.058, min: 0, max: 5210000 },
    { rate: 0.0675, min: 5210001, max: 12320000 },
    { rate: 0.0715, min: 12320001, max: Infinity }
  ],
  married_separate: [
    { rate: 0.058, min: 0, max: 2605000 },
    { rate: 0.0675, min: 2605001, max: 6160000 },
    { rate: 0.0715, min: 6160001, max: Infinity }
  ],
  head_of_household: [
    { rate: 0.058, min: 0, max: 3907500 },
    { rate: 0.0675, min: 3907501, max: 9240000 },
    { rate: 0.0715, min: 9240001, max: Infinity }
  ]
};

const ME_STANDARD_DEDUCTIONS_2025 = {
  single: 1530000,
  married_joint: 3060000,
  married_separate: 1530000,
  head_of_household: 2295000
};

/**
 * MARYLAND - 2025 Tax Brackets
 * Progressive rates: 2%-5.75%
 * All values in cents
 */
const MD_TAX_BRACKETS_2025 = {
  single: [
    { rate: 0.02, min: 0, max: 100000 },
    { rate: 0.03, min: 100001, max: 200000 },
    { rate: 0.04, min: 200001, max: 300000 },
    { rate: 0.0475, min: 300001, max: 15000000 },
    { rate: 0.0525, min: 15000001, max: 25000000 },
    { rate: 0.0575, min: 25000001, max: Infinity }
  ],
  married_joint: [
    { rate: 0.02, min: 0, max: 100000 },
    { rate: 0.03, min: 100001, max: 200000 },
    { rate: 0.04, min: 200001, max: 300000 },
    { rate: 0.0475, min: 300001, max: 15000000 },
    { rate: 0.0525, min: 15000001, max: 25000000 },
    { rate: 0.0575, min: 25000001, max: Infinity }
  ],
  married_separate: [
    { rate: 0.02, min: 0, max: 100000 },
    { rate: 0.03, min: 100001, max: 200000 },
    { rate: 0.04, min: 200001, max: 300000 },
    { rate: 0.0475, min: 300001, max: 15000000 },
    { rate: 0.0525, min: 15000001, max: 25000000 },
    { rate: 0.0575, min: 25000001, max: Infinity }
  ],
  head_of_household: [
    { rate: 0.02, min: 0, max: 100000 },
    { rate: 0.03, min: 100001, max: 200000 },
    { rate: 0.04, min: 200001, max: 300000 },
    { rate: 0.0475, min: 300001, max: 15000000 },
    { rate: 0.0525, min: 15000001, max: 25000000 },
    { rate: 0.0575, min: 25000001, max: Infinity }
  ]
};

const MD_STANDARD_DEDUCTIONS_2025 = {
  single: 335000,
  married_joint: 670000,
  married_separate: 335000,
  head_of_household: 335000
};

/**
 * MASSACHUSETTS - 2025 Tax Brackets
 * Flat rate: 5% (ordinary); 9% (high-income surtax)
 * All values in cents
 */
const MA_TAX_BRACKETS_2025 = {
  single: [{ rate: 0.05, min: 0, max: Infinity }],
  married_joint: [{ rate: 0.05, min: 0, max: Infinity }],
  married_separate: [{ rate: 0.05, min: 0, max: Infinity }],
  head_of_household: [{ rate: 0.05, min: 0, max: Infinity }]
};

const MA_STANDARD_DEDUCTIONS_2025 = {
  single: 440000,
  married_joint: 880000,
  married_separate: 440000,
  head_of_household: 880000
};

/**
 * MICHIGAN - 2025 Tax Brackets
 * Flat rate: 4.25%
 * All values in cents
 */
const MI_TAX_BRACKETS_2025 = {
  single: [{ rate: 0.0425, min: 0, max: Infinity }],
  married_joint: [{ rate: 0.0425, min: 0, max: Infinity }],
  married_separate: [{ rate: 0.0425, min: 0, max: Infinity }],
  head_of_household: [{ rate: 0.0425, min: 0, max: Infinity }]
};

const MI_STANDARD_DEDUCTIONS_2025 = {
  single: 1460000,
  married_joint: 2920000,
  married_separate: 1460000,
  head_of_household: 2190000
};

/**
 * MINNESOTA - 2025 Tax Brackets
 * Progressive rates: 5.35%-9.85%
 * All values in cents
 */
const MN_TAX_BRACKETS_2025 = {
  single: [
    { rate: 0.0535, min: 0, max: 3007000 },
    { rate: 0.068, min: 3007001, max: 7931000 },
    { rate: 0.0785, min: 7931001, max: 13320000 },
    { rate: 0.0985, min: 13320001, max: Infinity }
  ],
  married_joint: [
    { rate: 0.0535, min: 0, max: 4484000 },
    { rate: 0.068, min: 4484001, max: 11846000 },
    { rate: 0.0785, min: 11846001, max: 19970000 },
    { rate: 0.0985, min: 19970001, max: Infinity }
  ],
  married_separate: [
    { rate: 0.0535, min: 0, max: 2242000 },
    { rate: 0.068, min: 2242001, max: 5923000 },
    { rate: 0.0785, min: 5923001, max: 9985000 },
    { rate: 0.0985, min: 9985001, max: Infinity }
  ],
  head_of_household: [
    { rate: 0.0535, min: 0, max: 3007000 },
    { rate: 0.068, min: 3007001, max: 7931000 },
    { rate: 0.0785, min: 7931001, max: 13320000 },
    { rate: 0.0985, min: 13320001, max: Infinity }
  ]
};

const MN_STANDARD_DEDUCTIONS_2025 = {
  single: 1495000,
  married_joint: 2990000,
  married_separate: 1495000,
  head_of_household: 2245000
};

/**
 * MISSISSIPPI - 2025 Tax Brackets
 * Progressive rates: 0%-4.7%
 * All values in cents
 */
const MS_TAX_BRACKETS_2025 = {
  single: [
    { rate: 0.00, min: 0, max: 1000000 },
    { rate: 0.044, min: 1000001, max: 1100000 },
    { rate: 0.047, min: 1100001, max: Infinity }
  ],
  married_joint: [
    { rate: 0.00, min: 0, max: 1000000 },
    { rate: 0.044, min: 1000001, max: 1100000 },
    { rate: 0.047, min: 1100001, max: Infinity }
  ],
  married_separate: [
    { rate: 0.00, min: 0, max: 1000000 },
    { rate: 0.044, min: 1000001, max: 1100000 },
    { rate: 0.047, min: 1100001, max: Infinity }
  ],
  head_of_household: [
    { rate: 0.00, min: 0, max: 1000000 },
    { rate: 0.044, min: 1000001, max: 1100000 },
    { rate: 0.047, min: 1100001, max: Infinity }
  ]
};

const MS_STANDARD_DEDUCTIONS_2025 = {
  single: 230000,
  married_joint: 460000,
  married_separate: 230000,
  head_of_household: 340000
};

/**
 * MISSOURI - 2025 Tax Brackets
 * Progressive rates: 2%-4.7%
 * All values in cents
 */
const MO_TAX_BRACKETS_2025 = {
  single: [
    { rate: 0.02, min: 0, max: 131300 },
    { rate: 0.025, min: 131301, max: 262600 },
    { rate: 0.03, min: 262601, max: 393900 },
    { rate: 0.035, min: 393901, max: 525200 },
    { rate: 0.04, min: 525201, max: 656500 },
    { rate: 0.045, min: 656501, max: 787800 },
    { rate: 0.047, min: 787801, max: Infinity }
  ],
  married_joint: [
    { rate: 0.02, min: 0, max: 131300 },
    { rate: 0.025, min: 131301, max: 262600 },
    { rate: 0.03, min: 262601, max: 393900 },
    { rate: 0.035, min: 393901, max: 525200 },
    { rate: 0.04, min: 525201, max: 656500 },
    { rate: 0.045, min: 656501, max: 787800 },
    { rate: 0.047, min: 787801, max: Infinity }
  ],
  married_separate: [
    { rate: 0.02, min: 0, max: 131300 },
    { rate: 0.025, min: 131301, max: 262600 },
    { rate: 0.03, min: 262601, max: 393900 },
    { rate: 0.035, min: 393901, max: 525200 },
    { rate: 0.04, min: 525201, max: 656500 },
    { rate: 0.045, min: 656501, max: 787800 },
    { rate: 0.047, min: 787801, max: Infinity }
  ],
  head_of_household: [
    { rate: 0.02, min: 0, max: 131300 },
    { rate: 0.025, min: 131301, max: 262600 },
    { rate: 0.03, min: 262601, max: 393900 },
    { rate: 0.035, min: 393901, max: 525200 },
    { rate: 0.04, min: 525201, max: 656500 },
    { rate: 0.045, min: 656501, max: 787800 },
    { rate: 0.047, min: 787801, max: Infinity }
  ]
};

const MO_STANDARD_DEDUCTIONS_2025 = {
  single: 1575000,
  married_joint: 3150000,
  married_separate: 1575000,
  head_of_household: 2362500
};

/**
 * MONTANA - 2025 Tax Brackets
 * Progressive rates: 4.7%-5.9%
 * All values in cents
 */
const MT_TAX_BRACKETS_2025 = {
  single: [
    { rate: 0.047, min: 0, max: 360000 },
    { rate: 0.059, min: 360001, max: Infinity }
  ],
  married_joint: [
    { rate: 0.047, min: 0, max: 360000 },
    { rate: 0.059, min: 360001, max: Infinity }
  ],
  married_separate: [
    { rate: 0.047, min: 0, max: 360000 },
    { rate: 0.059, min: 360001, max: Infinity }
  ],
  head_of_household: [
    { rate: 0.047, min: 0, max: 360000 },
    { rate: 0.059, min: 360001, max: Infinity }
  ]
};

const MT_STANDARD_DEDUCTIONS_2025 = {
  single: 450000,
  married_joint: 1150000,
  married_separate: 450000,
  head_of_household: 675000
};

/**
 * NEBRASKA - 2025 Tax Brackets
 * Progressive rates: 2.46%-5.2%
 * All values in cents
 */
const NE_TAX_BRACKETS_2025 = {
  single: [
    { rate: 0.0246, min: 0, max: 370000 },
    { rate: 0.0351, min: 370001, max: 920000 },
    { rate: 0.052, min: 920001, max: Infinity }
  ],
  married_joint: [
    { rate: 0.0246, min: 0, max: 370000 },
    { rate: 0.0351, min: 370001, max: 920000 },
    { rate: 0.052, min: 920001, max: Infinity }
  ],
  married_separate: [
    { rate: 0.0246, min: 0, max: 370000 },
    { rate: 0.0351, min: 370001, max: 920000 },
    { rate: 0.052, min: 920001, max: Infinity }
  ],
  head_of_household: [
    { rate: 0.0246, min: 0, max: 370000 },
    { rate: 0.0351, min: 370001, max: 920000 },
    { rate: 0.052, min: 920001, max: Infinity }
  ]
};

const NE_STANDARD_DEDUCTIONS_2025 = {
  single: 790000,
  married_joint: 1720000,
  married_separate: 790000,
  head_of_household: 1185000
};

/**
 * NEW JERSEY - 2025 Tax Brackets
 * Progressive rates: 1.4%-10.75% (applied to federal tax liability)
 * All values in cents
 */
const NJ_TAX_BRACKETS_2025 = {
  single: [
    { rate: 0.014, min: 0, max: 2000000 },
    { rate: 0.0175, min: 2000001, max: 3500000 },
    { rate: 0.035, min: 3500001, max: 4000000 },
    { rate: 0.05525, min: 4000001, max: 7500000 },
    { rate: 0.0637, min: 7500001, max: 50000000 },
    { rate: 0.0897, min: 50000001, max: 100000000 },
    { rate: 0.1075, min: 100000001, max: Infinity }
  ],
  married_joint: [
    { rate: 0.014, min: 0, max: 2000000 },
    { rate: 0.0175, min: 2000001, max: 3500000 },
    { rate: 0.035, min: 3500001, max: 4000000 },
    { rate: 0.05525, min: 4000001, max: 7500000 },
    { rate: 0.0637, min: 7500001, max: 50000000 },
    { rate: 0.0897, min: 50000001, max: 100000000 },
    { rate: 0.1075, min: 100000001, max: Infinity }
  ],
  married_separate: [
    { rate: 0.014, min: 0, max: 2000000 },
    { rate: 0.0175, min: 2000001, max: 3500000 },
    { rate: 0.035, min: 3500001, max: 4000000 },
    { rate: 0.05525, min: 4000001, max: 7500000 },
    { rate: 0.0637, min: 7500001, max: 50000000 },
    { rate: 0.0897, min: 50000001, max: 100000000 },
    { rate: 0.1075, min: 100000001, max: Infinity }
  ],
  head_of_household: [
    { rate: 0.014, min: 0, max: 2000000 },
    { rate: 0.0175, min: 2000001, max: 3500000 },
    { rate: 0.035, min: 3500001, max: 4000000 },
    { rate: 0.05525, min: 4000001, max: 7500000 },
    { rate: 0.0637, min: 7500001, max: 50000000 },
    { rate: 0.0897, min: 50000001, max: 100000000 },
    { rate: 0.1075, min: 100000001, max: Infinity }
  ]
};

const NJ_STANDARD_DEDUCTIONS_2025 = {
  single: 1460000,
  married_joint: 2920000,
  married_separate: 1460000,
  head_of_household: 2190000
};

/**
 * NEW MEXICO - 2025 Tax Brackets
 * Progressive rates: 1.5%-5.9%
 * All values in cents
 */
const NM_TAX_BRACKETS_2025 = {
  single: [
    { rate: 0.015, min: 0, max: 550000 },
    { rate: 0.032, min: 550001, max: 1100000 },
    { rate: 0.047, min: 1100001, max: 1600000 },
    { rate: 0.049, min: 1600001, max: 2100000 },
    { rate: 0.059, min: 2100001, max: Infinity }
  ],
  married_joint: [
    { rate: 0.015, min: 0, max: 550000 },
    { rate: 0.032, min: 550001, max: 1100000 },
    { rate: 0.047, min: 1100001, max: 1600000 },
    { rate: 0.049, min: 1600001, max: 2100000 },
    { rate: 0.059, min: 2100001, max: Infinity }
  ],
  married_separate: [
    { rate: 0.015, min: 0, max: 550000 },
    { rate: 0.032, min: 550001, max: 1100000 },
    { rate: 0.047, min: 1100001, max: 1600000 },
    { rate: 0.049, min: 1600001, max: 2100000 },
    { rate: 0.059, min: 2100001, max: Infinity }
  ],
  head_of_household: [
    { rate: 0.015, min: 0, max: 550000 },
    { rate: 0.032, min: 550001, max: 1100000 },
    { rate: 0.047, min: 1100001, max: 1600000 },
    { rate: 0.049, min: 1600001, max: 2100000 },
    { rate: 0.059, min: 2100001, max: Infinity }
  ]
};

const NM_STANDARD_DEDUCTIONS_2025 = {
  single: 1500000,
  married_joint: 3000000,
  married_separate: 1500000,
  head_of_household: 2250000
};

/**
 * NORTH CAROLINA - 2025 Tax Brackets
 * Flat rate: 4.25%
 * All values in cents
 */
const NC_TAX_BRACKETS_2025 = {
  single: [{ rate: 0.0425, min: 0, max: Infinity }],
  married_joint: [{ rate: 0.0425, min: 0, max: Infinity }],
  married_separate: [{ rate: 0.0425, min: 0, max: Infinity }],
  head_of_household: [{ rate: 0.0425, min: 0, max: Infinity }]
};

const NC_STANDARD_DEDUCTIONS_2025 = {
  single: 1460000,
  married_joint: 2920000,
  married_separate: 1460000,
  head_of_household: 2190000
};

/**
 * NORTH DAKOTA - 2025 Tax Brackets
 * Progressive rates: 1.1%-2.9%
 * All values in cents
 */
const ND_TAX_BRACKETS_2025 = {
  single: [
    { rate: 0.011, min: 0, max: 4669500 },
    { rate: 0.0204, min: 4669501, max: 14008500 },
    { rate: 0.0227, min: 14008501, max: 23347500 },
    { rate: 0.0264, min: 23347501, max: 28017000 },
    { rate: 0.029, min: 28017001, max: Infinity }
  ],
  married_joint: [
    { rate: 0.011, min: 0, max: 4669500 },
    { rate: 0.0204, min: 4669501, max: 14008500 },
    { rate: 0.0227, min: 14008501, max: 23347500 },
    { rate: 0.0264, min: 23347501, max: 28017000 },
    { rate: 0.029, min: 28017001, max: Infinity }
  ],
  married_separate: [
    { rate: 0.011, min: 0, max: 4669500 },
    { rate: 0.0204, min: 4669501, max: 14008500 },
    { rate: 0.0227, min: 14008501, max: 23347500 },
    { rate: 0.0264, min: 23347501, max: 28017000 },
    { rate: 0.029, min: 28017001, max: Infinity }
  ],
  head_of_household: [
    { rate: 0.011, min: 0, max: 4669500 },
    { rate: 0.0204, min: 4669501, max: 14008500 },
    { rate: 0.0227, min: 14008501, max: 23347500 },
    { rate: 0.0264, min: 23347501, max: 28017000 },
    { rate: 0.029, min: 28017001, max: Infinity }
  ]
};

const ND_STANDARD_DEDUCTIONS_2025 = {
  single: 1460000,
  married_joint: 2920000,
  married_separate: 1460000,
  head_of_household: 2190000
};

/**
 * OHIO - 2025 Tax Brackets
 * Flat rate: 2.75% (on income over $26,050; income at/below $26,050 untaxed)
 * All values in cents
 */
const OH_TAX_BRACKETS_2025 = {
  single: [{ rate: 0.0275, min: 0, max: Infinity }],
  married_joint: [{ rate: 0.0275, min: 0, max: Infinity }],
  married_separate: [{ rate: 0.0275, min: 0, max: Infinity }],
  head_of_household: [{ rate: 0.0275, min: 0, max: Infinity }]
};

const OH_STANDARD_DEDUCTIONS_2025 = {
  single: 1460000,
  married_joint: 2920000,
  married_separate: 1460000,
  head_of_household: 2190000
};

/**
 * OKLAHOMA - 2025 Tax Brackets
 * Progressive rates: 0.25%-4.75%
 * All values in cents
 */
const OK_TAX_BRACKETS_2025 = {
  single: [
    { rate: 0.0025, min: 0, max: 1000000 },
    { rate: 0.007, min: 1000001, max: 2500000 },
    { rate: 0.011, min: 2500001, max: 3750000 },
    { rate: 0.015, min: 3750001, max: 4900000 },
    { rate: 0.027, min: 4900001, max: 7200000 },
    { rate: 0.036, min: 7200001, max: 12200000 },
    { rate: 0.0475, min: 12200001, max: Infinity }
  ],
  married_joint: [
    { rate: 0.0025, min: 0, max: 1000000 },
    { rate: 0.007, min: 1000001, max: 2500000 },
    { rate: 0.011, min: 2500001, max: 3750000 },
    { rate: 0.015, min: 3750001, max: 4900000 },
    { rate: 0.027, min: 4900001, max: 7200000 },
    { rate: 0.036, min: 7200001, max: 12200000 },
    { rate: 0.0475, min: 12200001, max: Infinity }
  ],
  married_separate: [
    { rate: 0.0025, min: 0, max: 1000000 },
    { rate: 0.007, min: 1000001, max: 2500000 },
    { rate: 0.011, min: 2500001, max: 3750000 },
    { rate: 0.015, min: 3750001, max: 4900000 },
    { rate: 0.027, min: 4900001, max: 7200000 },
    { rate: 0.036, min: 7200001, max: 12200000 },
    { rate: 0.0475, min: 12200001, max: Infinity }
  ],
  head_of_household: [
    { rate: 0.0025, min: 0, max: 1000000 },
    { rate: 0.007, min: 1000001, max: 2500000 },
    { rate: 0.011, min: 2500001, max: 3750000 },
    { rate: 0.015, min: 3750001, max: 4900000 },
    { rate: 0.027, min: 4900001, max: 7200000 },
    { rate: 0.036, min: 7200001, max: 12200000 },
    { rate: 0.0475, min: 12200001, max: Infinity }
  ]
};

const OK_STANDARD_DEDUCTIONS_2025 = {
  single: 635000,
  married_joint: 1270000,
  married_separate: 635000,
  head_of_household: 952500
};

/**
 * OREGON - 2025 Tax Brackets
 * Progressive rates: 4.75%-9.9%
 * All values in cents
 */
const OR_TAX_BRACKETS_2025 = {
  single: [
    { rate: 0.0475, min: 0, max: 405000 },
    { rate: 0.0675, min: 405001, max: 1030000 },
    { rate: 0.0875, min: 1030001, max: 12500000 },
    { rate: 0.099, min: 12500001, max: Infinity }
  ],
  married_joint: [
    { rate: 0.0475, min: 0, max: 810000 },
    { rate: 0.0675, min: 810001, max: 2060000 },
    { rate: 0.0875, min: 2060001, max: 25000000 },
    { rate: 0.099, min: 25000001, max: Infinity }
  ],
  married_separate: [
    { rate: 0.0475, min: 0, max: 405000 },
    { rate: 0.0675, min: 405001, max: 1030000 },
    { rate: 0.0875, min: 1030001, max: 12500000 },
    { rate: 0.099, min: 12500001, max: Infinity }
  ],
  head_of_household: [
    { rate: 0.0475, min: 0, max: 607500 },
    { rate: 0.0675, min: 607501, max: 1545000 },
    { rate: 0.0875, min: 1545001, max: 18750000 },
    { rate: 0.099, min: 18750001, max: Infinity }
  ]
};

const OR_STANDARD_DEDUCTIONS_2025 = {
  single: 283500,
  married_joint: 567000,
  married_separate: 283500,
  head_of_household: 425250
};

/**
 * PENNSYLVANIA - 2025 Tax Brackets
 * Flat rate: 3.07%
 * All values in cents
 */
const PA_TAX_BRACKETS_2025 = {
  single: [{ rate: 0.0307, min: 0, max: Infinity }],
  married_joint: [{ rate: 0.0307, min: 0, max: Infinity }],
  married_separate: [{ rate: 0.0307, min: 0, max: Infinity }],
  head_of_household: [{ rate: 0.0307, min: 0, max: Infinity }]
};

const PA_STANDARD_DEDUCTIONS_2025 = {
  single: 1460000,
  married_joint: 2920000,
  married_separate: 1460000,
  head_of_household: 2190000
};

/**
 * RHODE ISLAND - 2025 Tax Brackets
 * Progressive rates: 3.75%-5.99%
 * All values in cents
 */
const RI_TAX_BRACKETS_2025 = {
  single: [
    { rate: 0.0375, min: 0, max: 7345000 },
    { rate: 0.0475, min: 7345001, max: 16695000 },
    { rate: 0.0599, min: 16695001, max: Infinity }
  ],
  married_joint: [
    { rate: 0.0375, min: 0, max: 7345000 },
    { rate: 0.0475, min: 7345001, max: 16695000 },
    { rate: 0.0599, min: 16695001, max: Infinity }
  ],
  married_separate: [
    { rate: 0.0375, min: 0, max: 7345000 },
    { rate: 0.0475, min: 7345001, max: 16695000 },
    { rate: 0.0599, min: 16695001, max: Infinity }
  ],
  head_of_household: [
    { rate: 0.0375, min: 0, max: 7345000 },
    { rate: 0.0475, min: 7345001, max: 16695000 },
    { rate: 0.0599, min: 16695001, max: Infinity }
  ]
};

const RI_STANDARD_DEDUCTIONS_2025 = {
  single: 1090000,
  married_joint: 2180000,
  married_separate: 1090000,
  head_of_household: 1635000
};

/**
 * SOUTH CAROLINA - 2025 Tax Brackets
 * Progressive rates: 0%-6.2%
 * All values in cents
 */
const SC_TAX_BRACKETS_2025 = {
  single: [
    { rate: 0.00, min: 0, max: 360000 },
    { rate: 0.03, min: 360001, max: 360100 },
    { rate: 0.031, min: 360101, max: 360200 },
    { rate: 0.032, min: 360201, max: 360300 },
    { rate: 0.033, min: 360301, max: 360400 },
    { rate: 0.034, min: 360401, max: 360500 },
    { rate: 0.035, min: 360501, max: 360600 },
    { rate: 0.036, min: 360601, max: 360700 },
    { rate: 0.037, min: 360701, max: 360800 },
    { rate: 0.038, min: 360801, max: 360900 },
    { rate: 0.039, min: 360901, max: 361000 },
    { rate: 0.04, min: 361001, max: 361100 },
    { rate: 0.041, min: 361101, max: 361200 },
    { rate: 0.042, min: 361201, max: 361300 },
    { rate: 0.043, min: 361301, max: 361400 },
    { rate: 0.044, min: 361401, max: 361500 },
    { rate: 0.045, min: 361501, max: 361600 },
    { rate: 0.046, min: 361601, max: 361700 },
    { rate: 0.047, min: 361701, max: 361800 },
    { rate: 0.048, min: 361801, max: 361900 },
    { rate: 0.049, min: 361901, max: 362000 },
    { rate: 0.05, min: 362001, max: 362100 },
    { rate: 0.051, min: 362101, max: 362200 },
    { rate: 0.052, min: 362201, max: 362300 },
    { rate: 0.053, min: 362301, max: 362400 },
    { rate: 0.054, min: 362401, max: 362500 },
    { rate: 0.055, min: 362501, max: 362600 },
    { rate: 0.056, min: 362601, max: 362700 },
    { rate: 0.057, min: 362701, max: 362800 },
    { rate: 0.058, min: 362801, max: 362900 },
    { rate: 0.059, min: 362901, max: 363000 },
    { rate: 0.06, min: 363001, max: 363100 },
    { rate: 0.061, min: 363101, max: 363200 },
    { rate: 0.062, min: 363201, max: Infinity }
  ],
  married_joint: [
    { rate: 0.00, min: 0, max: 360000 },
    { rate: 0.03, min: 360001, max: 360100 },
    { rate: 0.031, min: 360101, max: 360200 },
    { rate: 0.032, min: 360201, max: 360300 },
    { rate: 0.033, min: 360301, max: 360400 },
    { rate: 0.034, min: 360401, max: 360500 },
    { rate: 0.035, min: 360501, max: 360600 },
    { rate: 0.036, min: 360601, max: 360700 },
    { rate: 0.037, min: 360701, max: 360800 },
    { rate: 0.038, min: 360801, max: 360900 },
    { rate: 0.039, min: 360901, max: 361000 },
    { rate: 0.04, min: 361001, max: 361100 },
    { rate: 0.041, min: 361101, max: 361200 },
    { rate: 0.042, min: 361201, max: 361300 },
    { rate: 0.043, min: 361301, max: 361400 },
    { rate: 0.044, min: 361401, max: 361500 },
    { rate: 0.045, min: 361501, max: 361600 },
    { rate: 0.046, min: 361601, max: 361700 },
    { rate: 0.047, min: 361701, max: 361800 },
    { rate: 0.048, min: 361801, max: 361900 },
    { rate: 0.049, min: 361901, max: 362000 },
    { rate: 0.05, min: 362001, max: 362100 },
    { rate: 0.051, min: 362101, max: 362200 },
    { rate: 0.052, min: 362201, max: 362300 },
    { rate: 0.053, min: 362301, max: 362400 },
    { rate: 0.054, min: 362401, max: 362500 },
    { rate: 0.055, min: 362501, max: 362600 },
    { rate: 0.056, min: 362601, max: 362700 },
    { rate: 0.057, min: 362701, max: 362800 },
    { rate: 0.058, min: 362801, max: 362900 },
    { rate: 0.059, min: 362901, max: 363000 },
    { rate: 0.06, min: 363001, max: 363100 },
    { rate: 0.061, min: 363101, max: 363200 },
    { rate: 0.062, min: 363201, max: Infinity }
  ],
  married_separate: [
    { rate: 0.00, min: 0, max: 360000 },
    { rate: 0.03, min: 360001, max: 360100 },
    { rate: 0.031, min: 360101, max: 360200 },
    { rate: 0.032, min: 360201, max: 360300 },
    { rate: 0.033, min: 360301, max: 360400 },
    { rate: 0.034, min: 360401, max: 360500 },
    { rate: 0.035, min: 360501, max: 360600 },
    { rate: 0.036, min: 360601, max: 360700 },
    { rate: 0.037, min: 360701, max: 360800 },
    { rate: 0.038, min: 360801, max: 360900 },
    { rate: 0.039, min: 360901, max: 361000 },
    { rate: 0.04, min: 361001, max: 361100 },
    { rate: 0.041, min: 361101, max: 361200 },
    { rate: 0.042, min: 361201, max: 361300 },
    { rate: 0.043, min: 361301, max: 361400 },
    { rate: 0.044, min: 361401, max: 361500 },
    { rate: 0.045, min: 361501, max: 361600 },
    { rate: 0.046, min: 361601, max: 361700 },
    { rate: 0.047, min: 361701, max: 361800 },
    { rate: 0.048, min: 361801, max: 361900 },
    { rate: 0.049, min: 361901, max: 362000 },
    { rate: 0.05, min: 362001, max: 362100 },
    { rate: 0.051, min: 362101, max: 362200 },
    { rate: 0.052, min: 362201, max: 362300 },
    { rate: 0.053, min: 362301, max: 362400 },
    { rate: 0.054, min: 362401, max: 362500 },
    { rate: 0.055, min: 362501, max: 362600 },
    { rate: 0.056, min: 362601, max: 362700 },
    { rate: 0.057, min: 362701, max: 362800 },
    { rate: 0.058, min: 362801, max: 362900 },
    { rate: 0.059, min: 362901, max: 363000 },
    { rate: 0.06, min: 363001, max: 363100 },
    { rate: 0.061, min: 363101, max: 363200 },
    { rate: 0.062, min: 363201, max: Infinity }
  ],
  head_of_household: [
    { rate: 0.00, min: 0, max: 360000 },
    { rate: 0.03, min: 360001, max: 360100 },
    { rate: 0.031, min: 360101, max: 360200 },
    { rate: 0.032, min: 360201, max: 360300 },
    { rate: 0.033, min: 360301, max: 360400 },
    { rate: 0.034, min: 360401, max: 360500 },
    { rate: 0.035, min: 360501, max: 360600 },
    { rate: 0.036, min: 360601, max: 360700 },
    { rate: 0.037, min: 360701, max: 360800 },
    { rate: 0.038, min: 360801, max: 360900 },
    { rate: 0.039, min: 360901, max: 361000 },
    { rate: 0.04, min: 361001, max: 361100 },
    { rate: 0.041, min: 361101, max: 361200 },
    { rate: 0.042, min: 361201, max: 361300 },
    { rate: 0.043, min: 361301, max: 361400 },
    { rate: 0.044, min: 361401, max: 361500 },
    { rate: 0.045, min: 361501, max: 361600 },
    { rate: 0.046, min: 361601, max: 361700 },
    { rate: 0.047, min: 361701, max: 361800 },
    { rate: 0.048, min: 361801, max: 361900 },
    { rate: 0.049, min: 361901, max: 362000 },
    { rate: 0.05, min: 362001, max: 362100 },
    { rate: 0.051, min: 362101, max: 362200 },
    { rate: 0.052, min: 362201, max: 362300 },
    { rate: 0.053, min: 362301, max: 362400 },
    { rate: 0.054, min: 362401, max: 362500 },
    { rate: 0.055, min: 362501, max: 362600 },
    { rate: 0.056, min: 362601, max: 362700 },
    { rate: 0.057, min: 362701, max: 362800 },
    { rate: 0.058, min: 362801, max: 362900 },
    { rate: 0.059, min: 362901, max: 363000 },
    { rate: 0.06, min: 363001, max: 363100 },
    { rate: 0.061, min: 363101, max: 363200 },
    { rate: 0.062, min: 363201, max: Infinity }
  ]
};

const SC_STANDARD_DEDUCTIONS_2025 = {
  single: 1460000,
  married_joint: 2920000,
  married_separate: 1460000,
  head_of_household: 2190000
};

/**
 * UTAH - 2025 Tax Brackets
 * Flat rate: 4.5%
 * All values in cents
 */
const UT_TAX_BRACKETS_2025 = {
  single: [{ rate: 0.045, min: 0, max: Infinity }],
  married_joint: [{ rate: 0.045, min: 0, max: Infinity }],
  married_separate: [{ rate: 0.045, min: 0, max: Infinity }],
  head_of_household: [{ rate: 0.045, min: 0, max: Infinity }]
};

const UT_STANDARD_DEDUCTIONS_2025 = {
  single: 1460000,
  married_joint: 2920000,
  married_separate: 1460000,
  head_of_household: 2190000
};

/**
 * VERMONT - 2025 Tax Brackets
 * Progressive rates: 3.35%-8.75%
 * All values in cents
 */
const VT_TAX_BRACKETS_2025 = {
  single: [
    { rate: 0.0335, min: 0, max: 4540000 },
    { rate: 0.066, min: 4540001, max: 10940000 },
    { rate: 0.076, min: 10940001, max: 22950000 },
    { rate: 0.0875, min: 22950001, max: Infinity }
  ],
  married_joint: [
    { rate: 0.0335, min: 0, max: 9080000 },
    { rate: 0.066, min: 9080001, max: 21880000 },
    { rate: 0.076, min: 21880001, max: 45900000 },
    { rate: 0.0875, min: 45900001, max: Infinity }
  ],
  married_separate: [
    { rate: 0.0335, min: 0, max: 4540000 },
    { rate: 0.066, min: 4540001, max: 10940000 },
    { rate: 0.076, min: 10940001, max: 22950000 },
    { rate: 0.0875, min: 22950001, max: Infinity }
  ],
  head_of_household: [
    { rate: 0.0335, min: 0, max: 6810000 },
    { rate: 0.066, min: 6810001, max: 16410000 },
    { rate: 0.076, min: 16410001, max: 34425000 },
    { rate: 0.0875, min: 34425001, max: Infinity }
  ]
};

const VT_STANDARD_DEDUCTIONS_2025 = {
  single: 740000,
  married_joint: 1485000,
  married_separate: 740000,
  head_of_household: 1110000
};

/**
 * VIRGINIA - 2025 Tax Brackets
 * Progressive rates: 2%-5.75%
 * All values in cents
 */
const VA_TAX_BRACKETS_2025 = {
  single: [
    { rate: 0.02, min: 0, max: 300000 },
    { rate: 0.03, min: 300001, max: 500000 },
    { rate: 0.0575, min: 500001, max: Infinity }
  ],
  married_joint: [
    { rate: 0.02, min: 0, max: 300000 },
    { rate: 0.03, min: 300001, max: 500000 },
    { rate: 0.0575, min: 500001, max: Infinity }
  ],
  married_separate: [
    { rate: 0.02, min: 0, max: 300000 },
    { rate: 0.03, min: 300001, max: 500000 },
    { rate: 0.0575, min: 500001, max: Infinity }
  ],
  head_of_household: [
    { rate: 0.02, min: 0, max: 300000 },
    { rate: 0.03, min: 300001, max: 500000 },
    { rate: 0.0575, min: 500001, max: Infinity }
  ]
};

const VA_STANDARD_DEDUCTIONS_2025 = {
  single: 875000,
  married_joint: 1750000,
  married_separate: 875000,
  head_of_household: 875000
};

/**
 * WASHINGTON D.C. - 2025 Tax Brackets
 * Progressive rates: 4%-10.75%
 * All values in cents
 */
const DC_TAX_BRACKETS_2025 = {
  single: [
    { rate: 0.04, min: 0, max: 1000000 },
    { rate: 0.06, min: 1000001, max: 4000000 },
    { rate: 0.065, min: 4000001, max: 6000000 },
    { rate: 0.085, min: 6000001, max: 25000000 },
    { rate: 0.0925, min: 25000001, max: 50000000 },
    { rate: 0.0975, min: 50000001, max: 100000000 },
    { rate: 0.1075, min: 100000001, max: Infinity }
  ],
  married_joint: [
    { rate: 0.04, min: 0, max: 1000000 },
    { rate: 0.06, min: 1000001, max: 4000000 },
    { rate: 0.065, min: 4000001, max: 6000000 },
    { rate: 0.085, min: 6000001, max: 25000000 },
    { rate: 0.0925, min: 25000001, max: 50000000 },
    { rate: 0.0975, min: 50000001, max: 100000000 },
    { rate: 0.1075, min: 100000001, max: Infinity }
  ],
  married_separate: [
    { rate: 0.04, min: 0, max: 1000000 },
    { rate: 0.06, min: 1000001, max: 4000000 },
    { rate: 0.065, min: 4000001, max: 6000000 },
    { rate: 0.085, min: 6000001, max: 25000000 },
    { rate: 0.0925, min: 25000001, max: 50000000 },
    { rate: 0.0975, min: 50000001, max: 100000000 },
    { rate: 0.1075, min: 100000001, max: Infinity }
  ],
  head_of_household: [
    { rate: 0.04, min: 0, max: 1000000 },
    { rate: 0.06, min: 1000001, max: 4000000 },
    { rate: 0.065, min: 4000001, max: 6000000 },
    { rate: 0.085, min: 6000001, max: 25000000 },
    { rate: 0.0925, min: 25000001, max: 50000000 },
    { rate: 0.0975, min: 50000001, max: 100000000 },
    { rate: 0.1075, min: 100000001, max: Infinity }
  ]
};

const DC_STANDARD_DEDUCTIONS_2025 = {
  single: 1500000,
  married_joint: 3000000,
  married_separate: 1500000,
  head_of_household: 2250000
};

/**
 * WEST VIRGINIA - 2025 Tax Brackets
 * Progressive rates: 2.22%-4.82%
 * All values in cents
 */
const WV_TAX_BRACKETS_2025 = {
  single: [
    { rate: 0.0222, min: 0, max: 1000000 },
    { rate: 0.0265, min: 1000001, max: 2500000 },
    { rate: 0.0309, min: 2500001, max: 4000000 },
    { rate: 0.0352, min: 4000001, max: 6000000 },
    { rate: 0.0395, min: 6000001, max: 8000000 },
    { rate: 0.0438, min: 8000001, max: 10000000 },
    { rate: 0.0482, min: 10000001, max: Infinity }
  ],
  married_joint: [
    { rate: 0.0222, min: 0, max: 1000000 },
    { rate: 0.0265, min: 1000001, max: 2500000 },
    { rate: 0.0309, min: 2500001, max: 4000000 },
    { rate: 0.0352, min: 4000001, max: 6000000 },
    { rate: 0.0395, min: 6000001, max: 8000000 },
    { rate: 0.0438, min: 8000001, max: 10000000 },
    { rate: 0.0482, min: 10000001, max: Infinity }
  ],
  married_separate: [
    { rate: 0.0222, min: 0, max: 1000000 },
    { rate: 0.0265, min: 1000001, max: 2500000 },
    { rate: 0.0309, min: 2500001, max: 4000000 },
    { rate: 0.0352, min: 4000001, max: 6000000 },
    { rate: 0.0395, min: 6000001, max: 8000000 },
    { rate: 0.0438, min: 8000001, max: 10000000 },
    { rate: 0.0482, min: 10000001, max: Infinity }
  ],
  head_of_household: [
    { rate: 0.0222, min: 0, max: 1000000 },
    { rate: 0.0265, min: 1000001, max: 2500000 },
    { rate: 0.0309, min: 2500001, max: 4000000 },
    { rate: 0.0352, min: 4000001, max: 6000000 },
    { rate: 0.0395, min: 6000001, max: 8000000 },
    { rate: 0.0438, min: 8000001, max: 10000000 },
    { rate: 0.0482, min: 10000001, max: Infinity }
  ]
};

const WV_STANDARD_DEDUCTIONS_2025 = {
  single: 200000,
  married_joint: 400000,
  married_separate: 200000,
  head_of_household: 200000
};

/**
 * WISCONSIN - 2025 Tax Brackets
 * Progressive rates: 3.5%-7.65%
 * All values in cents
 */
const WI_TAX_BRACKETS_2025 = {
  single: [
    { rate: 0.035, min: 0, max: 1468000 },
    { rate: 0.044, min: 1468001, max: 5048000 },
    { rate: 0.053, min: 5048001, max: 32329000 },
    { rate: 0.0765, min: 32329001, max: Infinity }
  ],
  married_joint: [
    { rate: 0.035, min: 0, max: 2192000 },
    { rate: 0.044, min: 2192001, max: 7572000 },
    { rate: 0.053, min: 7572001, max: 48493500 },
    { rate: 0.0765, min: 48493501, max: Infinity }
  ],
  married_separate: [
    { rate: 0.035, min: 0, max: 1096000 },
    { rate: 0.044, min: 1096001, max: 3786000 },
    { rate: 0.053, min: 3786001, max: 24246750 },
    { rate: 0.0765, min: 24246751, max: Infinity }
  ],
  head_of_household: [
    { rate: 0.035, min: 0, max: 1832000 },
    { rate: 0.044, min: 1832001, max: 6310000 },
    { rate: 0.053, min: 6310001, max: 40361100 },
    { rate: 0.0765, min: 40361101, max: Infinity }
  ]
};

const WI_STANDARD_DEDUCTIONS_2025 = {
  single: 1500000,
  married_joint: 3000000,
  married_separate: 1500000,
  head_of_household: 2250000
};

/**
 * Get state tax brackets for given state, year, and filing status
 * @param {string} state - State abbreviation (2-letter code or null)
 * @param {number} year - Tax year (2024 or 2025)
 * @param {string} filingStatus - Filing status
 * @returns {Array} State tax brackets
 */
export function getStateTaxBrackets(state, year, filingStatus) {
  if (!state) return null;

  const upperState = state.toUpperCase();

  // States with no income tax - return empty brackets
  const noTaxStates = ['AK', 'FL', 'NV', 'SD', 'TN', 'TX', 'WA', 'WY', 'NH'];
  if (noTaxStates.includes(upperState)) {
    return [{ rate: 0.0, min: 0, max: Infinity }];
  }

  // All other states - return their respective brackets
  const stateMappings = {
    'AL': year === 2024 ? AL_TAX_BRACKETS_2024 : AL_TAX_BRACKETS_2025,
    'AR': year === 2024 ? AR_TAX_BRACKETS_2024 : AR_TAX_BRACKETS_2025,
    'AZ': year === 2024 ? AZ_TAX_BRACKETS_2024 : AZ_TAX_BRACKETS_2025,
    'CA': year === 2024 ? CA_TAX_BRACKETS_2024 : CA_TAX_BRACKETS_2025,
    'CO': year === 2024 ? CO_TAX_BRACKETS_2024 : CO_TAX_BRACKETS_2025,
    'CT': year === 2024 ? CT_TAX_BRACKETS_2024 : CT_TAX_BRACKETS_2025,
    'DC': year === 2024 ? DC_TAX_BRACKETS_2024 : DC_TAX_BRACKETS_2025,
    'DE': year === 2024 ? DE_TAX_BRACKETS_2024 : DE_TAX_BRACKETS_2025,
    'GA': year === 2024 ? GA_TAX_BRACKETS_2024 : GA_TAX_BRACKETS_2025,
    'HI': year === 2024 ? HI_TAX_BRACKETS_2024 : HI_TAX_BRACKETS_2025,
    'IA': year === 2024 ? IA_TAX_BRACKETS_2024 : IA_TAX_BRACKETS_2025,
    'ID': year === 2024 ? ID_TAX_BRACKETS_2024 : ID_TAX_BRACKETS_2025,
    'IL': year === 2024 ? IL_TAX_BRACKETS_2024 : IL_TAX_BRACKETS_2025,
    'IN': year === 2024 ? IN_TAX_BRACKETS_2024 : IN_TAX_BRACKETS_2025,
    'KS': year === 2024 ? KS_TAX_BRACKETS_2024 : KS_TAX_BRACKETS_2025,
    'KY': year === 2024 ? KY_TAX_BRACKETS_2024 : KY_TAX_BRACKETS_2025,
    'LA': year === 2024 ? LA_TAX_BRACKETS_2024 : LA_TAX_BRACKETS_2025,
    'MA': year === 2024 ? MA_TAX_BRACKETS_2024 : MA_TAX_BRACKETS_2025,
    'MD': year === 2024 ? MD_TAX_BRACKETS_2024 : MD_TAX_BRACKETS_2025,
    'ME': year === 2024 ? ME_TAX_BRACKETS_2024 : ME_TAX_BRACKETS_2025,
    'MI': year === 2024 ? MI_TAX_BRACKETS_2024 : MI_TAX_BRACKETS_2025,
    'MN': year === 2024 ? MN_TAX_BRACKETS_2024 : MN_TAX_BRACKETS_2025,
    'MO': year === 2024 ? MO_TAX_BRACKETS_2024 : MO_TAX_BRACKETS_2025,
    'MS': year === 2024 ? MS_TAX_BRACKETS_2024 : MS_TAX_BRACKETS_2025,
    'MT': year === 2024 ? MT_TAX_BRACKETS_2024 : MT_TAX_BRACKETS_2025,
    'NC': year === 2024 ? NC_TAX_BRACKETS_2024 : NC_TAX_BRACKETS_2025,
    'ND': year === 2024 ? ND_TAX_BRACKETS_2024 : ND_TAX_BRACKETS_2025,
    'NE': year === 2024 ? NE_TAX_BRACKETS_2024 : NE_TAX_BRACKETS_2025,
    'NH': year === 2024 ? NH_TAX_BRACKETS_2024 : NH_TAX_BRACKETS_2025,
    'NJ': year === 2024 ? NJ_TAX_BRACKETS_2024 : NJ_TAX_BRACKETS_2025,
    'NM': year === 2024 ? NM_TAX_BRACKETS_2024 : NM_TAX_BRACKETS_2025,
    'NV': year === 2024 ? NV_TAX_BRACKETS_2024 : NV_TAX_BRACKETS_2025,
    'NY': year === 2024 ? NY_TAX_BRACKETS_2024 : NY_TAX_BRACKETS_2025,
    'OH': year === 2024 ? OH_TAX_BRACKETS_2024 : OH_TAX_BRACKETS_2025,
    'OK': year === 2024 ? OK_TAX_BRACKETS_2024 : OK_TAX_BRACKETS_2025,
    'OR': year === 2024 ? OR_TAX_BRACKETS_2024 : OR_TAX_BRACKETS_2025,
    'PA': year === 2024 ? PA_TAX_BRACKETS_2024 : PA_TAX_BRACKETS_2025,
    'RI': year === 2024 ? RI_TAX_BRACKETS_2024 : RI_TAX_BRACKETS_2025,
    'SC': year === 2024 ? SC_TAX_BRACKETS_2024 : SC_TAX_BRACKETS_2025,
    'SD': year === 2024 ? SD_TAX_BRACKETS_2024 : SD_TAX_BRACKETS_2025,
    'TN': year === 2024 ? TN_TAX_BRACKETS_2024 : TN_TAX_BRACKETS_2025,
    'TX': year === 2024 ? TX_TAX_BRACKETS_2024 : TX_TAX_BRACKETS_2025,
    'UT': year === 2024 ? UT_TAX_BRACKETS_2024 : UT_TAX_BRACKETS_2025,
    'VA': year === 2024 ? VA_TAX_BRACKETS_2024 : VA_TAX_BRACKETS_2025,
    'VT': year === 2024 ? VT_TAX_BRACKETS_2024 : VT_TAX_BRACKETS_2025,
    'WA': year === 2024 ? WA_TAX_BRACKETS_2024 : WA_TAX_BRACKETS_2025,
    'WI': year === 2024 ? WI_TAX_BRACKETS_2024 : WI_TAX_BRACKETS_2025,
    'WV': year === 2024 ? WV_TAX_BRACKETS_2024 : WV_TAX_BRACKETS_2025,
    'WY': year === 2024 ? WY_TAX_BRACKETS_2024 : WY_TAX_BRACKETS_2025
  };

  const brackets = stateMappings[upperState];
  if (!brackets || !brackets[filingStatus]) {
    throw new Error(`Invalid filing status for ${state}: ${filingStatus}`);
  }

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

  const upperState = state.toUpperCase();

  // States with no income tax
  const noTaxStates = ['AK', 'FL', 'NV', 'SD', 'TN', 'TX', 'WA', 'WY', 'NH'];
  if (noTaxStates.includes(upperState)) {
    return 0;
  }

  // All other states - return their respective deductions
  const deductionMappings = {
    'AL': year === 2024 ? AL_STANDARD_DEDUCTIONS_2024 : AL_STANDARD_DEDUCTIONS_2025,
    'AR': year === 2024 ? AR_STANDARD_DEDUCTIONS_2024 : AR_STANDARD_DEDUCTIONS_2025,
    'AZ': year === 2024 ? AZ_STANDARD_DEDUCTIONS_2024 : AZ_STANDARD_DEDUCTIONS_2025,
    'CA': year === 2024 ? CA_STANDARD_DEDUCTIONS_2024 : CA_STANDARD_DEDUCTIONS_2025,
    'CO': year === 2024 ? CO_STANDARD_DEDUCTIONS_2024 : CO_STANDARD_DEDUCTIONS_2025,
    'CT': year === 2024 ? CT_STANDARD_DEDUCTIONS_2024 : CT_STANDARD_DEDUCTIONS_2025,
    'DC': year === 2024 ? DC_STANDARD_DEDUCTIONS_2024 : DC_STANDARD_DEDUCTIONS_2025,
    'DE': year === 2024 ? DE_STANDARD_DEDUCTIONS_2024 : DE_STANDARD_DEDUCTIONS_2025,
    'GA': year === 2024 ? GA_STANDARD_DEDUCTIONS_2024 : GA_STANDARD_DEDUCTIONS_2025,
    'HI': year === 2024 ? HI_STANDARD_DEDUCTIONS_2024 : HI_STANDARD_DEDUCTIONS_2025,
    'IA': year === 2024 ? IA_STANDARD_DEDUCTIONS_2024 : IA_STANDARD_DEDUCTIONS_2025,
    'ID': year === 2024 ? ID_STANDARD_DEDUCTIONS_2024 : ID_STANDARD_DEDUCTIONS_2025,
    'IL': year === 2024 ? IL_STANDARD_DEDUCTIONS_2024 : IL_STANDARD_DEDUCTIONS_2025,
    'IN': year === 2024 ? IN_STANDARD_DEDUCTIONS_2024 : IN_STANDARD_DEDUCTIONS_2025,
    'KS': year === 2024 ? KS_STANDARD_DEDUCTIONS_2024 : KS_STANDARD_DEDUCTIONS_2025,
    'KY': year === 2024 ? KY_STANDARD_DEDUCTIONS_2024 : KY_STANDARD_DEDUCTIONS_2025,
    'LA': year === 2024 ? LA_STANDARD_DEDUCTIONS_2024 : LA_STANDARD_DEDUCTIONS_2025,
    'MA': year === 2024 ? MA_STANDARD_DEDUCTIONS_2024 : MA_STANDARD_DEDUCTIONS_2025,
    'MD': year === 2024 ? MD_STANDARD_DEDUCTIONS_2024 : MD_STANDARD_DEDUCTIONS_2025,
    'ME': year === 2024 ? ME_STANDARD_DEDUCTIONS_2024 : ME_STANDARD_DEDUCTIONS_2025,
    'MI': year === 2024 ? MI_STANDARD_DEDUCTIONS_2024 : MI_STANDARD_DEDUCTIONS_2025,
    'MN': year === 2024 ? MN_STANDARD_DEDUCTIONS_2024 : MN_STANDARD_DEDUCTIONS_2025,
    'MO': year === 2024 ? MO_STANDARD_DEDUCTIONS_2024 : MO_STANDARD_DEDUCTIONS_2025,
    'MS': year === 2024 ? MS_STANDARD_DEDUCTIONS_2024 : MS_STANDARD_DEDUCTIONS_2025,
    'MT': year === 2024 ? MT_STANDARD_DEDUCTIONS_2024 : MT_STANDARD_DEDUCTIONS_2025,
    'NC': year === 2024 ? NC_STANDARD_DEDUCTIONS_2024 : NC_STANDARD_DEDUCTIONS_2025,
    'ND': year === 2024 ? ND_STANDARD_DEDUCTIONS_2024 : ND_STANDARD_DEDUCTIONS_2025,
    'NE': year === 2024 ? NE_STANDARD_DEDUCTIONS_2024 : NE_STANDARD_DEDUCTIONS_2025,
    'NH': year === 2024 ? NH_STANDARD_DEDUCTIONS_2024 : NH_STANDARD_DEDUCTIONS_2025,
    'NJ': year === 2024 ? NJ_STANDARD_DEDUCTIONS_2024 : NJ_STANDARD_DEDUCTIONS_2025,
    'NM': year === 2024 ? NM_STANDARD_DEDUCTIONS_2024 : NM_STANDARD_DEDUCTIONS_2025,
    'NV': year === 2024 ? NV_STANDARD_DEDUCTIONS_2024 : NV_STANDARD_DEDUCTIONS_2025,
    'NY': year === 2024 ? NY_STANDARD_DEDUCTIONS_2024 : NY_STANDARD_DEDUCTIONS_2025,
    'OH': year === 2024 ? OH_STANDARD_DEDUCTIONS_2024 : OH_STANDARD_DEDUCTIONS_2025,
    'OK': year === 2024 ? OK_STANDARD_DEDUCTIONS_2024 : OK_STANDARD_DEDUCTIONS_2025,
    'OR': year === 2024 ? OR_STANDARD_DEDUCTIONS_2024 : OR_STANDARD_DEDUCTIONS_2025,
    'PA': year === 2024 ? PA_STANDARD_DEDUCTIONS_2024 : PA_STANDARD_DEDUCTIONS_2025,
    'RI': year === 2024 ? RI_STANDARD_DEDUCTIONS_2024 : RI_STANDARD_DEDUCTIONS_2025,
    'SC': year === 2024 ? SC_STANDARD_DEDUCTIONS_2024 : SC_STANDARD_DEDUCTIONS_2025,
    'SD': year === 2024 ? SD_STANDARD_DEDUCTIONS_2024 : SD_STANDARD_DEDUCTIONS_2025,
    'TN': year === 2024 ? TN_STANDARD_DEDUCTIONS_2024 : TN_STANDARD_DEDUCTIONS_2025,
    'TX': year === 2024 ? TX_STANDARD_DEDUCTIONS_2024 : TX_STANDARD_DEDUCTIONS_2025,
    'UT': year === 2024 ? UT_STANDARD_DEDUCTIONS_2024 : UT_STANDARD_DEDUCTIONS_2025,
    'VA': year === 2024 ? VA_STANDARD_DEDUCTIONS_2024 : VA_STANDARD_DEDUCTIONS_2025,
    'VT': year === 2024 ? VT_STANDARD_DEDUCTIONS_2024 : VT_STANDARD_DEDUCTIONS_2025,
    'WA': year === 2024 ? WA_STANDARD_DEDUCTIONS_2024 : WA_STANDARD_DEDUCTIONS_2025,
    'WI': year === 2024 ? WI_STANDARD_DEDUCTIONS_2024 : WI_STANDARD_DEDUCTIONS_2025,
    'WV': year === 2024 ? WV_STANDARD_DEDUCTIONS_2024 : WV_STANDARD_DEDUCTIONS_2025,
    'WY': year === 2024 ? WY_STANDARD_DEDUCTIONS_2024 : WY_STANDARD_DEDUCTIONS_2025
  };

  const deductions = deductionMappings[upperState];
  if (!deductions || !deductions[filingStatus]) {
    throw new Error(`Invalid filing status for ${state}: ${filingStatus}`);
  }

  return deductions[filingStatus];
}
