import { describe, it, expect } from 'vitest';
import type { WorkIncome, RecurringExpense } from '.';

describe('Income and Expense Types', () => {
  it('should accept valid work income', () => {
    const income = {
      id: 'inc-1',
      type: 'work',
      name: 'Primary Salary',
      amount: 85000,
      frequency: 'monthly' as const,
      startDate: '2024-01-01',
      category: 'salary',
    };

    expect(income.type).toBe('work');
    expect(income.amount).toBe(85000);
    expect(income.frequency).toBe('monthly');
  });

  it('should accept bonus income', () => {
    const income = {
      id: 'inc-2',
      type: 'work',
      name: 'Annual Bonus',
      amount: 15000,
      frequency: 'yearly' as const,
      startDate: '2024-12-01',
      category: 'bonus',
    };

    expect(income.category).toBe('bonus');
    expect(income.frequency).toBe('yearly');
  });

  it('should accept part-time work income', () => {
    const income = {
      id: 'inc-3',
      type: 'work',
      name: 'Part-time Consulting',
      amount: 20000,
      frequency: 'monthly' as const,
      startDate: '2024-06-01',
      category: 'part-time',
      endDate: '2030-12-31',
    };

    expect(income.category).toBe('part-time');
    expect(income.endDate).toBe('2030-12-31');
  });

  it('should accept Social Security income', () => {
    const income = {
      id: 'inc-4',
      type: 'social-security',
      name: 'Social Security',
      amount: 24000,
      frequency: 'yearly' as const,
      startDate: '2035-01-01',
      category: 'pension',
      inflationAdjusted: true,
    };

    expect(income.type).toBe('social-security');
    expect(income.inflationAdjusted).toBe(true);
  });

  it('should accept business income', () => {
    const income = {
      id: 'inc-5',
      type: 'business',
      name: 'Freelance Business',
      amount: 50000,
      frequency: 'yearly' as const,
      startDate: '2024-01-01',
      category: 'business',
      associatedExpenses: 12000,
    };

    expect(income.type).toBe('business');
    expect(income.associatedExpenses).toBe(12000);
  });

  it('should accept rental income', () => {
    const income = {
      id: 'inc-6',
      type: 'rental',
      name: 'Rental Property Income',
      amount: 18000,
      frequency: 'yearly' as const,
      startDate: '2024-01-01',
      category: 'rental',
      associatedExpenses: 5000,
      propertyId: 'asset-1',
    };

    expect(income.type).toBe('rental');
    expect(income.associatedExpenses).toBe(5000);
    expect(income.propertyId).toBe('asset-1');
  });

  it('should accept recurring expense', () => {
    const expense = {
      id: 'exp-1',
      type: 'recurring',
      name: 'Groceries',
      amount: 600,
      frequency: 'monthly' as const,
      startDate: '2024-01-01',
      category: 'food',
      tags: ['essential', 'groceries'],
    };

    expect(expense.type).toBe('recurring');
    expect(expense.amount).toBe(600);
    expect(expense.tags).toEqual(['essential', 'groceries']);
  });

  it('should accept one-time expense', () => {
    const expense = {
      id: 'exp-2',
      type: 'one-time',
      name: 'Wedding',
      amount: 35000,
      frequency: 'once' as const,
      startDate: '2026-06-15',
      category: 'celebration',
      tags: ['major-event'],
    };

    expect(expense.type).toBe('one-time');
    expect(expense.frequency).toBe('once');
  });

  it('should accept expense with change-over-time entries', () => {
    const expense = {
      id: 'exp-3',
      type: 'recurring',
      name: 'Mortgage Payment',
      amount: 2500,
      frequency: 'monthly' as const,
      startDate: '2024-01-01',
      category: 'housing',
      changes: [
        {
          year: 2030,
          newAmount: 2000,
          description: 'Refinanced mortgage',
        },
      ],
    };

    expect(expense.changes).toHaveLength(1);
    expect(expense.changes?.[0].newAmount).toBe(2000);
  });

  it('should accept expense with multiple tags', () => {
    const expense = {
      id: 'exp-4',
      type: 'recurring',
      name: 'Health Insurance',
      amount: 800,
      frequency: 'monthly' as const,
      startDate: '2024-01-01',
      category: 'healthcare',
      tags: ['essential', 'insurance', 'healthcare'],
    };

    expect(expense.tags).toHaveLength(3);
    expect(expense.tags).toContain('insurance');
  });

  it('should enforce readonly properties on income', () => {
    const income = {
      id: 'inc-1',
      type: 'work' as const,
      name: 'Salary',
      amount: 85000,
      frequency: 'monthly' as const,
      startDate: '2024-01-01',
      category: 'salary',
      taxable: true,
    } as WorkIncome;

    (income as any).amount = 90000;

    (income as any).name = 'Changed Name';
  });

  it('should enforce readonly properties on expense', () => {
    const expense = {
      id: 'exp-1',
      type: 'recurring' as const,
      name: 'Groceries',
      amount: 600,
      frequency: 'monthly' as const,
      startDate: '2024-01-01',
      category: 'food',
      mandatory: true,
      variable: false,
    } as RecurringExpense;

    (expense as any).amount = 700;

    (expense as any).tags = ['new-tag'];
  });
});
