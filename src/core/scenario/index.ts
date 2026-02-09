import type {
  Scenario,
  ScenarioSnapshot,
  Plan,
  FlexSpendingRule,
  ScenarioComparisonResult,
  SimulationResult,
  UserProfile,
  Income,
  Expense,
  ScenarioComparisonData,
} from '../types';

/**
 * Flex spending calculation context
 */
type FlexSpendingContext = Readonly<{
  income: number;
  age: number;
  netWorth: number;
  year: number;
  isRetired: boolean;
}>;

/**
 * Clones a scenario with a new ID and name
 * @param scenario - The scenario to clone
 * @param newName - The name for the cloned scenario
 * @param newId - Optional custom ID for the cloned scenario
 * @returns A new Scenario object
 */
export function cloneScenario(
  scenario: Scenario,
  newName: string,
  newId?: string
): Scenario {
  const now = new Date().toISOString().split('T')[0];
  return {
    ...scenario,
    id: newId ?? `scenario-${Date.now()}`,
    name: newName,
    parentScenarioId: scenario.id,
    createdAt: now,
    modifiedAt: now,
    version: scenario.version,
  };
}

/**
 * Creates a snapshot of a scenario at a point in time
 * @param scenarioId - The ID of the scenario to snapshot
 * @param name - The name/description of the snapshot
 * @param plan - The plan data to include in the snapshot
 * @param simulationData - Optional simulation results to include
 * @param profileData - Optional user profile data to include
 * @param incomeData - Optional income data to include
 * @param expenseData - Optional expense data to include
 * @returns A new ScenarioSnapshot object
 */
export function createScenarioSnapshot(
  scenarioId: string,
  name: string,
  plan: Plan,
  simulationData?: readonly SimulationResult[],
  profileData?: UserProfile,
  incomeData?: readonly Income[],
  expenseData?: readonly Expense[]
): ScenarioSnapshot {
  return {
    id: `snapshot-${Date.now()}`,
    scenarioId,
    name,
    createdAt: new Date().toISOString().split('T')[0],
    planData: plan,
    simulationData: simulationData as SimulationResult[] | undefined,
    profileData,
    incomeData,
    expenseData,
  };
}

/**
 * Compares multiple scenarios and generates comparison data
 * @param scenarioIds - IDs of scenarios to compare
 * @param scenarioData - Array of scenario data points with metrics
 * @param year - The year of the data point
 * @param age - The age at the time of the data point
 * @returns A ScenarioComparisonResult object
 */
export function compareScenarios(
  scenarioIds: readonly string[],
  scenarioData: readonly {
    id: string;
    name: string;
    netWorth: number;
    income: number;
    expenses: number;
    cashFlow: number;
  }[],
  year: number,
  age: number
): ScenarioComparisonResult {
  const comparisonData: ScenarioComparisonData[] = [];

  if (scenarioData.length > 0) {
    comparisonData.push({
      year,
      age,
      scenarios: scenarioData.map((data) => ({
        scenarioId: data.id,
        scenarioName: data.name,
        netWorth: data.netWorth,
        income: data.income,
        expenses: data.expenses,
        cashFlow: data.cashFlow,
      })),
    });
  }

  const netWorths = scenarioData.map((d) => d.netWorth);
  const maxNetWorth = netWorths.length > 0 ? Math.max(...netWorths) : 0;
  const minNetWorth = netWorths.length > 0 ? Math.min(...netWorths) : 0;

  const summary = {
    avgNetWorthDiff:
      scenarioData.length > 1 ? Math.abs(netWorths[0] - netWorths[1]) : 0,
    maxNetWorthDiff: scenarioData.length > 1 ? maxNetWorth - minNetWorth : 0,
    maxDiffYear: year,
    highestScenarioId:
      scenarioData.find((d) => d.netWorth === maxNetWorth)?.id ?? '',
    lowestScenarioId:
      scenarioData.find((d) => d.netWorth === minNetWorth)?.id ?? '',
  };

  return {
    id: `comparison-${Date.now()}`,
    scenarioIds,
    comparisonData,
    summary,
    createdAt: new Date().toISOString().split('T')[0],
  };
}

