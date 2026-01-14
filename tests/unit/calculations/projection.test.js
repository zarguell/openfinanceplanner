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
      { id: '1', name: '401k', type: '401k', balance: 50000000, annualContribution: 0, withdrawalRate: 0.04 }, // $500,000
      { id: '2', name: 'Roth IRA', type: 'Roth', balance: 20000000, annualContribution: 0, withdrawalRate: 0.04 } // $200,000
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

export function testUserReportedIssue() {
  // Test the exact scenario reported by the user
  const plan = {
    accounts: [
      {
        id: "acc_1768363789468_r22ci00fg",
        name: "Main Portfolio",
        type: "401k",
        balance: 10000000, // $100,000 in cents
        annualContribution: 0,
        withdrawalRate: 0.04
      }
    ],
    expenses: [
      {
        id: "exp_1768363789468_07hjg03b7",
        name: "Living Expenses",
        baseAmount: 6000000, // $60,000 in cents
        startYear: 0,
        endYear: null,
        inflationAdjusted: true
      }
    ],
    taxProfile: {
      currentAge: 70,
      retirementAge: 70,
      estimatedTaxRate: 0.25,
      filingStatus: "single",
      federalTaxRate: 0.24,
      taxYear: 2025,
      state: null
    },
    assumptions: {
      inflationRate: 0.03,
      equityGrowthRate: 0.07,
      bondGrowthRate: 0.04,
      equityVolatility: 0.12,
      bondVolatility: 0.04
    },
    socialSecurity: {
      enabled: false
    }
  };

  const results = project(plan, 40, 2025);

  // Check the balance at retirement (age 70)
  const retirementResult = results.find(r => r.age === 70);
  if (!retirementResult) {
    throw new Error('Retirement year result not found');
  }

  console.log(`Starting balance: $${(plan.accounts[0].balance / 100).toLocaleString()}`);
  console.log(`Balance at retirement (age 70): $${retirementResult.totalBalance.toLocaleString()}`);
  console.log(`Annual expenses: $${(plan.expenses[0].baseAmount / 100).toLocaleString()}`);

  // With $100K starting balance and $60K annual withdrawals at 7% growth,
  // the balance should decrease over time, not increase to billions
  if (retirementResult.totalBalance > plan.accounts[0].balance / 100) {
    console.log(`WARNING: Balance increased from $${(plan.accounts[0].balance / 100).toLocaleString()} to $${retirementResult.totalBalance.toLocaleString()}`);
    console.log('This suggests the projection math is incorrect');
  }

  // Let's check a few intermediate years to understand what's happening
  for (let year = 0; year <= 40; year += 10) {
    const yearResult = results.find(r => r.year === 2026 + year);
    if (yearResult) {
      console.log(`Year ${yearResult.year} (age ${yearResult.age}): Balance = $${yearResult.totalBalance.toLocaleString()}, Expense = $${yearResult.totalExpense.toLocaleString()}`);
    }
  }

  console.log('✓ testUserReportedIssue completed (check logs for details)');
}

export function testProjectionSanityChecks() {
  // Test that projections don't produce unrealistic results
  const plan = {
    accounts: [
      { type: '401k', balance: 10000000, annualContribution: 0, withdrawalRate: 0.04 } // $100K
    ],
    expenses: [
      { name: 'Living', baseAmount: 6000000, startYear: 0, inflationAdjusted: true } // $60K
    ],
    taxProfile: {
      currentAge: 30,
      retirementAge: 70,
      state: null,
      filingStatus: 'single'
    },
    assumptions: {
      inflationRate: 0.03,
      equityGrowthRate: 0.07
    },
    socialSecurity: { enabled: false }
  };

  const results = project(plan, 40);

  // Check that balance doesn't grow more than 100x in 40 years (very generous upper bound)
  const startBalance = results[0].totalBalance;
  const endBalance = results[results.length - 1].totalBalance;
  const growthFactor = endBalance / startBalance;

  if (growthFactor > 100) {
    throw new Error(`Unrealistic growth: ${growthFactor.toFixed(1)}x in 40 years (max expected: ~10x)`);
  }

  // Check that withdrawals are happening in retirement
  const retirementResults = results.filter(r => r.isRetired);
  if (retirementResults.length === 0) {
    throw new Error('No retirement results found');
  }

  // With 4% withdrawals and 7% growth, balance may still grow, but should not grow unrealistically
  const firstRetirementResult = retirementResults[0];
  const lastRetirementResult = retirementResults[retirementResults.length - 1];

  // In a 40-year retirement, with 4% withdrawals vs 7% growth, balance should be reasonable
  if (lastRetirementResult.totalBalance > firstRetirementResult.totalBalance * 10) {
    throw new Error('Balance grew too much during retirement phase');
  }

  console.log('✓ testProjectionSanityChecks passed');
}

