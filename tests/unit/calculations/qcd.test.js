import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  mustTakeQCD,
  canAccountTakeQCD,
  calculateQCDForAccount,
  calculateTotalQCD,
  getQCDLimit,
  getQCDMinimumAge,
  calculateQCDTaxBenefit,
  validateQCDSettings,
} from '../../../src/calculations/qcd.js';

const mockStorage = new Map();

beforeEach(() => {
  vi.stubGlobal('localStorage', {
    getItem: vi.fn((key) => mockStorage.get(key) || null),
    setItem: vi.fn((key, value) => mockStorage.set(key, value)),
    removeItem: vi.fn((key) => mockStorage.delete(key)),
    clear: vi.fn(() => mockStorage.clear()),
    get length() {
      return mockStorage.size;
    },
    key: vi.fn((index) => {
      const keys = Array.from(mockStorage.keys());
      return keys[index] || null;
    }),
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
  mockStorage.clear();
});

describe('QCD Calculations', () => {
  describe('mustTakeQCD', () => {
    it('should return false for age 70', () => {
      expect(mustTakeQCD(70)).toBe(false);
    });

    it('should return true for age 70.5', () => {
      expect(mustTakeQCD(70.5)).toBe(true);
    });

    it('should return true for age 71', () => {
      expect(mustTakeQCD(71)).toBe(true);
    });

    it('should return true for age 80', () => {
      expect(mustTakeQCD(80)).toBe(true);
    });
  });

  describe('canAccountTakeQCD', () => {
    it('should return true for IRA', () => {
      expect(canAccountTakeQCD('IRA')).toBe(true);
    });

    it('should return true for 401k', () => {
      expect(canAccountTakeQCD('401k')).toBe(true);
    });

    it('should return false for Roth', () => {
      expect(canAccountTakeQCD('Roth')).toBe(false);
    });

    it('should return false for HSA', () => {
      expect(canAccountTakeQCD('HSA')).toBe(false);
    });

    it('should return false for Taxable', () => {
      expect(canAccountTakeQCD('Taxable')).toBe(false);
    });
  });

  describe('calculateQCDForAccount', () => {
    it('should calculate fixed strategy QCD', () => {
      const settings = {
        enabled: true,
        strategy: 'fixed',
        annualAmount: 5000 * 100,
        currentAge: 71,
      };
      const account = { type: 'IRA', balance: 100000 * 100 };

      const qcd = calculateQCDForAccount(account, settings, 0);

      expect(qcd).toBe(5000 * 100);
    });

    it('should calculate percentage strategy QCD', () => {
      const settings = { enabled: true, strategy: 'percentage', percentage: 0.1, currentAge: 71 };
      const account = { type: 'IRA', balance: 100000 * 100 };

      const qcd = calculateQCDForAccount(account, settings, 0);

      expect(qcd).toBe(10000 * 100);
    });

    it('should calculate RMD strategy QCD', () => {
      const settings = { enabled: true, strategy: 'rmd', currentAge: 71 };
      const account = { type: 'IRA', balance: 100000 * 100 };

      const qcd = calculateQCDForAccount(account, settings, 3000 * 100);

      expect(qcd).toBe(3000 * 100);
    });

    it('should return 0 when disabled', () => {
      const settings = {
        enabled: false,
        strategy: 'fixed',
        annualAmount: 5000 * 100,
        currentAge: 71,
      };
      const account = { type: 'IRA', balance: 100000 * 100 };

      const qcd = calculateQCDForAccount(account, settings, 0);

      expect(qcd).toBe(0);
    });

    it('should return 0 for age under 70.5', () => {
      const settings = {
        enabled: true,
        strategy: 'fixed',
        annualAmount: 5000 * 100,
        currentAge: 65,
      };
      const account = { type: 'IRA', balance: 100000 * 100 };

      const qcd = calculateQCDForAccount(account, settings, 0);

      expect(qcd).toBe(0);
    });
  });

  describe('calculateTotalQCD', () => {
    it('should calculate total QCD across eligible accounts', () => {
      const accounts = [
        { type: 'IRA', balance: 200000 * 100 },
        { type: '401k', balance: 300000 * 100 },
        { type: 'Roth', balance: 100000 * 100 },
      ];

      const settings = {
        enabled: true,
        strategy: 'fixed',
        annualAmount: 10000 * 100,
        currentAge: 72,
      };
      const totalQCD = calculateTotalQCD(accounts, settings, 0);

      expect(totalQCD).toBe(20000 * 100);
    });
  });

  describe('getQCDLimit', () => {
    it('should return $100,000 limit', () => {
      const limit = getQCDLimit();

      expect(limit).toBe(100000 * 100);
    });
  });

  describe('getQCDMinimumAge', () => {
    it('should return 70.5', () => {
      const minAge = getQCDMinimumAge();

      expect(minAge).toBe(70.5);
    });
  });

  describe('calculateQCDTaxBenefit', () => {
    it('should calculate tax benefit correctly', () => {
      const benefit = calculateQCDTaxBenefit(10000 * 100, 0.24);
      const expectedBenefit = 10000 * 100 * 0.24;

      expect(benefit).toBe(expectedBenefit);
    });

    it('should return 0 for zero QCD', () => {
      const zeroBenefit = calculateQCDTaxBenefit(0, 0.24);

      expect(zeroBenefit).toBe(0);
    });
  });

  describe('validateQCDSettings', () => {
    it('should pass validation for valid settings', () => {
      const validSettings = { enabled: true, strategy: 'fixed', annualAmount: 5000 * 100 };
      const errors = validateQCDSettings(validSettings);

      expect(errors.length).toBe(0);
    });

    it('should detect invalid strategy', () => {
      const invalidStrategy = { enabled: true, strategy: 'invalid', annualAmount: 5000 * 100 };
      const errors = validateQCDSettings(invalidStrategy);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0]).toMatch(/Invalid QCD strategy/);
    });

    it('should detect negative amount', () => {
      const negativeAmount = { enabled: true, strategy: 'fixed', annualAmount: -100 };
      const errors = validateQCDSettings(negativeAmount);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0]).toMatch(/Fixed QCD amount must be positive/);
    });

    it('should detect invalid percentage', () => {
      const invalidPercentage = { enabled: true, strategy: 'percentage', percentage: 1.5 };
      const errors = validateQCDSettings(invalidPercentage);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0]).toMatch(/percentage must be between 0 and 1/);
    });
  });
});
