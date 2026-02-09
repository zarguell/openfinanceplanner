import { describe, it, expect } from 'vitest';
import type { Scenario, Plan, FlexSpendingRule } from '@/core/types';
import {
  cloneScenario,
  createScenarioSnapshot,
  compareScenarios,
  validateFlexSpendingRule,
  calculateFlexSpending,
} from './index';

describe('Scenario Management', () => {
  describe('cloneScenario', () => {
    it('should create a new scenario with a different ID', () => {
      const basePlanId = 'plan-1';
      const scenario: Scenario = {
        id: 'scenario-1',
        name: 'Base Scenario',
        description: 'Original scenario',
        basePlanId,
        status: 'active',
        createdAt: '2024-01-01',
        modifiedAt: '2024-01-01',
        version: 1,
      };

      const cloned = cloneScenario(scenario, 'Cloned Scenario');

      expect(cloned.id).not.toBe(scenario.id);
      expect(cloned.id).toMatch(/^scenario-/);
      expect(cloned.name).toBe('Cloned Scenario');
      expect(cloned.basePlanId).toBe(basePlanId);
      expect(cloned.parentScenarioId).toBe(scenario.id);
      expect(cloned.version).toBe(1);
    });

    it('should preserve version when cloning', () => {
      const scenario: Scenario = {
        id: 'scenario-1',
        name: 'Base Scenario',
        basePlanId: 'plan-1',
        status: 'active',
        createdAt: '2024-01-01',
        modifiedAt: '2024-01-01',
        version: 5,
      };

      const cloned = cloneScenario(scenario, 'Clone');

      expect(cloned.version).toBe(5);
    });

    it('should set current date for created/modified timestamps', () => {
      const scenario: Scenario = {
        id: 'scenario-1',
        name: 'Base Scenario',
        basePlanId: 'plan-1',
        status: 'active',
        createdAt: '2020-01-01',
        modifiedAt: '2020-01-01',
        version: 1,
      };

      const cloned = cloneScenario(scenario, 'Clone');

      expect(cloned.createdAt).not.toBe(scenario.createdAt);
      expect(cloned.modifiedAt).not.toBe(scenario.modifiedAt);
    });
  });

  describe('createScenarioSnapshot', () => {
    it('should create a snapshot with all required data', () => {
      const scenarioId = 'scenario-1';
      const plan: Plan = {
        id: 'plan-1',
        name: 'Test Plan',
        type: 'fixed-date',
        startDate: '2024-01-01',
        timeHorizon: 30,
        assumptions: {
          inflation: { rate: 2.5, adjustSpending: true, adjustGrowth: true },
          growthModel: { defaultRate: 7 },
          withdrawalRules: {
            strategy: 'tax-efficient',
            retirementAge: 65,
            maxProjectionYears: 30,
          },
        },
      };

      const snapshot = createScenarioSnapshot(
        scenarioId,
        'Test Snapshot',
        plan
      );

      expect(snapshot.id).toMatch(/^snapshot-/);
      expect(snapshot.scenarioId).toBe(scenarioId);
      expect(snapshot.name).toBe('Test Snapshot');
      expect(snapshot.planData).toEqual(plan);
      expect(snapshot.createdAt).toBeDefined();
    });

    it('should create snapshot with optional data', () => {
      const scenarioId = 'scenario-1';
      const plan: Plan = {
        id: 'plan-1',
        name: 'Test Plan',
        type: 'fixed-date',
        startDate: '2024-01-01',
        timeHorizon: 30,
        assumptions: {
          inflation: { rate: 2.5, adjustSpending: true, adjustGrowth: true },
          growthModel: { defaultRate: 7 },
          withdrawalRules: {
            strategy: 'tax-efficient',
            retirementAge: 65,
            maxProjectionYears: 30,
          },
        },
      };

      const simulationData = [
        {
          year: 0,
          age: 35,
          startingBalance: 100000,
          growth: 7000,
          spending: 50000,
          endingBalance: 57000,
        },
      ];

      const snapshot = createScenarioSnapshot(
        scenarioId,
        'Test Snapshot',
        plan,
        simulationData
      );

      expect(snapshot.simulationData).toEqual(simulationData);
    });
  });

  describe('compareScenarios', () => {
    it('should generate comparison data for multiple scenarios', () => {
      const scenarioIds = ['scenario-1', 'scenario-2'];

      const comparison = compareScenarios(
        scenarioIds,
        [
          {
            id: 'scenario-1',
            name: 'Scenario A',
            netWorth: 100000,
            income: 80000,
            expenses: 60000,
            cashFlow: 20000,
          },
          {
            id: 'scenario-2',
            name: 'Scenario B',
            netWorth: 120000,
            income: 85000,
            expenses: 65000,
            cashFlow: 20000,
          },
        ],
        0,
        35
      );

      expect(comparison.id).toMatch(/^comparison-/);
      expect(comparison.scenarioIds).toEqual(scenarioIds);
      expect(comparison.comparisonData).toHaveLength(1);
      expect(comparison.summary.maxDiffYear).toBe(0);
      expect(comparison.summary.highestScenarioId).toBe('scenario-2');
      expect(comparison.summary.lowestScenarioId).toBe('scenario-1');
    });

    it('should calculate net worth differences correctly', () => {
      const scenarioIds = ['scenario-1', 'scenario-2'];

      const comparison = compareScenarios(
        scenarioIds,
        [
          {
            id: 'scenario-1',
            name: 'Scenario A',
            netWorth: 100000,
            income: 80000,
            expenses: 60000,
            cashFlow: 20000,
          },
          {
            id: 'scenario-2',
            name: 'Scenario B',
            netWorth: 150000,
            income: 90000,
            expenses: 65000,
            cashFlow: 25000,
          },
        ],
        0,
        35
      );

      expect(comparison.summary.maxNetWorthDiff).toBe(50000);
      expect(comparison.summary.avgNetWorthDiff).toBe(50000);
    });

    it('should handle empty scenario list', () => {
      const comparison = compareScenarios([], [], 0, 35);

      expect(comparison.scenarioIds).toHaveLength(0);
      expect(comparison.comparisonData).toHaveLength(0);
    });
  });
});

