/**
 * Withdrawal Strategies - Unit Tests
 * Testing withdrawal algorithms for tax efficiency
 */

import {
  proportionalWithdrawalStrategy,
  taxEfficientWithdrawalStrategy,
  taxAwareWithdrawalStrategy,
  calculateWithdrawals,
} from '/Users/zach/localcode/openfinanceplanner/src/calculations/withdrawal-strategies.js';

export function testProportionalStrategy() {
  console.log('Testing proportional withdrawal strategy...');

  // Test 1: Simple case with 2 accounts
  const accounts1 = [
    { type: '401k', balance: 1000000 }, // $10,000
    { type: 'Roth', balance: 500000 }, // $5,000
  ];
  const withdrawals1 = proportionalWithdrawalStrategy(accounts1, 800000); // Need $8,000

  // Total balance: $15,000 (401k: $10,000, Roth: $5,000)
  // 401k share: $10,000 / $15,000 = 66.7% → should withdraw $5,333.33
  // Roth share: $5,000 / $15,000 = 33.3% → should withdraw $2,666.67
  console.assert(
    withdrawals1[0] === 533333,
    'Test 1a failed: 401k should withdraw 66.7% of $8,000 = $5,333.33'
  );
  console.assert(
    withdrawals1[1] === 266667,
    'Test 1b failed: Roth should withdraw 33.3% of $8,000 = $2,666.67'
  );

  // Test 2: Three accounts, different balances
  const accounts2 = [
    { type: 'IRA', balance: 2000000 }, // $20,000
    { type: '401k', balance: 1500000 }, // $15,000
    { type: 'Taxable', balance: 500000 }, // $5,000
  ];
  const withdrawals2 = proportionalWithdrawalStrategy(accounts2, 2000000); // Need $20,000

  // Total balance: $40,000
  // IRA: $20,000 / $40,000 = 50% → $10,000
  // 401k: $15,000 / $40,000 = 37.5% → $7,500
  // Taxable: $5,000 / $40,000 = 12.5% → $2,500
  console.assert(withdrawals2[0] === 1000000, 'Test 2a failed: IRA should withdraw 50% = $10,000');
  console.assert(withdrawals2[1] === 750000, 'Test 2b failed: 401k should withdraw 37.5% = $7,500');
  console.assert(
    withdrawals2[2] === 250000,
    'Test 2c failed: Taxable should withdraw 12.5% = $2,500'
  );

  // Test 3: Withdrawal larger than total balance
  const withdrawals3 = proportionalWithdrawalStrategy(accounts1, 20000000); // Need $20,000 but only have $15,000

  console.assert(withdrawals3[0] === 1000000, 'Test 3 failed: 401k should withdraw all $10,000');
  console.assert(withdrawals3[1] === 500000, 'Test 3 failed: Roth should withdraw all $5,000');

  console.log('All proportional strategy tests passed! ✓');
}

export function testTaxEfficientStrategy() {
  console.log('Testing tax-efficient withdrawal strategy...');

  // Test 1: No RMDs, withdraw from Taxable first
  const accounts1 = [
    { type: 'Roth', balance: 1000000 }, // $10,000
    { type: 'Taxable', balance: 500000 }, // $5,000
    { type: 'IRA', balance: 2000000 }, // $20,000
  ];
  const withdrawals1 = taxEfficientWithdrawalStrategy(accounts1, 500000); // Need $5,000

  console.assert(
    withdrawals1[0] === 0,
    'Test 1a failed: Roth should not withdraw (lowest priority)'
  );
  console.assert(
    withdrawals1[1] === 500000,
    'Test 1b failed: Taxable should withdraw first ($5,000)'
  );
  console.assert(
    withdrawals1[2] === 0,
    'Test 1c failed: IRA should not withdraw (second priority after Taxable)'
  );

  // Test 2: Withdrawal needs more than one account
  const accounts2 = [
    { type: 'Taxable', balance: 300000 }, // $3,000
    { type: 'IRA', balance: 2000000 }, // $20,000
    { type: 'Roth', balance: 1000000 }, // $10,000
  ];
  const withdrawals2 = taxEfficientWithdrawalStrategy(accounts2, 1500000); // Need $15,000

  console.assert(withdrawals2[0] === 300000, 'Test 2a failed: Taxable should withdraw all $3,000');
  console.assert(withdrawals2[1] === 1200000, 'Test 2b failed: IRA should withdraw $12,000');
  console.assert(withdrawals2[2] === 0, 'Test 2c failed: Roth should not withdraw');

  // Test 3: With RMD requirements
  const accounts3 = [
    { type: 'Taxable', balance: 1000000 }, // $10,000
    { type: 'IRA', balance: 500000 }, // $5,000
  ];
  const rmdRequirements3 = [0, 100000]; // IRA needs $1,000 RMD
  const withdrawals3 = taxEfficientWithdrawalStrategy(accounts3, 300000, rmdRequirements3); // Need $3,000

  console.assert(withdrawals3[0] === 200000, 'Test 3a failed: Taxable should withdraw $2,000');
  console.assert(
    withdrawals3[1] === 100000,
    'Test 3b failed: IRA should withdraw exactly RMD ($1,000)'
  );

  console.log('All tax-efficient strategy tests passed! ✓');
}

export function testTaxAwareStrategy() {
  console.log('Testing tax-aware withdrawal strategy...');

  const accounts = [
    { type: 'Taxable', balance: 1000000 }, // $10,000
    { type: 'IRA', balance: 2000000 }, // $20,000
  ];
  const withdrawals = taxAwareWithdrawalStrategy(accounts, 500000); // Need $5,000

  console.assert(
    withdrawals.length === 2,
    'Test 1 failed: Should return withdrawals for all accounts'
  );
  console.assert(withdrawals[0] === 500000, 'Test 1a failed: Taxable should withdraw $5,000 first');
  console.assert(withdrawals[1] === 0, 'Test 1b failed: IRA should not withdraw');

  console.log('All tax-aware strategy tests passed! ✓');
}

export function testCalculateWithdrawals() {
  console.log('Testing calculateWithdrawals function...');

  const accounts = [
    { type: 'Taxable', balance: 1000000 },
    { type: 'IRA', balance: 2000000 },
  ];

  // Test default strategy (proportional)
  const withdrawals1 = calculateWithdrawals('proportional', accounts, 500000);
  console.assert(withdrawals1[0] === 166667, 'Test 1a failed: Proportional strategy should work');
  console.assert(withdrawals1[1] === 333333, 'Test 1b failed: Proportional strategy should work');

  // Test tax-efficient strategy
  const withdrawals2 = calculateWithdrawals('tax-efficient', accounts, 500000);
  console.assert(withdrawals2[0] === 500000, 'Test 2a failed: Tax-efficient strategy should work');
  console.assert(withdrawals2[1] === 0, 'Test 2b failed: Tax-efficient strategy should work');

  // Test tax-aware strategy
  const withdrawals3 = calculateWithdrawals('tax-aware', accounts, 500000, []);
  console.assert(withdrawals3[0] === 500000, 'Test 3a failed: Tax-aware strategy should work');
  console.assert(withdrawals3[1] === 0, 'Test 3b failed: Tax-aware strategy should work');

  console.log('All calculateWithdrawals tests passed! ✓');
}

// Run tests if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testProportionalStrategy();
  testTaxEfficientStrategy();
  testTaxAwareStrategy();
  testCalculateWithdrawals();

  console.log('\n=== All Withdrawal Strategy Tests Passed ===\n');
}
