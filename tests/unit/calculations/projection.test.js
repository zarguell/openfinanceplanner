import { project, getAccountGrowthRate, calculateExpenseForYear, calculateTotalExpenses } from '../../../src/calculations/projection.js';

export function testGetAccountGrowthRate() {
  const assumptions = {
    inflationRate: 0.03,
    equityGrowthRate: 0.07,
    bondGrowthRate: 0.04
  };

  const rate401k = getAccountGrowthRate('401k', assumptions);
  if (rate401k !== 0.07) {
    throw new Error(`Expected 401k rate of 0.07, got ${rate401k}`);
  }

  const rateTaxable = getAccountGrowthRate('Taxable', assumptions);
  if (Math.abs(rateTaxable - 0.056) > 0.0001) { // 0.07 * 0.8
    throw new Error(`Expected Taxable rate of 0.056, got ${rateTaxable}`);
  }

  console.log('✓ testGetAccountGrowthRate passed');
}

export function testCalculateExpenseForYear() {
  const expense = {
    name: 'Rent',
    baseAmount: 1200000, // $12,000 in cents
    startYear: 0,
    inflationAdjusted: true
  };
  const inflationRate = 0.03;

  // Year 0 - no inflation
  const year0 = calculateExpenseForYear(expense, 0, inflationRate);
  if (year0 !== 12000) {
    throw new Error(`Expected $12,000, got $${year0}`);
  }

  // Year 1 - with inflation
  const year1 = calculateExpenseForYear(expense, 1, inflationRate);
  if (Math.abs(year1 - 12360) > 0.01) { // 12000 * 1.03
    throw new Error(`Expected $12,360, got $${year1}`);
  }

  console.log('✓ testCalculateExpenseForYear passed');
}

export function testCalculateTotalExpenses() {
  const expenses = [
    { name: 'Rent', baseAmount: 1200000, startYear: 0, inflationAdjusted: true },
    { name: 'Food', baseAmount: 600000, startYear: 0, inflationAdjusted: true }
  ];
  const inflationRate = 0.03;

  const total = calculateTotalExpenses(expenses, 0, inflationRate);
  if (total !== 18000) { // 12000 + 6000
    throw new Error(`Expected $18,000, got $${total}`);
  }

  console.log('✓ testCalculateTotalExpenses passed');
}

export function testSimpleProjection() {
  const plan = {
    accounts: [
      { type: '401k', balance: 100000, annualContribution: 10000 }
    ],
    expenses: [
      { name: 'Living', baseAmount: 6000000, startYear: 0, inflationAdjusted: true }
    ],
    taxProfile: {
      currentAge: 35,
      retirementAge: 65
    },
    assumptions: {
      inflationRate: 0.03,
      equityGrowthRate: 0.07,
      bondGrowthRate: 0.04
    }
  };

  const results = project(plan, 1); // Project 1 year

  if (results.length !== 2) { // Year 0 and Year 1
    throw new Error(`Expected 2 years, got ${results.length}`);
  }

  if (results[1].totalBalance <= results[0].totalBalance) {
    throw new Error('Expected balance to grow with contributions and returns');
  }

  console.log('✓ testSimpleProjection passed');
}

export function testDetailedTaxCalculations() {
  // Test that detailed tax calculations are used instead of estimated rates
  const plan = {
    accounts: [
      { id: '1', name: '401k', type: '401k', balance: 50000000, annualContribution: 0 }, // $500,000
      { id: '2', name: 'Roth IRA', type: 'Roth', balance: 20000000, annualContribution: 0 } // $200,000
    ],
    expenses: [
      { id: '1', name: 'Living', baseAmount: 6000000, startYear: 0, inflationAdjusted: true } // $60,000/year
    ],
    taxProfile: {
      currentAge: 30,
      retirementAge: 65,
      state: 'CA', // California has high state taxes
      filingStatus: 'single'
    },
    assumptions: {
      inflationRate: 0.03,
      equityGrowthRate: 0.07
    },
    socialSecurity: {
      enabled: false
    }
  };

  const results = project(plan, 40, 2025);
  const retirementYearResult = results.find(r => r.age === 65);

  // In retirement year, should have detailed tax calculations
  if (!retirementYearResult) {
    throw new Error('Retirement year result not found');
  }

  // Traditional 401k withdrawals should be taxed
  if (retirementYearResult.totalFederalTax <= 0) {
    throw new Error('Federal tax should be positive for traditional account withdrawals');
  }

  if (retirementYearResult.totalStateTax <= 0) {
    throw new Error('State tax should be positive for traditional account withdrawals');
  }

  // Total tax should include federal + state (no FICA in retirement)
  const expectedTotalTax = retirementYearResult.totalFederalTax + retirementYearResult.totalStateTax;
  if (Math.abs(retirementYearResult.totalTax - expectedTotalTax) > 0.01) {
    throw new Error(`Total tax mismatch: expected ${expectedTotalTax}, got ${retirementYearResult.totalTax}`);
  }

  console.log('✓ testDetailedTaxCalculations passed');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    testGetAccountGrowthRate();
    testCalculateExpenseForYear();
    testCalculateTotalExpenses();
    testSimpleProjection();
    testDetailedTaxCalculations();
    console.log('All Projection tests passed!');
  } catch (error) {
    console.error('Test failed:', error.message);
    process.exit(1);
  }
}