describe('Flex Spending Rules Engine', () => {
  describe('createFlexSpendingRule', () => {
    it('should create a valid flex spending rule', () => {
      const rule: FlexSpendingRule = {
        id: 'rule-1',
        name: 'Retirement Spending',
        type: 'percentage-of-income',
        category: 'healthcare',
        baseValue: 15,
        isPercentage: true,
        minimumAmount: 5000,
        maximumAmount: 20000,
        conditions: [
          {
            type: 'retirement-date',
            operator: '>=',
            value: 65,
          },
        ],
        enabled: true,
        priority: 1,
      };

      expect(validateFlexSpendingRule(rule)).toBe(true);
    });

    it('should fail validation with invalid condition operator', () => {
      const rule: FlexSpendingRule = {
        id: 'rule-1',
        name: 'Invalid Rule',
        type: 'fixed-amount',
        baseValue: 10000,
        isPercentage: false,
        conditions: [
          {
            type: 'age',
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            operator: 'invalid' as any,
            value: 65,
          },
        ],
        enabled: true,
        priority: 1,
      };

      expect(validateFlexSpendingRule(rule)).toBe(false);
    });

    it('should fail validation with negative base value', () => {
      const rule: FlexSpendingRule = {
        id: 'rule-1',
        name: 'Invalid Rule',
        type: 'fixed-amount',
        baseValue: -1000,
        isPercentage: false,
        conditions: [
          {
            type: 'always',
            operator: '==',
            value: 1,
          },
        ],
        enabled: true,
        priority: 1,
      };

      expect(validateFlexSpendingRule(rule)).toBe(false);
    });
  });

  describe('calculateFlexSpending', () => {
    it('should apply rule with percentage of income', () => {
      const rule: FlexSpendingRule = {
        id: 'rule-1',
        name: '15% of Income',
        type: 'percentage-of-income',
        baseValue: 15,
        isPercentage: true,
        conditions: [
          {
            type: 'always',
            operator: '==',
            value: 1,
          },
        ],
        enabled: true,
        priority: 1,
      };

      const result = calculateFlexSpending(rule, {
        income: 100000,
        age: 65,
        netWorth: 500000,
        year: 2024,
        isRetired: true,
      });

      expect(result).toBe(15000);
    });

    it('should apply minimum amount floor', () => {
      const rule: FlexSpendingRule = {
        id: 'rule-1',
        name: 'Minimum Spending',
        type: 'percentage-of-income',
        baseValue: 5,
        isPercentage: true,
        minimumAmount: 3000,
        conditions: [
          {
            type: 'always',
            operator: '==',
            value: 1,
          },
        ],
        enabled: true,
        priority: 1,
      };

      const result = calculateFlexSpending(rule, {
        income: 40000,
        age: 65,
        netWorth: 200000,
        year: 2024,
        isRetired: true,
      });

      expect(result).toBe(3000);
    });

    it('should apply maximum amount ceiling', () => {
      const rule: FlexSpendingRule = {
        id: 'rule-1',
        name: 'Capped Spending',
        type: 'percentage-of-income',
        baseValue: 20,
        isPercentage: true,
        maximumAmount: 25000,
        conditions: [
          {
            type: 'always',
            operator: '==',
            value: 1,
          },
        ],
        enabled: true,
        priority: 1,
      };

      const result = calculateFlexSpending(rule, {
        income: 200000,
        age: 65,
        netWorth: 2000000,
        year: 2024,
        isRetired: true,
      });

      expect(result).toBe(25000);
    });

    it('should return 0 when conditions are not met', () => {
      const rule: FlexSpendingRule = {
        id: 'rule-1',
        name: 'Post-Retirement Rule',
        type: 'fixed-amount',
        baseValue: 10000,
        isPercentage: false,
        conditions: [
          {
            type: 'age',
            operator: '>=',
            value: 65,
          },
        ],
        enabled: true,
        priority: 1,
      };

      const result = calculateFlexSpending(rule, {
        income: 100000,
        age: 55,
        netWorth: 300000,
        year: 2024,
        isRetired: false,
      });

      expect(result).toBe(0);
    });

    it('should skip disabled rules', () => {
      const rule: FlexSpendingRule = {
        id: 'rule-1',
        name: 'Disabled Rule',
        type: 'percentage-of-income',
        baseValue: 20,
        isPercentage: true,
        conditions: [
          {
            type: 'always',
            operator: '==',
            value: 1,
          },
        ],
        enabled: false,
        priority: 1,
      };

      const result = calculateFlexSpending(rule, {
        income: 100000,
        age: 65,
        netWorth: 500000,
        year: 2024,
        isRetired: true,
      });

      expect(result).toBe(0);
    });
  });
});
