import { describe, it, expect } from 'vitest';
import {
  TaxJurisdiction,
  TaxBracket,
  TaxConfig,
  TaxCalculationResult,
  TaxStrategy,
  calculateFederalTax,
  calculateStateTax,
  calculateTotalTax,
  getTaxBracketsForIncome,
  calculateMarginalRate,
  calculateEffectiveRate,
  analyzeTaxImpact,
} from './types';
import type { TaxRegion } from '@/core/types';

describe('Tax Types', () => {
  describe('TaxBracket', () => {
    it('should define tax bracket structure', () => {
      const bracket: TaxBracket = {
        min: 0,
        max: 11000,
        rate: 10,
      };

      expect(bracket.min).toBe(0);
      expect(bracket.max).toBe(11000);
      expect(bracket.rate).toBe(10);
    });

    it('should handle unbounded bracket (no max)', () => {
      const bracket: TaxBracket = {
        min: 578126,
        max: undefined,
        rate: 37,
      };

      expect(bracket.min).toBe(578126);
      expect(bracket.max).toBeUndefined();
      expect(bracket.rate).toBe(37);
    });
  });

  describe('TaxJurisdiction', () => {
    it('should define federal jurisdiction', () => {
      const jurisdiction: TaxJurisdiction = {
        type: 'federal',
        countryCode: 'US',
        name: 'Federal',
      };

      expect(jurisdiction.type).toBe('federal');
      expect(jurisdiction.countryCode).toBe('US');
    });

    it('should define state jurisdiction', () => {
      const jurisdiction: TaxJurisdiction = {
        type: 'state',
        countryCode: 'US',
        name: 'California',
        stateCode: 'CA',
      };

      expect(jurisdiction.type).toBe('state');
      expect(jurisdiction.stateCode).toBe('CA');
    });

    it('should define local jurisdiction', () => {
      const jurisdiction: TaxJurisdiction = {
        type: 'local',
        countryCode: 'US',
        name: 'New York City',
        stateCode: 'NY',
        locality: 'NYC',
      };

      expect(jurisdiction.type).toBe('local');
      expect(jurisdiction.locality).toBe('NYC');
    });
  });

  describe('TaxConfig', () => {
    it('should define comprehensive tax configuration', () => {
      const config: TaxConfig = {
        year: 2024,
        filingStatus: 'single',
        jurisdiction: {
          type: 'federal',
          countryCode: 'US',
          name: 'Federal',
        },
        ordinaryIncomeBrackets: [
          { min: 0, max: 11000, rate: 10 },
          { min: 11000, max: 44725, rate: 12 },
          { min: 44725, max: 95375, rate: 22 },
        ],
        longTermCapitalGainsBrackets: [
          { min: 0, max: 44625, rate: 0 },
          { min: 44625, max: 492300, rate: 15 },
          { min: 492300, max: undefined, rate: 20 },
        ],
        shortTermCapitalGainsRate: 37,
        standardDeduction: 14600,
        personalExemption: 0,
        specialRules: [],
      };

      expect(config.year).toBe(2024);
      expect(config.ordinaryIncomeBrackets.length).toBe(3);
      expect(config.longTermCapitalGainsBrackets.length).toBe(3);
    });

    it('should support progressive tax brackets', () => {
      const config: TaxConfig = {
        year: 2024,
        filingStatus: 'married-filing-jointly',
        jurisdiction: {
          type: 'federal',
          countryCode: 'US',
          name: 'Federal',
        },
        ordinaryIncomeBrackets: [
          { min: 0, max: 22000, rate: 10 },
          { min: 22000, max: 89450, rate: 12 },
        ],
        longTermCapitalGainsBrackets: [
          { min: 0, max: 89250, rate: 0 },
          { min: 89250, max: 553850, rate: 15 },
        ],
        shortTermCapitalGainsRate: 37,
        standardDeduction: 29200,
        personalExemption: 0,
        specialRules: [],
      };

      expect(config.filingStatus).toBe('married-filing-jointly');
      expect(config.standardDeduction).toBe(29200);
    });
  });

  describe('TaxStrategy', () => {
    it('should define Roth conversion strategy', () => {
      const strategy: TaxStrategy = {
        type: 'roth-conversion',
        amount: 10000,
        targetYear: 2024,
        description: 'Convert traditional IRA to Roth',
      };

      expect(strategy.type).toBe('roth-conversion');
      expect(strategy.amount).toBe(10000);
    });

    it('should define 72t/SEPP distribution strategy', () => {
      const strategy: TaxStrategy = {
        type: 'sepp-distribution',
        accountBalance: 500000,
        lifeExpectancy: 25,
        description: 'Substantially Equal Periodic Payments',
      };

      expect(strategy.type).toBe('sepp-distribution');
      expect(strategy.lifeExpectancy).toBe(25);
    });
  });
});

