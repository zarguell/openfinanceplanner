import { describe, it, expect } from 'vitest';
import {
  calculateIncomeForYear,
  calculateTotalIncome,
  calculateTaxableIncome,
  evaluateStartYear,
  evaluateEndYear,
} from '../../../src/calculations/income.js';

describe('Income Calculations', () => {
  describe('calculateIncomeForYear', () => {
    it('should return base amount in year 0 with no growth', () => {
      const income = {
        name: 'Salary',
        baseAmount: 10000000,
        startYear: 0,
        endYear: null,
        type: 'salary',
        growthRate: 0.03,
      };

      const planContext = { currentAge: 30, retirementAge: 65 };

      const year0 = calculateIncomeForYear(income, 0, 0.03, planContext);

      expect(year0).toBe(100000);
    });

    it('should apply growth in year 1', () => {
      const income = {
        name: 'Salary',
        baseAmount: 10000000,
        startYear: 0,
        endYear: null,
        type: 'salary',
        growthRate: 0.03,
      };

      const planContext = { currentAge: 30, retirementAge: 65 };

      const year1 = calculateIncomeForYear(income, 1, 0.03, planContext);
      const expectedYear1 = 100000 * 1.03;

      expect(Math.abs(year1 - expectedYear1)).toBeLessThan(0.01);
    });

    it('should return 0 before start year', () => {
      const income = {
        name: 'Salary',
        baseAmount: 10000000,
        startYear: 0,
        endYear: null,
        type: 'salary',
        growthRate: 0.03,
      };

      const planContext = { currentAge: 30, retirementAge: 65 };

      const beforeStart = calculateIncomeForYear(income, -1, 0.03, planContext);

      expect(beforeStart).toBe(0);
    });
  });

  describe('income with end year', () => {
    it('should return 0 before start year', () => {
      const income = {
        name: 'Contract Work',
        baseAmount: 5000000,
        startYear: 2,
        endYear: 5,
        type: 'business',
        growthRate: 0.02,
      };

      const planContext = { currentAge: 30, retirementAge: 65 };

      const result = calculateIncomeForYear(income, 1, 0.03, planContext);

      expect(result).toBe(0);
    });

    it('should return base amount in start year', () => {
      const income = {
        name: 'Contract Work',
        baseAmount: 5000000,
        startYear: 2,
        endYear: 5,
        type: 'business',
        growthRate: 0.02,
      };

      const planContext = { currentAge: 30, retirementAge: 65 };

      const result = calculateIncomeForYear(income, 2, 0.03, planContext);

      expect(result).toBe(50000);
    });

    it('should apply growth in later years', () => {
      const income = {
        name: 'Contract Work',
        baseAmount: 5000000,
        startYear: 2,
        endYear: 5,
        type: 'business',
        growthRate: 0.02,
      };

      const planContext = { currentAge: 30, retirementAge: 65 };

      const result = calculateIncomeForYear(income, 4, 0.03, planContext);
      const expectedYear4 = 50000 * Math.pow(1.02, 2);

      expect(Math.abs(result - expectedYear4)).toBeLessThan(0.01);
    });

    it('should return 0 after end year', () => {
      const income = {
        name: 'Contract Work',
        baseAmount: 5000000,
        startYear: 2,
        endYear: 5,
        type: 'business',
        growthRate: 0.02,
      };

      const planContext = { currentAge: 30, retirementAge: 65 };

      const result = calculateIncomeForYear(income, 6, 0.03, planContext);

      expect(result).toBe(0);
    });
  });

  describe('calculateTotalIncome', () => {
    it('should sum multiple incomes in year 0', () => {
      const incomes = [
        {
          name: 'Salary',
          baseAmount: 8000000,
          startYear: 0,
          endYear: null,
          type: 'salary',
          growthRate: 0.03,
        },
        {
          name: 'Side Business',
          baseAmount: 2000000,
          startYear: 1,
          endYear: null,
          type: 'business',
          growthRate: 0.05,
        },
      ];

      const planContext = { currentAge: 30, retirementAge: 65 };

      const year0 = calculateTotalIncome(incomes, 0, 0.03, planContext);

      expect(year0).toBe(80000);
    });

    it('should include all active incomes in year 1', () => {
      const incomes = [
        {
          name: 'Salary',
          baseAmount: 8000000,
          startYear: 0,
          endYear: null,
          type: 'salary',
          growthRate: 0.03,
        },
        {
          name: 'Side Business',
          baseAmount: 2000000,
          startYear: 1,
          endYear: null,
          type: 'business',
          growthRate: 0.05,
        },
      ];

      const planContext = { currentAge: 30, retirementAge: 65 };

      const year1 = calculateTotalIncome(incomes, 1, 0.03, planContext);
      const expectedYear1 = 80000 * 1.03 + 20000;

      expect(Math.abs(year1 - expectedYear1)).toBeLessThan(0.01);
    });
  });

  describe('calculateTaxableIncome', () => {
    it('should calculate total and breakdown income', () => {
      const incomes = [
        {
          name: 'Salary',
          baseAmount: 10000000,
          startYear: 0,
          endYear: null,
          type: 'salary',
          growthRate: 0.03,
          getTaxTreatment: () => 'earned',
        },
        {
          name: 'Qualified Dividends',
          baseAmount: 1000000,
          startYear: 0,
          endYear: null,
          type: 'dividends',
          growthRate: 0.02,
          getTaxTreatment: () => 'qualified',
        },
        {
          name: 'Rental Income',
          baseAmount: 2000000,
          startYear: 0,
          endYear: null,
          type: 'rental',
          growthRate: 0.01,
          getTaxTreatment: () => 'earned',
        },
      ];

      const planContext = { currentAge: 30, retirementAge: 65 };

      const result = calculateTaxableIncome(incomes, 0, 0.03, planContext);

      expect(result.totalIncome).toBe(130000);
      expect(result.earnedIncome).toBe(120000);
      expect(result.qualifiedDividends).toBe(10000);
      expect(result.passiveIncome).toBe(0);
    });
  });

  describe('income growth scenarios', () => {
    const scenarios = [
      { name: 'No growth', growthRate: 0, expectedMultiplier: 1 },
      { name: '3% growth', growthRate: 0.03, expectedMultiplier: 1.03 },
      { name: '5% growth', growthRate: 0.05, expectedMultiplier: 1.05 },
    ];

    const baseIncome = {
      name: 'Test',
      baseAmount: 5000000,
      startYear: 0,
      endYear: null,
      type: 'salary',
    };
    const planContext = { currentAge: 30, retirementAge: 65 };

    scenarios.forEach((scenario) => {
      it(`should handle ${scenario.name}`, () => {
        const income = { ...baseIncome, growthRate: scenario.growthRate };
        const result = calculateIncomeForYear(income, 1, 0.03, planContext);
        const expected = 50000 * scenario.expectedMultiplier;

        expect(Math.abs(result - expected)).toBeLessThan(0.01);
      });
    });
  });

  describe('evaluateStartYear', () => {
    it('should return manual start year', () => {
      const income = { startRule: 'manual', startYear: 5 };
      const currentAge = 30;
      const retirementAge = 65;

      const result = evaluateStartYear(income, currentAge, retirementAge);

      expect(result).toBe(5);
    });

    it('should calculate start year based on retirement', () => {
      const income = { startRule: 'retirement' };
      const currentAge = 30;
      const retirementAge = 65;

      const result = evaluateStartYear(income, currentAge, retirementAge);

      expect(result).toBe(35);
    });

    it('should calculate start year based on age', () => {
      const income = { startRule: 'age', startRuleAge: 62 };
      const currentAge = 30;
      const retirementAge = 65;

      const result = evaluateStartYear(income, currentAge, retirementAge);

      expect(result).toBe(32);
    });

    it('should use retirement when age condition met', () => {
      const income = { startRule: 'retirement-if-age', startRuleAge: 62 };
      const currentAge = 30;
      const retirementAge = 65;

      const result = evaluateStartYear(income, currentAge, retirementAge);

      expect(result).toBe(35);
    });

    it('should use age rule when retirement age below minimum', () => {
      const income = { startRule: 'retirement-if-age', startRuleAge: 70 };
      const currentAge = 30;
      const retirementAge = 65;

      const result = evaluateStartYear(income, currentAge, retirementAge);

      expect(result).toBe(40);
    });
  });

  describe('evaluateEndYear', () => {
    it('should return manual end year', () => {
      const income = { endRule: 'manual', endYear: 20 };
      const currentAge = 30;
      const retirementAge = 65;

      const result = evaluateEndYear(income, currentAge, retirementAge);

      expect(result).toBe(20);
    });

    it('should calculate end year based on retirement', () => {
      const income = { endRule: 'retirement' };
      const currentAge = 30;
      const retirementAge = 65;

      const result = evaluateEndYear(income, currentAge, retirementAge);

      expect(result).toBe(35);
    });

    it('should calculate end year based on age', () => {
      const income = { endRule: 'age', endRuleAge: 70 };
      const currentAge = 30;
      const retirementAge = 65;

      const result = evaluateEndYear(income, currentAge, retirementAge);

      expect(result).toBe(40);
    });

    it('should return null for null end rule', () => {
      const income = { endRule: null, endYear: null };
      const currentAge = 30;
      const retirementAge = 65;

      const result = evaluateEndYear(income, currentAge, retirementAge);

      expect(result).toBeNull();
    });
  });

  describe('smart rule integration', () => {
    it('should integrate start and end rules correctly', () => {
      const incomes = [
        {
          name: 'Salary',
          baseAmount: 10000000,
          startYear: 0,
          endYear: null,
          type: 'salary',
          growthRate: 0.03,
          startRule: 'manual',
          endRule: 'retirement',
        },
        {
          name: 'Pension',
          baseAmount: 3000000,
          startYear: 0,
          endYear: null,
          type: 'pension',
          growthRate: 0.02,
          startRule: 'retirement',
          endRule: null,
        },
      ];

      const planContext = { currentAge: 30, retirementAge: 65 };

      const retirementYear = planContext.retirementAge - planContext.currentAge;

      const yearAtRetirement = calculateTotalIncome(incomes, retirementYear, 0.02, planContext);
      const expectedAtRetirement = 30000;

      expect(Math.abs(yearAtRetirement - expectedAtRetirement)).toBeLessThan(0.01);
    });
  });
});
