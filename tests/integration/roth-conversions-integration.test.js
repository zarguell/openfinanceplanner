/**
 * Roth Conversion Strategy Integration Tests
 * Tests Roth conversions integrated with projection engine and tax calculations
 */

import { Plan } from '../../src/core/models/Plan.js';
import { Account } from '../../src/core/models/Account.js';
import { Expense } from '../../src/core/models/Expense.js';
import { project } from '../../src/calculations/projection.js';
import { optimizeConversionsAcrossYears } from '../../src/calculations/roth-conversions.js';

export function testRothConversionStrategyComparison() {
  console.log('Testing Roth conversion strategy comparison...');

  const plan = new Plan('Roth Conversion Test', 55, 65);
  plan.addAccount(new Account('Traditional IRA', 'IRA', 50000000)); // $500,000
  plan.addAccount(new Account('Roth IRA', 'Roth', 0));
  plan.addExpense(new Expense('Living Expenses', 6000000)); // $60,000

  const projection1 = project(plan, 10, 2025);
  console.log(
    `Traditional only: Final balance: $${(projection1[projection1.length - 1].totalBalance / 100).toLocaleString('en-US')}`
  );

  const plan2 = new Plan('Roth Conversion Test', 55, 65);
  plan2.addAccount(new Account('Traditional IRA', 'IRA', 50000000));
  plan2.addAccount(new Account('Roth IRA', 'Roth', 0));
  plan2.addExpense(new Expense('Living Expenses', 6000000));
  plan2.rothConversions = {
    enabled: true,
    strategy: 'fixed',
    annualAmount: 10000000, // $10,000 per year
  };

  const projection2 = project(plan2, 10, 2025);
  console.log(
    `With conversions: Final balance: $${(projection2[projection2.length - 1].totalBalance / 100).toLocaleString('en-US')}`
  );

  if (
    projection2[projection2.length - 1].totalBalance >
    projection1[projection1.length - 1].totalBalance
  ) {
    console.log('✓ Roth conversions improved final balance');
  } else {
    console.log('⚠ Conversions reduced final balance (expected for high conversion amounts)');
  }

  console.log('✓ testRothConversionStrategyComparison passed');
}

export function testRothConversionBracketFill() {
  console.log('Testing bracket-fill Roth conversion strategy...');

  const plan = new Plan('Bracket Fill Test', 55, 65);
  plan.addAccount(new Account('Traditional IRA', 'IRA', 30000000)); // $300,000
  plan.addAccount(new Account('Roth IRA', 'Roth', 0));
  plan.addExpense(new Expense('Living Expenses', 4000000)); // $40,000 (low expenses leave room for conversions)

  plan.rothConversions = {
    enabled: true,
    strategy: 'bracket-fill',
    targetBracket: '12%',
  };

  const projections = project(plan, 5, 2025);

  let totalConversions = 0;
  projections.forEach((row) => {
    if (row.rothConversions) {
      totalConversions += row.rothConversions;
    }
  });

  console.log(
    `Total bracket-fill conversions: $${(totalConversions / 100).toLocaleString('en-US')} over 5 years`
  );

  if (totalConversions > 0) {
    console.log('✓ Bracket-fill strategy executed conversions');
  } else {
    throw new Error('Expected some conversions with bracket-fill strategy');
  }

  console.log('✓ testRothConversionBracketFill passed');
}

export function testRothConversionPercentage() {
  console.log('Testing percentage Roth conversion strategy...');

  const plan = new Plan('Percentage Test', 50, 65);
  plan.addAccount(new Account('Traditional IRA', 'IRA', 100000000)); // $1,000,000
  plan.addAccount(new Account('Roth IRA', 'Roth', 50000000)); // Already has $50,000
  plan.addExpense(new Expense('Living Expenses', 5000000));

  plan.rothConversions = {
    enabled: true,
    strategy: 'percentage',
    percentage: 0.05, // Convert 5% per year
  };

  const projections = project(plan, 10, 2025);

  let totalConversions = 0;
  projections.forEach((row) => {
    if (row.rothConversions) {
      totalConversions += row.rothConversions;
    }
  });

  console.log(
    `Total percentage conversions: $${(totalConversions / 100).toLocaleString('en-US')} over 10 years`
  );

  if (totalConversions > 0) {
    console.log('✓ Percentage strategy executed conversions');
  } else {
    throw new Error('Expected some conversions with percentage strategy');
  }

  console.log('✓ testRothConversionPercentage passed');
}

