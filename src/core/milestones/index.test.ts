import { describe, it, expect } from 'vitest';
import type {
  Milestone,
  Event,
  MilestoneCondition,
  MilestoneType,
} from '../types';
import { createMilestone, validateMilestone, createEvent } from './index';

describe('Milestone Types', () => {
  it('should accept valid retirement milestone', () => {
    const milestone: Milestone = {
      id: 'ms-1',
      name: 'Retirement',
      type: 'retirement',
      targetDate: '2035-06-15',
      completed: false,
      conditions: [],
    };

    expect(milestone.id).toBe('ms-1');
    expect(milestone.name).toBe('Retirement');
    expect(milestone.type).toBe('retirement');
    expect(milestone.completed).toBe(false);
  });

  it('should accept career change milestone', () => {
    const milestone: Milestone = {
      id: 'ms-2',
      name: 'Career Change',
      type: 'career-change',
      targetDate: '2027-01-01',
      completed: false,
      conditions: [],
      description: 'Transition to consulting',
    };

    expect(milestone.type).toBe('career-change');
    expect(milestone.description).toBe('Transition to consulting');
  });

  it('should accept asset purchase milestone', () => {
    const milestone: Milestone = {
      id: 'ms-3',
      name: 'Buy Vacation Home',
      type: 'asset-purchase',
      targetDate: '2029-05-01',
      completed: false,
      conditions: [],
      financialImpact: {
        amount: 250000,
        type: 'expense',
        recurring: false,
      },
    };

    expect(milestone.financialImpact?.amount).toBe(250000);
    expect(milestone.financialImpact?.type).toBe('expense');
  });

  it('should accept asset sale milestone', () => {
    const milestone: Milestone = {
      id: 'ms-4',
      name: 'Sell Rental Property',
      type: 'asset-sale',
      targetDate: '2032-03-15',
      completed: false,
      conditions: [],
      financialImpact: {
        amount: 350000,
        type: 'income',
        recurring: false,
      },
    };

    expect(milestone.type).toBe('asset-sale');
    expect(milestone.financialImpact?.type).toBe('income');
  });

  it('should accept family change milestone', () => {
    const milestone: Milestone = {
      id: 'ms-5',
      name: 'Child Born',
      type: 'family-change',
      targetDate: '2026-09-01',
      completed: false,
      conditions: [],
      description: 'First child expected',
      financialImpact: {
        amount: 15000,
        type: 'expense',
        recurring: true,
        frequency: 'monthly',
      },
    };

    expect(milestone.type).toBe('family-change');
    expect(milestone.financialImpact?.recurring).toBe(true);
    expect(milestone.financialImpact?.frequency).toBe('monthly');
  });

  it('should accept milestone with multiple conditions', () => {
    const milestone: Milestone = {
      id: 'ms-6',
      name: 'Early Retirement',
      type: 'retirement',
      targetDate: '2030-12-31',
      completed: false,
      conditions: [
        {
          type: 'age',
          operator: '>=',
          value: 55,
        },
        {
          type: 'net-worth',
          operator: '>=',
          value: 2000000,
        },
        {
          type: 'savings-rate',
          operator: '>=',
          value: 30,
        },
      ],
    };

    expect(milestone.conditions).toHaveLength(3);
    expect(milestone.conditions[0].type).toBe('age');
    expect(milestone.conditions[1].type).toBe('net-worth');
    expect(milestone.conditions[2].type).toBe('savings-rate');
  });

  it('should enforce readonly properties on milestone', () => {
    const milestone: Milestone = {
      id: 'ms-7',
      name: 'Test Milestone',
      type: 'retirement',
      targetDate: '2035-06-15',
      completed: false,
      conditions: [],
    };

    // TypeScript should prevent mutation at compile time
    // @ts-expect-error - Cannot assign to 'completed' because it is a read-only property
    milestone.completed = true;

    // @ts-expect-error - Cannot assign to 'name' because it is a read-only property
    milestone.name = 'Changed Name';
  });
});

