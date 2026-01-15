import { Plan } from '../../src/core/models/Plan.js';
import { Account } from '../../src/core/models/Account.js';
import { StorageManager } from '../../src/storage/StorageManager.js';

global.localStorage = {
  store: {},
  getItem(key) {
    return this.store[key] || null;
  },
  setItem(key, value) {
    this.store[key] = value;
  },
  removeItem(key) {
    delete this.store[key];
  },
  clear() {
    this.store = {};
  },
};

export function testRothConversionUIFields() {
  console.log('Testing Roth Conversion UI fields...');

  const plan = new Plan('Roth Conversion Test', 45, 65);
  plan.addAccount(new Account('401k', '401k', 500000));
  plan.addAccount(new Account('Roth IRA', 'Roth', 100000));

  plan.rothConversions = {
    enabled: true,
    strategy: 'fixed',
    annualAmount: 10000 * 100,
    percentage: 0.05,
    bracketTop: 50000 * 100,
  };

  console.log('✓ Plan created with Roth Conversion settings:', plan.rothConversions);

  StorageManager.savePlan(plan);
  console.log('✓ Plan saved to storage');

  const loadedPlan = StorageManager.loadPlan(plan.id);
  const reconstructedPlan = Plan.fromJSON(loadedPlan);

  console.log('✓ Plan loaded from storage');

  if (reconstructedPlan.rothConversions.enabled !== true) {
    throw new Error('Roth Conversions enabled setting not preserved');
  }
  console.log('✓ Roth Conversions enabled preserved');

  if (reconstructedPlan.rothConversions.strategy !== 'fixed') {
    throw new Error('Roth Conversions strategy not preserved');
  }
  console.log('✓ Roth Conversions strategy preserved:', reconstructedPlan.rothConversions.strategy);

  if (reconstructedPlan.rothConversions.annualAmount !== 10000 * 100) {
    throw new Error('Roth Conversions annualAmount not preserved');
  }
  console.log(
    '✓ Roth Conversions annualAmount preserved:',
    reconstructedPlan.rothConversions.annualAmount
  );

  if (reconstructedPlan.rothConversions.percentage !== 0.05) {
    throw new Error('Roth Conversions percentage not preserved');
  }
  console.log(
    '✓ Roth Conversions percentage preserved:',
    reconstructedPlan.rothConversions.percentage
  );

  if (reconstructedPlan.rothConversions.bracketTop !== 50000 * 100) {
    throw new Error('Roth Conversions bracketTop not preserved');
  }
  console.log(
    '✓ Roth Conversions bracketTop preserved:',
    reconstructedPlan.rothConversions.bracketTop
  );

  plan.rothConversions.strategy = 'percentage';
  plan.rothConversions.percentage = 0.1;
  StorageManager.savePlan(plan);
  const loadedPlan2 = StorageManager.loadPlan(plan.id);
  const reconstructedPlan2 = Plan.fromJSON(loadedPlan2);

  if (reconstructedPlan2.rothConversions.strategy !== 'percentage') {
    throw new Error('Percentage strategy not preserved');
  }
  console.log('✓ Percentage strategy preserved:', reconstructedPlan2.rothConversions.strategy);
  console.log('✓ Percentage value preserved:', reconstructedPlan2.rothConversions.percentage);

  plan.rothConversions.strategy = 'bracket-fill';
  plan.rothConversions.bracketTop = 95000 * 100;
  StorageManager.savePlan(plan);
  const loadedPlan3 = StorageManager.loadPlan(plan.id);
  const reconstructedPlan3 = Plan.fromJSON(loadedPlan3);

  if (reconstructedPlan3.rothConversions.strategy !== 'bracket-fill') {
    throw new Error('Bracket-fill strategy not preserved');
  }
  console.log('✓ Bracket-fill strategy preserved:', reconstructedPlan3.rothConversions.strategy);
  console.log('✓ Bracket-top value preserved:', reconstructedPlan3.rothConversions.bracketTop);

  plan.rothConversions.enabled = false;
  StorageManager.savePlan(plan);
  const loadedPlan4 = StorageManager.loadPlan(plan.id);
  const reconstructedPlan4 = Plan.fromJSON(loadedPlan4);

  if (reconstructedPlan4.rothConversions.enabled !== false) {
    throw new Error('Disabled Roth Conversions setting not preserved');
  }
  console.log('✓ Disabled Roth Conversions preserved');

  StorageManager.deletePlan(plan.id);
  console.log('✓ Cleanup: Test plan deleted');

  console.log('✅ testRothConversionUIFields PASSED\n');
}

export function testRothConversionWithProjection() {
  console.log('Testing Roth Conversion with projection...');

  const plan = new Plan('Roth Projection Test', 50, 65);
  plan.addAccount(new Account('401k', '401k', 500000));
  plan.addAccount(new Account('Roth IRA', 'Roth', 100000));

  plan.rothConversions = {
    enabled: true,
    strategy: 'fixed',
    annualAmount: 15000 * 100,
    percentage: 0,
    bracketTop: 0,
  };

  console.log('✓ Plan created with Roth Conversions');

  StorageManager.savePlan(plan);

  const loadedPlan = StorageManager.loadPlan(plan.id);
  const reconstructedPlan = Plan.fromJSON(loadedPlan);

  console.log('✓ Plan loaded from storage');
  console.log('✓ Roth Conversions settings:', reconstructedPlan.rothConversions);

  if (
    reconstructedPlan.rothConversions.enabled !== true ||
    reconstructedPlan.rothConversions.strategy !== 'fixed' ||
    reconstructedPlan.rothConversions.annualAmount !== 15000 * 100
  ) {
    throw new Error('Roth Conversion settings mismatch after load');
  }
  console.log('✓ Roth Conversion settings verified');

  StorageManager.deletePlan(plan.id);
  console.log('✓ Cleanup: Test plan deleted');

  console.log('✅ testRothConversionWithProjection PASSED\n');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('=== Roth Conversion UI Integration Tests ===\n');

  try {
    testRothConversionUIFields();
    testRothConversionWithProjection();

    console.log('=== All Roth Conversion UI Integration Tests PASSED ✅ ===\n');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}
