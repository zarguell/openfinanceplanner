import { describe, it, expect } from 'vitest';
import {
  project,
  getAccountGrowthRate,
  calculateExpenseForYear,
  calculateTotalExpenses,
} from '../../../src/calculations/projection.js';

describe('Projection Calculations', () => {
  describe('getAccountGrowthRate', () => {
    it('should return 7% for 401k accounts', () => {
      const assumptions = {
        inflationRate: 0.03,
        equityGrowthRate: 0.07,
        bondGrowthRate: 0.04,
      };

      const rate = getAccountGrowthRate('401k', assumptions);

      expect(rate).toBe(0.07);
    });

    it('should calculate taxable account rate with drag factor', () => {
      const assumptions = {
        inflationRate: 0.03,
        equityGrowthRate: 0.07,
        bondGrowthRate: 0.04,
      };

      const rate = getAccountGrowthRate('Taxable', assumptions);

      expect(Math.abs(rate - 0.056)).toBeLessThan(0.0001);
    });
  });

  describe('calculateExpenseForYear', () => {
    it('should return base amount in year 0 with no inflation', () => {
      const expense = {
        name: 'Rent',
        baseAmount: 1200000,
        startYear: 0,
        inflationAdjusted: true,
      };
      const inflationRate = 0.03;

      const year0 = calculateExpenseForYear(expense, 0, inflationRate);

      expect(year0).toBe(12000);
    });

    it('should apply inflation in year 1', () => {
      const expense = {
        name: 'Rent',
        baseAmount: 1200000,
        startYear: 0,
        inflationAdjusted: true,
      };
      const inflationRate = 0.03;

      const year1 = calculateExpenseForYear(expense, 1, inflationRate);

      expect(Math.abs(year1 - 12360)).toBeLessThan(0.01);
    });
  });

  describe('calculateTotalExpenses', () => {
    it('should sum multiple expenses', () => {
      const expenses = [
        { name: 'Rent', baseAmount: 1200000, startYear: 0, inflationAdjusted: true },
        { name: 'Food', baseAmount: 600000, startYear: 0, inflationAdjusted: true },
      ];
      const inflationRate = 0.03;

      const total = calculateTotalExpenses(expenses, 0, inflationRate);

      expect(total).toBe(18000);
    });
  });

  describe('project', () => {
    it('should return correct number of years', () => {
      const plan = {
        accounts: [{ type: '401k', balance: 10000000, annualContribution: 10000 }],
        expenses: [{ name: 'Living', baseAmount: 1200000, startYear: 0, inflationAdjusted: false }],
        taxProfile: { currentAge: 35, retirementAge: 65, state: null, filingStatus: 'single' },
        assumptions: { inflationRate: 0.03, equityGrowthRate: 0.07, bondGrowthRate: 0.04 },
        socialSecurity: { enabled: false },
      };

      const results = project(plan, 1);

      expect(results.length).toBe(2);
    });

    it('should include year 0 expenses', () => {
      const startingBalance = 10000000;
      const annualExpense = 2000000;
      const contribution = 20000;

      const plan = {
        accounts: [{ type: '401k', balance: startingBalance, annualContribution: contribution }],
        expenses: [
          { name: 'Living', baseAmount: annualExpense, startYear: 0, inflationAdjusted: false },
        ],
        taxProfile: { currentAge: 30, retirementAge: 65, state: null, filingStatus: 'single' },
        assumptions: { inflationRate: 0.03, equityGrowthRate: 0.07 },
        socialSecurity: { enabled: false },
      };

      const results = project(plan, 1);
      const year0 = results[0];

      expect(year0.totalExpense).toBe(annualExpense / 100);
    });

    it('should project retirement withdrawals', () => {
      const plan = {
        accounts: [
          { type: '401k', balance: 10000000, annualContribution: 0, withdrawalRate: 0.04 },
        ],
        expenses: [{ name: 'Living', baseAmount: 6000000, startYear: 0, inflationAdjusted: false }],
        taxProfile: { currentAge: 65, retirementAge: 65, state: null, filingStatus: 'single' },
        assumptions: { inflationRate: 0.03, equityGrowthRate: 0.07 },
        socialSecurity: { enabled: false },
      };

      const results = project(plan, 5);

      expect(results[0].totalExpense).toBe(60000);
    });

    it('should perform detailed tax calculations', () => {
      const plan = {
        accounts: [
          {
            id: '1',
            name: '401k',
            type: '401k',
            balance: 50000000,
            annualContribution: 0,
            withdrawalRate: 0.04,
          },
          {
            id: '2',
            name: 'Roth IRA',
            type: 'Roth',
            balance: 20000000,
            annualContribution: 0,
            withdrawalRate: 0.04,
          },
        ],
        expenses: [
          { id: '1', name: 'Living', baseAmount: 6000000, startYear: 0, inflationAdjusted: true },
        ],
        taxProfile: { currentAge: 30, retirementAge: 65, state: 'CA', filingStatus: 'single' },
        assumptions: { inflationRate: 0.03, equityGrowthRate: 0.07 },
        socialSecurity: { enabled: false },
      };

      const results = project(plan, 40, 2025);
      const retirementYearResult = results.find((r) => r.age === 65);

      expect(retirementYearResult).toBeDefined();
    });

    it('should pass sanity checks for realistic projections', () => {
      const plan = {
        accounts: [{ type: '401k', balance: 100000000, annualContribution: 50000 }],
        expenses: [{ name: 'Living', baseAmount: 4000000, startYear: 0, inflationAdjusted: false }],
        taxProfile: { currentAge: 30, retirementAge: 65, state: null, filingStatus: 'single' },
        assumptions: { inflationRate: 0.03, equityGrowthRate: 0.07 },
        socialSecurity: { enabled: false },
      };

      const results = project(plan, 40);

      const accumulationResults = results.filter((r) => !r.isRetired);
      expect(accumulationResults.length).toBeGreaterThan(1);

      for (let i = 1; i < accumulationResults.length; i++) {
        expect(accumulationResults[i].totalBalance).toBeGreaterThanOrEqual(
          accumulationResults[i - 1].totalBalance
        );
      }
    });

    it('should handle extreme inputs', () => {
      const extremePlan = {
        accounts: [{ type: '401k', balance: 1, annualContribution: 0, withdrawalRate: 0.99 }],
        expenses: [
          { name: 'Living', baseAmount: 100000000, startYear: 0, inflationAdjusted: false },
        ],
        taxProfile: { currentAge: 30, retirementAge: 30, state: null, filingStatus: 'single' },
        assumptions: { inflationRate: 0.03, equityGrowthRate: 0.07 },
        socialSecurity: { enabled: false },
      };

      const results = project(extremePlan, 5);

      expect(results.length).toBe(6);

      const finalResult = results[results.length - 1];
      expect(finalResult.totalBalance).toBeLessThanOrEqual(1);
    });
  });
});
