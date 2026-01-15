/**
 * Federal tax brackets and deductions for 2024-2025. All values in cents.
 */

/**
 * Federal income tax brackets for 2024
 * All values in cents
 */
const TAX_BRACKETS_2024 = {
  single: [
    { rate: 0.1, min: 0, max: 1160000 },
    { rate: 0.12, min: 1160001, max: 4715000 },
    { rate: 0.22, min: 4715001, max: 10052500 },
    { rate: 0.24, min: 10052501, max: 19195000 },
    { rate: 0.32, min: 19195001, max: 24372500 },
    { rate: 0.35, min: 24372501, max: 60935000 },
    { rate: 0.37, min: 60935001, max: Infinity },
  ],
  married_joint: [
    { rate: 0.1, min: 0, max: 2320000 },
    { rate: 0.12, min: 2320001, max: 9430000 },
    { rate: 0.22, min: 9430001, max: 20105000 },
    { rate: 0.24, min: 20105001, max: 38390000 },
    { rate: 0.32, min: 38390001, max: 48745000 },
    { rate: 0.35, min: 48745001, max: 73120000 },
    { rate: 0.37, min: 73120001, max: Infinity },
  ],
  married_separate: [
    { rate: 0.1, min: 0, max: 1160000 },
    { rate: 0.12, min: 1160001, max: 4715000 },
    { rate: 0.22, min: 4715001, max: 10052500 },
    { rate: 0.24, min: 10052501, max: 19195000 },
    { rate: 0.32, min: 19195001, max: 24372500 },
    { rate: 0.35, min: 24372501, max: 36560000 },
    { rate: 0.37, min: 36560001, max: Infinity },
  ],
  head_of_household: [
    { rate: 0.1, min: 0, max: 1655000 },
    { rate: 0.12, min: 1655001, max: 6310000 },
    { rate: 0.22, min: 6310001, max: 10050000 },
    { rate: 0.24, min: 10050001, max: 19195000 },
    { rate: 0.32, min: 19195001, max: 24370000 },
    { rate: 0.35, min: 24370001, max: 60935000 },
    { rate: 0.37, min: 60935001, max: Infinity },
  ],
};

/**
 * Federal income tax brackets for 2025
 * All values in cents
 */
const TAX_BRACKETS_2025 = {
  single: [
    { rate: 0.1, min: 0, max: 1192500 },
    { rate: 0.12, min: 1192501, max: 4847500 },
    { rate: 0.22, min: 4847501, max: 10335000 },
    { rate: 0.24, min: 10335001, max: 19730000 },
    { rate: 0.32, min: 19730001, max: 25052500 },
    { rate: 0.35, min: 25052501, max: 62635000 },
    { rate: 0.37, min: 62635001, max: Infinity },
  ],
  married_joint: [
    { rate: 0.1, min: 0, max: 2385000 },
    { rate: 0.12, min: 2385001, max: 9695000 },
    { rate: 0.22, min: 9695001, max: 20670000 },
    { rate: 0.24, min: 20670001, max: 39460000 },
    { rate: 0.32, min: 39460001, max: 50105000 },
    { rate: 0.35, min: 50105001, max: 75160000 },
    { rate: 0.37, min: 75160001, max: Infinity },
  ],
  married_separate: [
    { rate: 0.1, min: 0, max: 1192500 },
    { rate: 0.12, min: 1192501, max: 4847500 },
    { rate: 0.22, min: 4847501, max: 10335000 },
    { rate: 0.24, min: 10335001, max: 19730000 },
    { rate: 0.32, min: 19730001, max: 25052500 },
    { rate: 0.35, min: 25052501, max: 62635000 },
    { rate: 0.37, min: 62635001, max: Infinity },
  ],
  head_of_household: [
    { rate: 0.1, min: 0, max: 1700000 },
    { rate: 0.12, min: 1700001, max: 6485000 },
    { rate: 0.22, min: 6485001, max: 10335000 },
    { rate: 0.24, min: 10335001, max: 19730000 },
    { rate: 0.32, min: 19730001, max: 25050000 },
    { rate: 0.35, min: 25050001, max: 62635000 },
    { rate: 0.37, min: 62635001, max: Infinity },
  ],
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
    head_of_household: 2190000,
  },
  2025: {
    single: 1575000,
    married_joint: 3150000,
    married_separate: 1575000,
    head_of_household: 2362500,
  },
};
