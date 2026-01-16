import { describe, it, expect, beforeEach } from 'vitest';
import { Plan } from '../../src/core/models/Plan.js';
import { Account } from '../../src/core/models/Account.js';
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

describe('Roth Conversions UI Integration', () => {
  beforeEach(() => {
    global.localStorage.store = {};
  });

  describe('UI Fields Persistence', () => {
    it('should preserve Roth conversion enabled setting', () => {
      const plan = new Plan('Roth Conversion Test', 45, 65);
      plan.addAccount(new Account('401k', '401k', 500000));
      plan.addAccount(new Account('Roth IRA', 'Roth', 100000));

      plan.rothConversions = {
        enabled: true,
        strategy: 'fixed',
        annualAmount: 10000 * 100,
        percentage: 0.05,
        bracketTop: 50000 * 100,
      };

      StorageManager.savePlan(plan);
      const loadedPlan = StorageManager.loadPlan(plan.id);
      const reconstructedPlan = Plan.fromJSON(loadedPlan);

      expect(reconstructedPlan.rothConversions.enabled).toBe(true);
    });

    it('should preserve Roth conversion strategy', () => {
      const plan = new Plan('Roth Conversion Test', 45, 65);
      plan.addAccount(new Account('401k', '401k', 500000));
      plan.addAccount(new Account('Roth IRA', 'Roth', 100000));

      plan.rothConversions = {
        enabled: true,
        strategy: 'fixed',
        annualAmount: 10000 * 100,
        percentage: 0.05,
        bracketTop: 50000 * 100,
      };

      StorageManager.savePlan(plan);
      const loadedPlan = StorageManager.loadPlan(plan.id);
      const reconstructedPlan = Plan.fromJSON(loadedPlan);

      expect(reconstructedPlan.rothConversions.strategy).toBe('fixed');
    });

    it('should preserve annual amount', () => {
      const plan = new Plan('Roth Conversion Test', 45, 65);
      plan.addAccount(new Account('401k', '401k', 500000));
      plan.addAccount(new Account('Roth IRA', 'Roth', 100000));

      plan.rothConversions = {
        enabled: true,
        strategy: 'fixed',
        annualAmount: 10000 * 100,
        percentage: 0.05,
        bracketTop: 50000 * 100,
      };

      StorageManager.savePlan(plan);
      const loadedPlan = StorageManager.loadPlan(plan.id);
      const reconstructedPlan = Plan.fromJSON(loadedPlan);

      expect(reconstructedPlan.rothConversions.annualAmount).toBe(10000 * 100);
    });

    it('should preserve percentage value', () => {
      const plan = new Plan('Roth Conversion Test', 45, 65);
      plan.addAccount(new Account('401k', '401k', 500000));
      plan.addAccount(new Account('Roth IRA', 'Roth', 100000));

      plan.rothConversions = {
        enabled: true,
        strategy: 'fixed',
        annualAmount: 10000 * 100,
        percentage: 0.05,
        bracketTop: 50000 * 100,
      };

      StorageManager.savePlan(plan);
      const loadedPlan = StorageManager.loadPlan(plan.id);
      const reconstructedPlan = Plan.fromJSON(loadedPlan);

      expect(reconstructedPlan.rothConversions.percentage).toBe(0.05);
    });

    it('should preserve bracket top value', () => {
      const plan = new Plan('Roth Conversion Test', 45, 65);
      plan.addAccount(new Account('401k', '401k', 500000));
      plan.addAccount(new Account('Roth IRA', 'Roth', 100000));

      plan.rothConversions = {
        enabled: true,
        strategy: 'fixed',
        annualAmount: 10000 * 100,
        percentage: 0.05,
        bracketTop: 50000 * 100,
      };

      StorageManager.savePlan(plan);
      const loadedPlan = StorageManager.loadPlan(plan.id);
      const reconstructedPlan = Plan.fromJSON(loadedPlan);

      expect(reconstructedPlan.rothConversions.bracketTop).toBe(50000 * 100);
    });

    it('should update and preserve percentage strategy', () => {
      const plan = new Plan('Roth Conversion Test', 45, 65);
      plan.addAccount(new Account('401k', '401k', 500000));
      plan.addAccount(new Account('Roth IRA', 'Roth', 100000));

      plan.rothConversions = {
        enabled: true,
        strategy: 'fixed',
        annualAmount: 10000 * 100,
        percentage: 0.05,
        bracketTop: 50000 * 100,
      };

      plan.rothConversions.strategy = 'percentage';
      plan.rothConversions.percentage = 0.1;
      StorageManager.savePlan(plan);
      const loadedPlan = StorageManager.loadPlan(plan.id);
      const reconstructedPlan = Plan.fromJSON(loadedPlan);

      expect(reconstructedPlan.rothConversions.strategy).toBe('percentage');
      expect(reconstructedPlan.rothConversions.percentage).toBe(0.1);
    });

    it('should update and preserve bracket-fill strategy', () => {
      const plan = new Plan('Roth Conversion Test', 45, 65);
      plan.addAccount(new Account('401k', '401k', 500000));
      plan.addAccount(new Account('Roth IRA', 'Roth', 100000));

      plan.rothConversions = {
        enabled: true,
        strategy: 'fixed',
        annualAmount: 10000 * 100,
        percentage: 0.05,
        bracketTop: 50000 * 100,
      };

      plan.rothConversions.strategy = 'bracket-fill';
      plan.rothConversions.bracketTop = 95000 * 100;
      StorageManager.savePlan(plan);
      const loadedPlan = StorageManager.loadPlan(plan.id);
      const reconstructedPlan = Plan.fromJSON(loadedPlan);

      expect(reconstructedPlan.rothConversions.strategy).toBe('bracket-fill');
      expect(reconstructedPlan.rothConversions.bracketTop).toBe(95000 * 100);
    });

    it('should preserve disabled setting', () => {
      const plan = new Plan('Roth Conversion Test', 45, 65);
      plan.addAccount(new Account('401k', '401k', 500000));
      plan.addAccount(new Account('Roth IRA', 'Roth', 100000));

      plan.rothConversions = {
        enabled: true,
        strategy: 'fixed',
        annualAmount: 10000 * 100,
        percentage: 0.05,
        bracketTop: 50000 * 100,
      };

      plan.rothConversions.enabled = false;
      StorageManager.savePlan(plan);
      const loadedPlan = StorageManager.loadPlan(plan.id);
      const reconstructedPlan = Plan.fromJSON(loadedPlan);

      expect(reconstructedPlan.rothConversions.enabled).toBe(false);
    });
  });

  describe('Projection Integration', () => {
    it('should save and load Roth conversion settings with projection', () => {
      const plan = new Plan('Roth Projection Test', 50, 65);
      plan.addAccount(new Account('401k', '401k', 500000));
      plan.addAccount(new Account('Roth IRA', 'Roth', 100000));

      plan.rothConversions = {
        enabled: true,
        strategy: 'fixed',
        annualAmount: 15000 * 100,
        percentage: 0,
        bracketTop: 0,
      };

      StorageManager.savePlan(plan);
      const loadedPlan = StorageManager.loadPlan(plan.id);
      const reconstructedPlan = Plan.fromJSON(loadedPlan);

      expect(reconstructedPlan.rothConversions.enabled).toBe(true);
      expect(reconstructedPlan.rothConversions.strategy).toBe('fixed');
      expect(reconstructedPlan.rothConversions.annualAmount).toBe(15000 * 100);
    });
  });
});
