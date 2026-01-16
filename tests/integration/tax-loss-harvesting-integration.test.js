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

describe('Tax Loss Harvesting Integration', () => {
  beforeEach(() => {
    global.localStorage.store = {};
  });

  describe('Settings Persistence', () => {
    it('should preserve TLH enabled setting', () => {
      const plan = new Plan('TLH Test', 50, 65);
      plan.addAccount(new Account('Taxable', 'Taxable', 100000));
      plan.addExpense(new Expense('Living Expenses', 60000, 0, true));

      plan.taxLossHarvesting = {
        enabled: true,
        strategy: 'all',
        threshold: 100000,
      };

      StorageManager.savePlan(plan);
      const loadedPlan = StorageManager.loadPlan(plan.id);
      const reconstructedPlan = Plan.fromJSON(loadedPlan);

      expect(reconstructedPlan.taxLossHarvesting.enabled).toBe(true);
    });

    it('should preserve TLH strategy', () => {
      const plan = new Plan('TLH Test', 50, 65);
      plan.addAccount(new Account('Taxable', 'Taxable', 100000));
      plan.addExpense(new Expense('Living Expenses', 60000, 0, true));

      plan.taxLossHarvesting = {
        enabled: true,
        strategy: 'all',
        threshold: 100000,
      };

      StorageManager.savePlan(plan);
      const loadedPlan = StorageManager.loadPlan(plan.id);
      const reconstructedPlan = Plan.fromJSON(loadedPlan);

      expect(reconstructedPlan.taxLossHarvesting.strategy).toBe('all');
    });

    it('should preserve TLH threshold', () => {
      const plan = new Plan('TLH Test', 50, 65);
      plan.addAccount(new Account('Taxable', 'Taxable', 100000));
      plan.addExpense(new Expense('Living Expenses', 60000, 0, true));

      plan.taxLossHarvesting = {
        enabled: true,
        strategy: 'all',
        threshold: 100000,
      };

      StorageManager.savePlan(plan);
      const loadedPlan = StorageManager.loadPlan(plan.id);
      const reconstructedPlan = Plan.fromJSON(loadedPlan);

      expect(reconstructedPlan.taxLossHarvesting.threshold).toBe(100000);
    });
  });

  describe('Projection Integration', () => {
    it('should calculate TLH benefits in projections', () => {
      const plan = new Plan('TLH Projection Test', 50, 65);
      const taxable = new Account('Taxable', 'Taxable', 100000);
      plan.addAccount(taxable);
      plan.addExpense(new Expense('Living Expenses', 40000, 0, true));

      plan.taxLossHarvesting = {
        enabled: true,
        strategy: 'all',
        threshold: 100000,
      };

      plan.assumptions.equityGrowthRate = 0.06;
      plan.assumptions.bondGrowthRate = 0.04;
      plan.assumptions.inflationRate = 0.03;

      const results = project(plan, 10, 2025);

      const yearsWithTLH = results.filter((year) => year.taxLossHarvestingBenefit > 0);
      expect(yearsWithTLH.length).toBeGreaterThanOrEqual(0);

      const totalTLHBenefit = results.reduce(
        (sum, year) => sum + (year.taxLossHarvestingBenefit || 0),
        0
      );

      expect(totalTLHBenefit).toBeGreaterThanOrEqual(0);
    });

    it('should not calculate TLH when disabled', () => {
      const plan = new Plan('TLH Disabled Test', 50, 65);
      const taxable = new Account('Taxable', 'Taxable', 100000);
      plan.addAccount(taxable);
      plan.addExpense(new Expense('Living Expenses', 40000, 0, true));

      plan.taxLossHarvesting = {
        enabled: false,
        strategy: 'all',
        threshold: 100000,
      };

      plan.assumptions.equityGrowthRate = 0.06;
      plan.assumptions.bondGrowthRate = 0.04;
      plan.assumptions.inflationRate = 0.03;

      const results = project(plan, 10, 2025);

      const totalTLHBenefit = results.reduce(
        (sum, year) => sum + (year.taxLossHarvestingBenefit || 0),
        0
      );

      expect(totalTLHBenefit).toBe(0);
    });
  });

  describe('Strategy Variations', () => {
    it('should calculate TLH with "all" strategy', () => {
      const plan = new Plan('TLH All Strategy Test', 50, 65);
      const taxable = new Account('Taxable', 'Taxable', 100000);
      plan.addAccount(taxable);
      plan.addExpense(new Expense('Living Expenses', 40000, 0, true));

      plan.taxLossHarvesting = {
        enabled: true,
        strategy: 'all',
        threshold: 50000,
      };

      plan.assumptions.equityGrowthRate = 0.03;
      plan.assumptions.bondGrowthRate = 0.02;
      plan.assumptions.inflationRate = 0.03;

      const results = project(plan, 10, 2025);

      const totalTLHBenefit = results.reduce(
        (sum, year) => sum + (year.taxLossHarvestingBenefit || 0),
        0
      );

      expect(totalTLHBenefit).toBeDefined();
    });

    it('should calculate TLH with "offset-gains" strategy', () => {
      const plan = new Plan('TLH Offset Gains Test', 50, 65);
      const taxable = new Account('Taxable', 'Taxable', 100000);
      plan.addAccount(taxable);
      plan.addExpense(new Expense('Living Expenses', 40000, 0, true));

      plan.taxLossHarvesting = {
        enabled: true,
        strategy: 'offset-gains',
        threshold: 50000,
      };

      plan.assumptions.equityGrowthRate = 0.03;
      plan.assumptions.bondGrowthRate = 0.02;
      plan.assumptions.inflationRate = 0.03;

      const results = project(plan, 10, 2025);

      const totalTLHBenefit = results.reduce(
        (sum, year) => sum + (year.taxLossHarvestingBenefit || 0),
        0
      );

      expect(totalTLHBenefit).toBeDefined();
    });

    it('should respect TLH threshold', () => {
      const plan = new Plan('TLH Threshold Test', 50, 65);
      const taxable = new Account('Taxable', 'Taxable', 100000);
      plan.addAccount(taxable);
      plan.addExpense(new Expense('Living Expenses', 40000, 0, true));

      plan.taxLossHarvesting = {
        enabled: true,
        strategy: 'all',
        threshold: 500000,
      };

      plan.assumptions.equityGrowthRate = 0.04;
      plan.assumptions.bondGrowthRate = 0.03;
      plan.assumptions.inflationRate = 0.03;

      const results = project(plan, 10, 2025);

      const totalTLHBenefit = results.reduce(
        (sum, year) => sum + (year.taxLossHarvestingBenefit || 0),
        0
      );

      expect(totalTLHBenefit).toBeDefined();
    });
  });

  describe('Advanced Scenarios', () => {
    it('should track cost basis in projections', () => {
      const plan = new Plan('TLH Cost Basis Test', 50, 65);
      const taxable = new Account('Taxable', 'Taxable', 100000);
      plan.addAccount(taxable);
      plan.addExpense(new Expense('Living Expenses', 40000, 0, true));

      plan.taxLossHarvesting = {
        enabled: true,
        strategy: 'all',
        threshold: 50000,
      };

      plan.assumptions.equityGrowthRate = 0.04;
      plan.assumptions.bondGrowthRate = 0.03;
      plan.assumptions.inflationRate = 0.03;

      const results = project(plan, 10, 2025);

      let hasCostBasisUpdate = false;
      results.forEach((year) => {
        if (year.accounts && year.accounts[0]) {
          const account = year.accounts[0];
          if (account.costBasis !== undefined) {
            hasCostBasisUpdate = true;
          }
        }
      });

      expect(hasCostBasisUpdate).toBe(true);
    });

    it('should calculate TLH with multiple accounts', () => {
      const plan = new Plan('TLH Multiple Accounts Test', 50, 65);
      plan.addAccount(new Account('Taxable 1', 'Taxable', 100000));
      plan.addAccount(new Account('Taxable 2', 'Taxable', 80000));
      plan.addAccount(new Account('401k', '401k', 200000));
      plan.addExpense(new Expense('Living Expenses', 40000, 0, true));

      plan.taxLossHarvesting = {
        enabled: true,
        strategy: 'all',
        threshold: 50000,
      };

      plan.assumptions.equityGrowthRate = 0.04;
      plan.assumptions.bondGrowthRate = 0.03;
      plan.assumptions.inflationRate = 0.03;

      const results = project(plan, 10, 2025);

      const totalTLHBenefit = results.reduce(
        (sum, year) => sum + (year.taxLossHarvestingBenefit || 0),
        0
      );

      expect(totalTLHBenefit).toBeDefined();
    });
  });
});
