import type {
  Goal,
  CashFlowPriority,
  PrioritySimulationResult,
  GoalHeatmapData,
  GoalStatus,
} from '../types';

export function createGoal(config: {
  name: string;
  type: Goal['type'];
  targetAmount: number;
  targetDate: string;
  startDate: string;
  priority: Goal['priority'];
  mandatory: boolean;
  currentAmount?: number;
  monthlyContribution?: number;
  description?: string;
  accountId?: string;
  tags?: ReadonlyArray<string>;
}): Goal {
  return {
    id: `goal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name: config.name,
    type: config.type,
    targetAmount: config.targetAmount,
    currentAmount: config.currentAmount ?? 0,
    targetDate: config.targetDate,
    startDate: config.startDate,
    priority: config.priority,
    mandatory: config.mandatory,
    status:
      config.currentAmount && config.currentAmount > 0
        ? 'in-progress'
        : 'not-started',
    monthlyContribution: config.monthlyContribution,
    description: config.description,
    accountId: config.accountId,
    tags: config.tags,
  };
}

export function updateGoalProgress(goal: Goal, newCurrentAmount: number): Goal {
  const progress = calculateGoalProgress(newCurrentAmount, goal.targetAmount);
  const status = determineGoalStatus({
    progress,
    startDate: goal.startDate,
    targetDate: goal.targetDate,
    currentDate: new Date().toISOString().split('T')[0],
  });

  return {
    ...goal,
    currentAmount: newCurrentAmount,
    status,
  };
}

export function calculateGoalProgress(
  currentAmount: number,
  targetAmount: number
): number {
  if (targetAmount <= 0) return 0;
  const progress = (currentAmount / targetAmount) * 100;
  return Math.min(Math.round(progress * 100) / 100, 100);
}

export function determineGoalStatus(config: {
  progress: number;
  startDate: string;
  targetDate: string;
  currentDate: string;
}): GoalStatus {
  const { progress, startDate, targetDate, currentDate } = config;

  if (progress >= 100) return 'completed';

  const start = new Date(startDate);
  const target = new Date(targetDate);
  const current = new Date(currentDate);

  const totalDuration = target.getTime() - start.getTime();
  const elapsed = current.getTime() - start.getTime();
  const expectedProgress = (elapsed / totalDuration) * 100;

  if (progress === 0 && elapsed < 30 * 24 * 60 * 60 * 1000) {
    return 'not-started';
  }

  if (progress < expectedProgress * 0.5) return 'at-risk';
  if (progress < expectedProgress * 0.8) return 'behind-schedule';
  return 'on-track';
}

export function createCashFlowPriority(config: {
  name: string;
  order: number;
  goalIds: ReadonlyArray<string>;
  allocationPercentage: number;
  mandatory: boolean;
  description?: string;
}): CashFlowPriority {
  return {
    id: `priority-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name: config.name,
    order: config.order,
    goalIds: config.goalIds,
    allocationPercentage: config.allocationPercentage,
    mandatory: config.mandatory,
    description: config.description,
  };
}

export function simulatePriorityAllocation(config: {
  year: number;
  cashFlowAvailable: number;
  priorities: ReadonlyArray<CashFlowPriority>;
  goals: Record<string, Goal>;
}): PrioritySimulationResult {
  const { year, cashFlowAvailable, priorities, goals } = config;

  const sortedPriorities = [...priorities].sort((a, b) => a.order - b.order);
  const allocations: Array<{
    priorityId: string;
    priorityName: string;
    amountAllocated: number;
    percentageAllocated: number;
  }> = [];
  const goalsFunded: Array<{
    goalId: string;
    goalName: string;
    amountFunded: number;
    progress: number;
  }> = [];
  let remainingCashFlow = cashFlowAvailable;

  for (const priority of sortedPriorities) {
    if (remainingCashFlow <= 0) break;

    const theoreticalAllocation =
      (cashFlowAvailable * priority.allocationPercentage) / 100;
    const allocationAmount = Math.min(theoreticalAllocation, remainingCashFlow);

    if (allocationAmount <= 0) continue;

    allocations.push({
      priorityId: priority.id,
      priorityName: priority.name,
      amountAllocated: allocationAmount,
      percentageAllocated: (allocationAmount / cashFlowAvailable) * 100,
    });

    const amountPerGoal =
      priority.goalIds.length > 0
        ? allocationAmount / priority.goalIds.length
        : 0;

    for (const goalId of priority.goalIds) {
      const goal = goals[goalId];
      if (!goal) continue;

      const newAmount = goal.currentAmount + amountPerGoal;
      const progress = calculateGoalProgress(newAmount, goal.targetAmount);

      goalsFunded.push({
        goalId: goal.id,
        goalName: goal.name,
        amountFunded: amountPerGoal,
        progress,
      });
    }

    remainingCashFlow -= allocationAmount;
  }

  return {
    year,
    cashFlowAvailable,
    allocations: allocations as PrioritySimulationResult['allocations'],
    goalsFunded: goalsFunded as PrioritySimulationResult['goalsFunded'],
  };
}

export function generateGoalHeatmapData(
  goals: ReadonlyArray<Goal>,
  currentDate: string
): GoalHeatmapData[] {
  return goals.map((goal) => {
    const progress = calculateGoalProgress(
      goal.currentAmount,
      goal.targetAmount
    );
    const status = determineGoalStatus({
      progress,
      startDate: goal.startDate,
      targetDate: goal.targetDate,
      currentDate,
    });

    const targetDate = new Date(goal.targetDate);
    const current = new Date(currentDate);
    const monthsRemaining = Math.max(
      0,
      (targetDate.getFullYear() - current.getFullYear()) * 12 +
        (targetDate.getMonth() - current.getMonth())
    );

    return {
      goalId: goal.id,
      goalName: goal.name,
      progress,
      status,
      monthsRemaining,
      onTrack: status === 'on-track' || status === 'completed',
    };
  });
}

export function reorderPriorities(
  priorities: ReadonlyArray<CashFlowPriority>,
  newOrderIds: ReadonlyArray<string>
): CashFlowPriority[] {
  const priorityMap = new Map(priorities.map((p) => [p.id, p]));
  const reordered: CashFlowPriority[] = [];

  for (let i = 0; i < newOrderIds.length; i++) {
    const priority = priorityMap.get(newOrderIds[i]);
    if (priority) {
      reordered.push({
        ...priority,
        order: i + 1,
      });
    }
  }

  return reordered;
}
