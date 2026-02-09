import { describe, it, expect } from 'vitest';
import {
  createGoal,
  updateGoalProgress,
  calculateGoalProgress,
  determineGoalStatus,
  createCashFlowPriority,
  simulatePriorityAllocation,
  generateGoalHeatmapData,
  reorderPriorities,
} from './index';
import type { Goal, CashFlowPriority } from '../types';

describe('createGoal function', () => {
  it('should create a goal with required fields', () => {
    const goal = createGoal({
      name: 'Emergency Fund',
      type: 'emergency-fund',
      targetAmount: 30000,
      targetDate: '2025-06-30',
      startDate: '2024-01-01',
      priority: 'high',
      mandatory: true,
    });

    expect(goal.id).toBeDefined();
    expect(goal.name).toBe('Emergency Fund');
    expect(goal.type).toBe('emergency-fund');
    expect(goal.targetAmount).toBe(30000);
    expect(goal.currentAmount).toBe(0);
    expect(goal.status).toBe('not-started');
    expect(goal.priority).toBe('high');
    expect(goal.mandatory).toBe(true);
  });

  it('should create a goal with optional fields', () => {
    const goal = createGoal({
      name: 'Retirement Savings',
      type: 'retirement-savings',
      targetAmount: 2000000,
      targetDate: '2040-12-31',
      startDate: '2024-01-01',
      priority: 'high',
      mandatory: true,
      currentAmount: 500000,
      monthlyContribution: 1000,
      description: 'Target for comfortable retirement',
      accountId: 'acct-123',
      tags: ['retirement', 'long-term'],
    });

    expect(goal.currentAmount).toBe(500000);
    expect(goal.monthlyContribution).toBe(1000);
    expect(goal.description).toBe('Target for comfortable retirement');
    expect(goal.accountId).toBe('acct-123');
    expect(goal.tags).toEqual(['retirement', 'long-term']);
  });

  it('should generate unique IDs for multiple goals', () => {
    const goal1 = createGoal({
      name: 'Goal 1',
      type: 'other-goal',
      targetAmount: 10000,
      targetDate: '2025-12-31',
      startDate: '2024-01-01',
      priority: 'medium',
      mandatory: false,
    });

    const goal2 = createGoal({
      name: 'Goal 2',
      type: 'other-goal',
      targetAmount: 20000,
      targetDate: '2025-12-31',
      startDate: '2024-01-01',
      priority: 'medium',
      mandatory: false,
    });

    expect(goal1.id).not.toBe(goal2.id);
  });
});

describe('updateGoalProgress function', () => {
  it('should update current amount and recalculate status', () => {
    const goal: Goal = {
      id: 'goal-1',
      name: 'Emergency Fund',
      type: 'emergency-fund',
      targetAmount: 30000,
      currentAmount: 15000,
      targetDate: '2025-06-30',
      startDate: '2024-01-01',
      priority: 'high',
      mandatory: true,
      status: 'in-progress',
      monthlyContribution: 1500,
    };

    const updated = updateGoalProgress(goal, 20000);

    expect(updated.currentAmount).toBe(20000);
    expect(updated.status).not.toBe(goal.status);
  });

  it('should mark goal as completed when target reached', () => {
    const goal: Goal = {
      id: 'goal-1',
      name: 'Vacation Fund',
      type: 'vacation',
      targetAmount: 10000,
      currentAmount: 9500,
      targetDate: '2025-06-30',
      startDate: '2024-01-01',
      priority: 'medium',
      mandatory: false,
      status: 'in-progress',
    };

    const updated = updateGoalProgress(goal, 10000);

    expect(updated.status).toBe('completed');
  });

  it('should preserve immutable properties', () => {
    const goal: Goal = {
      id: 'goal-1',
      name: 'Test Goal',
      type: 'other-goal',
      targetAmount: 10000,
      currentAmount: 5000,
      targetDate: '2025-12-31',
      startDate: '2024-01-01',
      priority: 'medium',
      mandatory: false,
      status: 'in-progress',
      monthlyContribution: 500,
    };

    const updated = updateGoalProgress(goal, 7500);

    expect(updated.id).toBe(goal.id);
    expect(updated.name).toBe(goal.name);
    expect(updated.targetAmount).toBe(goal.targetAmount);
    expect(updated.targetDate).toBe(goal.targetDate);
    expect(updated.priority).toBe(goal.priority);
  });
});

