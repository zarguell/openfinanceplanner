import { Account } from '../../../src/core/models/Account.js';

export function testAccountCreation() {
  const account = new Account('Test 401k', '401k', 100000);

  if (account.name !== 'Test 401k') {
    throw new Error('Expected account name to be "Test 401k"');
  }

  if (account.type !== '401k') {
    throw new Error('Expected account type to be "401k"');
  }

  if (account.balance !== 10000000) {
    throw new Error('Expected balance to be 10000000 cents ($100,000 * 100)');
  }

  console.log('✓ testAccountCreation passed');
}

export function testAccountJSONSerialization() {
  const account = new Account('Test IRA', 'IRA', 50000);
  account.annualContribution = 6000;

  const json = account.toJSON();
  const restored = Account.fromJSON(json);

  if (restored.name !== account.name) {
    throw new Error('Expected restored name to match original');
  }

  if (restored.balance !== account.balance) {
    throw new Error('Expected restored balance to match original');
  }

  console.log('✓ testAccountJSONSerialization passed');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    testAccountCreation();
    testAccountJSONSerialization();
    console.log('All Account tests passed!');
  } catch (error) {
    console.error('Test failed:', error.message);
    process.exit(1);
  }
}
