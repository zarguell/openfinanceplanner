import { describe, it, expect, beforeEach } from 'vitest';
import { useStore } from './index';

describe('State Management Enhancement - Indexing', () => {
  beforeEach(() => {
    useStore.getState().clearPlans();
    useStore.getState().clearScenarios();
    useStore.getState().clearIncomeExpenses();
  });

  describe('Plan Indexing', () => {
    it('should provide efficient plan lookup by index', () => {
      const plan1 = {
        id: 'plan-1',
        name: 'Plan 1',
        type: 'fixed-date' as const,
        startDate: '2024-01-01',
        timeHorizon: 30,
        assumptions: {
          inflation: { rate: 2.5, adjustSpending: true, adjustGrowth: false },
          growthModel: { defaultRate: 7, accountGrowthRates: {} },
          withdrawalRules: {
            strategy: 'sequential' as const,
            retirementAge: 65,
            maxProjectionYears: 40,
          },
        },
      };

      const plan2 = {
        id: 'plan-2',
        name: 'Plan 2',
        type: 'rolling' as const,
        startDate: '2024-01-01',
        timeHorizon: 30,
        assumptions: {
          inflation: { rate: 2.5, adjustSpending: true, adjustGrowth: false },
          growthModel: { defaultRate: 7, accountGrowthRates: {} },
          withdrawalRules: {
            strategy: 'proportional' as const,
            retirementAge: 62,
            maxProjectionYears: 40,
          },
        },
      };

      useStore.getState().addPlan(plan1);
      useStore.getState().addPlan(plan2);

      const planIndex = useStore.getState().getPlanIndex();
      expect(planIndex).toBeDefined();
      expect(planIndex['plan-1']).toBe(plan1);
      expect(planIndex['plan-2']).toBe(plan2);
    });

    it('should update index when plans change', () => {
      const plan1 = {
        id: 'plan-1',
        name: 'Plan 1',
        type: 'fixed-date' as const,
        startDate: '2024-01-01',
        timeHorizon: 30,
        assumptions: {
          inflation: { rate: 2.5, adjustSpending: true, adjustGrowth: false },
          growthModel: { defaultRate: 7, accountGrowthRates: {} },
          withdrawalRules: {
            strategy: 'sequential' as const,
            retirementAge: 65,
            maxProjectionYears: 40,
          },
        },
      };

      useStore.getState().addPlan(plan1);

      const updatedPlan = {
        ...plan1,
        name: 'Updated Plan 1',
      };

      useStore.getState().updatePlan(updatedPlan);

      const planIndex = useStore.getState().getPlanIndex();
      expect(planIndex['plan-1'].name).toBe('Updated Plan 1');
    });
  });

  describe('Scenario Indexing', () => {
    it('should provide efficient scenario lookup by index', () => {
      const scenario1 = {
        id: 'scenario-1',
        name: 'Scenario 1',
        basePlanId: 'plan-1',
        status: 'active' as const,
        createdAt: '2024-01-01',
        modifiedAt: '2024-01-01',
        version: 1,
      };

      const scenario2 = {
        id: 'scenario-2',
        name: 'Scenario 2',
        basePlanId: 'plan-1',
        status: 'active' as const,
        createdAt: '2024-01-02',
        modifiedAt: '2024-01-02',
        version: 1,
      };

      useStore.getState().addScenario(scenario1);
      useStore.getState().addScenario(scenario2);

      const scenarioIndex = useStore.getState().getScenarioIndex();
      expect(scenarioIndex).toBeDefined();
      expect(scenarioIndex['scenario-1']).toBe(scenario1);
      expect(scenarioIndex['scenario-2']).toBe(scenario2);
    });
  });

  describe('Income/Expense Indexing', () => {
    it('should provide efficient income lookup by category', () => {
      const income1 = {
        id: 'income-1',
        type: 'work' as const,
        name: 'Salary',
        amount: 100000,
        frequency: 'monthly' as const,
        startDate: '2024-01-01',
        category: 'salary',
        taxable: true,
      };

      const income2 = {
        id: 'income-2',
        type: 'business' as const,
        name: 'Side Business',
        amount: 50000,
        frequency: 'yearly' as const,
        startDate: '2024-01-01',
        category: 'business',
        associatedExpenses: 10000,
      };

      useStore.getState().addIncome(income1);
      useStore.getState().addIncome(income2);

      const incomeByCategory = useStore.getState().getIncomeByCategory();
      expect(incomeByCategory).toBeDefined();
      expect(incomeByCategory['salary']).toHaveLength(1);
      expect(incomeByCategory['business']).toHaveLength(1);
    });

    it('should provide efficient expense lookup by category', () => {
      const expense1 = {
        id: 'expense-1',
        type: 'recurring' as const,
        name: 'Rent',
        amount: 2000,
        frequency: 'monthly' as const,
        startDate: '2024-01-01',
        category: 'housing',
        mandatory: true,
        variable: false,
      };

      const expense2 = {
        id: 'expense-2',
        type: 'recurring' as const,
        name: 'Groceries',
        amount: 500,
        frequency: 'monthly' as const,
        startDate: '2024-01-01',
        category: 'food',
        mandatory: true,
        variable: true,
      };

      useStore.getState().addExpense(expense1);
      useStore.getState().addExpense(expense2);

      const expenseByCategory = useStore.getState().getExpenseByCategory();
      expect(expenseByCategory).toBeDefined();
      expect(expenseByCategory['housing']).toHaveLength(1);
      expect(expenseByCategory['food']).toHaveLength(1);
    });
  });
});