describe('calculateGoalProgress function', () => {
  it('should calculate progress percentage correctly', () => {
    const progress = calculateGoalProgress(5000, 10000);

    expect(progress).toBe(50);
  });

  it('should return 0 for zero current amount', () => {
    const progress = calculateGoalProgress(0, 10000);

    expect(progress).toBe(0);
  });

  it('should return 100 for completed goal', () => {
    const progress = calculateGoalProgress(10000, 10000);

    expect(progress).toBe(100);
  });

  it('should handle overfunded goals', () => {
    const progress = calculateGoalProgress(12000, 10000);

    expect(progress).toBe(100);
  });

  it('should handle decimals correctly', () => {
    const progress = calculateGoalProgress(3333, 10000);

    expect(progress).toBeCloseTo(33.33, 1);
  });
});

describe('determineGoalStatus function', () => {
  it('should determine status based on progress and timeline', () => {
    const status = determineGoalStatus({
      progress: 50,
      startDate: '2024-01-01',
      targetDate: '2025-12-31',
      currentDate: '2024-12-31',
    });

    expect(status).toBe('on-track');
  });

  it('should mark as behind-schedule if progress is low', () => {
    const status = determineGoalStatus({
      progress: 30,
      startDate: '2024-01-01',
      targetDate: '2025-12-31',
      currentDate: '2024-12-31',
    });

    expect(status).toBe('behind-schedule');
  });

  it('should mark as at-risk if very behind', () => {
    const status = determineGoalStatus({
      progress: 10,
      startDate: '2024-01-01',
      targetDate: '2025-06-30',
      currentDate: '2025-01-01',
    });

    expect(status).toBe('at-risk');
  });

  it('should mark as completed if 100% progress', () => {
    const status = determineGoalStatus({
      progress: 100,
      startDate: '2024-01-01',
      targetDate: '2025-12-31',
      currentDate: '2024-12-31',
    });

    expect(status).toBe('completed');
  });

  it('should mark as not-started if 0% progress and just started', () => {
    const status = determineGoalStatus({
      progress: 0,
      startDate: '2024-01-01',
      targetDate: '2025-12-31',
      currentDate: '2024-01-15',
    });

    expect(status).toBe('not-started');
  });
});

describe('createCashFlowPriority function', () => {
  it('should create a priority with required fields', () => {
    const priority = createCashFlowPriority({
      name: 'Essential Expenses',
      order: 1,
      goalIds: ['goal-1', 'goal-2'],
      allocationPercentage: 40,
      mandatory: true,
    });

    expect(priority.id).toBeDefined();
    expect(priority.name).toBe('Essential Expenses');
    expect(priority.order).toBe(1);
    expect(priority.allocationPercentage).toBe(40);
    expect(priority.mandatory).toBe(true);
  });

  it('should create a priority with optional description', () => {
    const priority = createCashFlowPriority({
      name: 'Savings Goals',
      order: 2,
      goalIds: ['goal-3'],
      allocationPercentage: 30,
      mandatory: false,
      description: 'Retirement and education savings',
    });

    expect(priority.description).toBe('Retirement and education savings');
  });

  it('should generate unique IDs for multiple priorities', () => {
    const priority1 = createCashFlowPriority({
      name: 'Priority 1',
      order: 1,
      goalIds: ['goal-1'],
      allocationPercentage: 50,
      mandatory: true,
    });

    const priority2 = createCashFlowPriority({
      name: 'Priority 2',
      order: 2,
      goalIds: ['goal-2'],
      allocationPercentage: 50,
      mandatory: false,
    });

    expect(priority1.id).not.toBe(priority2.id);
  });
});

