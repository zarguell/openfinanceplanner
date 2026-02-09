import type {
  UserProfile,
  SimulationResult,
  Plan,
  Income,
  Expense,
  Scenario,
  ScenarioSnapshot,
  FlexSpendingConfig,
  ScenarioComparisonResult,
} from '@/core/types';

/**
 * Profile slice state and actions
 */
export interface ProfileSlice {
  /** User profile data */
  profile: UserProfile | null;
  /** Set user profile */
  setProfile: (profile: UserProfile) => void;
  /** Clear the user profile */
  clearProfile: () => void;
}

/**
 * Projection slice state and actions
 */
export interface ProjectionSlice {
  /** Projection results array */
  projection: SimulationResult[] | null;
  /** Set projection results */
  setProjection: (projection: SimulationResult[]) => void;
  /** Clear the projection results */
  clearProjection: () => void;
}

/**
 * Plan slice state and actions
 */
export interface PlanSlice {
  /** Array of all plans */
  plans: Plan[];
  /** Currently selected plan ID */
  currentPlanId: string | null;
  /** Add a new plan */
  addPlan: (plan: Plan) => void;
  /** Update an existing plan */
  updatePlan: (plan: Plan) => void;
  /** Delete a plan by ID */
  deletePlan: (planId: string) => void;
  /** Set all plans (replace existing) */
  setPlans: (plans: Plan[]) => void;
  /** Get a plan by ID */
  getPlan: (planId: string) => Plan | undefined;
  /** Set the current/active plan */
  setCurrentPlan: (planId: string) => void;
  /** Get the current plan */
  getCurrentPlan: () => Plan | undefined;
  /** Clear all plans */
  clearPlans: () => void;
}

/**
 * Income and expense slice state and actions
 */
export interface IncomeExpenseSlice {
  /** Array of all income sources */
  incomes: Income[];
  /** Array of all expenses */
  expenses: Expense[];
  /** Add a new income source */
  addIncome: (income: Income) => void;
  /** Update an existing income source */
  updateIncome: (income: Income) => void;
  /** Delete an income source by ID */
  deleteIncome: (incomeId: string) => void;
  /** Set all income sources */
  setIncomes: (incomes: Income[]) => void;
  /** Add a new expense */
  addExpense: (expense: Expense) => void;
  /** Update an existing expense */
  updateExpense: (expense: Expense) => void;
  /** Delete an expense by ID */
  deleteExpense: (expenseId: string) => void;
  /** Set all expenses */
  setExpenses: (expenses: Expense[]) => void;
  /** Clear all incomes and expenses */
  clearIncomeExpenses: () => void;
}

/**
 * Hydration tracking slice
 *
 * Used to prevent UI flash and loading issues during async store hydration.
 * @see https://zustand.docs.pmnd.rs/integrations/persisting-store-data#how-can-i-check-if-my-store-has-been-hydrated
 */
export interface HydrationSlice {
  /** Whether store has finished hydrating from storage */
  _hasHydrated: boolean;
  /** Set hydration state */
  setHasHydrated: (state: boolean) => void;
}

/**
 * Scenario slice state and actions
 */
export interface ScenarioSlice {
  /** Array of all scenarios */
  scenarios: Scenario[];
  /** Currently selected scenario ID */
  currentScenarioId: string | null;
  /** Array of all snapshots */
  snapshots: ScenarioSnapshot[];
  /** Flex spending configuration for current scenario */
  flexSpendingConfig: FlexSpendingConfig | null;
  /** Latest comparison result */
  comparisonResult: ScenarioComparisonResult | null;
  /** Add a new scenario */
  addScenario: (scenario: Scenario) => void;
  /** Update an existing scenario */
  updateScenario: (scenario: Scenario) => void;
  /** Delete a scenario by ID */
  deleteScenario: (scenarioId: string) => void;
  /** Clone an existing scenario */
  cloneScenario: (scenarioId: string, newName: string) => void;
  /** Set all scenarios (replace existing) */
  setScenarios: (scenarios: Scenario[]) => void;
  /** Get a scenario by ID */
  getScenario: (scenarioId: string) => Scenario | undefined;
  /** Set the current/active scenario */
  setCurrentScenario: (scenarioId: string) => void;
  /** Get the current scenario */
  getCurrentScenario: () => Scenario | undefined;
  /** Clear all scenarios */
  clearScenarios: () => void;
  /** Add a snapshot */
  addSnapshot: (snapshot: ScenarioSnapshot) => void;
  /** Delete a snapshot by ID */
  deleteSnapshot: (snapshotId: string) => void;
  /** Set flex spending config */
  setFlexSpendingConfig: (config: FlexSpendingConfig) => void;
  /** Set comparison result */
  setComparisonResult: (result: ScenarioComparisonResult) => void;
  /** Clear comparison result */
  clearComparisonResult: () => void;
}

/**
 * Combined store state type
 *
 * Includes profile, projection, plan, income/expense, scenario, and hydration slices.
 */
export type StoreState = ProfileSlice &
  ProjectionSlice &
  PlanSlice &
  IncomeExpenseSlice &
  ScenarioSlice &
  HydrationSlice;