describe('Tax Calculation Functions', () => {
  describe('getTaxBracketsForIncome', () => {
    it('should return applicable brackets for income', () => {
      const brackets: TaxBracket[] = [
        { min: 0, max: 11000, rate: 10 },
        { min: 11000, max: 44725, rate: 12 },
        { min: 44725, max: 95375, rate: 22 },
      ];

      const result = getTaxBracketsForIncome(50000, brackets);

      expect(result).toHaveLength(3);
    });

    it('should return only first bracket for low income', () => {
      const brackets: TaxBracket[] = [
        { min: 0, max: 11000, rate: 10 },
        { min: 11000, max: 44725, rate: 12 },
      ];

      const result = getTaxBracketsForIncome(5000, brackets);

      expect(result).toHaveLength(1);
      expect(result[0].rate).toBe(10);
    });
  });

  describe('calculateMarginalRate', () => {
    it('should calculate correct marginal rate', () => {
      const brackets: TaxBracket[] = [
        { min: 0, max: 11000, rate: 10 },
        { min: 11000, max: 44725, rate: 12 },
        { min: 44725, max: 95375, rate: 22 },
      ];

      const marginalRate = calculateMarginalRate(50000, brackets);

      expect(marginalRate).toBe(22);
    });

    it('should handle income in first bracket', () => {
      const brackets: TaxBracket[] = [
        { min: 0, max: 11000, rate: 10 },
        { min: 11000, max: 44725, rate: 12 },
      ];

      const marginalRate = calculateMarginalRate(5000, brackets);

      expect(marginalRate).toBe(10);
    });
  });

  describe('calculateEffectiveRate', () => {
    it('should calculate effective tax rate', () => {
      const effectiveRate = calculateEffectiveRate(10000, 1500);

      expect(effectiveRate).toBeCloseTo(15, 2);
    });

    it('should handle zero tax', () => {
      const effectiveRate = calculateEffectiveRate(10000, 0);

      expect(effectiveRate).toBe(0);
    });

    it('should handle zero income', () => {
      const effectiveRate = calculateEffectiveRate(0, 0);

      expect(effectiveRate).toBe(0);
    });
  });

  describe('calculateFederalTax', () => {
    it('should calculate federal tax correctly', () => {
      const taxRegion: TaxRegion = {
        country: 'US',
      };

      const result = calculateFederalTax({
        ordinaryIncome: 100000,
        capitalGains: 50000,
        deductions: 14600,
        year: 2024,
        filingStatus: 'single',
        taxRegion,
      });

      expect(result).toHaveProperty('federalTax');
      expect(result).toHaveProperty('ordinaryIncomeTax');
      expect(result).toHaveProperty('capitalGainsTax');
      expect(result).toHaveProperty('marginalRate');
      expect(result.federalTax).toBeGreaterThan(0);
    });

    it('should apply standard deduction', () => {
      const taxRegion: TaxRegion = {
        country: 'US',
      };

      const resultWithoutDeduction = calculateFederalTax({
        ordinaryIncome: 50000,
        capitalGains: 0,
        deductions: 0,
        year: 2024,
        filingStatus: 'single',
        taxRegion,
      });

      const resultWithDeduction = calculateFederalTax({
        ordinaryIncome: 50000,
        capitalGains: 0,
        deductions: 14600,
        year: 2024,
        filingStatus: 'single',
        taxRegion,
      });

      expect(resultWithDeduction.federalTax).toBeLessThan(
        resultWithoutDeduction.federalTax
      );
    });
  });

  describe('calculateStateTax', () => {
    it('should calculate state tax for California', () => {
      const taxRegion: TaxRegion = {
        country: 'US',
        state: 'CA',
      };

      const result = calculateStateTax({
        ordinaryIncome: 100000,
        capitalGains: 50000,
        deductions: 5000,
        year: 2024,
        filingStatus: 'single',
        taxRegion,
      });

      expect(result).toHaveProperty('stateTax');
      expect(result.stateTax).toBeGreaterThanOrEqual(0);
    });

    it('should handle states with no income tax', () => {
      const taxRegion: TaxRegion = {
        country: 'US',
        state: 'TX',
      };

      const result = calculateStateTax({
        ordinaryIncome: 100000,
        capitalGains: 50000,
        deductions: 0,
        year: 2024,
        filingStatus: 'single',
        taxRegion,
      });

      expect(result.stateTax).toBe(0);
    });
  });

  describe('calculateTotalTax', () => {
    it('should sum federal and state taxes', () => {
      const federalResult: TaxCalculationResult = {
        federalTax: 15000,
        ordinaryIncomeTax: 12000,
        capitalGainsTax: 3000,
        marginalRate: 22,
        effectiveRate: 15,
      };

      const stateResult: TaxCalculationResult = {
        federalTax: 0,
        stateTax: 5000,
        ordinaryIncomeTax: 5000,
        capitalGainsTax: 0,
        marginalRate: 9.3,
        effectiveRate: 5,
      };

      const total = calculateTotalTax(federalResult, stateResult);

      expect(total.totalTax).toBeCloseTo(20000, 2);
      expect(total.federalTax).toBe(15000);
      expect(total.stateTax).toBe(5000);
    });

    it('should handle missing state tax', () => {
      const federalResult: TaxCalculationResult = {
        federalTax: 15000,
        ordinaryIncomeTax: 12000,
        capitalGainsTax: 3000,
        marginalRate: 22,
        effectiveRate: 15,
      };

      const total = calculateTotalTax(federalResult);

      expect(total.totalTax).toBe(15000);
    });
  });

  describe('analyzeTaxImpact', () => {
    it('should analyze tax impact over time', () => {
      const taxRegion: TaxRegion = {
        country: 'US',
      };

      const analytics = analyzeTaxImpact({
        ordinaryIncome: [50000, 55000, 60000],
        capitalGains: [10000, 15000, 20000],
        deductions: [14600, 14600, 14600],
        year: 2024,
        filingStatus: 'single',
        taxRegion,
      });

      expect(analytics).toHaveProperty('yearlyBreakdown');
      expect(analytics.yearlyBreakdown).toHaveLength(3);
      expect(analytics).toHaveProperty('totalFederalTax');
      expect(analytics).toHaveProperty('averageEffectiveRate');
      expect(analytics).toHaveProperty('taxBurdenTrend');
    });

    it('should identify tax optimization opportunities', () => {
      const taxRegion: TaxRegion = {
        country: 'US',
      };

      const analytics = analyzeTaxImpact({
        ordinaryIncome: [80000, 85000],
        capitalGains: [0, 0],
        deductions: [0, 0],
        year: 2024,
        filingStatus: 'single',
        taxRegion,
      });

      expect(analytics).toHaveProperty('optimizationOpportunities');
      expect(Array.isArray(analytics.optimizationOpportunities)).toBe(true);
    });
  });
});