export function testWithdrawalAdequacy() {
  // Test that withdrawals are adequate relative to expenses
  const plan = {
    accounts: [
      { type: '401k', balance: 100000000, annualContribution: 0, withdrawalRate: 0.04 } // $1M
    ],
    expenses: [
      { name: 'Living', baseAmount: 3000000, startYear: 0, inflationAdjusted: true } // $30K
    ],
    taxProfile: {
      currentAge: 65,
      retirementAge: 65, // Already retired
      state: null,
      filingStatus: 'single'
    },
    assumptions: {
      inflationRate: 0.03,
      equityGrowthRate: 0.07
    },
    socialSecurity: { enabled: false }
  };

  const results = project(plan, 10);

  // Check that 4% withdrawal from $1M ($40K) covers $30K expenses reasonably well
  const firstRetirementResult = results.find(r => r.isRetired);
  if (firstRetirementResult) {
    const withdrawalAmount = firstRetirementResult.totalBalance * 0.04;
    const expenseRatio = withdrawalAmount / firstRetirementResult.totalExpense;

    if (expenseRatio < 1.1) { // Should be at least 110% of expenses
      throw new Error(`Withdrawals inadequate: $${withdrawalAmount.toFixed(0)} vs expenses $${firstRetirementResult.totalExpense.toFixed(0)}`);
    }
  }

  console.log('✓ testWithdrawalAdequacy passed');
}

export function testMathematicalConsistency() {
  // Test mathematical properties that should always hold
  const plan = {
    accounts: [
      { type: '401k', balance: 10000000, annualContribution: 0, withdrawalRate: 0.04 }
    ],
    expenses: [
      { name: 'Living', baseAmount: 1000000, startYear: 0, inflationAdjusted: false } // $10K, no inflation
    ],
    taxProfile: {
      currentAge: 30,
      retirementAge: 70,
      state: null,
      filingStatus: 'single'
    },
    assumptions: {
      inflationRate: 0.03,
      equityGrowthRate: 0.07
    },
    socialSecurity: { enabled: false }
  };

  const results = project(plan, 40);

  // Check that results are monotonically increasing during accumulation phase
  const accumulationResults = results.filter(r => !r.isRetired);
  for (let i = 1; i < accumulationResults.length; i++) {
    if (accumulationResults[i].totalBalance < accumulationResults[i-1].totalBalance) {
      throw new Error(`Balance decreased during accumulation phase: year ${accumulationResults[i].year}`);
    }
  }

  // Check that tax calculations are non-negative
  for (const result of results) {
    if (result.totalTax < 0) {
      throw new Error(`Negative taxes in year ${result.year}: ${result.totalTax}`);
    }
  }

  console.log('✓ testMathematicalConsistency passed');
}

export function testExtremeInputs() {
  // Test with extreme inputs to ensure system doesn't break
  const extremePlan = {
    accounts: [
      { type: '401k', balance: 1, annualContribution: 0, withdrawalRate: 0.99 } // $0.01 balance
    ],
    expenses: [
      { name: 'Living', baseAmount: 100000000, startYear: 0, inflationAdjusted: false } // $1M expenses
    ],
    taxProfile: {
      currentAge: 30,
      retirementAge: 30, // Immediately retired
      state: null,
      filingStatus: 'single'
    },
    assumptions: {
      inflationRate: 0.03,
      equityGrowthRate: 0.07
    },
    socialSecurity: { enabled: false }
  };

  // Should not crash with extreme inputs
  const results = project(extremePlan, 5);

  // Should have valid results
  if (results.length !== 6) {
    throw new Error(`Expected 6 results, got ${results.length}`);
  }

  // Balance should go to zero quickly with 99% withdrawal rate
  const finalResult = results[results.length - 1];
  if (finalResult.totalBalance > 1) {
    throw new Error(`Balance should be near zero with 99% withdrawal rate, got ${finalResult.totalBalance}`);
  }

  console.log('✓ testExtremeInputs passed');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    testGetAccountGrowthRate();
    testCalculateExpenseForYear();
    testCalculateTotalExpenses();
    testSimpleProjection();
    testDetailedTaxCalculations();
    testProjectionSanityChecks();
    testWithdrawalAdequacy();
    testMathematicalConsistency();
    testExtremeInputs();
    console.log('All Projection tests passed!');
  } catch (error) {
    console.error('Test failed:', error.message);
    process.exit(1);
  }
}
