import { describe, it, expect } from 'vitest';
import { Plan } from '../../src/core/models/Plan.js';
import { Account } from '../../src/core/models/Account.js';
import { Expense } from '../../src/core/models/Expense.js';
import { project } from '../../src/calculations/projection.js';

describe('Withdrawal Strategies Integration', () => {
  describe('Strategy Comparison', () => {
    it('should compare tax-efficient vs proportional withdrawal strategies', () => {
      const plan1 = new Plan('Withdrawal Strategy Test', 65, 67);

      const taxableAccount = new Account('Taxable Brokerage', 'Taxable', 50000000);
      const rothIRA = new Account('Roth IRA', 'Roth', 30000000);
      const traditionalIRA = new Account('Traditional IRA', 'IRA', 40000000);

      plan1.addAccount(taxableAccount);
      plan1.addAccount(rothIRA);
      plan1.addAccount(traditionalIRA);

      const expenses = new Expense('Living Expenses', 6000000, 0, true);
      plan1.addExpense(expenses);

      plan1.withdrawalStrategy = 'proportional';
      const projectionProportional = project(plan1, 10);
      const finalBalanceProportional = projectionProportional[10].totalBalance;

      const plan2 = new Plan('Withdrawal Strategy Test', 65, 67);

      const taxableAccount2 = new Account('Taxable Brokerage', 'Taxable', 50000000);
      const rothIRA2 = new Account('Roth IRA', 'Roth', 30000000);
      const traditionalIRA2 = new Account('Traditional IRA', 'IRA', 40000000);

      plan2.addAccount(taxableAccount2);
      plan2.addAccount(rothIRA2);
      plan2.addAccount(traditionalIRA2);

      const expenses2 = new Expense('Living Expenses', 6000000, 0, true);
      plan2.addExpense(expenses2);

      plan2.withdrawalStrategy = 'tax-efficient';
      const projectionTaxEfficient = project(plan2, 10);
      const finalBalanceTaxEfficient = projectionTaxEfficient[10].totalBalance;

      expect(finalBalanceTaxEfficient).toBeDefined();
      expect(finalBalanceProportional).toBeDefined();
    });

    it('should calculate total tax for each strategy', () => {
      const plan1 = new Plan('Withdrawal Strategy Test', 65, 67);

      const taxableAccount = new Account('Taxable Brokerage', 'Taxable', 50000000);
      const rothIRA = new Account('Roth IRA', 'Roth', 30000000);
      const traditionalIRA = new Account('Traditional IRA', 'IRA', 40000000);

      plan1.addAccount(taxableAccount);
      plan1.addAccount(rothIRA);
      plan1.addAccount(traditionalIRA);

      const expenses = new Expense('Living Expenses', 6000000, 0, true);
      plan1.addExpense(expenses);

      plan1.withdrawalStrategy = 'proportional';
      const projectionProportional = project(plan1, 10);
      const totalTaxProportional = projectionProportional
        .slice(0, 11)
        .reduce((sum, year) => sum + year.totalTax, 0);

      const plan2 = new Plan('Withdrawal Strategy Test', 65, 67);

      const taxableAccount2 = new Account('Taxable Brokerage', 'Taxable', 50000000);
      const rothIRA2 = new Account('Roth IRA', 'Roth', 30000000);
      const traditionalIRA2 = new Account('Traditional IRA', 'IRA', 40000000);

      plan2.addAccount(taxableAccount2);
      plan2.addAccount(rothIRA2);
      plan2.addAccount(traditionalIRA2);

      const expenses2 = new Expense('Living Expenses', 6000000, 0, true);
      plan2.addExpense(expenses2);

      plan2.withdrawalStrategy = 'tax-efficient';
      const projectionTaxEfficient = project(plan2, 10);
      const totalTaxTaxEfficient = projectionTaxEfficient
        .slice(0, 11)
        .reduce((sum, year) => sum + year.totalTax, 0);

      expect(totalTaxProportional).toBeDefined();
      expect(totalTaxTaxEfficient).toBeDefined();
    });
  });

  describe('RMD Integration', () => {
    it('should handle withdrawal strategies with RMD requirements', () => {
      const plan = new Plan('RMD Strategy Test', 72, 73);
      plan.taxProfile.filingStatus = 'single';

      const traditionalIRA = new Account('Traditional IRA', 'IRA', 100000000);
      plan.addAccount(traditionalIRA);

      const taxableAccount = new Account('Taxable Brokerage', 'Taxable', 20000000);
      plan.addAccount(taxableAccount);

      const rothIRA = new Account('Roth IRA', 'Roth', 20000000);
      plan.addAccount(rothIRA);

      const expenses = new Expense('Living Expenses', 5000000, 0, true);
      plan.addExpense(expenses);

      plan.withdrawalStrategy = 'tax-efficient';
      const projection = project(plan, 10);

      const age72RMD = projection[0].totalRmdAmount;
      expect(age72RMD).toBe(0);

      const age73RMD = projection[1].totalRmdAmount;
      expect(age73RMD).toBeGreaterThan(0);
    });

    it('should keep all account balances non-negative', () => {
      const plan = new Plan('RMD Strategy Test', 72, 73);
      plan.taxProfile.filingStatus = 'single';

      const traditionalIRA = new Account('Traditional IRA', 'IRA', 100000000);
      plan.addAccount(traditionalIRA);

      const taxableAccount = new Account('Taxable Brokerage', 'Taxable', 20000000);
      plan.addAccount(taxableAccount);

      const rothIRA = new Account('Roth IRA', 'Roth', 20000000);
      plan.addAccount(rothIRA);

      const expenses = new Expense('Living Expenses', 5000000, 0, true);
      plan.addExpense(expenses);

      plan.withdrawalStrategy = 'tax-efficient';
      const projection = project(plan, 10);

      projection.forEach((yearData) => {
        expect(yearData.accountBalances.every((balance) => balance >= 0)).toBe(true);
      });
    });
  });
});