describe('State Management Enhancement - Optimistic Updates', () => {
  beforeEach(() => {
    useStore.getState().clearPlans();
  });

  it('should support optimistic plan updates with rollback', async () => {
    const plan = {
      id: 'plan-1',
      name: 'Plan 1',
      type: 'fixed-date' as const,
      startDate: '2024-01-01',
      timeHorizon: 30,
      assumptions: {
        inflation: { rate: 2.5, adjustSpending: true, adjustGrowth: false },
        growthModel: { defaultRate: 7, accountGrowthRates: {} },
        withdrawalRules: {
          strategy: 'sequential' as const,
          retirementAge: 65,
          maxProjectionYears: 40,
        },
      },
    };

    useStore.getState().addPlan(plan);

    const updatePromise = useStore.getState().optimisticUpdatePlan({
      id: 'plan-1',
      name: 'Updated Plan 1',
    });

    expect(useStore.getState().plans[0].name).toBe('Updated Plan 1');

    await updatePromise;

    expect(useStore.getState().plans[0].name).toBe('Updated Plan 1');
  });

  it('should rollback optimistic update on failure', async () => {
    const plan = {
      id: 'plan-1',
      name: 'Plan 1',
      type: 'fixed-date' as const,
      startDate: '2024-01-01',
      timeHorizon: 30,
      assumptions: {
        inflation: { rate: 2.5, adjustSpending: true, adjustGrowth: false },
        growthModel: { defaultRate: 7, accountGrowthRates: {} },
        withdrawalRules: {
          strategy: 'sequential' as const,
          retirementAge: 65,
          maxProjectionYears: 40,
        },
      },
    };

    useStore.getState().addPlan(plan);

    const updatePromise = useStore.getState().optimisticUpdatePlan({
      id: 'plan-1',
      name: 'Updated Plan 1',
      _shouldFail: true,
    } as { id: string; name: string; _shouldFail?: boolean });

    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(useStore.getState().plans[0].name).toBe('Updated Plan 1');

    try {
      await updatePromise;
      expect.fail('Should have thrown an error');
    } catch {
      expect(useStore.getState().plans[0].name).toBe('Plan 1');
    }
  });
});