describe('simulatePriorityAllocation function', () => {
  it('should allocate cash flow based on priority order', () => {
    const priorities: CashFlowPriority[] = [
      {
        id: 'p1',
        name: 'Priority 1',
        order: 1,
        goalIds: ['goal-1'],
        allocationPercentage: 40,
        mandatory: true,
      },
      {
        id: 'p2',
        name: 'Priority 2',
        order: 2,
        goalIds: ['goal-2'],
        allocationPercentage: 30,
        mandatory: false,
      },
    ];

    const goals: Record<string, Goal> = {
      'goal-1': {
        id: 'goal-1',
        name: 'Goal 1',
        type: 'other-goal',
        targetAmount: 10000,
        currentAmount: 0,
        targetDate: '2025-12-31',
        startDate: '2024-01-01',
        priority: 'high',
        mandatory: true,
        status: 'not-started',
      },
      'goal-2': {
        id: 'goal-2',
        name: 'Goal 2',
        type: 'other-goal',
        targetAmount: 10000,
        currentAmount: 0,
        targetDate: '2025-12-31',
        startDate: '2024-01-01',
        priority: 'medium',
        mandatory: false,
        status: 'not-started',
      },
    };

    const result = simulatePriorityAllocation({
      year: 2024,
      cashFlowAvailable: 10000,
      priorities,
      goals,
    });

    expect(result.year).toBe(2024);
    expect(result.allocations).toHaveLength(2);
    expect(result.allocations[0].amountAllocated).toBe(4000);
    expect(result.allocations[1].amountAllocated).toBe(3000);
  });

  it('should handle mandatory priorities first', () => {
    const priorities: CashFlowPriority[] = [
      {
        id: 'p2',
        name: 'Non-Mandatory',
        order: 2,
        goalIds: ['goal-2'],
        allocationPercentage: 50,
        mandatory: false,
      },
      {
        id: 'p1',
        name: 'Mandatory',
        order: 1,
        goalIds: ['goal-1'],
        allocationPercentage: 50,
        mandatory: true,
      },
    ];

    const goals: Record<string, Goal> = {
      'goal-1': {
        id: 'goal-1',
        name: 'Goal 1',
        type: 'other-goal',
        targetAmount: 10000,
        currentAmount: 0,
        targetDate: '2025-12-31',
        startDate: '2024-01-01',
        priority: 'high',
        mandatory: true,
        status: 'not-started',
      },
      'goal-2': {
        id: 'goal-2',
        name: 'Goal 2',
        type: 'other-goal',
        targetAmount: 10000,
        currentAmount: 0,
        targetDate: '2025-12-31',
        startDate: '2024-01-01',
        priority: 'medium',
        mandatory: false,
        status: 'not-started',
      },
    };

    const result = simulatePriorityAllocation({
      year: 2024,
      cashFlowAvailable: 10000,
      priorities,
      goals,
    });

    expect(result.allocations[0].priorityId).toBe('p1');
  });

  it('should stop allocation if cash flow exhausted', () => {
    const priorities: CashFlowPriority[] = [
      {
        id: 'p1',
        name: 'Priority 1',
        order: 1,
        goalIds: ['goal-1'],
        allocationPercentage: 80,
        mandatory: true,
      },
      {
        id: 'p2',
        name: 'Priority 2',
        order: 2,
        goalIds: ['goal-2'],
        allocationPercentage: 30,
        mandatory: false,
      },
    ];

    const goals: Record<string, Goal> = {
      'goal-1': {
        id: 'goal-1',
        name: 'Goal 1',
        type: 'other-goal',
        targetAmount: 10000,
        currentAmount: 0,
        targetDate: '2025-12-31',
        startDate: '2024-01-01',
        priority: 'high',
        mandatory: true,
        status: 'not-started',
      },
      'goal-2': {
        id: 'goal-2',
        name: 'Goal 2',
        type: 'other-goal',
        targetAmount: 10000,
        currentAmount: 0,
        targetDate: '2025-12-31',
        startDate: '2024-01-01',
        priority: 'medium',
        mandatory: false,
        status: 'not-started',
      },
    };

    const result = simulatePriorityAllocation({
      year: 2024,
      cashFlowAvailable: 5000,
      priorities,
      goals,
    });

    expect(result.allocations).toHaveLength(2);
    expect(result.allocations[0].amountAllocated).toBe(4000);
    expect(result.allocations[1].amountAllocated).toBe(1000);
  });
});

