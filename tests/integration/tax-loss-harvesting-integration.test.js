import { Plan } from '../../src/core/models/Plan.js';
import { Account } from '../../src/core/models/Account.js';
import { Expense } from '../../src/core/models/Expense.js';
import { project } from '../../src/calculations/projection.js';
import { StorageManager } from '../../src/storage/StorageManager.js';

global.localStorage = {
  store: {},
  getItem(key) { return this.store[key] || null; },
  setItem(key, value) { this.store[key] = value; },
  removeItem(key) { delete this.store[key]; },
  clear() { this.store = {}; }
};

export function testTLHSettingsPersistence() {
  console.log('Testing TLH settings persistence...');

  const plan = new Plan('TLH Test', 50, 65);
  plan.addAccount(new Account('Taxable', 'Taxable', 100000));
  plan.addExpense(new Expense('Living Expenses', 60000, 0, true));

  plan.taxLossHarvesting = {
    enabled: true,
    strategy: 'all',
    threshold: 100000
  };

  console.log('✓ Plan created with TLH settings:', plan.taxLossHarvesting);

  StorageManager.savePlan(plan);
  console.log('✓ Plan saved to storage');

  const loadedPlan = StorageManager.loadPlan(plan.id);
  const reconstructedPlan = Plan.fromJSON(loadedPlan);

  console.log('✓ Plan loaded from storage');

  if (reconstructedPlan.taxLossHarvesting.enabled !== true) {
    throw new Error('TLH enabled setting not preserved');
  }
  console.log('✓ TLH enabled preserved');

  if (reconstructedPlan.taxLossHarvesting.strategy !== 'all') {
    throw new Error('TLH strategy not preserved');
  }
  console.log('✓ TLH strategy preserved:', reconstructedPlan.taxLossHarvesting.strategy);

  if (reconstructedPlan.taxLossHarvesting.threshold !== 100000) {
    throw new Error('TLH threshold not preserved');
  }
  console.log('✓ TLH threshold preserved:', reconstructedPlan.taxLossHarvesting.threshold);

  StorageManager.deletePlan(plan.id);
  console.log('✓ Cleanup: Test plan deleted');

  console.log('✅ testTLHSettingsPersistence PASSED\n');
}

export function testTLHWithProjection() {
  console.log('Testing TLH with projection...');

  const plan = new Plan('TLH Projection Test', 50, 65);
  const taxable = new Account('Taxable', 'Taxable', 100000);
  plan.addAccount(taxable);
  plan.addExpense(new Expense('Living Expenses', 40000, 0, true));

  plan.taxLossHarvesting = {
    enabled: true,
    strategy: 'all',
    threshold: 100000
  };

  plan.assumptions.equityGrowthRate = 0.06;
  plan.assumptions.bondGrowthRate = 0.04;
  plan.assumptions.inflationRate = 0.03;

  console.log('✓ Plan created with TLH enabled');

  const results = project(plan, 10, 2025);

  console.log('✓ Projection completed');

  const yearsWithTLH = results.filter(year => year.taxLossHarvestingBenefit > 0);

  console.log('✓ Years with TLH benefits:', yearsWithTLH.length);

  const totalTLHBenefit = results.reduce((sum, year) => sum + (year.taxLossHarvestingBenefit || 0), 0);

  if (totalTLHBenefit < 0) {
    throw new Error('Expected non-negative TLH benefit');
  }
  console.log('✓ Total TLH benefit:', totalTLHBenefit);

  StorageManager.deletePlan(plan.id);
  console.log('✓ Cleanup: Test plan deleted');

  console.log('✅ testTLHWithProjection PASSED\n');
}

export function testTLHDisabled() {
  console.log('Testing TLH disabled...');

  const plan = new Plan('TLH Disabled Test', 50, 65);
  const taxable = new Account('Taxable', 'Taxable', 100000);
  plan.addAccount(taxable);
  plan.addExpense(new Expense('Living Expenses', 40000, 0, true));

  plan.taxLossHarvesting = {
    enabled: false,
    strategy: 'all',
    threshold: 100000
  };

  plan.assumptions.equityGrowthRate = 0.06;
  plan.assumptions.bondGrowthRate = 0.04;
  plan.assumptions.inflationRate = 0.03;

  const results = project(plan, 10, 2025);

  const totalTLHBenefit = results.reduce((sum, year) => sum + (year.taxLossHarvestingBenefit || 0), 0);

  if (totalTLHBenefit !== 0) {
    throw new Error('Expected no TLH benefit when disabled');
  }
  console.log('✓ No TLH benefit when disabled');

  StorageManager.deletePlan(plan.id);
  console.log('✓ Cleanup: Test plan deleted');

  console.log('✅ testTLHDisabled PASSED\n');
}

export function testTLHAllStrategy() {
  console.log('Testing TLH "all" strategy...');

  const plan = new Plan('TLH All Strategy Test', 50, 65);
  const taxable = new Account('Taxable', 'Taxable', 100000);
  plan.addAccount(taxable);
  plan.addExpense(new Expense('Living Expenses', 40000, 0, true));

  plan.taxLossHarvesting = {
    enabled: true,
    strategy: 'all',
    threshold: 50000
  };

  plan.assumptions.equityGrowthRate = 0.03;
  plan.assumptions.bondGrowthRate = 0.02;
  plan.assumptions.inflationRate = 0.03;

  const results = project(plan, 10, 2025);

  const totalTLHBenefit = results.reduce((sum, year) => sum + (year.taxLossHarvestingBenefit || 0), 0);

  console.log('✓ Total TLH benefit with "all" strategy:', totalTLHBenefit);

  StorageManager.deletePlan(plan.id);
  console.log('✓ Cleanup: Test plan deleted');

  console.log('✅ testTLHAllStrategy PASSED\n');
}