describe('Event Types', () => {
  it('should accept valid event', () => {
    const event: Event = {
      id: 'evt-1',
      type: 'income',
      name: 'Job Promotion',
      date: '2025-07-01',
      amount: 20000,
      recurring: false,
      description: 'Annual salary increase',
    };

    expect(event.id).toBe('evt-1');
    expect(event.type).toBe('income');
    expect(event.name).toBe('Job Promotion');
    expect(event.amount).toBe(20000);
  });

  it('should accept recurring expense event', () => {
    const event: Event = {
      id: 'evt-2',
      type: 'expense',
      name: 'Mortgage Payment',
      date: '2024-02-01',
      amount: 2500,
      recurring: true,
      frequency: 'monthly',
      endDate: '2054-02-01',
      category: 'housing',
    };

    expect(event.recurring).toBe(true);
    expect(event.frequency).toBe('monthly');
    expect(event.category).toBe('housing');
    expect(event.endDate).toBe('2054-02-01');
  });

  it('should accept one-time expense event', () => {
    const event: Event = {
      id: 'evt-3',
      type: 'expense',
      name: 'Wedding',
      date: '2026-06-15',
      amount: 35000,
      recurring: false,
      category: 'celebration',
    };

    expect(event.recurring).toBe(false);
    expect(event.category).toBe('celebration');
  });

  it('should enforce readonly properties on event', () => {
    const event: Event = {
      id: 'evt-4',
      type: 'income',
      name: 'Bonus',
      date: '2024-12-15',
      amount: 5000,
      recurring: false,
    };

    // TypeScript should prevent mutation at compile time
    // @ts-expect-error - Cannot assign to 'amount' because it is a read-only property
    event.amount = 6000;

    // @ts-expect-error - Cannot assign to 'type' because it is a read-only property
    event.type = 'expense';
  });
});

describe('Milestone Condition Types', () => {
  it('should accept age-based condition', () => {
    const condition: MilestoneCondition = {
      type: 'age',
      operator: '>=',
      value: 65,
    };

    expect(condition.type).toBe('age');
    expect(condition.operator).toBe('>=');
    expect(condition.value).toBe(65);
  });

  it('should accept net-worth condition', () => {
    const condition: MilestoneCondition = {
      type: 'net-worth',
      operator: '>=',
      value: 1500000,
    };

    expect(condition.type).toBe('net-worth');
    expect(condition.value).toBe(1500000);
  });

  it('should accept savings-rate condition', () => {
    const condition: MilestoneCondition = {
      type: 'savings-rate',
      operator: '>=',
      value: 20,
    };

    expect(condition.type).toBe('savings-rate');
    expect(condition.value).toBe(20);
  });

  it('should accept debt-ratio condition', () => {
    const condition: MilestoneCondition = {
      type: 'debt-ratio',
      operator: '<=',
      value: 0.3,
    };

    expect(condition.type).toBe('debt-ratio');
    expect(condition.operator).toBe('<=');
    expect(condition.value).toBe(0.3);
  });

  it('should accept date-based condition', () => {
    const condition: MilestoneCondition = {
      type: 'date',
      operator: '>=',
      value: '2030-01-01',
    };

    expect(condition.type).toBe('date');
    expect(condition.value).toBe('2030-01-01');
  });

  it('should support all comparison operators', () => {
    const operators = ['>', '>=', '<', '<=', '==', '!='] as const;

    operators.forEach((op) => {
      const condition: MilestoneCondition = {
        type: 'age',
        operator: op,
        value: 60,
      };

      expect(condition.operator).toBe(op);
    });
  });
});