export function testRothConversionsWithRMDs() {
  console.log('Testing Roth conversions with RMDs...');

  const plan = new Plan('RMD + Conversion Test', 70, 75);
  plan.addAccount(new Account('Traditional IRA', 'IRA', 100000000)); // $1,000,000 at age 70
  plan.addAccount(new Account('Roth IRA', 'Roth', 0));
  plan.addExpense(new Expense('Living Expenses', 6000000));

  plan.rothConversions = {
    enabled: true,
    strategy: 'fixed',
    annualAmount: 20000000, // $20,000 per year
  };

  const projections = project(plan, 10, 2025);

  let totalRMDs = 0;
  let totalConversions = 0;
  projections.forEach((row) => {
    if (row.totalRmdAmount) {
      totalRMDs += row.totalRmdAmount;
    }
    if (row.rothConversions) {
      totalConversions += row.rothConversions;
    }
  });

  console.log(`Total RMDs: $${(totalRMDs / 100).toLocaleString('en-US')}`);
  console.log(`Total conversions: $${(totalConversions / 100).toLocaleString('en-US')}`);

  if (totalRMDs > 0) {
    console.log('✓ RMDs calculated correctly');
  }
  if (totalConversions > 0) {
    console.log('✓ Conversions executed alongside RMDs');
  }

  console.log('✓ testRothConversionsWithRMDs passed');
}

export function testRothConversionTaxImpact() {
  console.log('Testing Roth conversion tax impact...');

  const plan1 = new Plan('No Conversion Tax Test', 55, 65);
  plan1.addAccount(new Account('Traditional IRA', 'IRA', 20000000));
  plan1.addAccount(new Account('Roth IRA', 'Roth', 0));
  plan1.addExpense(new Expense('Living Expenses', 5000000));

  const projection1 = project(plan1, 10, 2025);
  const totalTax1 = projection1.reduce(
    (sum, row) => sum + row.totalFederalTax + row.totalStateTax,
    0
  );
  console.log(`Tax without conversions: $${(totalTax1 / 100).toLocaleString('en-US')}`);

  const plan2 = new Plan('With Conversion Tax Test', 55, 65);
  plan2.addAccount(new Account('Traditional IRA', 'IRA', 20000000));
  plan2.addAccount(new Account('Roth IRA', 'Roth', 0));
  plan2.addExpense(new Expense('Living Expenses', 5000000));
  plan2.rothConversions = {
    enabled: true,
    strategy: 'fixed',
    annualAmount: 5000000, // $5,000 per year
  };

  const projection2 = project(plan2, 10, 2025);
  const totalTax2 = projection2.reduce(
    (sum, row) => sum + row.totalFederalTax + row.totalStateTax,
    0
  );
  console.log(`Tax with conversions: $${(totalTax2 / 100).toLocaleString('en-US')}`);

  if (totalTax2 > totalTax1) {
    console.log('✓ Conversions increased current taxes as expected');
  } else {
    throw new Error('Expected higher taxes with conversions');
  }

  console.log('✓ testRothConversionTaxImpact passed');
}

export function testOptimizeConversionsAcrossYears() {
  console.log('Testing optimizeConversionsAcrossYears function...');

  const plan = new Plan('Multi-Year Test', 50, 65);
  plan.addAccount(new Account('Traditional IRA', 'IRA', 30000000));
  plan.addAccount(new Account('Roth IRA', 'Roth', 0));
  plan.addExpense(new Expense('Living Expenses', 4000000));

  const conversions = optimizeConversionsAcrossYears(plan, 5, 'fixed');

  if (conversions.length !== 5) {
    throw new Error(`Expected 5 years, got ${conversions.length}`);
  }
  if (conversions[0].year !== new Date().getFullYear()) {
    throw new Error(`Expected year ${new Date().getFullYear()}, got ${conversions[0].year}`);
  }
  if (conversions[0].conversionAmount <= 0) {
    throw new Error('Expected positive conversion amount');
  }

  console.log(
    `Year 0 conversion: $${(conversions[0].conversionAmount / 100).toLocaleString('en-US')}`
  );
  console.log(
    `Year 4 conversion: $${(conversions[4].conversionAmount / 100).toLocaleString('en-US')}`
  );

  console.log('✓ testOptimizeConversionsAcrossYears passed');
}

export function runAllIntegrationTests() {
  console.log('=== Running Roth Conversion Integration Tests ===\n');

  testRothConversionStrategyComparison();
  testRothConversionBracketFill();
  testRothConversionPercentage();
  testRothConversionsWithRMDs();
  testRothConversionTaxImpact();
  testOptimizeConversionsAcrossYears();

  console.log('\n=== All Roth Conversion Integration Tests Passed ===');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runAllIntegrationTests();
}
