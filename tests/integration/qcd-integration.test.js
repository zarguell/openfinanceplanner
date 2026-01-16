import { describe, it, expect, beforeEach } from 'vitest';
import { Plan } from '../../src/core/models/Plan.js';
import { Account } from '../../src/core/models/Account.js';
import { Expense } from '../../src/core/models/Expense.js';
import { project } from '../../src/calculations/projection.js';
import { StorageManager } from '../../src/storage/StorageManager.js';

global.localStorage = {
  store: {},
  getItem(key) {
    return this.store[key] || null;
  },
  setItem(key, value) {
    this.store[key] = value;
  },
  removeItem(key) {
    delete this.store[key];
  },
  clear() {
    this.store = {};
  },
};

describe('QCD Integration', () => {
  beforeEach(() => {
    global.localStorage.store = {};
  });

  describe('Settings Persistence', () => {
    it('should preserve QCD enabled setting', () => {
      const plan = new Plan('QCD Test', 65, 75);
      plan.addAccount(new Account('IRA', 'IRA', 500000));
      plan.addExpense(new Expense('Living Expenses', 60000, 0, true));

      plan.qcdSettings = {
        enabled: true,
        strategy: 'fixed',
        annualAmount: 10000 * 100,
        percentage: 0.1,
        marginalTaxRate: 0.24,
      };

      StorageManager.savePlan(plan);
      const loadedPlan = StorageManager.loadPlan(plan.id);
      const reconstructedPlan = Plan.fromJSON(loadedPlan);

      expect(reconstructedPlan.qcdSettings.enabled).toBe(true);
    });

    it('should preserve QCD strategy', () => {
      const plan = new Plan('QCD Test', 65, 75);
      plan.addAccount(new Account('IRA', 'IRA', 500000));
      plan.addExpense(new Expense('Living Expenses', 60000, 0, true));

      plan.qcdSettings = {
        enabled: true,
        strategy: 'fixed',
        annualAmount: 10000 * 100,
        percentage: 0.1,
        marginalTaxRate: 0.24,
      };

      StorageManager.savePlan(plan);
      const loadedPlan = StorageManager.loadPlan(plan.id);
      const reconstructedPlan = Plan.fromJSON(loadedPlan);

      expect(reconstructedPlan.qcdSettings.strategy).toBe('fixed');
    });

    it('should preserve annual amount', () => {
      const plan = new Plan('QCD Test', 65, 75);
      plan.addAccount(new Account('IRA', 'IRA', 500000));
      plan.addExpense(new Expense('Living Expenses', 60000, 0, true));

      plan.qcdSettings = {
        enabled: true,
        strategy: 'fixed',
        annualAmount: 10000 * 100,
        percentage: 0.1,
        marginalTaxRate: 0.24,
      };

      StorageManager.savePlan(plan);
      const loadedPlan = StorageManager.loadPlan(plan.id);
      const reconstructedPlan = Plan.fromJSON(loadedPlan);

      expect(reconstructedPlan.qcdSettings.annualAmount).toBe(10000 * 100);
    });
  });

  describe('Projection Integration', () => {
    it('should calculate QCD in projections', () => {
      const plan = new Plan('QCD Projection Test', 71, 80);
      plan.addAccount(new Account('IRA', 'IRA', 500000));
      plan.addExpense(new Expense('Living Expenses', 40000, 0, true));

      plan.qcdSettings = {
        enabled: true,
        strategy: 'fixed',
        annualAmount: 10000 * 100,
        percentage: 0,
        marginalTaxRate: 0.24,
      };

      const results = project(plan, 20, 2025);

      const totalQCD = results.reduce((sum, year) => sum + (year.totalQCD || 0), 0);

      expect(totalQCD).toBe(210000);
      const yearsWithQCD = results.filter((year) => year.totalQCD > 0);
      expect(yearsWithQCD.length).toBe(21);
    });

    it('should calculate percentage-based QCD', () => {
      const plan = new Plan('QCD Percentage Test', 70, 80);
      plan.addAccount(new Account('IRA', 'IRA', 400000));
      plan.addExpense(new Expense('Living Expenses', 50000, 0, true));

      plan.qcdSettings = {
        enabled: true,
        strategy: 'percentage',
        annualAmount: 0,
        percentage: 0.1,
        marginalTaxRate: 0.22,
      };

      const results = project(plan, 15, 2025);

      const yearsWithQCD = results.filter((year) => year.totalQCD > 0);
      expect(yearsWithQCD.length).toBeGreaterThan(0);

      const totalQCD = results.reduce((sum, year) => sum + (year.totalQCD || 0), 0);
      expect(totalQCD).toBeGreaterThan(0);
    });

    it('should calculate RMD-based QCD', () => {
      const plan = new Plan('QCD RMD Test', 72, 85);
      plan.addAccount(new Account('IRA', 'IRA', 600000));
      plan.addExpense(new Expense('Living Expenses', 40000, 0, true));

      plan.qcdSettings = {
        enabled: true,
        strategy: 'rmd',
        annualAmount: 0,
        percentage: 0,
        marginalTaxRate: 0.24,
      };

      const results = project(plan, 15, 2025);

      const yearsWithRMD = results.filter((year) => year.totalRmdAmount > 0);
      const yearsWithQCD = results.filter((year) => year.totalQCD > 0);

      expect(yearsWithQCD.length).toBe(yearsWithRMD.length);
    });

    it('should not calculate QCD when disabled', () => {
      const plan = new Plan('QCD Disabled Test', 75, 85);
      plan.addAccount(new Account('IRA', 'IRA', 500000));
      plan.addExpense(new Expense('Living Expenses', 50000, 0, true));

      plan.qcdSettings = {
        enabled: false,
        strategy: 'fixed',
        annualAmount: 0,
        percentage: 0,
        marginalTaxRate: 0.24,
      };

      const results = project(plan, 10, 2025);

      const totalQCD = results.reduce((sum, year) => sum + (year.totalQCD || 0), 0);
      expect(totalQCD).toBe(0);
    });
  });
});
