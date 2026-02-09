import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { StoreState } from './types';
import { indexedDBStorage } from './middleware/indexeddb';
export { enhancedIndexedDBStorage } from './middleware/enhanced-storage';
export { schemaManager, backupManager } from './middleware/enhanced-storage';
export { initializeSchemasAndMigrations } from './middleware/migrations';

/**
 * Global application store with IndexedDB persistence
 *
 * Uses Zustand with persist middleware for automatic state hydration.
 * Storage name 'open-finance-planner' used for IndexedDB key.
 *
 * @see https://zustand.docs.pmnd.rs/integrations/persisting-store-data
 */
export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      // Profile slice
      profile: null,
      setProfile: (profile) => set({ profile }),
      clearProfile: () => set({ profile: null }),

      // Projection slice
      projection: null,
      setProjection: (projection) => set({ projection }),
      clearProjection: () => set({ projection: null }),

      // Plan slice
      plans: [],
      currentPlanId: null,
      addPlan: (plan) => set((state) => ({ plans: [...state.plans, plan] })),
      updatePlan: (plan) =>
        set((state) => ({
          plans: state.plans.map((p) => (p.id === plan.id ? plan : p)),
        })),
      deletePlan: (planId) =>
        set((state) => ({
          plans: state.plans.filter((p) => p.id !== planId),
          currentPlanId:
            state.currentPlanId === planId ? null : state.currentPlanId,
        })),
      setPlans: (plans) => set({ plans }),
      getPlan: (planId) => get().plans.find((p) => p.id === planId),
      setCurrentPlan: (planId) => set({ currentPlanId: planId }),
      getCurrentPlan: () => {
        const state = get();
        return state.currentPlanId
          ? state.plans.find((p) => p.id === state.currentPlanId)
          : undefined;
      },
      clearPlans: () => set({ plans: [], currentPlanId: null }),
      getPlanIndex: () => {
        const state = get();
        const index: Record<string, (typeof state.plans)[number]> = {};
        state.plans.forEach((plan) => {
          index[plan.id] = plan;
        });
        return index;
      },
      optimisticUpdatePlan: async (update) => {
        const state = get();
        const existingPlan = state.plans.find((p) => p.id === update.id);
        if (!existingPlan) {
          throw new Error(`Plan with id ${update.id} not found`);
        }

        const previousPlan = { ...existingPlan };

        set((s) => ({
          plans: s.plans.map((p) =>
            p.id === update.id ? { ...p, ...update } : p
          ),
        }));

        try {
          await new Promise((resolve, reject) => {
            setTimeout(() => {
              if (
                (update as unknown as { _shouldFail?: boolean })._shouldFail
              ) {
                reject(new Error('Simulated update failure'));
              } else {
                resolve(undefined);
              }
            }, 100);
          });
        } catch (error) {
          set((s) => ({
            plans: s.plans.map((p) => (p.id === update.id ? previousPlan : p)),
          }));
          throw error;
        }
      },
      getPlansByType: (type) => {
        const state = get();
        return state.plans.filter((p) => p.type === type);
      },

      // Income/Expense slice
      incomes: [],
      expenses: [],
      addIncome: (income) =>
        set((state) => ({ incomes: [...state.incomes, income] })),
      updateIncome: (income) =>
        set((state) => ({
          incomes: state.incomes.map((i) => (i.id === income.id ? income : i)),
        })),
      deleteIncome: (incomeId) =>
        set((state) => ({
          incomes: state.incomes.filter((i) => i.id !== incomeId),
        })),
      setIncomes: (incomes) => set({ incomes }),
      addExpense: (expense) =>
        set((state) => ({ expenses: [...state.expenses, expense] })),
      updateExpense: (expense) =>
        set((state) => ({
          expenses: state.expenses.map((e) =>
            e.id === expense.id ? expense : e
          ),
        })),
      deleteExpense: (expenseId) =>
        set((state) => ({
          expenses: state.expenses.filter((e) => e.id !== expenseId),
        })),
      setExpenses: (expenses) => set({ expenses }),
      clearIncomeExpenses: () => set({ incomes: [], expenses: [] }),
      getIncomeByCategory: () => {
        const state = get();
        const index: Record<string, (typeof state.incomes)[number][]> = {};
        state.incomes.forEach((income) => {
          if (!index[income.category]) {
            index[income.category] = [];
          }
          index[income.category].push(income);
        });
        return index;
      },
      getExpenseByCategory: () => {
        const state = get();
        const index: Record<string, (typeof state.expenses)[number][]> = {};
        state.expenses.forEach((expense) => {
          if (!index[expense.category]) {
            index[expense.category] = [];
          }
          index[expense.category].push(expense);
        });
        return index;
      },
      getIncomeByType: (type) => {
        const state = get();
        return state.incomes.filter((i) => i.type === type);
      },

      // Scenario slice
      scenarios: [],
      currentScenarioId: null,
      snapshots: [],
      flexSpendingConfig: null,
      comparisonResult: null,
      addScenario: (scenario) =>
        set((state) => ({ scenarios: [...state.scenarios, scenario] })),
      updateScenario: (scenario) =>
        set((state) => ({
          scenarios: state.scenarios.map((s) =>
            s.id === scenario.id ? scenario : s
          ),
        })),
      deleteScenario: (scenarioId) =>
        set((state) => ({
          scenarios: state.scenarios.filter((s) => s.id !== scenarioId),
          currentScenarioId:
            state.currentScenarioId === scenarioId
              ? null
              : state.currentScenarioId,
          snapshots: state.snapshots.filter(
            (snap) => snap.scenarioId !== scenarioId
          ),
        })),
      cloneScenario: (scenarioId, newName) =>
        set((state) => {
          const scenarioToClone = state.scenarios.find(
            (s) => s.id === scenarioId
          );
          if (!scenarioToClone) {
            return state;
          }
          const cloned = {
            ...scenarioToClone,
            id: `scenario-${Date.now()}`,
            name: newName,
            parentScenarioId: scenarioToClone.id,
            createdAt: new Date().toISOString().split('T')[0],
            modifiedAt: new Date().toISOString().split('T')[0],
          };
          return {
            scenarios: [...state.scenarios, cloned],
          };
        }),
      setScenarios: (scenarios) => set({ scenarios }),
      getScenario: (scenarioId) =>
        get().scenarios.find((s) => s.id === scenarioId),
      setCurrentScenario: (scenarioId) =>
        set({ currentScenarioId: scenarioId }),
      getCurrentScenario: () => {
        const state = get();
        return state.currentScenarioId
          ? state.scenarios.find((s) => s.id === state.currentScenarioId)
          : undefined;
      },
      clearScenarios: () =>
        set({
          scenarios: [],
          currentScenarioId: null,
          snapshots: [],
          comparisonResult: null,
        }),
      addSnapshot: (snapshot) =>
        set((state) => ({ snapshots: [...state.snapshots, snapshot] })),
      deleteSnapshot: (snapshotId) =>
        set((state) => ({
          snapshots: state.snapshots.filter((s) => s.id !== snapshotId),
        })),
      setFlexSpendingConfig: (config) => set({ flexSpendingConfig: config }),
      setComparisonResult: (result) => set({ comparisonResult: result }),
      clearComparisonResult: () => set({ comparisonResult: null }),
      getScenarioIndex: () => {
        const state = get();
        const index: Record<string, (typeof state.scenarios)[number]> = {};
        state.scenarios.forEach((scenario) => {
          index[scenario.id] = scenario;
        });
        return index;
      },
      getScenariosByBasePlan: (basePlanId) => {
        const state = get();
        return state.scenarios.filter((s) => s.basePlanId === basePlanId);
      },

      // Hydration slice
      _hasHydrated: false,
      setHasHydrated: (state) => set({ _hasHydrated: state }),
    }),
    {
      name: 'open-finance-planner',
      storage: createJSONStorage(() => indexedDBStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
