import type {
  Account,
  Income,
  Expense,
  Goal,
  RecurrenceFrequency,
  CashFlowResult,
  NetWorthComposition,
  ProgressMetrics,
  ProgressPoint,
  SankeyNode,
  SankeyLink,
  SankeyData,
} from '../types';

const FREQUENCY_MULTIPLIERS: Readonly<Record<RecurrenceFrequency, number>> = {
  daily: 365,
  weekly: 52,
  biweekly: 26,
  monthly: 12,
  quarterly: 4,
  yearly: 1,
};

function getFrequencyMultiplier(
  frequency: RecurrenceFrequency | 'once'
): number {
  if (frequency === 'once') {
    return 1;
  }
  return FREQUENCY_MULTIPLIERS[frequency] ?? 1;
}

function applyFrequency(
  amount: number,
  frequency: RecurrenceFrequency | 'once'
): number {
  return amount * getFrequencyMultiplier(frequency);
}

function isActiveInYear(
  item: { startDate: string; endDate?: string },
  year: number
): boolean {
  const startDate = new Date(item.startDate);
  const endDate = item.endDate
    ? new Date(item.endDate)
    : new Date('2099-12-31');
  const itemYear = year;
  const startYear = startDate.getFullYear();
  const endYear = endDate.getFullYear();

  return itemYear >= startYear && itemYear <= endYear;
}

function getAmountWithChanges(
  item: {
    amount: number;
    changes?: readonly { year: number; newAmount: number }[];
  },
  year: number
): number {
  const applicableChanges = (item.changes ?? []).filter((c) => c.year <= year);
  if (applicableChanges.length === 0) {
    return item.amount;
  }
  const latestChange = applicableChanges[applicableChanges.length - 1];
  return latestChange.newAmount;
}

export function calculateCashFlow(
  incomes: readonly Income[],
  expenses: readonly Expense[],
  year: number
): CashFlowResult {
  const activeIncomes = incomes.filter((i) => isActiveInYear(i, year));
  const activeExpenses = expenses.filter((e) => isActiveInYear(e, year));

  const incomeByCategory: Record<string, number> = {};
  const expenseByCategory: Record<string, number> = {};

  for (const income of activeIncomes) {
    const amount = getAmountWithChanges(income, year);
    const yearlyAmount = applyFrequency(amount, income.frequency);
    const category = income.category;
    incomeByCategory[category] =
      (incomeByCategory[category] ?? 0) + yearlyAmount;
  }

  for (const expense of activeExpenses) {
    const amount = getAmountWithChanges(expense, year);
    const yearlyAmount = applyFrequency(amount, expense.frequency);
    const category = expense.category;
    expenseByCategory[category] =
      (expenseByCategory[category] ?? 0) + yearlyAmount;
  }

  const totalIncome = Object.values(incomeByCategory).reduce(
    (a, b) => a + b,
    0
  );
  const totalExpenses = Object.values(expenseByCategory).reduce(
    (a, b) => a + b,
    0
  );

  return {
    totalIncome,
    totalExpenses,
    netCashFlow: totalIncome - totalExpenses,
    byCategory: { ...incomeByCategory, ...expenseByCategory },
  };
}

export function calculateNetWorthComposition(
  accounts: readonly Account[]
): NetWorthComposition {
  const byType: Record<string, number> = {};
  const byAccount: Array<{
    id: string;
    name: string;
    type: string;
    balance: number;
  }> = [];
  let totalAssets = 0;
  let totalLiabilities = 0;

  for (const account of accounts) {
    const balance = account.balance;

    byAccount.push({
      id: account.id,
      name: account.name,
      type: account.type,
      balance,
    });

    if (account.type === 'debts') {
      totalLiabilities += Math.abs(balance);
    } else {
      totalAssets += balance;
    }

    byType[account.type] = (byType[account.type] ?? 0) + balance;
  }

  return {
    totalNetWorth: totalAssets - totalLiabilities,
    totalAssets,
    totalLiabilities,
    byType,
    byAccount,
  };
}

function calculateProgressForGoal(goal: Goal): number {
  return goal.targetAmount > 0 ? goal.currentAmount / goal.targetAmount : 0;
}

function isGoalOnTrack(goal: Goal): boolean {
  const now = new Date();
  const targetDate = new Date(goal.targetDate);
  const startDate = new Date(goal.startDate);

  if (goal.status === 'completed') {
    return true;
  }

  if (goal.status === 'cancelled') {
    return false;
  }

  if (now >= targetDate) {
    return (goal.status as string) === 'completed';
  }

  const totalMonths =
    (targetDate.getFullYear() - startDate.getFullYear()) * 12 +
    (targetDate.getMonth() - startDate.getMonth());
  const elapsedMonths =
    (now.getFullYear() - startDate.getFullYear()) * 12 +
    (now.getMonth() - startDate.getMonth());

  if (totalMonths <= 0 || elapsedMonths <= 0) {
    return goal.currentAmount > 0;
  }

  const expectedProgress = elapsedMonths / totalMonths;
  const actualProgress = calculateProgressForGoal(goal);

  return actualProgress >= expectedProgress * 0.8;
}

function createProgressPoint(goal: Goal): ProgressPoint {
  return {
    goalId: goal.id,
    goalName: goal.name,
    progress: calculateProgressForGoal(goal),
    targetDate: goal.targetDate,
    status: goal.status,
  };
}

