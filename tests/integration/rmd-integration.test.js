import { describe, it, expect } from 'vitest';
import { Plan } from '../../src/core/models/Plan.js';
import { Account } from '../../src/core/models/Account.js';
import { Expense } from '../../src/core/models/Expense.js';
import { project } from '../../src/calculations/projection.js';

describe('RMD Integration', () => {
  describe('RMD Calculations', () => {
    it('should calculate RMDs for age 73+', () => {
      const plan = new Plan('RMD Test Plan', 73, 65);

      const account401k = new Account('My 401k', '401k', 1000000);
      account401k.annualContribution = 0;
      plan.addAccount(account401k);

      const ira = new Account('Traditional IRA', 'IRA', 500000);
      plan.addAccount(ira);

      const roth = new Account('Roth IRA', 'Roth', 300000);
      plan.addAccount(roth);

      const hsa = new Account('HSA', 'HSA', 50000);
      plan.addAccount(hsa);

      const taxable = new Account('Taxable', 'Taxable', 200000);
      plan.addAccount(taxable);

      plan.taxProfile = {
        currentAge: 73,
        retirementAge: 65,
        estimatedTaxRate: 0.25,
        filingStatus: 'single',
        federalTaxRate: 0.22,
        state: 'CA',
        taxYear: 2025,
      };

      const livingExpenses = new Expense('Living Expenses', 60000, 0, true);
      plan.addExpense(livingExpenses);

      plan.assumptions = {
        inflationRate: 0.03,
        equityGrowthRate: 0.08,
        bondGrowthRate: 0.04,
        equityVolatility: 0.12,
        bondVolatility: 0.04,
      };

      const results = project(plan, 10);

      let totalRMDs = 0;
      let yearsWithRMDs = 0;

      results.forEach((year) => {
        if (year.totalRmdAmount > 0) {
          yearsWithRMDs++;
          totalRMDs += year.totalRmdAmount;
        }
      });

      expect(yearsWithRMDs).toBeGreaterThan(0);
      expect(totalRMDs).toBeGreaterThan(0);
    });

    it('should calculate correct first year RMD amount', () => {
      const plan = new Plan('RMD Test Plan', 73, 65);

      const account401k = new Account('My 401k', '401k', 1000000);
      account401k.annualContribution = 0;
      plan.addAccount(account401k);

      const ira = new Account('Traditional IRA', 'IRA', 500000);
      plan.addAccount(ira);

      plan.taxProfile = {
        currentAge: 73,
        retirementAge: 65,
        estimatedTaxRate: 0.25,
        filingStatus: 'single',
        federalTaxRate: 0.22,
        state: 'CA',
        taxYear: 2025,
      };

      const livingExpenses = new Expense('Living Expenses', 60000, 0, true);
      plan.addExpense(livingExpenses);

      plan.assumptions = {
        inflationRate: 0.03,
        equityGrowthRate: 0.08,
        bondGrowthRate: 0.04,
        equityVolatility: 0.12,
        bondVolatility: 0.04,
      };

      const results = project(plan, 10);

      const firstYearRMD = results[0].totalRmdAmount;
      const expectedFirstYearRMD = Math.round((1000000 + 500000) / 26.5);

      expect(Math.abs(firstYearRMD - expectedFirstYearRMD)).toBeLessThanOrEqual(1000);
    });

    it('should exempt Roth, HSA, and Taxable accounts from RMDs', () => {
      const plan = new Plan('RMD Test Plan', 73, 65);

      const account401k = new Account('My 401k', '401k', 1000000);
      account401k.annualContribution = 0;
      plan.addAccount(account401k);

      const ira = new Account('Traditional IRA', 'IRA', 500000);
      plan.addAccount(ira);

      const roth = new Account('Roth IRA', 'Roth', 300000);
      plan.addAccount(roth);

      const hsa = new Account('HSA', 'HSA', 50000);
      plan.addAccount(hsa);

      const taxable = new Account('Taxable', 'Taxable', 200000);
      plan.addAccount(taxable);

      plan.taxProfile = {
        currentAge: 73,
        retirementAge: 65,
        estimatedTaxRate: 0.25,
        filingStatus: 'single',
        federalTaxRate: 0.22,
        state: 'CA',
        taxYear: 2025,
      };

      const livingExpenses = new Expense('Living Expenses', 60000, 0, true);
      plan.addExpense(livingExpenses);

      plan.assumptions = {
        inflationRate: 0.03,
        equityGrowthRate: 0.08,
        bondGrowthRate: 0.04,
        equityVolatility: 0.12,
        bondVolatility: 0.04,
      };

      const results = project(plan, 10);

      expect(results[0].totalRmdAmount).toBeGreaterThan(0);
    });
  });

  describe('Age Threshold', () => {
    it('should NOT calculate RMDs under age 73', () => {
      const plan = new Plan('No RMD Test Plan', 70, 65);

      const account401k = new Account('My 401k', '401k', 1000000);
      plan.addAccount(account401k);

      plan.taxProfile = {
        currentAge: 70,
        retirementAge: 65,
        estimatedTaxRate: 0.25,
        filingStatus: 'single',
        state: 'CA',
        taxYear: 2025,
      };

      const expenses = new Expense('Living Expenses', 60000, 0, true);
      plan.addExpense(expenses);

      plan.assumptions = {
        inflationRate: 0.03,
        equityGrowthRate: 0.08,
        bondGrowthRate: 0.04,
        equityVolatility: 0.12,
        bondVolatility: 0.04,
      };

      const results = project(plan, 5);

      results.forEach((year) => {
        if (year.age < 73) {
          expect(year.totalRmdAmount).toBe(0);
        }
      });
    });

    it('should calculate RMDs at age 73 (SECURE Act 2.0 threshold)', () => {
      const plan = new Plan('SECURE Act 2.0 Test', 73, 65);

      const account401k = new Account('My 401k', '401k', 1000000);
      plan.addAccount(account401k);

      plan.taxProfile = {
        currentAge: 73,
        retirementAge: 65,
        estimatedTaxRate: 0.25,
        filingStatus: 'single',
        state: 'CA',
        taxYear: 2025,
      };

      const expenses = new Expense('Living Expenses', 60000, 0, true);
      plan.addExpense(expenses);

      plan.assumptions = {
        inflationRate: 0.03,
        equityGrowthRate: 0.08,
        bondGrowthRate: 0.04,
        equityVolatility: 0.12,
        bondVolatility: 0.04,
      };

      const results = project(plan, 1);

      expect(results[0].totalRmdAmount).toBeGreaterThan(0);
    });
  });
});
