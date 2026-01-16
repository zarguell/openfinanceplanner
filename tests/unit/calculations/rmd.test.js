import { describe, it, expect } from 'vitest';
import {
  calculateRMDForAccount,
  calculateTotalRMD,
  mustTakeRMD,
  getRMDStartAge,
  getLifeExpectancyFactor,
} from '../../../src/calculations/rmd.js';

describe('RMD Calculations', () => {
  describe('getLifeExpectancyFactor', () => {
    it('should return 27.4 for age 72', () => {
      const result = getLifeExpectancyFactor(72);

      expect(result).toBe(27.4);
    });

    it('should return null for age under 72', () => {
      const result = getLifeExpectancyFactor(70);

      expect(result).toBeNull();
    });

    it('should cap at 1.9 for age over 120', () => {
      const result = getLifeExpectancyFactor(125);

      expect(result).toBe(1.9);
    });
  });

  describe('calculateRMDForAccount', () => {
    it('should calculate standard RMD for 401k', () => {
      const account = { type: '401k', balance: 5000000 };
      const rmd = calculateRMDForAccount(account, 75);

      const expected = Math.round(5000000 / 24.6);
      expect(Math.abs(rmd - expected)).toBeLessThan(100);
    });

    it('should return 0 for age under 72', () => {
      const account = { type: 'IRA', balance: 10000000 };
      const rmd = calculateRMDForAccount(account, 70);

      expect(rmd).toBe(0);
    });

    it('should return 0 for Roth accounts', () => {
      const account = { type: 'Roth', balance: 10000000 };
      const rmd = calculateRMDForAccount(account, 75);

      expect(rmd).toBe(0);
    });

    it('should return 0 for HSA accounts', () => {
      const account = { type: 'HSA', balance: 5000000 };
      const rmd = calculateRMDForAccount(account, 75);

      expect(rmd).toBe(0);
    });

    it('should return 0 for Taxable accounts', () => {
      const account = { type: 'Taxable', balance: 10000000 };
      const rmd = calculateRMDForAccount(account, 75);

      expect(rmd).toBe(0);
    });
  });

  describe('calculateTotalRMD', () => {
    it('should sum RMDs for all applicable accounts', () => {
      const accounts = [
        { type: '401k', balance: 20000000 },
        { type: 'IRA', balance: 15000000 },
        { type: 'Roth', balance: 5000000 },
      ];
      const rmd = calculateTotalRMD(accounts, 75);

      const expected = Math.round(20000000 / 24.6) + Math.round(15000000 / 24.6);
      expect(Math.abs(rmd - expected)).toBeLessThan(100);
    });
  });

  describe('mustTakeRMD', () => {
    it('should return false for age 70', () => {
      expect(mustTakeRMD(70)).toBe(false);
    });

    it('should return true for age 73', () => {
      expect(mustTakeRMD(73)).toBe(true);
    });

    it('should return true for age 72 with 1951 birth year', () => {
      expect(mustTakeRMD(72, 1951)).toBe(true);
    });

    it('should return true for age 73 with 1951 birth year', () => {
      expect(mustTakeRMD(73, 1951)).toBe(true);
    });
  });

  describe('getRMDStartAge', () => {
    it('should return 73 for standard case', () => {
      const age = getRMDStartAge();

      expect(age).toBe(73);
    });

    it('should return 72 for 1951 birth year', () => {
      const age = getRMDStartAge(1951);

      expect(age).toBe(72);
    });
  });
});