export function calculateProgressMetrics(
  goals: readonly Goal[]
): ProgressMetrics {
  const completedGoals = goals.filter((g) => g.status === 'completed');
  const inProgressGoals = goals.filter(
    (g) =>
      g.status === 'in-progress' ||
      g.status === 'on-track' ||
      g.status === 'behind-schedule'
  );
  const onTrackGoals = goals.filter((g) => isGoalOnTrack(g));

  const totalProgress =
    goals.length > 0
      ? goals.reduce((sum, g) => sum + calculateProgressForGoal(g), 0) /
        goals.length
      : 0;

  const progressPoints = goals.map(createProgressPoint);

  return {
    totalProgress,
    completedGoals: completedGoals.length,
    inProgressGoals: inProgressGoals.length,
    onTrackGoals: onTrackGoals.length,
    progressPoints,
  };
}

export function generateCashFlowNodes(
  incomes: readonly Income[],
  expenses: readonly Expense[],
  goals: readonly Goal[],
  year: number
): SankeyNode[] {
  const nodes: SankeyNode[] = [];
  const cashFlow = calculateCashFlow(incomes, expenses, year);

  const incomeCategories = new Set(
    incomes.map((i) => i.category).filter(Boolean)
  );
  const expenseCategories = new Set(
    expenses.map((e) => e.category).filter(Boolean)
  );

  nodes.push({
    id: 'total-income',
    name: 'Total Income',
    category: 'income',
    value: cashFlow.totalIncome,
    color: '#4caf50',
  });

  for (const category of incomeCategories) {
    const amount = cashFlow.byCategory[category] ?? 0;
    if (amount > 0) {
      nodes.push({
        id: `income-${category}`,
        name: category,
        category: 'income',
        value: amount,
        color: '#81c784',
      });
    }
  }

  nodes.push({
    id: 'total-expenses',
    name: 'Total Expenses',
    category: 'expense',
    value: cashFlow.totalExpenses,
    color: '#f44336',
  });

  for (const category of expenseCategories) {
    const amount = cashFlow.byCategory[category] ?? 0;
    if (amount > 0) {
      nodes.push({
        id: `expense-${category}`,
        name: category,
        category: 'expense',
        value: amount,
        color: '#e57373',
      });
    }
  }

  const totalSavingsGoals = goals
    .filter((g) => g.monthlyContribution && g.monthlyContribution > 0)
    .reduce((sum, g) => sum + (g.monthlyContribution ?? 0), 0);

  if (totalSavingsGoals > 0) {
    nodes.push({
      id: 'savings',
      name: 'Savings & Investments',
      category: 'savings',
      value: totalSavingsGoals * 12,
      color: '#2196f3',
    });

    for (const goal of goals) {
      if (goal.monthlyContribution && goal.monthlyContribution > 0) {
        nodes.push({
          id: `goal-${goal.id}`,
          name: goal.name,
          category: 'savings',
          value: goal.monthlyContribution * 12,
          color: '#64b5f6',
        });
      }
    }
  }

  return nodes;
}

export function generateSankeyData(
  incomes: readonly Income[],
  expenses: readonly Expense[],
  goals: readonly Goal[],
  year: number
): SankeyData {
  const nodes = generateCashFlowNodes(incomes, expenses, goals, year);
  const links: SankeyLink[] = [];
  const cashFlow = calculateCashFlow(incomes, expenses, year);

  const incomeCategories = new Set(
    incomes.map((i) => i.category).filter(Boolean)
  );
  const expenseCategories = new Set(
    expenses.map((e) => e.category).filter(Boolean)
  );

  links.push({
    source: 'total-income',
    target: 'total-expenses',
    value: cashFlow.totalExpenses,
  });

  for (const category of incomeCategories) {
    const amount = cashFlow.byCategory[category] ?? 0;
    if (amount > 0) {
      links.push({
        source: `income-${category}`,
        target: 'total-expenses',
        value: amount,
      });
    }
  }

  for (const category of expenseCategories) {
    const amount = cashFlow.byCategory[category] ?? 0;
    if (amount > 0) {
      links.push({
        source: 'total-expenses',
        target: `expense-${category}`,
        value: amount,
      });
    }
  }

  const totalSavingsGoals = goals
    .filter((g) => g.monthlyContribution && g.monthlyContribution > 0)
    .reduce((sum, g) => sum + (g.monthlyContribution ?? 0), 0);

  if (totalSavingsGoals > 0) {
    links.push({
      source: 'total-income',
      target: 'savings',
      value: totalSavingsGoals * 12,
    });

    for (const goal of goals) {
      if (goal.monthlyContribution && goal.monthlyContribution > 0) {
        links.push({
          source: 'savings',
          target: `goal-${goal.id}`,
          value: goal.monthlyContribution * 12,
        });
      }
    }
  }

  return {
    nodes,
    links,
    year,
  };
}

export function generateAnalyticsReport(
  accounts: readonly Account[],
  incomes: readonly Income[],
  expenses: readonly Expense[],
  goals: readonly Goal[],
  years: readonly number[]
): ReadonlyArray<{
  year: number;
  cashFlow: CashFlowResult;
  netWorth: NetWorthComposition;
  progress: ProgressMetrics;
}> {
  return years.map((year) => ({
    year,
    cashFlow: calculateCashFlow(incomes, expenses, year),
    netWorth: calculateNetWorthComposition(accounts),
    progress: calculateProgressMetrics(goals),
  }));
}

export * from './reporting';
