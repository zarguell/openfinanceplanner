import { describe, it, expect } from 'vitest';
import type {
  Goal,
  GoalStatus,
  GoalPriority,
  CashFlowPriority,
  PrioritySimulationResult,
  GoalHeatmapData,
} from '../types';

describe('Goal Types', () => {
  it('should accept valid retirement savings goal', () => {
    const goal: Goal = {
      id: 'goal-1',
      name: 'Retirement Savings',
      type: 'retirement-savings',
      targetAmount: 2000000,
      currentAmount: 500000,
      targetDate: '2040-12-31',
      startDate: '2024-01-01',
      priority: 'high',
      mandatory: true,
      status: 'in-progress',
      monthlyContribution: 1000,
    };

    expect(goal.id).toBe('goal-1');
    expect(goal.type).toBe('retirement-savings');
    expect(goal.targetAmount).toBe(2000000);
    expect(goal.currentAmount).toBe(500000);
    expect(goal.priority).toBe('high');
    expect(goal.mandatory).toBe(true);
  });

  it('should accept emergency fund goal', () => {
    const goal: Goal = {
      id: 'goal-2',
      name: 'Emergency Fund',
      type: 'emergency-fund',
      targetAmount: 30000,
      currentAmount: 15000,
      targetDate: '2025-06-30',
      startDate: '2024-01-01',
      priority: 'critical',
      mandatory: true,
      status: 'on-track',
      monthlyContribution: 1500,
    };

    expect(goal.type).toBe('emergency-fund');
    expect(goal.priority).toBe('critical');
    expect(goal.status).toBe('on-track');
  });

  it('should accept debt payoff goal', () => {
    const goal: Goal = {
      id: 'goal-3',
      name: 'Pay Off Credit Cards',
      type: 'debt-payoff',
      targetAmount: 15000,
      currentAmount: 8000,
      targetDate: '2024-12-31',
      startDate: '2024-01-01',
      priority: 'high',
      mandatory: true,
      status: 'behind-schedule',
      monthlyContribution: 700,
    };

    expect(goal.type).toBe('debt-payoff');
    expect(goal.status).toBe('behind-schedule');
  });

  it('should accept home purchase goal', () => {
    const goal: Goal = {
      id: 'goal-4',
      name: 'Down Payment for Home',
      type: 'home-purchase',
      targetAmount: 80000,
      currentAmount: 20000,
      targetDate: '2027-06-30',
      startDate: '2024-01-01',
      priority: 'high',
      mandatory: false,
      status: 'not-started',
      monthlyContribution: 1500,
    };

    expect(goal.type).toBe('home-purchase');
    expect(goal.mandatory).toBe(false);
    expect(goal.status).toBe('not-started');
  });

  it('should accept education goal', () => {
    const goal: Goal = {
      id: 'goal-5',
      name: "Children's College Fund",
      type: 'education',
      targetAmount: 150000,
      currentAmount: 30000,
      targetDate: '2035-08-01',
      startDate: '2024-01-01',
      priority: 'medium',
      mandatory: false,
      status: 'in-progress',
      monthlyContribution: 500,
    };

    expect(goal.type).toBe('education');
    expect(goal.priority).toBe('medium');
  });

  it('should accept vacation goal', () => {
    const goal: Goal = {
      id: 'goal-6',
      name: 'European Vacation',
      type: 'vacation',
      targetAmount: 10000,
      currentAmount: 2000,
      targetDate: '2025-06-01',
      startDate: '2024-01-01',
      priority: 'low',
      mandatory: false,
      status: 'in-progress',
      monthlyContribution: 500,
    };

    expect(goal.type).toBe('vacation');
    expect(goal.priority).toBe('low');
    expect(goal.mandatory).toBe(false);
  });

  it('should accept goal with tags', () => {
    const goal: Goal = {
      id: 'goal-7',
      name: 'Rental Property Down Payment',
      type: 'investment-growth',
      targetAmount: 60000,
      currentAmount: 10000,
      targetDate: '2026-12-31',
      startDate: '2024-01-01',
      priority: 'medium',
      mandatory: false,
      status: 'not-started',
      monthlyContribution: 800,
      tags: ['real-estate', 'investment'],
    };

    expect(goal.tags).toEqual(['real-estate', 'investment']);
  });

  it('should accept goal with description', () => {
    const goal: Goal = {
      id: 'goal-8',
      name: 'New Car Fund',
      type: 'major-purchase',
      targetAmount: 35000,
      currentAmount: 5000,
      targetDate: '2026-03-01',
      startDate: '2024-01-01',
      priority: 'medium',
      mandatory: false,
      status: 'in-progress',
      monthlyContribution: 600,
      description: 'Fund for purchasing a new electric vehicle in 2026',
    };

    expect(goal.description).toBe(
      'Fund for purchasing a new electric vehicle in 2026'
    );
  });

  it('should accept goal with associated account', () => {
    const goal: Goal = {
      id: 'goal-9',
      name: 'IRA Contribution',
      type: 'retirement-savings',
      targetAmount: 6500,
      currentAmount: 2000,
      targetDate: '2024-12-31',
      startDate: '2024-01-01',
      priority: 'high',
      mandatory: false,
      status: 'in-progress',
      monthlyContribution: 500,
      accountId: 'acct-ira-123',
    };

    expect(goal.accountId).toBe('acct-ira-123');
  });

  it('should support all goal status types', () => {
    const statuses: GoalStatus[] = [
      'not-started',
      'in-progress',
      'on-track',
      'behind-schedule',
      'completed',
      'at-risk',
      'cancelled',
    ];

    statuses.forEach((status) => {
      const goal: Goal = {
        id: `goal-${status}`,
        name: 'Test Goal',
        type: 'other-goal',
        targetAmount: 10000,
        currentAmount: 5000,
        targetDate: '2025-12-31',
        startDate: '2024-01-01',
        priority: 'medium',
        mandatory: false,
        status,
      };

      expect(goal.status).toBe(status);
    });
  });

  it('should support all goal priority levels', () => {
    const priorities: GoalPriority[] = ['critical', 'high', 'medium', 'low'];

    priorities.forEach((priority) => {
      const goal: Goal = {
        id: `goal-${priority}`,
        name: 'Test Goal',
        type: 'other-goal',
        targetAmount: 10000,
        currentAmount: 5000,
        targetDate: '2025-12-31',
        startDate: '2024-01-01',
        priority,
        mandatory: false,
        status: 'in-progress',
      };

      expect(goal.priority).toBe(priority);
    });
  });
});

