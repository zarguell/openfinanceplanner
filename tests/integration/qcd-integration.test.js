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

export function testQCDSettingsPersistence() {
  console.log('Testing QCD settings persistence...');

  const plan = new Plan('QCD Test', 65, 75);
  plan.addAccount(new Account('IRA', 'IRA', 500000));
  plan.addExpense(new Expense('Living Expenses', 60000, 0, true));

  plan.qcdSettings = {
    enabled: true,
    strategy: 'fixed',
    annualAmount: 10000 * 100,
    percentage: 0.10,
    marginalTaxRate: 0.24
  };

  console.log('✓ Plan created with QCD settings:', plan.qcdSettings);

  StorageManager.savePlan(plan);
  console.log('✓ Plan saved to storage');

  const loadedPlan = StorageManager.loadPlan(plan.id);
  const reconstructedPlan = Plan.fromJSON(loadedPlan);

  console.log('✓ Plan loaded from storage');

  if (reconstructedPlan.qcdSettings.enabled !== true) {
    throw new Error('QCD enabled setting not preserved');
  }
  console.log('✓ QCD enabled preserved');

  if (reconstructedPlan.qcdSettings.strategy !== 'fixed') {
    throw new Error('QCD strategy not preserved');
  }
  console.log('✓ QCD strategy preserved:', reconstructedPlan.qcdSettings.strategy);

  if (reconstructedPlan.qcdSettings.annualAmount !== 10000 * 100) {
    throw new Error('QCD annualAmount not preserved');
  }
  console.log('✓ QCD annualAmount preserved');

  StorageManager.deletePlan(plan.id);
  console.log('✓ Cleanup: Test plan deleted');

  console.log('✅ testQCDSettingsPersistence PASSED\n');
}

export function testQCDWithProjection() {
  console.log('Testing QCD with projection...');

  const plan = new Plan('QCD Projection Test', 71, 80);
  plan.addAccount(new Account('IRA', 'IRA', 500000));
  plan.addExpense(new Expense('Living Expenses', 40000, 0, true));

  plan.qcdSettings = {
    enabled: true,
    strategy: 'fixed',
    annualAmount: 10000 * 100,
    percentage: 0,
    marginalTaxRate: 0.24
  };

  console.log('✓ Plan created with QCD enabled (age 71)');

  const results = project(plan, 20, 2025);

  console.log('✓ Projection completed');

  const totalQCD = results.reduce((sum, year) => sum + (year.totalQCD || 0), 0);

  if (totalQCD !== 210000) {
    throw new Error(`Expected total QCD of $210,000, got $${totalQCD}`);
  }
  console.log('✓ Total QCD in projection:', totalQCD);

  const yearsWithQCD = results.filter(year => year.totalQCD > 0);

  if (yearsWithQCD.length !== 21) {
    throw new Error(`Expected 21 years with QCD, got ${yearsWithQCD.length}`);
  }
  console.log('✓ QCD active for 21 years (age 71-90)');

  StorageManager.deletePlan(plan.id);
  console.log('✓ Cleanup: Test plan deleted');

  console.log('✅ testQCDWithProjection PASSED\n');
}

export function testQCDPercentageStrategy() {
  console.log('Testing QCD percentage strategy...');

  const plan = new Plan('QCD Percentage Test', 70, 80);
  plan.addAccount(new Account('IRA', 'IRA', 400000));
  plan.addExpense(new Expense('Living Expenses', 50000, 0, true));

  plan.qcdSettings = {
    enabled: true,
    strategy: 'percentage',
    annualAmount: 0,
    percentage: 0.10,
    marginalTaxRate: 0.22
  };

  const results = project(plan, 15, 2025);

  const yearsWithQCD = results.filter(year => year.totalQCD > 0);

  if (yearsWithQCD.length === 0) {
    throw new Error('Expected QCDs to be calculated');
  }
  console.log('✓ Percentage strategy QCD calculated for', yearsWithQCD.length, 'years');

  const totalQCD = results.reduce((sum, year) => sum + (year.totalQCD || 0), 0);

  if (totalQCD <= 0) {
    throw new Error('Expected positive QCD total');
  }
  console.log('✓ Percentage strategy QCD total:', totalQCD);

  StorageManager.deletePlan(plan.id);
  console.log('✓ Cleanup: Test plan deleted');

  console.log('✅ testQCDPercentageStrategy PASSED\n');
}

export function testQCDRMDBased() {
  console.log('Testing QCD based on RMD amount...');

  const plan = new Plan('QCD RMD Test', 72, 85);
  plan.addAccount(new Account('IRA', 'IRA', 600000));
  plan.addExpense(new Expense('Living Expenses', 40000, 0, true));

  plan.qcdSettings = {
    enabled: true,
    strategy: 'rmd',
    annualAmount: 0,
    percentage: 0,
    marginalTaxRate: 0.24
  };

  const results = project(plan, 15, 2025);

  const yearsWithRMD = results.filter(year => year.totalRmdAmount > 0);
  console.log('✓ RMDs required for', yearsWithRMD.length, 'years');

  const yearsWithQCD = results.filter(year => year.totalQCD > 0);

  if (yearsWithQCD.length !== yearsWithRMD.length) {
    throw new Error('QCD should match RMD years');
  }
  console.log('✓ QCD years match RMD years');

  StorageManager.deletePlan(plan.id);
  console.log('✓ Cleanup: Test plan deleted');

  console.log('✅ testQCDRMDBased PASSED\n');
}

export function testQCDDisabled() {
  console.log('Testing QCD disabled...');

  const plan = new Plan('QCD Disabled Test', 75, 85);
  plan.addAccount(new Account('IRA', 'IRA', 500000));
  plan.addExpense(new Expense('Living Expenses', 50000, 0, true));

  plan.qcdSettings = {
    enabled: false,
    strategy: 'fixed',
    annualAmount: 0,
    percentage: 0,
    marginalTaxRate: 0.24
  };

  const results = project(plan, 10, 2025);

  const totalQCD = results.reduce((sum, year) => sum + (year.totalQCD || 0), 0);

  if (totalQCD !== 0) {
    throw new Error('Expected no QCD when disabled, got QCDs');
  }
  console.log('✓ No QCD when disabled');

  StorageManager.deletePlan(plan.id);
  console.log('✓ Cleanup: Test plan deleted');

  console.log('✅ testQCDDisabled PASSED\n');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('=== QCD Integration Tests ===\n');

  try {
    testQCDSettingsPersistence();
    testQCDWithProjection();
    testQCDPercentageStrategy();
    testQCDRMDBased();
    testQCDDisabled();

    console.log('=== All QCD Integration Tests PASSED ✅ ===\n');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}
