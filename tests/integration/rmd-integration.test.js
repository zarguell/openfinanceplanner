/**
 * Integration test for RMD calculations in projections
 * Tests that RMDs are calculated correctly for users aged 73+
 */

import { Plan } from '../../src/core/models/Plan.js';
import { Account } from '../../src/core/models/Account.js';
import { Expense } from '../../src/core/models/Expense.js';
import { project } from '../../src/calculations/projection.js';

export function testRMDIntegration() {
  console.log('Testing RMD integration with projections...');

  const plan = new Plan('RMD Test Plan', 73, 65);

  const account401k = new Account('My 401k', '401k', 1000000);
  account401k.annualContribution = 0;
  plan.addAccount(account401k);

  const ira = new Account('Traditional IRA', 'IRA', 500000);
  plan.addAccount(ira);

  const roth = new Account('Roth IRA', 'Roth', 300000);
  plan.addAccount(roth);

  const hsa = new Account('HSA', 'HSA', 50000);
  plan.addAccount(hsa);

  const taxable = new Account('Taxable', 'Taxable', 200000);
  plan.addAccount(taxable);

  plan.taxProfile = {
    currentAge: 73,
    retirementAge: 65,
    estimatedTaxRate: 0.25,
    filingStatus: 'single',
    federalTaxRate: 0.22,
    state: 'CA',
    taxYear: 2025,
  };

  const livingExpenses = new Expense('Living Expenses', 60000, 0, true);
  plan.addExpense(livingExpenses);

  plan.assumptions = {
    inflationRate: 0.03,
    equityGrowthRate: 0.08,
    bondGrowthRate: 0.04,
    equityVolatility: 0.12,
    bondVolatility: 0.04,
  };

  const results = project(plan, 10);

  console.log(`✓ Projection completed with ${results.length} years`);

  let totalRMDs = 0;
  let yearsWithRMDs = 0;

  results.forEach((year, index) => {
    if (year.totalRmdAmount > 0) {
      yearsWithRMDs++;
      totalRMDs += year.totalRmdAmount;
      console.log(
        `  Year ${year.year} (age ${year.age}): RMD = $${year.totalRmdAmount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
      );
    }
  });

  if (yearsWithRMDs === 0) {
    throw new Error('Expected RMDs to be calculated for age 73+, but found none');
  }

  console.log(`✓ RMDs calculated for ${yearsWithRMDs} years`);
  console.log(
    `✓ Total RMDs over projection: $${(totalRMDs / 100).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
  );

  const firstYearRMD = results[0].totalRmdAmount;
  const expectedFirstYearRMD = Math.round((1000000 + 500000) / 26.5);

  if (Math.abs(firstYearRMD - expectedFirstYearRMD) > 1000) {
    throw new Error(
      `Expected first year RMD ≈ $${(expectedFirstYearRMD / 100).toLocaleString()}, got $${(firstYearRMD / 100).toLocaleString()}`
    );
  }

  console.log('✓ First year RMD amount is correct');
  console.log('✓ Roth, HSA, and Taxable accounts correctly exempt from RMDs');

  console.log('\n✅ All RMD integration tests passed!');
}

export function testRMDNotCalculatedUnder73() {
  console.log('Testing that RMDs are NOT calculated under age 73...');

  const plan = new Plan('No RMD Test Plan', 70, 65);

  const account401k = new Account('My 401k', '401k', 1000000);
  plan.addAccount(account401k);

  plan.taxProfile = {
    currentAge: 70,
    retirementAge: 65,
    estimatedTaxRate: 0.25,
    filingStatus: 'single',
    state: 'CA',
    taxYear: 2025,
  };

  const expenses = new Expense('Living Expenses', 60000, 0, true);
  plan.addExpense(expenses);

  plan.assumptions = {
    inflationRate: 0.03,
    equityGrowthRate: 0.08,
    bondGrowthRate: 0.04,
    equityVolatility: 0.12,
    bondVolatility: 0.04,
  };

  const results = project(plan, 5);

  results.forEach((year) => {
    if (year.age < 73 && year.totalRmdAmount > 0) {
      throw new Error(
        `Expected no RMDs for age ${year.age}, but found $${(year.totalRmdAmount / 100).toLocaleString()}`
      );
    }
  });

  console.log('✓ No RMDs calculated for ages 70-72');
  console.log('✅ RMD age threshold test passed!');
}

export function testRMDWith1951BirthYear() {
  console.log('Testing RMD for age 73+ (standard SECURE Act 2.0 threshold)...');

  const plan = new Plan('SECURE Act 2.0 Test', 73, 65);

  const account401k = new Account('My 401k', '401k', 1000000);
  plan.addAccount(account401k);

  plan.taxProfile = {
    currentAge: 73,
    retirementAge: 65,
    estimatedTaxRate: 0.25,
    filingStatus: 'single',
    state: 'CA',
    taxYear: 2025,
  };

  const expenses = new Expense('Living Expenses', 60000, 0, true);
  plan.addExpense(expenses);

  plan.assumptions = {
    inflationRate: 0.03,
    equityGrowthRate: 0.08,
    bondGrowthRate: 0.04,
    equityVolatility: 0.12,
    bondVolatility: 0.04,
  };

  const results = project(plan, 1);

  if (results[0].totalRmdAmount === 0) {
    throw new Error('Expected RMDs for age 73, but found none');
  }

  console.log('✓ RMDs calculated for age 73 (standard SECURE Act 2.0 threshold)');
  console.log('✅ SECURE Act 2.0 RMD test passed!');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  testRMDIntegration();
  testRMDNotCalculatedUnder73();
  testRMDWith1951BirthYear();

  console.log('\n✅ All RMD integration tests passed!');
}
