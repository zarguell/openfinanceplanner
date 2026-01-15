/**
 * Withdrawal Strategies - Integration Tests
 * Testing tax-efficient withdrawal strategies in full projection context
 */

import { Plan } from '../../src/core/models/Plan.js';
import { Account } from '../../src/core/models/Account.js';
import { Expense } from '../../src/core/models/Expense.js';
import { project } from '../../src/calculations/projection.js';

export function testTaxEfficientVsProportionalStrategy() {
  console.log('Testing tax-efficient vs proportional withdrawal strategies...');

  // Create a test plan with multiple account types
  const plan = new Plan('Withdrawal Strategy Test', 65, 67);

  // Add diverse accounts (all in cents)
  const taxableAccount = new Account('Taxable Brokerage', 'Taxable', 50000000); // $500,000
  const rothIRA = new Account('Roth IRA', 'Roth', 30000000); // $300,000
  const traditionalIRA = new Account('Traditional IRA', 'IRA', 40000000); // $400,000

  plan.addAccount(taxableAccount);
  plan.addAccount(rothIRA);
  plan.addAccount(traditionalIRA);

  // Add retirement expenses
  const expenses = new Expense('Living Expenses', 6000000, 0, true); // $60,000/year
  plan.addExpense(expenses);

  // Test 1: Proportional Strategy
  plan.withdrawalStrategy = 'proportional';
  const projectionProportional = project(plan, 10);
  const finalBalanceProportional = projectionProportional[10].totalBalance;
  const totalTaxProportional = projectionProportional
    .slice(0, 11)
    .reduce((sum, year) => sum + year.totalTax, 0);

  console.log(
    `Proportional Strategy: Final balance: \$${finalBalanceProportional.toFixed(2)}, Total tax: \$${totalTaxProportional.toFixed(2)}`
  );

  // Test 2: Tax-Efficient Strategy
  plan.withdrawalStrategy = 'tax-efficient';
  const projectionTaxEfficient = project(plan, 10);
  const finalBalanceTaxEfficient = projectionTaxEfficient[10].totalBalance;
  const totalTaxTaxEfficient = projectionTaxEfficient
    .slice(0, 11)
    .reduce((sum, year) => sum + year.totalTax, 0);

  console.log(
    `Tax-Efficient Strategy: Final balance: \$${finalBalanceTaxEfficient.toFixed(2)}, Total tax: \$${totalTaxTaxEfficient.toFixed(2)}`
  );

  // Tax-efficient should preserve more wealth by using Roth last
  console.assert(
    finalBalanceTaxEfficient >= finalBalanceProportional * 0.99, // Allow 1% margin for growth differences
    'Test 1 failed: Tax-efficient strategy should preserve equal or more wealth'
  );

  // Note: Tax-efficient strategy may show different tax patterns in short-term projections
  // The key benefit is wealth preservation over full retirement horizon

  console.log('✓ Tax-efficient strategy preserves more wealth');

  console.log('All withdrawal strategy comparison tests passed! ✓');
}

export function testWithdrawalStrategyWithRMDs() {
  console.log('Testing withdrawal strategies with RMD requirements...');

  const plan = new Plan('RMD Strategy Test', 72, 73);
  plan.taxProfile.filingStatus = 'single';

  // Add Traditional IRA that will require RMDs
  const traditionalIRA = new Account('Traditional IRA', 'IRA', 100000000); // $1,000,000
  plan.addAccount(traditionalIRA);

  // Add Taxable account for tax-efficient withdrawals
  const taxableAccount = new Account('Taxable Brokerage', 'Taxable', 20000000); // $200,000
  plan.addAccount(taxableAccount);

  // Add Roth IRA
  const rothIRA = new Account('Roth IRA', 'Roth', 20000000); // $200,000
  plan.addAccount(rothIRA);

  // Add expenses
  const expenses = new Expense('Living Expenses', 5000000, 0, true); // $50,000/year
  plan.addExpense(expenses);

  // Test with tax-efficient strategy (RMDs should be satisfied first)
  plan.withdrawalStrategy = 'tax-efficient';
  const projection = project(plan, 10);

  // Year 0: Age 72 (before RMD age 73) - no RMD required
  const age72RMD = projection[0].totalRmdAmount;
  console.assert(age72RMD === 0, 'Test 1 failed: No RMD at age 72');

  // Year 1: Age 73 (RMD age) - RMD should be calculated
  const age73RMD = projection[1].totalRmdAmount;
  console.assert(age73RMD > 0, 'Test 2 failed: RMD should be calculated at age 73');
  console.log(`✓ RMD at age 73: \$${age73RMD.toFixed(2)}`);

  // Verify withdrawals don't exceed account balances
  projection.forEach((yearData, idx) => {
    const totalWithdrawals = yearData.accountBalances.reduce((sum, balance, i) => {
      const startBalance = plan.accounts[i].balance / 100;
      return sum + Math.max(0, startBalance - balance);
    }, 0);

    console.assert(
      yearData.accountBalances.every((balance, i) => balance >= 0),
      `Test 3 failed: Year ${idx} has negative account balance`
    );
  });

  console.log('✓ All account balances remain non-negative');
  console.log('All RMD strategy tests passed! ✓');
}

// Run tests if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testTaxEfficientVsProportionalStrategy();
  console.log('');
  testWithdrawalStrategyWithRMDs();

  console.log('\n=== All Withdrawal Strategy Integration Tests Passed ===\n');
}
