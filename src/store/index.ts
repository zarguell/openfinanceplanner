import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { StoreState } from './types';
import { indexedDBStorage } from './middleware/indexeddb';

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
