/**
 * Integration test for full application flow
 * Tests the complete workflow from plan creation to projection
 */

import { Plan } from '../../src/core/models/Plan.js';
import { Account } from '../../src/core/models/Account.js';
import { Expense } from '../../src/core/models/Expense.js';
import { project } from '../../src/calculations/projection.js';
import { StorageManager } from '../../src/storage/StorageManager.js';

// Mock localStorage
global.localStorage = {
  store: {},
  getItem(key) { return this.store[key] || null; },
  setItem(key, value) { this.store[key] = value; },
  removeItem(key) { delete this.store[key]; },
  clear() { this.store = {}; }
};

export function testFullPlanWorkflow() {
  console.log('Testing full plan workflow...');

  // Step 1: Create a plan
  const plan = new Plan('Integration Test Plan', 35, 65);
  console.log('✓ Plan created');

  // Step 2: Add accounts
  const account401k = new Account('My 401k', '401k', 100000);
  account401k.annualContribution = 20000;
  plan.addAccount(account401k);

  const rothIRA = new Account('Roth IRA', 'Roth', 50000);
  rothIRA.annualContribution = 6000;
  plan.addAccount(rothIRA);
  console.log('✓ Accounts added');

  // Step 3: Add expenses
  const livingExpenses = new Expense('Living Expenses', 60000, 0, true);
  plan.addExpense(livingExpenses);
  console.log('✓ Expenses added');

  // Step 4: Save plan
  StorageManager.savePlan(plan.toJSON());
  console.log('✓ Plan saved');

  // Step 5: Load plan
  const loadedPlanData = StorageManager.loadPlan(plan.id);
  if (!loadedPlanData) {
    throw new Error('Failed to load plan');
  }

  const loadedPlan = Plan.fromJSON(loadedPlanData);
  loadedPlan.accounts = loadedPlanData.accounts.map(acc => Account.fromJSON(acc));
  loadedPlan.expenses = loadedPlanData.expenses.map(exp => Expense.fromJSON(exp));
  console.log('✓ Plan loaded');

  // Step 6: Run projection
  const projections = project(loadedPlan, 40);
  if (projections.length !== 41) { // 0-40 years
    throw new Error(`Expected 41 projection years, got ${projections.length}`);
  }
  console.log('✓ Projection calculated');

  // Step 7: Verify results
  const startBalance = projections[0].totalBalance;
  const endBalance = projections[40].totalBalance;

  if (endBalance <= startBalance) {
    throw new Error('Expected end balance to exceed start balance with contributions');
  }

  console.log(`✓ Start balance: $${startBalance.toFixed(0)}, End balance: $${endBalance.toFixed(0)}`);
  console.log('✓ Full workflow test passed!');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    testFullPlanWorkflow();
  } catch (error) {
    console.error('Integration test failed:', error.message);
    process.exit(1);
  }
}