/**
 * Validates a flex spending rule
 * @param rule - The flex spending rule to validate
 * @returns True if the rule is valid, false otherwise
 */
export function validateFlexSpendingRule(rule: FlexSpendingRule): boolean {
  if (!rule.id || rule.id.trim() === '') {
    return false;
  }

  if (!rule.name || rule.name.trim() === '') {
    return false;
  }

  const validOperators = ['>', '>=', '<', '<=', '==', '!='];
  for (const condition of rule.conditions) {
    if (!validOperators.includes(condition.operator)) {
      return false;
    }
  }

  if (rule.baseValue < 0) {
    return false;
  }

  if (rule.minimumAmount !== undefined && rule.minimumAmount < 0) {
    return false;
  }

  if (
    rule.minimumAmount !== undefined &&
    rule.maximumAmount !== undefined &&
    rule.maximumAmount < rule.minimumAmount
  ) {
    return false;
  }

  return true;
}

/**
 * Evaluates a flex spending condition against the context
 * @param condition - The condition to evaluate
 * @param context - The flex spending context
 * @returns True if the condition is met, false otherwise
 */
function evaluateFlexSpendingCondition(
  condition: {
    type: 'age' | 'year' | 'net-worth' | 'retirement-date' | 'always';
    operator: '>' | '>=' | '<' | '<=' | '==' | '!=';
    value: number;
  },
  context: FlexSpendingContext
): boolean {
  if (condition.type === 'always') {
    return true;
  }

  let contextValue: number;

  switch (condition.type) {
    case 'age':
      contextValue = context.age;
      break;
    case 'year':
      contextValue = context.year;
      break;
    case 'net-worth':
      contextValue = context.netWorth;
      break;
    case 'retirement-date':
      contextValue = context.isRetired ? 1 : 0;
      break;
    default:
      return false;
  }

  switch (condition.operator) {
    case '>':
      return contextValue > condition.value;
    case '>=':
      return contextValue >= condition.value;
    case '<':
      return contextValue < condition.value;
    case '<=':
      return contextValue <= condition.value;
    case '==':
      return contextValue === condition.value;
    case '!=':
      return contextValue !== condition.value;
    default:
      return false;
  }
}

/**
 * Calculates flex spending based on a rule and context
 * @param rule - The flex spending rule to apply
 * @param context - The flex spending calculation context
 * @returns The calculated flex spending amount
 */
export function calculateFlexSpending(
  rule: FlexSpendingRule,
  context: FlexSpendingContext
): number {
  if (!rule.enabled) {
    return 0;
  }

  for (const condition of rule.conditions) {
    if (!evaluateFlexSpendingCondition(condition, context)) {
      return 0;
    }
  }

  let amount: number;

  if (rule.isPercentage) {
    amount = (context.income * rule.baseValue) / 100;
  } else {
    amount = rule.baseValue;
  }

  if (rule.minimumAmount !== undefined && amount < rule.minimumAmount) {
    amount = rule.minimumAmount;
  }

  if (rule.maximumAmount !== undefined && amount > rule.maximumAmount) {
    amount = rule.maximumAmount;
  }

  return amount;
}

/**
 * Updates a scenario with new data
 * @param scenario - The scenario to update
 * @param updates - Partial updates to apply
 * @returns A ScenarioUpdateResult object
 */
export function updateScenario(
  scenario: Scenario,
  updates: Partial<Scenario>
): {
  scenario: Scenario;
  success: boolean;
  error?: string;
} {
  try {
    const updatedScenario: Scenario = {
      ...scenario,
      ...updates,
      id: scenario.id,
      modifiedAt: new Date().toISOString().split('T')[0],
      version: scenario.version + 1,
    };

    return {
      scenario: updatedScenario,
      success: true,
    };
  } catch (error) {
    return {
      scenario,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
