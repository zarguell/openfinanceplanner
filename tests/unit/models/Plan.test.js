import { Plan } from '../../../src/core/models/Plan.js';

export function testPlanCreation() {
  const plan = new Plan('Test Plan', 35, 65);

  if (plan.name !== 'Test Plan') {
    throw new Error('Expected plan name to be "Test Plan"');
  }

  if (plan.id === undefined || plan.id === null) {
    throw new Error('Expected plan to have an ID');
  }

  if (plan.accounts.length !== 0) {
    throw new Error('Expected new plan to have no accounts');
  }

  console.log('✓ testPlanCreation passed');
}

export function testPlanAddAccount() {
  const plan = new Plan('Test Plan', 35, 65);
  const account = {
    id: 'acc_test',
    name: 'Test Account',
    type: '401k',
    balance: 100000,
    annualContribution: 10000,
  };

  plan.addAccount(account);

  if (plan.accounts.length !== 1) {
    throw new Error('Expected plan to have 1 account');
  }

  console.log('✓ testPlanAddAccount passed');
}

// Run tests if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    testPlanCreation();
    testPlanAddAccount();
    console.log('All Plan tests passed!');
  } catch (error) {
    console.error('Test failed:', error.message);
    process.exit(1);
  }
}
