import { describe, it, expect, beforeEach } from 'vitest';
import { useStore } from './index';
import type { Plan } from '@/core/types';

describe('Plan Store Integration', () => {
  beforeEach(() => {
    useStore.getState().clearPlans();
  });

  it('should initialize with empty plans array', () => {
    const plans = useStore.getState().plans;
    expect(plans).toEqual([]);
    expect(plans).toHaveLength(0);
  });

  it('should add a new plan to the store', () => {
    const testPlan: Plan = {
      id: 'test-plan-1',
      name: 'Test Plan',
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

    useStore.getState().addPlan(testPlan);
    const plans = useStore.getState().plans;

    expect(plans).toHaveLength(1);
    expect(plans[0]).toEqual(testPlan);
  });

  it('should set multiple plans in the store', () => {
    const plans: Plan[] = [
      {
        id: 'plan-1',
        name: 'First Plan',
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
      },
      {
        id: 'plan-2',
        name: 'Second Plan',
        type: 'rolling',
        startDate: new Date().toISOString().split('T')[0],
        timeHorizon: 25,
        assumptions: {
          inflation: {
            rate: 3.0,
            adjustSpending: true,
            adjustGrowth: false,
          },
          growthModel: {
            defaultRate: 6.5,
          },
          withdrawalRules: {
            strategy: 'proportional',
            retirementAge: 67,
            maxProjectionYears: 25,
          },
        },
      },
    ];

    useStore.getState().setPlans(plans);
    const storedPlans = useStore.getState().plans;

    expect(storedPlans).toHaveLength(2);
    expect(storedPlans).toEqual(plans);
  });

  it('should update an existing plan', () => {
    const originalPlan: Plan = {
      id: 'plan-1',
      name: 'Original Name',
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

    useStore.getState().addPlan(originalPlan);

    const updatedPlan: Plan = {
      ...originalPlan,
      name: 'Updated Name',
      timeHorizon: 35,
      assumptions: {
        ...originalPlan.assumptions,
        inflation: {
          ...originalPlan.assumptions.inflation,
          rate: 3.0,
        },
      },
    };

    useStore.getState().updatePlan(updatedPlan);
    const plans = useStore.getState().plans;

    expect(plans).toHaveLength(1);
    expect(plans[0].name).toBe('Updated Name');
    expect(plans[0].timeHorizon).toBe(35);
    expect(plans[0].assumptions.inflation.rate).toBe(3.0);
  });

  it('should delete a plan by ID', () => {
    const plans: Plan[] = [
      {
        id: 'plan-1',
        name: 'Plan 1',
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
      },
      {
        id: 'plan-2',
        name: 'Plan 2',
        type: 'rolling',
        startDate: '2024-01-01',
        timeHorizon: 25,
        assumptions: {
          inflation: {
            rate: 3.0,
            adjustSpending: true,
            adjustGrowth: false,
          },
          growthModel: {
            defaultRate: 6.5,
          },
          withdrawalRules: {
            strategy: 'proportional',
            retirementAge: 67,
            maxProjectionYears: 25,
          },
        },
      },
    ];

    useStore.getState().setPlans(plans);
    expect(useStore.getState().plans).toHaveLength(2);

    useStore.getState().deletePlan('plan-1');
    const remainingPlans = useStore.getState().plans;

    expect(remainingPlans).toHaveLength(1);
    expect(remainingPlans[0].id).toBe('plan-2');
  });

  it('should get a plan by ID', () => {
    const plans: Plan[] = [
      {
        id: 'plan-1',
        name: 'Plan 1',
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
      },
      {
        id: 'plan-2',
        name: 'Plan 2',
        type: 'rolling',
        startDate: '2024-01-01',
        timeHorizon: 25,
        assumptions: {
          inflation: {
            rate: 3.0,
            adjustSpending: true,
            adjustGrowth: false,
          },
          growthModel: {
            defaultRate: 6.5,
          },
          withdrawalRules: {
            strategy: 'proportional',
            retirementAge: 67,
            maxProjectionYears: 25,
          },
        },
      },
    ];

    useStore.getState().setPlans(plans);

    const plan1 = useStore.getState().getPlan('plan-1');
    const plan2 = useStore.getState().getPlan('plan-2');
    const nonExistent = useStore.getState().getPlan('non-existent');

    expect(plan1).toEqual(plans[0]);
    expect(plan2).toEqual(plans[1]);
    expect(nonExistent).toBeUndefined();
  });

  it('should set the current/active plan', () => {
    const testPlan: Plan = {
      id: 'test-plan',
      name: 'Test Plan',
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

    useStore.getState().addPlan(testPlan);
    useStore.getState().setCurrentPlan('test-plan');

    expect(useStore.getState().currentPlanId).toBe('test-plan');
    expect(useStore.getState().getCurrentPlan()).toEqual(testPlan);
  });

  it('should clear all plans', () => {
    const plans: Plan[] = [
      {
        id: 'plan-1',
        name: 'Plan 1',
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
      },
    ];

    useStore.getState().setPlans(plans);
    expect(useStore.getState().plans).toHaveLength(1);

    useStore.getState().clearPlans();

    expect(useStore.getState().plans).toEqual([]);
    expect(useStore.getState().currentPlanId).toBeNull();
  });
});