describe('Tax Strategy Modeling', () => {
  describe('Roth Conversion Strategy', () => {
    it('should calculate tax impact of Roth conversion', () => {
      const taxRegion: TaxRegion = {
        country: 'US',
      };

      const strategy: TaxStrategy = {
        type: 'roth-conversion',
        amount: 50000,
        targetYear: 2024,
        description: 'Roth conversion',
      };

      const currentTax = calculateFederalTax({
        ordinaryIncome: 80000,
        capitalGains: 0,
        deductions: 14600,
        year: 2024,
        filingStatus: 'single',
        taxRegion,
      });

      const conversionTax = calculateFederalTax({
        ordinaryIncome: 80000 + (strategy.amount ?? 0),
        capitalGains: 0,
        deductions: 14600,
        year: 2024,
        filingStatus: 'single',
        taxRegion,
      });

      const additionalTax = conversionTax.federalTax - currentTax.federalTax;

      expect(additionalTax).toBeGreaterThan(0);
      expect(additionalTax).toBeLessThan(strategy.amount ?? 0);
    });
  });

  describe('SEPP Distribution Strategy', () => {
    it('should calculate SEPP payment amount', () => {
      const strategy: TaxStrategy = {
        type: 'sepp-distribution',
        accountBalance: 500000,
        lifeExpectancy: 25,
        description: 'SEPP distribution',
      };

      if (strategy.accountBalance && strategy.lifeExpectancy !== undefined) {
        const annualPayment = strategy.accountBalance / strategy.lifeExpectancy;

        expect(annualPayment).toBeCloseTo(20000, 2);
      }
    });
  });
});
