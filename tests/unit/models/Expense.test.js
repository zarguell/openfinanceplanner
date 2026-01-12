import { Expense } from '../../../src/core/models/Expense.js';

export function testExpenseCreation() {
  const expense = new Expense('Living Expenses', 60000, 0, true);

  if (expense.name !== 'Living Expenses') {
    throw new Error('Expected expense name to be "Living Expenses"');
  }

  if (expense.baseAmount !== 6000000) { // Stored in cents
    throw new Error('Expected baseAmount to be in cents');
  }

  if (expense.inflationAdjusted !== true) {
    throw new Error('Expected inflationAdjusted to be true');
  }

  console.log('✓ testExpenseCreation passed');
}

export function testExpenseJSONRoundTrip() {
  const expense = new Expense('Healthcare', 12000, 5, false);
  expense.endYear = 20;

  const json = expense.toJSON();
  const restored = Expense.fromJSON(json);

  if (restored.name !== expense.name) {
    throw new Error('Expected restored name to match');
  }

  if (restored.inflationAdjusted !== false) {
    throw new Error('Expected inflationAdjusted to be false');
  }

  console.log('✓ testExpenseJSONRoundTrip passed');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    testExpenseCreation();
    testExpenseJSONRoundTrip();
    console.log('All Expense tests passed!');
  } catch (error) {
    console.error('Test failed:', error.message);
    process.exit(1);
  }
}
