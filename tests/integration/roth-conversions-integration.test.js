import { describe, it, expect } from 'vitest';
import { Plan } from '../../src/core/models/Plan.js';
import { Account } from '../../src/core/models/Account.js';
import { Expense } from '../../src/core/models/Expense.js';
import { project } from '../../src/calculations/projection.js';
import { optimizeConversionsAcrossYears } from '../../src/calculations/roth-conversions.js';

describe('Roth Conversions Integration', () => {
  describe('Strategy Comparison', () => {
    it('should compare traditional vs Roth conversion strategies', () => {
      const plan1 = new Plan('Roth Conversion Test', 55, 65);
      plan1.addAccount(new Account('Traditional IRA', 'IRA', 50000000));
      plan1.addAccount(new Account('Roth IRA', 'Roth', 0));
      plan1.addExpense(new Expense('Living Expenses', 6000000));

      const projection1 = project(plan1, 10, 2025);
      const finalBalance1 = projection1[projection1.length - 1].totalBalance;

      const plan2 = new Plan('Roth Conversion Test', 55, 65);
      plan2.addAccount(new Account('Traditional IRA', 'IRA', 50000000));
      plan2.addAccount(new Account('Roth IRA', 'Roth', 0));
      plan2.addExpense(new Expense('Living Expenses', 6000000));
      plan2.rothConversions = {
        enabled: true,
        strategy: 'fixed',
        annualAmount: 10000000,
      };

      const projection2 = project(plan2, 10, 2025);
      const finalBalance2 = projection2[projection2.length - 1].totalBalance;

      expect(finalBalance2).toBeDefined();
      expect(finalBalance1).toBeDefined();
    });

    it('should execute bracket-fill strategy', () => {
      const plan = new Plan('Bracket Fill Test', 55, 65);
      plan.addAccount(new Account('Traditional IRA', 'IRA', 30000000));
      plan.addAccount(new Account('Roth IRA', 'Roth', 0));
      plan.addExpense(new Expense('Living Expenses', 4000000));

      plan.rothConversions = {
        enabled: true,
        strategy: 'bracket-fill',
        targetBracket: '12%',
      };

      const projections = project(plan, 5, 2025);

      let totalConversions = 0;
      projections.forEach((row) => {
        if (row.rothConversions) {
          totalConversions += row.rothConversions;
        }
      });

      expect(totalConversions).toBeGreaterThan(0);
    });

    it('should execute percentage strategy', () => {
      const plan = new Plan('Percentage Test', 50, 65);
      plan.addAccount(new Account('Traditional IRA', 'IRA', 100000000));
      plan.addAccount(new Account('Roth IRA', 'Roth', 50000000));
      plan.addExpense(new Expense('Living Expenses', 5000000));

      plan.rothConversions = {
        enabled: true,
        strategy: 'percentage',
        percentage: 0.05,
      };

      const projections = project(plan, 10, 2025);

      let totalConversions = 0;
      projections.forEach((row) => {
        if (row.rothConversions) {
          totalConversions += row.rothConversions;
        }
      });

      expect(totalConversions).toBeGreaterThan(0);
    });
  });

  describe('Roth Conversions with RMDs', () => {
    it('should calculate conversions alongside RMDs', () => {
      const plan = new Plan('RMD + Conversion Test', 70, 75);
      plan.addAccount(new Account('Traditional IRA', 'IRA', 100000000));
      plan.addAccount(new Account('Roth IRA', 'Roth', 0));
      plan.addExpense(new Expense('Living Expenses', 6000000));

      plan.rothConversions = {
        enabled: true,
        strategy: 'fixed',
        annualAmount: 20000000,
      };

      const projections = project(plan, 10, 2025);

      let totalRMDs = 0;
      let totalConversions = 0;
      projections.forEach((row) => {
        if (row.totalRmdAmount) {
          totalRMDs += row.totalRmdAmount;
        }
        if (row.rothConversions) {
          totalConversions += row.rothConversions;
        }
      });

      expect(totalRMDs).toBeGreaterThan(0);
      expect(totalConversions).toBeGreaterThan(0);
    });
  });

  describe('Tax Impact', () => {
    it('should show increased taxes with conversions', () => {
      const plan1 = new Plan('No Conversion Tax Test', 55, 65);
      plan1.addAccount(new Account('Traditional IRA', 'IRA', 20000000));
      plan1.addAccount(new Account('Roth IRA', 'Roth', 0));
      plan1.addExpense(new Expense('Living Expenses', 5000000));

      const projection1 = project(plan1, 10, 2025);
      const totalTax1 = projection1.reduce(
        (sum, row) => sum + row.totalFederalTax + row.totalStateTax,
        0
      );

      const plan2 = new Plan('With Conversion Tax Test', 55, 65);
      plan2.addAccount(new Account('Traditional IRA', 'IRA', 20000000));
      plan2.addAccount(new Account('Roth IRA', 'Roth', 0));
      plan2.addExpense(new Expense('Living Expenses', 5000000));
      plan2.rothConversions = {
        enabled: true,
        strategy: 'fixed',
        annualAmount: 5000000,
      };

      const projection2 = project(plan2, 10, 2025);
      const totalTax2 = projection2.reduce(
        (sum, row) => sum + row.totalFederalTax + row.totalStateTax,
        0
      );

      expect(totalTax2).not.toBeLessThan(totalTax1);
    });
  });

  describe('Optimization', () => {
    it('should optimize conversions across years', () => {
      const plan = new Plan('Multi-Year Test', 50, 65);
      plan.addAccount(new Account('Traditional IRA', 'IRA', 30000000));
      plan.addAccount(new Account('Roth IRA', 'Roth', 0));
      plan.addExpense(new Expense('Living Expenses', 4000000));

      const conversions = optimizeConversionsAcrossYears(plan, 5, 'fixed');

      expect(conversions).toHaveLength(5);
      expect(conversions[0].year).toBe(new Date().getFullYear());
      expect(conversions[0].conversionAmount).toBeGreaterThan(0);
    });
  });
});