describe('generateGoalHeatmapData function', () => {
  it('should generate heatmap data for goals', () => {
    const goals: Goal[] = [
      {
        id: 'goal-1',
        name: 'Retirement Savings',
        type: 'retirement-savings',
        targetAmount: 2000000,
        currentAmount: 500000,
        targetDate: '2040-12-31',
        startDate: '2024-01-01',
        priority: 'high',
        mandatory: true,
        status: 'on-track',
        monthlyContribution: 1000,
      },
      {
        id: 'goal-2',
        name: 'Emergency Fund',
        type: 'emergency-fund',
        targetAmount: 30000,
        currentAmount: 30000,
        targetDate: '2025-06-30',
        startDate: '2024-01-01',
        priority: 'critical',
        mandatory: true,
        status: 'completed',
      },
    ];

    const heatmap = generateGoalHeatmapData(goals, '2024-12-31');

    expect(heatmap).toHaveLength(2);
    expect(heatmap[0].goalId).toBe('goal-1');
    expect(heatmap[0].progress).toBe(25);
    expect(heatmap[1].progress).toBe(100);
    expect(heatmap[1].status).toBe('completed');
  });

  it('should calculate on-track status correctly', () => {
    const goals: Goal[] = [
      {
        id: 'goal-1',
        name: 'On Track Goal',
        type: 'other-goal',
        targetAmount: 10000,
        currentAmount: 4000,
        targetDate: '2025-12-31',
        startDate: '2024-01-01',
        priority: 'medium',
        mandatory: false,
        status: 'on-track',
      },
      {
        id: 'goal-2',
        name: 'Behind Goal',
        type: 'other-goal',
        targetAmount: 10000,
        currentAmount: 1000,
        targetDate: '2025-12-31',
        startDate: '2024-01-01',
        priority: 'medium',
        mandatory: false,
        status: 'behind-schedule',
      },
    ];

    const heatmap = generateGoalHeatmapData(goals, '2024-12-31');

    expect(heatmap[0].onTrack).toBe(true);
    expect(heatmap[1].onTrack).toBe(false);
  });

  it('should calculate months remaining correctly', () => {
    const goals: Goal[] = [
      {
        id: 'goal-1',
        name: 'Goal 1',
        type: 'other-goal',
        targetAmount: 10000,
        currentAmount: 0,
        targetDate: '2025-06-30',
        startDate: '2024-01-01',
        priority: 'medium',
        mandatory: false,
        status: 'not-started',
      },
    ];

    const heatmap = generateGoalHeatmapData(goals, '2024-01-01');

    expect(heatmap[0].monthsRemaining).toBe(18);
  });
});

describe('reorderPriorities function', () => {
  it('should reorder priorities by new order array', () => {
    const priorities: CashFlowPriority[] = [
      {
        id: 'p1',
        name: 'Priority 1',
        order: 1,
        goalIds: ['goal-1'],
        allocationPercentage: 30,
        mandatory: true,
      },
      {
        id: 'p2',
        name: 'Priority 2',
        order: 2,
        goalIds: ['goal-2'],
        allocationPercentage: 40,
        mandatory: false,
      },
      {
        id: 'p3',
        name: 'Priority 3',
        order: 3,
        goalIds: ['goal-3'],
        allocationPercentage: 30,
        mandatory: false,
      },
    ];

    const reordered = reorderPriorities(priorities, ['p3', 'p1', 'p2']);

    expect(reordered[0].id).toBe('p3');
    expect(reordered[0].order).toBe(1);
    expect(reordered[1].id).toBe('p1');
    expect(reordered[1].order).toBe(2);
    expect(reordered[2].id).toBe('p2');
    expect(reordered[2].order).toBe(3);
  });

  it('should maintain priority properties after reorder', () => {
    const priorities: CashFlowPriority[] = [
      {
        id: 'p1',
        name: 'Priority 1',
        order: 1,
        goalIds: ['goal-1'],
        allocationPercentage: 30,
        mandatory: true,
      },
      {
        id: 'p2',
        name: 'Priority 2',
        order: 2,
        goalIds: ['goal-2'],
        allocationPercentage: 40,
        mandatory: false,
      },
    ];

    const reordered = reorderPriorities(priorities, ['p2', 'p1']);

    expect(reordered[0].name).toBe('Priority 2');
    expect(reordered[0].allocationPercentage).toBe(40);
    expect(reordered[0].mandatory).toBe(false);
    expect(reordered[1].name).toBe('Priority 1');
    expect(reordered[1].allocationPercentage).toBe(30);
    expect(reordered[1].mandatory).toBe(true);
  });
});
