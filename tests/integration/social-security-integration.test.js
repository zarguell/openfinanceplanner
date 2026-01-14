/**
 * Integration test for Social Security in projections
 * Tests that Social Security benefits are calculated correctly and integrated into projections
 */

import { Plan } from '../../src/core/models/Plan.js';
import { Account } from '../../src/core/models/Account.js';
import { Expense } from '../../src/core/models/Expense.js';
import { project } from '../../src/calculations/projection.js';

export function testSocialSecurityIntegration() {
  console.log('Testing Social Security integration with projections...');

  const plan = new Plan('SS Test Plan', 62, 67);

  const account401k = new Account('My 401k', '401k', 500000);
  account401k.annualContribution = 0;
  plan.addAccount(account401k);

  plan.taxProfile = {
    currentAge: 62,
    retirementAge: 67,
    estimatedTaxRate: 0.25,
    filingStatus: 'single',
    state: 'CA',
    taxYear: 2025
  };

  const expenses = new Expense('Living Expenses', 60000, 0, true);
  plan.addExpense(expenses);

  plan.assumptions = {
    inflationRate: 0.03,
    equityGrowthRate: 0.07,
    bondGrowthRate: 0.04,
    equityVolatility: 0.12,
    bondVolatility: 0.04
  };

  plan.socialSecurity = {
    enabled: true,
    birthYear: new Date().getFullYear() - 62,
    monthlyBenefit: 2000,
    filingAge: 67
  };

  const results = project(plan, 10);

  console.log(`✓ Projection completed with ${results.length} years`);

  let yearsWithSS = 0;
  results.forEach((year, index) => {
    if (year.socialSecurityIncome > 0) {
      yearsWithSS++;
      if (index === 0) {
        console.log(`  Year ${year.year} (age ${year.age}): SS = $${(year.socialSecurityIncome).toLocaleString('en-US', {minimumFractionDigits: 0, maximumFractionDigits: 0})}`);
      }
    }
  });

  if (yearsWithSS === 0) {
    throw new Error('Expected Social Security income, but found none');
  }

  console.log(`✓ Social Security calculated for ${yearsWithSS} years`);

  const yearAtFilingAge = results.find(r => r.age === 67);

  if (!yearAtFilingAge || yearAtFilingAge.socialSecurityIncome === 0) {
    throw new Error('Expected Social Security income at age 67');
  }

  const expectedAnnualSS = 2000 * 12;
  const ssAt67 = yearAtFilingAge.socialSecurityIncome;

  if (Math.abs(ssAt67 - expectedAnnualSS) > 100) {
    throw new Error(`Expected ~$${expectedAnnualSS} at age 67, got $${ssAt67}`);
  }

  console.log(`  Age 67 SS: $${(ssAt67).toLocaleString('en-US', {minimumFractionDigits: 0, maximumFractionDigits: 0})}`);
  console.log('✓ Social Security amount at filing age is correct');
  console.log('✅ Social Security integration test passed!');
}

export function testSocialSecurityEarlyClaiming() {
  console.log('Testing Social Security early claiming (age 62)...');

  const plan = new Plan('SS Early Test', 62, 67);

  const account = new Account('My 401k', '401k', 500000);
  plan.addAccount(account);

  plan.taxProfile = {
    currentAge: 62,
    retirementAge: 67,
    estimatedTaxRate: 0.25,
    filingStatus: 'single',
    state: 'CA',
    taxYear: 2025
  };

  const expenses = new Expense('Living Expenses', 60000, 0, true);
  plan.addExpense(expenses);

  plan.assumptions = {
    inflationRate: 0.03,
    equityGrowthRate: 0.07,
    bondGrowthRate: 0.04,
    equityVolatility: 0.12,
    bondVolatility: 0.04
  };

  plan.socialSecurity = {
    enabled: true,
    birthYear: new Date().getFullYear() - 62,
    monthlyBenefit: 2000,
    filingAge: 62
  };

  const results = project(plan, 5);

  if (results[0].socialSecurityIncome === 0) {
    throw new Error('Expected Social Security income at age 62');
  }

  console.log(`  Age 62 SS: $${(results[0].socialSecurityIncome).toLocaleString('en-US', {minimumFractionDigits: 0, maximumFractionDigits: 0})}`);
  console.log('✓ Social Security starts at age 62');
  console.log('✅ Early claiming test passed!');
}

export function testSocialSecurityDelayedClaiming() {
  console.log('Testing Social Security delayed claiming (age 70)...');

  const plan = new Plan('SS Delayed Test', 65, 67);

  const account = new Account('My 401k', '401k', 500000);
  plan.addAccount(account);

  plan.taxProfile = {
    currentAge: 65,
    retirementAge: 67,
    estimatedTaxRate: 0.25,
    filingStatus: 'single',
    state: 'CA',
    taxYear: 2025
  };

  const expenses = new Expense('Living Expenses', 60000, 0, true);
  plan.addExpense(expenses);

  plan.assumptions = {
    inflationRate: 0.03,
    equityGrowthRate: 0.07,
    bondGrowthRate: 0.04,
    equityVolatility: 0.12,
    bondVolatility: 0.04
  };

  plan.socialSecurity = {
    enabled: true,
    birthYear: new Date().getFullYear() - 65,
    monthlyBenefit: 2000,
    filingAge: 70
  };

  const results = project(plan, 10);

  const ssAtAge70 = results.find(r => r.age === 70);

  if (!ssAtAge70 || ssAtAge70.socialSecurityIncome === 0) {
    throw new Error('Expected Social Security income at age 70');
  }

  console.log(`  Age 70 SS: $${(ssAtAge70.socialSecurityIncome).toLocaleString('en-US', {minimumFractionDigits: 0, maximumFractionDigits: 0})}`);
  console.log('✓ Social Security starts at age 70');
  console.log('✅ Delayed claiming test passed!');
}

export function testSocialSecurityDisabled() {
  console.log('Testing projections with Social Security disabled...');

  const plan = new Plan('SS Disabled Test', 65, 67);

  const account = new Account('My 401k', '401k', 500000);
  plan.addAccount(account);

  plan.taxProfile = {
    currentAge: 65,
    retirementAge: 67,
    estimatedTaxRate: 0.25,
    filingStatus: 'single',
    state: 'CA',
    taxYear: 2025
  };

  const expenses = new Expense('Living Expenses', 60000, 0, true);
  plan.addExpense(expenses);

  plan.assumptions = {
    inflationRate: 0.03,
    equityGrowthRate: 0.07,
    bondGrowthRate: 0.04,
    equityVolatility: 0.12,
    bondVolatility: 0.04
  };

  plan.socialSecurity = {
    enabled: false,
    birthYear: new Date().getFullYear() - 65,
    monthlyBenefit: 2000,
    filingAge: 67
  };

  const results = project(plan, 10);

  const ssIncome = results.reduce((sum, r) => sum + r.socialSecurityIncome, 0);

  if (ssIncome !== 0) {
    throw new Error(`Expected no Social Security income when disabled, got $${(ssIncome / 100).toLocaleString()}`);
  }

  console.log('✓ No Social Security income when disabled');
  console.log('✅ Social Security disabled test passed!');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  testSocialSecurityIntegration();
  testSocialSecurityEarlyClaiming();
  testSocialSecurityDelayedClaiming();
  testSocialSecurityDisabled();

  console.log('\n✅ All Social Security integration tests passed!');
}