describe('State Management Enhancement - Selectors', () => {
  beforeEach(() => {
    useStore.getState().clearPlans();
    useStore.getState().clearScenarios();
    useStore.getState().clearIncomeExpenses();
  });

  it('should select plans by type', () => {
    const plan1 = {
      id: 'plan-1',
      name: 'Plan 1',
      type: 'fixed-date' as const,
      startDate: '2024-01-01',
      timeHorizon: 30,
      assumptions: {
        inflation: { rate: 2.5, adjustSpending: true, adjustGrowth: false },
        growthModel: { defaultRate: 7, accountGrowthRates: {} },
        withdrawalRules: {
          strategy: 'sequential' as const,
          retirementAge: 65,
          maxProjectionYears: 40,
        },
      },
    };

    const plan2 = {
      id: 'plan-2',
      name: 'Plan 2',
      type: 'rolling' as const,
      startDate: '2024-01-01',
      timeHorizon: 30,
      assumptions: {
        inflation: { rate: 2.5, adjustSpending: true, adjustGrowth: false },
        growthModel: { defaultRate: 7, accountGrowthRates: {} },
        withdrawalRules: {
          strategy: 'proportional' as const,
          retirementAge: 62,
          maxProjectionYears: 40,
        },
      },
    };

    useStore.getState().addPlan(plan1);
    useStore.getState().addPlan(plan2);

    const fixedDatePlans = useStore.getState().getPlansByType('fixed-date');
    expect(fixedDatePlans).toHaveLength(1);
    expect(fixedDatePlans[0].id).toBe('plan-1');

    const rollingPlans = useStore.getState().getPlansByType('rolling');
    expect(rollingPlans).toHaveLength(1);
    expect(rollingPlans[0].id).toBe('plan-2');
  });

  it('should select scenarios by base plan', () => {
    const scenario1 = {
      id: 'scenario-1',
      name: 'Scenario 1',
      basePlanId: 'plan-1',
      status: 'active' as const,
      createdAt: '2024-01-01',
      modifiedAt: '2024-01-01',
      version: 1,
    };

    const scenario2 = {
      id: 'scenario-2',
      name: 'Scenario 2',
      basePlanId: 'plan-1',
      status: 'active' as const,
      createdAt: '2024-01-02',
      modifiedAt: '2024-01-02',
      version: 1,
    };

    const scenario3 = {
      id: 'scenario-3',
      name: 'Scenario 3',
      basePlanId: 'plan-2',
      status: 'active' as const,
      createdAt: '2024-01-03',
      modifiedAt: '2024-01-03',
      version: 1,
    };

    useStore.getState().addScenario(scenario1);
    useStore.getState().addScenario(scenario2);
    useStore.getState().addScenario(scenario3);

    const scenariosForPlan1 = useStore
      .getState()
      .getScenariosByBasePlan('plan-1');
    expect(scenariosForPlan1).toHaveLength(2);
    expect(scenariosForPlan1.map((s) => s.id)).toEqual([
      'scenario-1',
      'scenario-2',
    ]);

    const scenariosForPlan2 = useStore
      .getState()
      .getScenariosByBasePlan('plan-2');
    expect(scenariosForPlan2).toHaveLength(1);
    expect(scenariosForPlan2[0].id).toBe('scenario-3');
  });

  it('should select income by type', () => {
    const income1 = {
      id: 'income-1',
      type: 'work' as const,
      name: 'Salary',
      amount: 100000,
      frequency: 'monthly' as const,
      startDate: '2024-01-01',
      category: 'salary',
      taxable: true,
    };

    const income2 = {
      id: 'income-2',
      type: 'work' as const,
      name: 'Bonus',
      amount: 20000,
      frequency: 'yearly' as const,
      startDate: '2024-01-01',
      category: 'bonus',
      taxable: true,
    };

    const income3 = {
      id: 'income-3',
      type: 'social-security' as const,
      name: 'Social Security',
      amount: 24000,
      frequency: 'yearly' as const,
      startDate: '2024-01-01',
      category: 'pension',
      inflationAdjusted: true,
    };

    useStore.getState().addIncome(income1);
    useStore.getState().addIncome(income2);
    useStore.getState().addIncome(income3);

    const workIncome = useStore.getState().getIncomeByType('work');
    expect(workIncome).toHaveLength(2);

    const pensionIncome = useStore
      .getState()
      .getIncomeByType('social-security');
    expect(pensionIncome).toHaveLength(1);
  });
});
