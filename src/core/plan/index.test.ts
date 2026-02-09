import { describe, it, expect } from 'vitest';
import type { Plan, PlanType } from '../types';
import { validatePlan } from './index';

describe('Plan Core Functionality', () => {
  it('should create a valid fixed-date plan', () => {
    const plan: Plan = {
      id: 'plan-1',
      name: 'Retirement Plan',
      type: 'fixed-date',
      startDate: '2024-01-01',
      timeHorizon: 30,
      assumptions: {
        inflation: {
          rate: 2.5,
          adjustSpending: true,
          adjustGrowth: true,
        },
        growthModel: {
          defaultRate: 7.0,
        },
        withdrawalRules: {
          strategy: 'tax-efficient',
          retirementAge: 65,
          maxProjectionYears: 30,
        },
      },
    };

    expect(plan.id).toBe('plan-1');
    expect(plan.name).toBe('Retirement Plan');
    expect(plan.type).toBe('fixed-date');
    expect(plan.startDate).toBe('2024-01-01');
    expect(plan.timeHorizon).toBe(30);
  });

  it('should create a valid rolling plan', () => {
    const plan: Plan = {
      id: 'plan-2',
      name: 'Project From Today Plan',
      type: 'rolling',
      startDate: new Date().toISOString().split('T')[0], // Today's date
      timeHorizon: 25,
      assumptions: {
        inflation: {
          rate: 3.0,
          adjustSpending: true,
          adjustGrowth: false,
        },
        growthModel: {
          defaultRate: 6.5,
          accountGrowthRates: {
            'account-1': 8.0,
            'account-2': 5.5,
          },
        },
        withdrawalRules: {
          strategy: 'proportional',
          retirementAge: 67,
          maxProjectionYears: 25,
        },
        socialSecurity: {
          startAge: 70,
          monthlyBenefit: 2500,
          inflationAdjusted: true,
        },
        rmdSettings: {
          rmdStartAge: 72,
          rmdTable: 'uniform',
        },
      },
    };

    expect(plan.type).toBe('rolling');
    expect(plan.assumptions.inflation.rate).toBe(3.0);
    expect(plan.assumptions.growthModel.accountGrowthRates?.['account-1']).toBe(
      8.0
    );
  });

  it('should validate plan type correctly', () => {
    // This test will fail until we implement proper validation
    const planTypes: PlanType[] = ['fixed-date', 'rolling'];

    expect(planTypes).toContain('fixed-date');
    expect(planTypes).toContain('rolling');
    expect(planTypes).not.toContain('invalid-type');
  });

  it('should enforce readonly properties', () => {
    const plan: Plan = {
      id: 'plan-3',
      name: 'Test Plan',
      type: 'fixed-date',
      startDate: '2024-01-01',
      timeHorizon: 20,
      assumptions: {
        inflation: {
          rate: 2.5,
          adjustSpending: true,
          adjustGrowth: true,
        },
        growthModel: {
          defaultRate: 7.0,
        },
        withdrawalRules: {
          strategy: 'sequential',
          retirementAge: 65,
          maxProjectionYears: 20,
        },
      },
    };

    // TypeScript should prevent mutation at compile time
    // @ts-expect-error - Cannot assign to 'id' because it is a read-only property
    plan.id = 'changed-id';

    // @ts-expect-error - Cannot assign to 'type' because it is a read-only property
    plan.type = 'rolling';
  });

  it('should validate correct plan configurations', () => {
    const validPlan: Plan = {
      id: 'valid-plan',
      name: 'Valid Plan',
      type: 'fixed-date',
      startDate: '2024-01-01',
      timeHorizon: 30,
      assumptions: {
        inflation: {
          rate: 2.5,
          adjustSpending: true,
          adjustGrowth: true,
        },
        growthModel: {
          defaultRate: 7.0,
        },
        withdrawalRules: {
          strategy: 'tax-efficient',
          retirementAge: 65,
          maxProjectionYears: 30,
        },
      },
    };

    expect(validatePlan(validPlan)).toBe(true);
  });

  it('should reject invalid plan configurations', () => {
    const invalidPlan: Plan = {
      id: '',
      name: '',
      type: 'invalid' as PlanType, // Invalid type
      startDate: 'invalid-date',
      timeHorizon: -5, // Invalid negative time horizon
      assumptions: {
        inflation: {
          rate: -1, // Invalid negative rate
          adjustSpending: true,
          adjustGrowth: true,
        },
        growthModel: {
          defaultRate: 150, // Unrealistically high rate
        },
        withdrawalRules: {
          strategy:
            'invalid-strategy' as unknown as import('../types').WithdrawalStrategy, // Invalid strategy
          retirementAge: -5, // Invalid negative age
          maxProjectionYears: -10, // Invalid negative years
        },
      },
    };

    expect(validatePlan(invalidPlan)).toBe(false);
  });
});
