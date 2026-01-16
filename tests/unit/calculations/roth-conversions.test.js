import { describe, it, expect } from 'vitest';
import {
  calculateConversionTax,
  calculateBracketFillConversion,
  calculateFixedConversion,
  calculatePercentageConversion,
  calculateBackdoorRothConversion,
  calculateProRataBasis,
  isPenaltyFree,
  optimizeConversionsAcrossYears,
  analyzeConversion,
} from '../../../src/calculations/roth-conversions.js';
import { Plan } from '../../../src/core/models/Plan.js';
import { Account } from '../../../src/core/models/Account.js';

describe('Roth Conversions', () => {
  describe('calculateConversionTax', () => {
    it('should calculate conversion tax correctly', () => {
      const result = calculateConversionTax(1000000, 5000000, 0.22, 0.3);

      expect(result.conversionAmount).toBe(1000000);
      expect(result.taxOnConversion).toBe(220000);
      expect(result.effectiveTaxRate).toBe(0.22);
      expect(result.afterTaxCost).toBe(1220000);
    });
  });

  describe('calculateBracketFillConversion', () => {
    it('should fill up bracket', () => {
      const result = calculateBracketFillConversion(5000000, 8945000, 5000000);

      expect(result).toBe(3945000);
    });

    it('should limit by balance', () => {
      const result = calculateBracketFillConversion(5000000, 8945000, 2000000);

      expect(result).toBe(2000000);
    });
  });

  describe('calculateFixedConversion', () => {
    it('should return target conversion', () => {
      const result = calculateFixedConversion(1000000, 5000000, 50, false);

      expect(result).toBe(1000000);
    });

    it('should limit by available balance', () => {
      const result = calculateFixedConversion(1000000, 500000, 50, false);

      expect(result).toBe(500000);
    });

    it('should work with RMD', () => {
      const result = calculateFixedConversion(1000000, 5000000, 73, true);

      expect(result).toBe(1000000);
    });
  });

  describe('calculatePercentageConversion', () => {
    it('should calculate percentage conversion', () => {
      const result = calculatePercentageConversion(0.1, 5000000, 6000000);

      expect(result).toBe(500000);
    });

    it('should respect max limit', () => {
      const result = calculatePercentageConversion(0.2, 5000000, 800000);

      expect(result).toBe(800000);
    });
  });

  describe('calculateBackdoorRothConversion', () => {
    it('should convert full after-tax basis', () => {
      const result = calculateBackdoorRothConversion(7000000, 50000000);

      expect(result).toBe(7000000);
    });

    it('should limit by balance', () => {
      const result = calculateBackdoorRothConversion(7000000, 5000000);

      expect(result).toBe(5000000);
    });
  });

  describe('calculateProRataBasis', () => {
    it('should calculate pro-rata basis correctly', () => {
      const result = calculateProRataBasis(1000000, 5000000, 1000000);

      expect(result.basisRatio).toBe(0.2);
      expect(result.nonTaxableAmount).toBe(200000);
      expect(result.taxableAmount).toBe(800000);
    });

    it('should return 0 taxable for zero balance', () => {
      const result = calculateProRataBasis(1000000, 0, 1000000);

      expect(result.taxableAmount).toBe(0);
    });
  });

  describe('isPenaltyFree', () => {
    it('should return true for 5-year rule satisfied and age 60+', () => {
      expect(isPenaltyFree(2020, 2025, 60)).toBe(true);
    });

    it('should return false for 5-year rule not satisfied', () => {
      expect(isPenaltyFree(2022, 2025, 60)).toBe(false);
    });

    it('should return false for age not satisfied', () => {
      expect(isPenaltyFree(2018, 2025, 55)).toBe(false);
    });

    it('should return true when both satisfied', () => {
      expect(isPenaltyFree(2019, 2025, 62)).toBe(true);
    });
  });

  describe('optimizeConversionsAcrossYears', () => {
    it('should return 5 years of conversions', () => {
      const plan = new Plan('Test Plan', 50, 65);
      plan.addAccount(new Account('Traditional IRA', 'IRA', 5000000));

      const conversions = optimizeConversionsAcrossYears(plan, 5, 'fixed');

      expect(conversions.length).toBe(5);
      expect(conversions[0].year).toBe(new Date().getFullYear());
      expect(conversions[0].age).toBe(50);
      expect(conversions[0].conversionAmount).toBe(1000000);
    });
  });

  describe('analyzeConversion', () => {
    it('should return analysis with recommendation', () => {
      const conversionPlan = {
        conversionAmount: 1000000,
        yearsInRoth: 30,
      };

      const taxContext = {
        currentTaxableIncome: 5000000,
        marginalTaxRate: 0.22,
        totalTaxRate: 0.3,
        assumedGrowthRate: 0.07,
        futureTaxRate: 0.3,
      };

      const analysis = analyzeConversion(conversionPlan, taxContext);

      expect(analysis.conversionAmount).toBe(1000000);
      expect(analysis.taxOnConversion).toBe(220000);
      expect(analysis.rothFinalValue).toBeGreaterThan(0);
      expect(analysis.recommendation).toBeDefined();
    });
  });

  describe('bracket fill edge cases', () => {
    it('should return 0 when income exceeds bracket', () => {
      const result = calculateBracketFillConversion(9000000, 8945000, 10000000);

      expect(result).toBe(0);
    });

    it('should return 0 when already at bracket top', () => {
      const result = calculateBracketFillConversion(8945000, 8945000, 10000000);

      expect(result).toBe(0);
    });
  });

  describe('pro-rata basis edge cases', () => {
    it('should be 100% non-taxable for 100% basis', () => {
      const result = calculateProRataBasis(5000000, 5000000, 1000000);

      expect(result.nonTaxableAmount).toBe(1000000);
      expect(result.taxableAmount).toBe(0);
    });

    it('should be 100% taxable for 0% basis', () => {
      const result = calculateProRataBasis(0, 5000000, 1000000);

      expect(result.nonTaxableAmount).toBe(0);
      expect(result.taxableAmount).toBe(1000000);
    });
  });
});