describe('Cash Flow Priority Types', () => {
  it('should accept valid cash flow priority', () => {
    const priority: CashFlowPriority = {
      id: 'priority-1',
      name: 'Essential Expenses',
      order: 1,
      goalIds: ['goal-1', 'goal-2'],
      allocationPercentage: 40,
      mandatory: true,
    };

    expect(priority.id).toBe('priority-1');
    expect(priority.order).toBe(1);
    expect(priority.mandatory).toBe(true);
    expect(priority.allocationPercentage).toBe(40);
  });

  it('should accept priority with multiple goals', () => {
    const priority: CashFlowPriority = {
      id: 'priority-2',
      name: 'Savings Goals',
      order: 2,
      goalIds: ['goal-3', 'goal-4', 'goal-5'],
      allocationPercentage: 30,
      mandatory: false,
    };

    expect(priority.goalIds).toHaveLength(3);
    expect(priority.goalIds).toContain('goal-3');
  });

  it('should accept priority with description', () => {
    const priority: CashFlowPriority = {
      id: 'priority-3',
      name: 'Discretionary Spending',
      order: 3,
      goalIds: ['goal-6'],
      allocationPercentage: 20,
      mandatory: false,
      description: 'Flex spending for entertainment, dining, and hobbies',
    };

    expect(priority.description).toBe(
      'Flex spending for entertainment, dining, and hobbies'
    );
  });

  it('should support 0% allocation', () => {
    const priority: CashFlowPriority = {
      id: 'priority-4',
      name: 'Future Allocation',
      order: 4,
      goalIds: [],
      allocationPercentage: 0,
      mandatory: false,
    };

    expect(priority.allocationPercentage).toBe(0);
    expect(priority.goalIds).toHaveLength(0);
  });
});