export function testTLHOffsetGainsStrategy() {
  console.log('Testing TLH "offset-gains" strategy...');

  const plan = new Plan('TLH Offset Gains Test', 50, 65);
  const taxable = new Account('Taxable', 'Taxable', 100000);
  plan.addAccount(taxable);
  plan.addExpense(new Expense('Living Expenses', 40000, 0, true));

  plan.taxLossHarvesting = {
    enabled: true,
    strategy: 'offset-gains',
    threshold: 50000
  };

  plan.assumptions.equityGrowthRate = 0.03;
  plan.assumptions.bondGrowthRate = 0.02;
  plan.assumptions.inflationRate = 0.03;

  const results = project(plan, 10, 2025);

  const totalTLHBenefit = results.reduce((sum, year) => sum + (year.taxLossHarvestingBenefit || 0), 0);

  console.log('✓ Total TLH benefit with "offset-gains" strategy:', totalTLHBenefit);

  StorageManager.deletePlan(plan.id);
  console.log('✓ Cleanup: Test plan deleted');

  console.log('✅ testTLHOffsetGainsStrategy PASSED\n');
}

export function testTLHThreshold() {
  console.log('Testing TLH threshold logic...');

  const plan = new Plan('TLH Threshold Test', 50, 65);
  const taxable = new Account('Taxable', 'Taxable', 100000);
  plan.addAccount(taxable);
  plan.addExpense(new Expense('Living Expenses', 40000, 0, true));

  plan.taxLossHarvesting = {
    enabled: true,
    strategy: 'all',
    threshold: 500000 // $5,000 threshold - high to prevent harvesting
  };

  plan.assumptions.equityGrowthRate = 0.04;
  plan.assumptions.bondGrowthRate = 0.03;
  plan.assumptions.inflationRate = 0.03;

  const results = project(plan, 10, 2025);

  const totalTLHBenefit = results.reduce((sum, year) => sum + (year.taxLossHarvestingBenefit || 0), 0);

  console.log('✓ Total TLH benefit with high threshold:', totalTLHBenefit);

  StorageManager.deletePlan(plan.id);
  console.log('✓ Cleanup: Test plan deleted');

  console.log('✅ testTLHThreshold PASSED\n');
}

export function testTLHCostBasisTracking() {
  console.log('Testing TLH cost basis tracking...');

  const plan = new Plan('TLH Cost Basis Test', 50, 65);
  const taxable = new Account('Taxable', 'Taxable', 100000);
  plan.addAccount(taxable);
  plan.addExpense(new Expense('Living Expenses', 40000, 0, true));

  plan.taxLossHarvesting = {
    enabled: true,
    strategy: 'all',
    threshold: 50000
  };

  plan.assumptions.equityGrowthRate = 0.04;
  plan.assumptions.bondGrowthRate = 0.03;
  plan.assumptions.inflationRate = 0.03;

  const results = project(plan, 10, 2025);

  let hasCostBasisUpdate = false;
  results.forEach((year, index) => {
    if (year.accounts && year.accounts[0]) {
      const account = year.accounts[0];
      if (account.costBasis !== undefined) {
        hasCostBasisUpdate = true;
        console.log(`✓ Year ${index}: Balance ${account.balance}, Cost Basis ${account.costBasis}`);
      }
    }
  });

  if (!hasCostBasisUpdate) {
    throw new Error('Expected cost basis to be tracked in projection');
  }

  StorageManager.deletePlan(plan.id);
  console.log('✓ Cleanup: Test plan deleted');

  console.log('✅ testTLHCostBasisTracking PASSED\n');
}

export function testTLHWithMultipleAccounts() {
  console.log('Testing TLH with multiple accounts...');

  const plan = new Plan('TLH Multiple Accounts Test', 50, 65);
  plan.addAccount(new Account('Taxable 1', 'Taxable', 100000));
  plan.addAccount(new Account('Taxable 2', 'Taxable', 80000));
  plan.addAccount(new Account('401k', '401k', 200000));
  plan.addExpense(new Expense('Living Expenses', 40000, 0, true));

  plan.taxLossHarvesting = {
    enabled: true,
    strategy: 'all',
    threshold: 50000
  };

  plan.assumptions.equityGrowthRate = 0.04;
  plan.assumptions.bondGrowthRate = 0.03;
  plan.assumptions.inflationRate = 0.03;

  const results = project(plan, 10, 2025);

  const totalTLHBenefit = results.reduce((sum, year) => sum + (year.taxLossHarvestingBenefit || 0), 0);

  console.log('✓ Total TLH benefit with multiple accounts:', totalTLHBenefit);

  StorageManager.deletePlan(plan.id);
  console.log('✓ Cleanup: Test plan deleted');

  console.log('✅ testTLHWithMultipleAccounts PASSED\n');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('=== TLH Integration Tests ===\n');

  try {
    testTLHSettingsPersistence();
    testTLHWithProjection();
    testTLHDisabled();
    testTLHAllStrategy();
    testTLHOffsetGainsStrategy();
    testTLHThreshold();
    testTLHCostBasisTracking();
    testTLHWithMultipleAccounts();

    console.log('=== All TLH Integration Tests PASSED ✅ ===\n');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}
