import { calculateIncomeForYear, calculateTotalIncome, calculateTaxableIncome } from '../../../src/calculations/income.js';

export function testCalculateIncomeForYear() {
  const income = {
    name: 'Salary',
    baseAmount: 10000000, // $100,000 in cents
    startYear: 0,
    endYear: null,
    type: 'salary',
    growthRate: 0.03
  };

  // Year 0 - no growth
  const year0 = calculateIncomeForYear(income, 0, 0.03);
  if (year0 !== 100000) {
    throw new Error(`Expected $100,000 in year 0, got $${year0}`);
  }

  // Year 1 - with growth
  const year1 = calculateIncomeForYear(income, 1, 0.03);
  const expectedYear1 = 100000 * 1.03; // 3% growth
  if (Math.abs(year1 - expectedYear1) > 0.01) {
    throw new Error(`Expected $${expectedYear1.toFixed(2)} in year 1, got $${year1}`);
  }

  // Before start year - should be 0
  const beforeStart = calculateIncomeForYear(income, -1, 0.03);
  if (beforeStart !== 0) {
    throw new Error(`Expected $0 before start year, got $${beforeStart}`);
  }

  console.log('✓ testCalculateIncomeForYear passed');
}

export function testIncomeWithEndYear() {
  const income = {
    name: 'Contract Work',
    baseAmount: 5000000, // $50,000 in cents
    startYear: 2,
    endYear: 5,
    type: 'business',
    growthRate: 0.02
  };

  // Before start - 0
  if (calculateIncomeForYear(income, 1, 0.03) !== 0) {
    throw new Error('Should be 0 before start year');
  }

  // During active years - positive with growth
  if (calculateIncomeForYear(income, 2, 0.03) !== 50000) {
    throw new Error('Should be $50,000 in start year (no growth yet)');
  }

  // Year 4 is 2 years after start (year 2), so 2 years of 2% growth
  const expectedYear4 = 50000 * Math.pow(1.02, 2); // 50000 * 1.0404 = 52020
  if (Math.abs(calculateIncomeForYear(income, 4, 0.03) - expectedYear4) > 0.01) {
    throw new Error(`Should be $${expectedYear4.toFixed(2)} in year 4 with growth`);
  }

  // After end year - 0
  if (calculateIncomeForYear(income, 6, 0.03) !== 0) {
    throw new Error('Should be 0 after end year');
  }

  console.log('✓ testIncomeWithEndYear passed');
}

export function testCalculateTotalIncome() {
  const incomes = [
    {
      name: 'Salary',
      baseAmount: 8000000, // $80,000
      startYear: 0,
      endYear: null,
      type: 'salary',
      growthRate: 0.03
    },
    {
      name: 'Side Business',
      baseAmount: 2000000, // $20,000
      startYear: 1,
      endYear: null,
      type: 'business',
      growthRate: 0.05
    }
  ];

  // Year 0: only salary
  const year0 = calculateTotalIncome(incomes, 0, 0.03);
  if (year0 !== 80000) {
    throw new Error(`Expected $80,000 in year 0, got $${year0}`);
  }

  // Year 1: salary + business
  const year1 = calculateTotalIncome(incomes, 1, 0.03);
  const expectedYear1 = 80000 * 1.03 + 20000; // Salary grows, business starts
  if (Math.abs(year1 - expectedYear1) > 0.01) {
    throw new Error(`Expected $${expectedYear1.toFixed(2)} in year 1, got $${year1}`);
  }

  console.log('✓ testCalculateTotalIncome passed');
}

export function testCalculateTaxableIncome() {
  const incomes = [
    {
      name: 'Salary',
      baseAmount: 10000000, // $100,000
      startYear: 0,
      endYear: null,
      type: 'salary',
      growthRate: 0.03,
      getTaxTreatment: () => 'earned'
    },
    {
      name: 'Qualified Dividends',
      baseAmount: 1000000, // $10,000
      startYear: 0,
      endYear: null,
      type: 'dividends',
      growthRate: 0.02,
      getTaxTreatment: () => 'qualified'
    },
    {
      name: 'Rental Income',
      baseAmount: 2000000, // $20,000
      startYear: 0,
      endYear: null,
      type: 'rental',
      growthRate: 0.01,
      getTaxTreatment: () => 'earned'
    }
  ];

  const result = calculateTaxableIncome(incomes, 0, 0.03);

  if (result.totalIncome !== 130000) { // 100k + 10k + 20k
    throw new Error(`Expected total income $130,000, got $${result.totalIncome}`);
  }

  if (result.earnedIncome !== 120000) { // 100k salary + 20k rental
    throw new Error(`Expected earned income $120,000, got $${result.earnedIncome}`);
  }

  if (result.qualifiedDividends !== 10000) { // 10k dividends
    throw new Error(`Expected qualified dividends $10,000, got $${result.qualifiedDividends}`);
  }

  if (result.passiveIncome !== 0) { // No passive income in this test
    throw new Error(`Expected passive income $0, got $${result.passiveIncome}`);
  }

  console.log('✓ testCalculateTaxableIncome passed');
}

export function testIncomeGrowthScenarios() {
  // Test different growth scenarios
  const scenarios = [
    { name: 'No growth', growthRate: 0, expectedMultiplier: 1 },
    { name: '3% growth', growthRate: 0.03, expectedMultiplier: 1.03 },
    { name: '5% growth', growthRate: 0.05, expectedMultiplier: 1.05 }
  ];

  const baseIncome = {
    name: 'Test',
    baseAmount: 5000000, // $50,000
    startYear: 0,
    endYear: null,
    type: 'salary'
  };

  scenarios.forEach(scenario => {
    const income = { ...baseIncome, growthRate: scenario.growthRate };
    const result = calculateIncomeForYear(income, 1, 0.03);
    const expected = 50000 * scenario.expectedMultiplier;

    if (Math.abs(result - expected) > 0.01) {
      throw new Error(`${scenario.name}: expected $${expected}, got $${result}`);
    }
  });

  console.log('✓ testIncomeGrowthScenarios passed');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    testCalculateIncomeForYear();
    testIncomeWithEndYear();
    testCalculateTotalIncome();
    testCalculateTaxableIncome();
    testIncomeGrowthScenarios();
    console.log('All Income calculation tests passed!');
  } catch (error) {
    console.error('Test failed:', error.message);
    process.exit(1);
  }
}
