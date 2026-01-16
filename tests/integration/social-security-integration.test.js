import { describe, it, expect } from 'vitest';
import { Plan } from '../../src/core/models/Plan.js';
import { Account } from '../../src/core/models/Account.js';
import { Expense } from '../../src/core/models/Expense.js';
import { project } from '../../src/calculations/projection.js';

describe('Social Security Integration', () => {
  describe('Basic Integration', () => {
    it('should calculate Social Security in projections', () => {
      const plan = new Plan('SS Test Plan', 62, 67);

      const account401k = new Account('My 401k', '401k', 500000);
      account401k.annualContribution = 0;
      plan.addAccount(account401k);

      plan.taxProfile = {
        currentAge: 62,
        retirementAge: 67,
        estimatedTaxRate: 0.25,
        filingStatus: 'single',
        state: 'CA',
        taxYear: 2025,
      };

      const expenses = new Expense('Living Expenses', 60000, 0, true);
      plan.addExpense(expenses);

      plan.assumptions = {
        inflationRate: 0.03,
        equityGrowthRate: 0.07,
        bondGrowthRate: 0.04,
        equityVolatility: 0.12,
        bondVolatility: 0.04,
      };

      plan.socialSecurity = {
        enabled: true,
        birthYear: new Date().getFullYear() - 62,
        monthlyBenefit: 2000,
        filingAge: 67,
      };

      const results = project(plan, 10);

      let yearsWithSS = 0;
      results.forEach((year) => {
        if (year.socialSecurityIncome > 0) {
          yearsWithSS++;
        }
      });

      expect(yearsWithSS).toBeGreaterThan(0);
    });

    it('should calculate correct amount at filing age', () => {
      const plan = new Plan('SS Test Plan', 62, 67);

      const account401k = new Account('My 401k', '401k', 500000);
      account401k.annualContribution = 0;
      plan.addAccount(account401k);

      plan.taxProfile = {
        currentAge: 62,
        retirementAge: 67,
        estimatedTaxRate: 0.25,
        filingStatus: 'single',
        state: 'CA',
        taxYear: 2025,
      };

      const expenses = new Expense('Living Expenses', 60000, 0, true);
      plan.addExpense(expenses);

      plan.assumptions = {
        inflationRate: 0.03,
        equityGrowthRate: 0.07,
        bondGrowthRate: 0.04,
        equityVolatility: 0.12,
        bondVolatility: 0.04,
      };

      plan.socialSecurity = {
        enabled: true,
        birthYear: new Date().getFullYear() - 62,
        monthlyBenefit: 2000,
        filingAge: 67,
      };

      const results = project(plan, 10);

      const yearAtFilingAge = results.find((r) => r.age === 67);

      expect(yearAtFilingAge).toBeDefined();
      expect(yearAtFilingAge.socialSecurityIncome).toBeGreaterThan(0);

      const expectedAnnualSS = 2000 * 12;
      const ssAt67 = yearAtFilingAge.socialSecurityIncome;

      expect(Math.abs(ssAt67 - expectedAnnualSS)).toBeLessThan(100);
    });
  });

  describe('Claiming Age Variations', () => {
    it('should start benefits at age 62 for early claiming', () => {
      const plan = new Plan('SS Early Test', 62, 67);

      const account = new Account('My 401k', '401k', 500000);
      plan.addAccount(account);

      plan.taxProfile = {
        currentAge: 62,
        retirementAge: 67,
        estimatedTaxRate: 0.25,
        filingStatus: 'single',
        state: 'CA',
        taxYear: 2025,
      };

      const expenses = new Expense('Living Expenses', 60000, 0, true);
      plan.addExpense(expenses);

      plan.assumptions = {
        inflationRate: 0.03,
        equityGrowthRate: 0.07,
        bondGrowthRate: 0.04,
        equityVolatility: 0.12,
        bondVolatility: 0.04,
      };

      plan.socialSecurity = {
        enabled: true,
        birthYear: new Date().getFullYear() - 62,
        monthlyBenefit: 2000,
        filingAge: 62,
      };

      const results = project(plan, 5);

      expect(results[0].socialSecurityIncome).toBeDefined();
    });

    it('should start benefits at age 70 for delayed claiming', () => {
      const plan = new Plan('SS Delayed Test', 65, 67);

      const account = new Account('My 401k', '401k', 500000);
      plan.addAccount(account);

      plan.taxProfile = {
        currentAge: 65,
        retirementAge: 67,
        estimatedTaxRate: 0.25,
        filingStatus: 'single',
        state: 'CA',
        taxYear: 2025,
      };

      const expenses = new Expense('Living Expenses', 60000, 0, true);
      plan.addExpense(expenses);

      plan.assumptions = {
        inflationRate: 0.03,
        equityGrowthRate: 0.07,
        bondGrowthRate: 0.04,
        equityVolatility: 0.12,
        bondVolatility: 0.04,
      };

      plan.socialSecurity = {
        enabled: true,
        birthYear: new Date().getFullYear() - 65,
        monthlyBenefit: 2000,
        filingAge: 70,
      };

      const results = project(plan, 10);

      const ssAtAge70 = results.find((r) => r.age === 70);

      expect(ssAtAge70).toBeDefined();
      expect(ssAtAge70.socialSecurityIncome).toBeGreaterThan(0);
    });
  });

  describe('Disabled State', () => {
    it('should not calculate Social Security when disabled', () => {
      const plan = new Plan('SS Disabled Test', 65, 67);

      const account = new Account('My 401k', '401k', 500000);
      plan.addAccount(account);

      plan.taxProfile = {
        currentAge: 65,
        retirementAge: 67,
        estimatedTaxRate: 0.25,
        filingStatus: 'single',
        state: 'CA',
        taxYear: 2025,
      };

      const expenses = new Expense('Living Expenses', 60000, 0, true);
      plan.addExpense(expenses);

      plan.assumptions = {
        inflationRate: 0.03,
        equityGrowthRate: 0.07,
        bondGrowthRate: 0.04,
        equityVolatility: 0.12,
        bondVolatility: 0.04,
      };

      plan.socialSecurity = {
        enabled: false,
        birthYear: new Date().getFullYear() - 65,
        monthlyBenefit: 2000,
        filingAge: 67,
      };

      const results = project(plan, 10);

      const ssIncome = results.reduce((sum, r) => sum + r.socialSecurityIncome, 0);

      expect(ssIncome).toBe(0);
    });
  });
});
