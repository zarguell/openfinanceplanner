/**
 * Integration test for full application flow
 * Tests the complete workflow from plan creation to projection
 */

import { Plan } from '../../src/core/models/Plan.js';
import { Account } from '../../src/core/models/Account.js';
import { Expense } from '../../src/core/models/Expense.js';
import { Income } from '../../src/core/models/Income.js';
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

  // Step 3: Add income
  const salary = new Income('Software Engineer Salary', 120000, 0, 'salary');
  plan.addIncome(salary);
  console.log('✓ Income added');

  // Step 4: Add expenses
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
  loadedPlan.incomes = loadedPlanData.incomes ? loadedPlanData.incomes.map(inc => Income.fromJSON(inc)) : [];
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

export function testIncomeToSavingsFlow() {
  console.log('Testing income to savings flow...');

  // Create a plan with income, expenses, and savings
  const plan = new Plan('Income Test Plan', 30, 65);

  // Add income: $80,000 salary
  const salary = new Income('Software Engineer Salary', 80000, 0, 'salary');
  plan.addIncome(salary);

  // Add expenses: $50,000 living expenses
  const expenses = new Expense('Living Expenses', 50000, 0, true);
  plan.addExpense(expenses);

  // Add savings account: $10,000 initial, $20,000 annual contribution
  const savings = new Account('Emergency Savings', 'Taxable', 10000);
  savings.annualContribution = 20000;
  plan.addAccount(savings);

  // Run projection for 5 years
  const projections = project(plan, 5);

  // Verify the cash flow logic
  // Year 0: Income $80k - Expenses $50k = $30k surplus
  // This should result in $20k going to savings + $10k available for other uses
  const year0 = projections[0];
  console.log(`Year 0: Income $${year0.totalIncome}, Expenses $${year0.totalExpense}, Balance $${year0.totalBalance.toFixed(0)}`);

  // Balance should grow: initial $10k + $20k contribution + investment growth
  // But we should have positive net cash flow contributing to growth
  if (year0.totalIncome < year0.totalExpense) {
    throw new Error('Income should exceed expenses in this scenario');
  }

  // Year 1: Income grows, expenses grow with inflation
  const year1 = projections[1];
  if (year1.totalIncome <= year0.totalIncome) {
    throw new Error('Income should grow over time');
  }

  console.log(`Year 1: Income $${year1.totalIncome.toFixed(0)}, Expenses $${year1.totalExpense.toFixed(0)}, Balance $${year1.totalBalance.toFixed(0)}`);

  // Verify retirement transition
  const retirementYear = projections.find(p => p.age === 65);
  if (retirementYear) {
    console.log(`Retirement year: Income $${retirementYear.totalIncome.toFixed(0)}, Balance $${retirementYear.totalBalance.toFixed(0)}`);
    // In retirement, income drops significantly (no salary), balance should be much higher
    if (retirementYear.totalIncome > year0.totalIncome * 0.5) {
      throw new Error('Income should drop significantly in retirement');
    }
  }

  console.log('✓ Income to savings flow test passed!');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    testFullPlanWorkflow();
    testIncomeToSavingsFlow();
    console.log('All integration tests passed!');
  } catch (error) {
    console.error('Integration test failed:', error.message);
    process.exit(1);
  }
}