describe('createMilestone function', () => {
  it('should create a retirement milestone', () => {
    const milestone = createMilestone({
      type: 'retirement',
      name: 'Retirement',
      targetDate: '2035-06-15',
    });

    expect(milestone.type).toBe('retirement');
    expect(milestone.name).toBe('Retirement');
    expect(milestone.targetDate).toBe('2035-06-15');
    expect(milestone.completed).toBe(false);
    expect(milestone.conditions).toEqual([]);
    expect(milestone.id).toBeDefined();
  });

  it('should create a milestone with conditions', () => {
    const milestone = createMilestone({
      type: 'retirement',
      name: 'Early Retirement',
      targetDate: '2030-12-31',
      conditions: [
        { type: 'age', operator: '>=', value: 55 },
        { type: 'net-worth', operator: '>=', value: 2000000 },
      ],
    });

    expect(milestone.conditions).toHaveLength(2);
    expect(milestone.conditions[0].type).toBe('age');
  });

  it('should create a milestone with financial impact', () => {
    const milestone = createMilestone({
      type: 'asset-purchase',
      name: 'Buy Vacation Home',
      targetDate: '2029-05-01',
      financialImpact: {
        amount: 250000,
        type: 'expense',
        recurring: false,
      },
    });

    expect(milestone.financialImpact?.amount).toBe(250000);
    expect(milestone.financialImpact?.type).toBe('expense');
  });
});

describe('validateMilestone function', () => {
  it('should validate a correct milestone', () => {
    const milestone: Milestone = {
      id: 'ms-1',
      name: 'Retirement',
      type: 'retirement',
      targetDate: '2035-06-15',
      completed: false,
      conditions: [],
    };

    expect(validateMilestone(milestone)).toBe(true);
  });

  it('should reject milestone with invalid date', () => {
    const milestone: Milestone = {
      id: 'ms-2',
      name: 'Invalid Date',
      type: 'retirement',
      targetDate: 'not-a-date',
      completed: false,
      conditions: [],
    };

    expect(validateMilestone(milestone)).toBe(false);
  });

  it('should reject milestone with empty name', () => {
    const milestone: Milestone = {
      id: 'ms-3',
      name: '',
      type: 'retirement',
      targetDate: '2035-06-15',
      completed: false,
      conditions: [],
    };

    expect(validateMilestone(milestone)).toBe(false);
  });

  it('should reject milestone with invalid type', () => {
    const milestone = {
      id: 'ms-4',
      name: 'Invalid Type',
      type: 'invalid-type' as MilestoneType,
      targetDate: '2035-06-15',
      completed: false,
      conditions: [],
    };

    expect(validateMilestone(milestone)).toBe(false);
  });

  it('should reject milestone with invalid financial impact', () => {
    const milestone = {
      id: 'ms-5',
      name: 'Invalid Impact',
      type: 'asset-purchase',
      targetDate: '2029-05-01',
      completed: false,
      conditions: [],
      financialImpact: {
        amount: -100, // Negative amount
        type: 'expense',
        recurring: false,
      },
    };

    expect(validateMilestone(milestone as Milestone)).toBe(false);
  });
});

describe('createEvent function', () => {
  it('should create an income event', () => {
    const event = createEvent({
      type: 'income',
      name: 'Job Promotion',
      date: '2025-07-01',
      amount: 20000,
    });

    expect(event.type).toBe('income');
    expect(event.name).toBe('Job Promotion');
    expect(event.amount).toBe(20000);
    expect(event.recurring).toBe(false);
    expect(event.id).toBeDefined();
  });

  it('should create a recurring expense event', () => {
    const event = createEvent({
      type: 'expense',
      name: 'Mortgage Payment',
      date: '2024-02-01',
      amount: 2500,
      recurring: true,
      frequency: 'monthly',
    });

    expect(event.recurring).toBe(true);
    expect(event.frequency).toBe('monthly');
  });

  it('should create an event with category', () => {
    const event = createEvent({
      type: 'expense',
      name: 'Groceries',
      date: '2024-02-01',
      amount: 500,
      recurring: true,
      frequency: 'weekly',
      category: 'food',
    });

    expect(event.category).toBe('food');
  });
});