describe('Priority Simulation Result Types', () => {
  it('should accept valid simulation result', () => {
    const result: PrioritySimulationResult = {
      year: 2024,
      cashFlowAvailable: 5000,
      allocations: [
        {
          priorityId: 'priority-1',
          priorityName: 'Essential Expenses',
          amountAllocated: 2000,
          percentageAllocated: 40,
        },
        {
          priorityId: 'priority-2',
          priorityName: 'Savings Goals',
          amountAllocated: 1500,
          percentageAllocated: 30,
        },
      ],
      goalsFunded: [
        {
          goalId: 'goal-1',
          goalName: 'Retirement Savings',
          amountFunded: 1000,
          progress: 50,
        },
      ],
    };

    expect(result.year).toBe(2024);
    expect(result.cashFlowAvailable).toBe(5000);
    expect(result.allocations).toHaveLength(2);
    expect(result.goalsFunded).toHaveLength(1);
  });

  it('should support multiple allocations', () => {
    const result: PrioritySimulationResult = {
      year: 2024,
      cashFlowAvailable: 10000,
      allocations: [
        {
          priorityId: 'p1',
          priorityName: 'Priority 1',
          amountAllocated: 3000,
          percentageAllocated: 30,
        },
        {
          priorityId: 'p2',
          priorityName: 'Priority 2',
          amountAllocated: 4000,
          percentageAllocated: 40,
        },
        {
          priorityId: 'p3',
          priorityName: 'Priority 3',
          amountAllocated: 2000,
          percentageAllocated: 20,
        },
      ],
      goalsFunded: [],
    };

    expect(result.allocations).toHaveLength(3);
  });

  it('should support multiple funded goals', () => {
    const result: PrioritySimulationResult = {
      year: 2024,
      cashFlowAvailable: 5000,
      allocations: [],
      goalsFunded: [
        {
          goalId: 'g1',
          goalName: 'Goal 1',
          amountFunded: 1000,
          progress: 10,
        },
        {
          goalId: 'g2',
          goalName: 'Goal 2',
          amountFunded: 2000,
          progress: 20,
        },
        {
          goalId: 'g3',
          goalName: 'Goal 3',
          amountFunded: 1500,
          progress: 15,
        },
      ],
    };

    expect(result.goalsFunded).toHaveLength(3);
  });
});

describe('Goal Heatmap Data Types', () => {
  it('should accept valid heatmap data', () => {
    const data: GoalHeatmapData = {
      goalId: 'goal-1',
      goalName: 'Retirement Savings',
      progress: 25,
      status: 'on-track',
      monthsRemaining: 120,
      onTrack: true,
    };

    expect(data.goalId).toBe('goal-1');
    expect(data.progress).toBe(25);
    expect(data.status).toBe('on-track');
    expect(data.onTrack).toBe(true);
  });

  it('should indicate goal is behind schedule', () => {
    const data: GoalHeatmapData = {
      goalId: 'goal-2',
      goalName: 'Emergency Fund',
      progress: 30,
      status: 'behind-schedule',
      monthsRemaining: 6,
      onTrack: false,
    };

    expect(data.status).toBe('behind-schedule');
    expect(data.onTrack).toBe(false);
  });

  it('should indicate goal is at risk', () => {
    const data: GoalHeatmapData = {
      goalId: 'goal-3',
      goalName: 'Home Down Payment',
      progress: 15,
      status: 'at-risk',
      monthsRemaining: 36,
      onTrack: false,
    };

    expect(data.status).toBe('at-risk');
  });

  it('should indicate completed goal', () => {
    const data: GoalHeatmapData = {
      goalId: 'goal-4',
      goalName: 'Vacation Fund',
      progress: 100,
      status: 'completed',
      monthsRemaining: 0,
      onTrack: true,
    };

    expect(data.progress).toBe(100);
    expect(data.status).toBe('completed');
    expect(data.monthsRemaining).toBe(0);
  });
});
