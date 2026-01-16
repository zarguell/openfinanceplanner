import { describe, it, expect } from 'vitest';
import {
  calculateFullRetirementAge,
  calculateSocialSecurityBenefit,
  calculateSocialSecurityForYear,
  estimatePIA,
  getClaimingStrategyOptions,
} from '../../../src/calculations/social-security.js';

describe('Social Security Calculations', () => {
  describe('calculateFullRetirementAge', () => {
    it('should return 67 for birth year 1960', () => {
      const result = calculateFullRetirementAge(1960);

      expect(result.years).toBe(67);
      expect(result.months).toBe(0);
    });

    it('should return 65 for birth year 1937', () => {
      const result = calculateFullRetirementAge(1937);

      expect(result.years).toBe(65);
      expect(result.months).toBe(0);
    });

    it('should return 66 years 10 months for birth year 1959', () => {
      const result = calculateFullRetirementAge(1959);

      expect(result.years).toBe(66);
      expect(result.months).toBe(10);
    });

    it('should return 66 years 0 months for birth year 1954', () => {
      const result = calculateFullRetirementAge(1954);

      expect(result.years).toBe(66);
      expect(result.months).toBe(0);
    });
  });

  describe('calculateSocialSecurityBenefit', () => {
    it('should return benefit at FRA with no reduction', () => {
      const pia = 2000;
      const birthYear = 1960;
      const currentYear = 2024;
      const retirementYear = 2027;
      const colaRate = 0.025;

      const benefitAtFRA = calculateSocialSecurityBenefit(
        pia,
        birthYear,
        67,
        currentYear,
        retirementYear,
        colaRate
      );
      const expectedAtFRA = pia;

      expect(Math.abs(benefitAtFRA - expectedAtFRA)).toBeLessThan(0.01);
    });

    it('should return valid number for early claiming at 62', () => {
      const pia = 2000;
      const birthYear = 1960;
      const currentYear = 2024;
      const retirementYear = 2027;
      const colaRate = 0.025;

      const benefitAt62 = calculateSocialSecurityBenefit(
        pia,
        birthYear,
        62,
        currentYear,
        retirementYear,
        colaRate
      );

      expect(typeof benefitAt62).toBe('number');
      expect(isNaN(benefitAt62)).toBe(false);
    });

    it('should apply delayed retirement credits at age 70', () => {
      const pia = 2000;
      const birthYear = 1960;
      const currentYear = 2024;
      const retirementYear = 2027;
      const colaRate = 0.025;

      const benefitAt70 = calculateSocialSecurityBenefit(
        pia,
        birthYear,
        70,
        currentYear,
        retirementYear,
        colaRate
      );
      const monthsLate = (70 - 67) * 12;
      const increaseFactor = 1 + (monthsLate / 12) * 0.08;
      const expectedAt70 = pia * increaseFactor;

      expect(Math.abs(benefitAt70 - expectedAt70)).toBeLessThan(0.01);
    });
  });

  describe('calculateSocialSecurityForYear', () => {
    it('should return 0 before retirement', () => {
      const socialSecurity = {
        enabled: true,
        birthYear: 1960,
        monthlyBenefit: 2000,
        filingAge: 67,
      };

      const currentAge = 60;
      const retirementAge = 65;

      const income = calculateSocialSecurityForYear(
        socialSecurity,
        3,
        currentAge,
        retirementAge,
        0.03
      );

      expect(income).toBe(0);
    });

    it('should return positive income after filing age', () => {
      const socialSecurity = {
        enabled: true,
        birthYear: 1960,
        monthlyBenefit: 2000,
        filingAge: 67,
      };

      const currentAge = 60;
      const retirementAge = 65;

      const income = calculateSocialSecurityForYear(
        socialSecurity,
        8,
        currentAge,
        retirementAge,
        0.03
      );

      expect(income).toBeGreaterThan(0);
      expect(typeof income).toBe('number');
      expect(isNaN(income)).toBe(false);
    });

    it('should return 0 when disabled', () => {
      const socialSecurity = {
        enabled: true,
        birthYear: 1960,
        monthlyBenefit: 2000,
        filingAge: 67,
      };

      const currentAge = 60;
      const retirementAge = 65;

      const disabledIncome = calculateSocialSecurityForYear(
        { ...socialSecurity, enabled: false },
        8,
        currentAge,
        retirementAge,
        0.03
      );

      expect(disabledIncome).toBe(0);
    });
  });

  describe('estimatePIA', () => {
    it('should calculate 90% replacement for first bend point', () => {
      const pia = estimatePIA(1000);
      const expected = 1000 * 0.9;

      expect(Math.abs(pia - expected)).toBeLessThan(0.01);
    });

    it('should apply 32% for second bend point portion', () => {
      const pia = estimatePIA(6000);
      const expected = 1174 * 0.9 + (6000 - 1174) * 0.32;

      expect(Math.abs(pia - expected)).toBeLessThan(0.01);
    });

    it('should apply 15% for portion above second bend point', () => {
      const pia = estimatePIA(10000);
      const expected = 1174 * 0.9 + (7078 - 1174) * 0.32 + (10000 - 7078) * 0.15;

      expect(Math.abs(pia - expected)).toBeLessThan(0.01);
    });
  });

  describe('getClaimingStrategyOptions', () => {
    it('should return all three claiming strategy options', () => {
      const options = getClaimingStrategyOptions();

      expect(options.early).toBeDefined();
      expect(options.fra).toBeDefined();
      expect(options.delayed).toBeDefined();
    });

    it('should return age 62 for early claiming', () => {
      const options = getClaimingStrategyOptions();

      expect(options.early.age).toBe(62);
    });

    it('should return FRA range for FRA claiming', () => {
      const options = getClaimingStrategyOptions();

      expect(options.fra.age).toBe('FRA (65-67)');
    });

    it('should return age 70 for delayed claiming', () => {
      const options = getClaimingStrategyOptions();

      expect(options.delayed.age).toBe(70);
    });
  });
});
