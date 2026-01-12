import { StorageManager } from '../../../src/storage/StorageManager.js';

// Mock localStorage for Node.js testing
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
  }
};

export function testSaveAndLoadPlan() {
  const plan = {
    id: 'test_plan_1',
    name: 'Test Plan',
    created: '2025-01-01T00:00:00.000Z',
    lastModified: '2025-01-01T00:00:00.000Z',
    taxProfile: {
      currentAge: 35,
      retirementAge: 65,
      filingStatus: 'single',
      federalTaxRate: 0.22
    },
    assumptions: {
      inflationRate: 0.03,
      equityGrowthRate: 0.07,
      bondGrowthRate: 0.04
    },
    accounts: [],
    expenses: []
  };

  StorageManager.savePlan(plan);

  const loaded = StorageManager.loadPlan('test_plan_1');

  if (!loaded) {
    throw new Error('Expected plan to be loaded');
  }

  if (loaded.name !== 'Test Plan') {
    throw new Error('Expected loaded plan name to match');
  }

  console.log('✓ testSaveAndLoadPlan passed');
}

export function testListPlans() {
  global.localStorage.clear();

  const plan1 = { id: 'plan_1', name: 'Plan 1', created: new Date().toISOString(), lastModified: new Date().toISOString(), taxProfile: {}, assumptions: {}, accounts: [], expenses: [] };
  const plan2 = { id: 'plan_2', name: 'Plan 2', created: new Date().toISOString(), lastModified: new Date().toISOString(), taxProfile: {}, assumptions: {}, accounts: [], expenses: [] };

  StorageManager.savePlan(plan1);
  StorageManager.savePlan(plan2);

  const list = StorageManager.listPlans();

  if (list.length !== 2) {
    throw new Error(`Expected 2 plans, got ${list.length}`);
  }

  console.log('✓ testListPlans passed');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    testSaveAndLoadPlan();
    testListPlans();
    console.log('All StorageManager tests passed!');
  } catch (error) {
    console.error('Test failed:', error.message);
    process.exit(1);
  }
}
