import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { AppController } from '../../../src/ui/AppController.js';

const mockStorage = new Map();

const mockElement = {
  innerHTML: '',
  textContent: '',
  value: '',
  checked: false,
  classList: {
    add: () => {},
    remove: () => {},
    contains: () => false,
  },
  style: {},
  appendChild: () => {},
  remove: () => {},
};

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

  vi.stubGlobal('document', {
    getElementById: (id) => ({ ...mockElement }),
    createElement: () => ({ ...mockElement }),
    body: { appendChild: () => {} },
    querySelectorAll: () => [],
    querySelector: () => null,
  });

  vi.stubGlobal('window', { app: null });

  vi.stubGlobal('StorageManager', {
    listPlans: () => [],
    loadPlan: () => null,
    savePlan: () => {},
    deletePlan: () => {},
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
  mockStorage.clear();
});

describe('AppController', () => {
  describe('initialization', () => {
    it('should initialize correctly', () => {
      const controller = new AppController();

      expect(controller instanceof AppController).toBe(true);
    });
  });

  describe('renderProjectionResults', () => {
    it('should handle valid projection data without errors', () => {
      const controller = new AppController();

      controller.projectionResults = [
        {
          year: 2025,
          age: 35,
          totalBalance: 100000,
          totalExpense: 40000,
          socialSecurityIncome: 0,
          totalFederalTax: 5000,
          totalStateTax: 2000,
          totalFicaTax: 3000,
          totalRmdAmount: 0,
          isRetired: false,
        },
        {
          year: 2026,
          age: 36,
          totalBalance: 110000,
          totalExpense: 41000,
          socialSecurityIncome: 0,
          totalFederalTax: 5500,
          totalStateTax: 2200,
          totalFicaTax: 3300,
          totalRmdAmount: 0,
          isRetired: false,
        },
        {
          year: 2065,
          age: 75,
          totalBalance: 2000000,
          totalExpense: 80000,
          socialSecurityIncome: 25000,
          totalFederalTax: 50000,
          totalStateTax: 20000,
          totalFicaTax: 0,
          totalRmdAmount: 100000,
          isRetired: true,
        },
      ];

      expect(() => controller.renderProjectionResults()).not.toThrow();
    });

    it('should handle empty projection data gracefully', () => {
      const controller = new AppController();

      controller.projectionResults = [];

      expect(() => controller.renderProjectionResults()).not.toThrow();
    });

    it('should handle null projection data gracefully', () => {
      const controller = new AppController();

      controller.projectionResults = null;

      expect(() => controller.renderProjectionResults()).not.toThrow();
    });

    it('should calculate years projected correctly', () => {
      const controller = new AppController();

      controller.projectionResults = [
        {
          year: 2025,
          age: 35,
          totalBalance: 100000,
          totalFederalTax: 5000,
          totalStateTax: 2000,
          totalFicaTax: 3000,
          totalRmdAmount: 0,
          totalExpense: 40000,
          socialSecurityIncome: 0,
          isRetired: false,
        },
        {
          year: 2026,
          age: 36,
          totalBalance: 110000,
          totalFederalTax: 5500,
          totalStateTax: 2200,
          totalFicaTax: 3300,
          totalRmdAmount: 0,
          totalExpense: 41000,
          socialSecurityIncome: 0,
          isRetired: false,
        },
        {
          year: 2027,
          age: 37,
          totalBalance: 120000,
          totalFederalTax: 6000,
          totalStateTax: 2400,
          totalFicaTax: 3600,
          totalRmdAmount: 0,
          totalExpense: 42000,
          socialSecurityIncome: 0,
          isRetired: false,
        },
      ];

      expect(() => controller.renderProjectionResults()).not.toThrow();
    });
  });
});
