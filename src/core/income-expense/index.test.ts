import { describe, it, expect } from 'vitest';
import type {
  Income,
  Expense,
  ChangeOverTimeEntry,
  BusinessIncome,
  RentalIncome,
  RecurringExpense,
  OneTimeExpense,
} from '../types';
import {
  calculateIncomeAmount,
  calculateExpenseAmount,
  applyChangeOverTime,
  getAmountForYear,
  calculateAnnualIncome,
  calculateAnnualExpense,
  createIncome,
  createExpense,
  validateIncome,
  validateExpense,
  filterByCategory,
  filterByTags,
  filterByDateRange,
} from './index';

describe('calculateIncomeAmount', () => {
  it('should calculate monthly income amount', () => {
    const income = {
      id: 'inc-1',
      type: 'work' as const,
      name: 'Salary',
      amount: 5000,
      frequency: 'monthly' as const,
      startDate: '2024-01-01',
      category: 'salary',
      taxable: true,
    };

    expect(calculateIncomeAmount(income)).toBe(60000);
  });

  it('should calculate yearly income amount', () => {
    const income = {
      id: 'inc-2',
      type: 'work' as const,
      name: 'Bonus',
      amount: 15000,
      frequency: 'yearly' as const,
      startDate: '2024-12-01',
      category: 'bonus',
      taxable: true,
    };

    expect(calculateIncomeAmount(income)).toBe(15000);
  });

  it('should calculate weekly income amount', () => {
    const income = {
      id: 'inc-3',
      type: 'work' as const,
      name: 'Part-time',
      amount: 500,
      frequency: 'weekly' as const,
      startDate: '2024-01-01',
      category: 'part-time',
      taxable: true,
    };

    expect(calculateIncomeAmount(income)).toBe(26000);
  });

  it('should subtract associated expenses from business income', () => {
    const income = {
      id: 'inc-4',
      type: 'business' as const,
      name: 'Freelance',
      amount: 50000,
      frequency: 'yearly' as const,
      startDate: '2024-01-01',
      category: 'business',
      associatedExpenses: 12000,
    };

    expect(calculateIncomeAmount(income)).toBe(38000);
  });

  it('should subtract associated expenses from rental income', () => {
    const income = {
      id: 'inc-5',
      type: 'rental' as const,
      name: 'Rental Property',
      amount: 18000,
      frequency: 'yearly' as const,
      startDate: '2024-01-01',
      category: 'rental',
      associatedExpenses: 5000,
    };

    expect(calculateIncomeAmount(income)).toBe(13000);
  });
});

describe('calculateExpenseAmount', () => {
  it('should calculate monthly recurring expense amount', () => {
    const expense = {
      id: 'exp-1',
      type: 'recurring' as const,
      name: 'Rent',
      amount: 2000,
      frequency: 'monthly' as const,
      startDate: '2024-01-01',
      category: 'housing',
      mandatory: true,
      variable: false,
    };

    expect(calculateExpenseAmount(expense)).toBe(24000);
  });

  it('should calculate one-time expense amount', () => {
    const expense = {
      id: 'exp-2',
      type: 'one-time' as const,
      name: 'Vacation',
      amount: 3000,
      frequency: 'once' as const,
      startDate: '2024-06-15',
      category: 'entertainment',
      status: 'confirmed' as const,
    };

    expect(calculateExpenseAmount(expense)).toBe(3000);
  });

  it('should calculate weekly recurring expense amount', () => {
    const expense = {
      id: 'exp-3',
      type: 'recurring' as const,
      name: 'Groceries',
      amount: 150,
      frequency: 'weekly' as const,
      startDate: '2024-01-01',
      category: 'food',
      mandatory: true,
      variable: true,
    };

    expect(calculateExpenseAmount(expense)).toBe(7800);
  });
});

describe('applyChangeOverTime', () => {
  it('should apply change-over-time entries correctly', () => {
    const changes: ChangeOverTimeEntry[] = [
      { year: 2030, newAmount: 2000, description: 'Refinanced' },
    ];

    const amount2029 = applyChangeOverTime(2500, 2029, changes);
    const amount2030 = applyChangeOverTime(2500, 2030, changes);
    const amount2035 = applyChangeOverTime(2500, 2035, changes);

    expect(amount2029).toBe(2500);
    expect(amount2030).toBe(2000);
    expect(amount2035).toBe(2000);
  });

  it('should apply multiple changes in chronological order', () => {
    const changes: ChangeOverTimeEntry[] = [
      { year: 2030, newAmount: 2000, description: 'First change' },
      { year: 2035, newAmount: 1800, description: 'Second change' },
    ];

    const amount2029 = applyChangeOverTime(2500, 2029, changes);
    const amount2030 = applyChangeOverTime(2500, 2030, changes);
    const amount2035 = applyChangeOverTime(2500, 2035, changes);
    const amount2040 = applyChangeOverTime(2500, 2040, changes);

    expect(amount2029).toBe(2500);
    expect(amount2030).toBe(2000);
    expect(amount2035).toBe(1800);
    expect(amount2040).toBe(1800);
  });

  it('should return original amount if no changes', () => {
    const amount = applyChangeOverTime(2500, 2035, []);
    expect(amount).toBe(2500);
  });
});

describe('getAmountForYear', () => {
  it('should return income amount for specific year', () => {
    const income = {
      id: 'inc-1',
      type: 'work' as const,
      name: 'Salary',
      amount: 5000,
      frequency: 'monthly' as const,
      startDate: '2024-01-01',
      category: 'salary',
      taxable: true,
      changes: [{ year: 2030, newAmount: 6000, description: 'Promotion' }],
    };

    const amount2029 = getAmountForYear(income, 2029);
    const amount2030 = getAmountForYear(income, 2030);

    expect(amount2029).toBe(60000);
    expect(amount2030).toBe(72000);
  });

  it('should return expense amount for specific year', () => {
    const expense = {
      id: 'exp-1',
      type: 'recurring' as const,
      name: 'Rent',
      amount: 2000,
      frequency: 'monthly' as const,
      startDate: '2024-01-01',
      category: 'housing',
      mandatory: true,
      variable: false,
      changes: [{ year: 2030, newAmount: 1800, description: 'Renewal' }],
    };

    const amount2029 = getAmountForYear(expense, 2029);
    const amount2030 = getAmountForYear(expense, 2030);

    expect(amount2029).toBe(24000);
    expect(amount2030).toBe(21600);
  });
});

describe('calculateAnnualIncome', () => {
  it('should sum all income sources for a year', () => {
    const incomes: Income[] = [
      {
        id: 'inc-1',
        type: 'work',
        name: 'Salary',
        amount: 5000,
        frequency: 'monthly',
        startDate: '2024-01-01',
        category: 'salary',
        taxable: true,
      },
      {
        id: 'inc-2',
        type: 'work',
        name: 'Bonus',
        amount: 15000,
        frequency: 'yearly',
        startDate: '2024-12-01',
        category: 'bonus',
        taxable: true,
      },
      {
        id: 'inc-3',
        type: 'rental',
        name: 'Rental',
        amount: 1500,
        frequency: 'monthly',
        startDate: '2024-01-01',
        category: 'rental',
        associatedExpenses: 500,
      },
    ];

    const total = calculateAnnualIncome(incomes, 2024);
    expect(total).toBe(92500);
  });

  it('should apply change-over-time to each income source', () => {
    const incomes: Income[] = [
      {
        id: 'inc-1',
        type: 'work',
        name: 'Salary',
        amount: 5000,
        frequency: 'monthly',
        startDate: '2024-01-01',
        category: 'salary',
        taxable: true,
        changes: [{ year: 2030, newAmount: 6000, description: 'Promotion' }],
      },
    ];

    const total2029 = calculateAnnualIncome(incomes, 2029);
    const total2030 = calculateAnnualIncome(incomes, 2030);

    expect(total2029).toBe(60000);
    expect(total2030).toBe(72000);
  });
});

describe('calculateAnnualExpense', () => {
  it('should sum all expenses for a year', () => {
    const expenses: Expense[] = [
      {
        id: 'exp-1',
        type: 'recurring',
        name: 'Rent',
        amount: 2000,
        frequency: 'monthly',
        startDate: '2024-01-01',
        category: 'housing',
        mandatory: true,
        variable: false,
      },
      {
        id: 'exp-2',
        type: 'recurring',
        name: 'Groceries',
        amount: 500,
        frequency: 'monthly',
        startDate: '2024-01-01',
        category: 'food',
        mandatory: true,
        variable: true,
      },
      {
        id: 'exp-3',
        type: 'one-time',
        name: 'Vacation',
        amount: 3000,
        frequency: 'once',
        startDate: '2024-06-15',
        category: 'entertainment',
        status: 'confirmed',
      },
    ];

    const total = calculateAnnualExpense(expenses, 2024);
    expect(total).toBe(33000);
  });

  it('should apply change-over-time to each expense', () => {
    const expenses: Expense[] = [
      {
        id: 'exp-1',
        type: 'recurring',
        name: 'Rent',
        amount: 2000,
        frequency: 'monthly',
        startDate: '2024-01-01',
        category: 'housing',
        mandatory: true,
        variable: false,
        changes: [{ year: 2030, newAmount: 1800, description: 'Renewal' }],
      },
    ];

    const total2029 = calculateAnnualExpense(expenses, 2029);
    const total2030 = calculateAnnualExpense(expenses, 2030);

    expect(total2029).toBe(24000);
    expect(total2030).toBe(21600);
  });
});

describe('createIncome', () => {
  it('should create work income', () => {
    const income = createIncome({
      type: 'work',
      name: 'Primary Salary',
      amount: 5000,
      frequency: 'monthly',
      startDate: '2024-01-01',
      category: 'salary',
      taxable: true,
    } as Omit<Income, 'id'>);

    expect(income.type).toBe('work');
    expect(income.name).toBe('Primary Salary');
    expect(income.amount).toBe(5000);
    expect(income.id).toBeDefined();
  });

  it('should create business income', () => {
    const income = createIncome({
      type: 'business',
      name: 'Freelance',
      amount: 50000,
      frequency: 'yearly',
      startDate: '2024-01-01',
      category: 'business',
      associatedExpenses: 12000,
    } as Omit<Income, 'id'>);

    expect(income.type).toBe('business');
    expect((income as BusinessIncome).associatedExpenses).toBe(12000);
  });

  it('should create rental income', () => {
    const income = createIncome({
      type: 'rental',
      name: 'Rental Property',
      amount: 1500,
      frequency: 'monthly',
      startDate: '2024-01-01',
      category: 'rental',
      associatedExpenses: 500,
    } as Omit<Income, 'id'>);

    expect(income.type).toBe('rental');
    expect((income as RentalIncome).associatedExpenses).toBe(500);
  });
});

describe('createExpense', () => {
  it('should create recurring expense', () => {
    const expense = createExpense({
      type: 'recurring',
      name: 'Rent',
      amount: 2000,
      frequency: 'monthly',
      startDate: '2024-01-01',
      category: 'housing',
      mandatory: true,
      variable: false,
    } as Omit<Expense, 'id'>);

    expect(expense.type).toBe('recurring');
    expect(expense.name).toBe('Rent');
    expect((expense as RecurringExpense).mandatory).toBe(true);
    expect(expense.id).toBeDefined();
  });

  it('should create one-time expense', () => {
    const expense = createExpense({
      type: 'one-time',
      name: 'Vacation',
      amount: 3000,
      frequency: 'once',
      startDate: '2024-06-15',
      category: 'entertainment',
      status: 'confirmed',
    } as Omit<Expense, 'id'>);

    expect(expense.type).toBe('one-time');
    expect((expense as OneTimeExpense).status).toBe('confirmed');
  });
});

describe('validateIncome', () => {
  it('should validate correct income', () => {
    const income = {
      id: 'inc-1',
      type: 'work' as const,
      name: 'Salary',
      amount: 5000,
      frequency: 'monthly' as const,
      startDate: '2024-01-01',
      category: 'salary',
      taxable: true,
    };

    expect(validateIncome(income)).toBe(true);
  });

  it('should reject income with negative amount', () => {
    const income = {
      id: 'inc-2',
      type: 'work' as const,
      name: 'Salary',
      amount: -5000,
      frequency: 'monthly' as const,
      startDate: '2024-01-01',
      category: 'salary',
      taxable: true,
    };

    expect(validateIncome(income)).toBe(false);
  });

  it('should reject income with invalid date', () => {
    const income = {
      id: 'inc-3',
      type: 'work' as const,
      name: 'Salary',
      amount: 5000,
      frequency: 'monthly' as const,
      startDate: 'not-a-date',
      category: 'salary',
      taxable: true,
    };

    expect(validateIncome(income)).toBe(false);
  });

  it('should reject income with empty name', () => {
    const income = {
      id: 'inc-4',
      type: 'work' as const,
      name: '',
      amount: 5000,
      frequency: 'monthly' as const,
      startDate: '2024-01-01',
      category: 'salary',
      taxable: true,
    };

    expect(validateIncome(income)).toBe(false);
  });

  it('should reject business income with expenses exceeding income', () => {
    const income = {
      id: 'inc-5',
      type: 'business' as const,
      name: 'Business',
      amount: 10000,
      frequency: 'yearly' as const,
      startDate: '2024-01-01',
      category: 'business',
      associatedExpenses: 15000,
    };

    expect(validateIncome(income)).toBe(false);
  });
});

describe('validateExpense', () => {
  it('should validate correct expense', () => {
    const expense = {
      id: 'exp-1',
      type: 'recurring' as const,
      name: 'Rent',
      amount: 2000,
      frequency: 'monthly' as const,
      startDate: '2024-01-01',
      category: 'housing',
      mandatory: true,
      variable: false,
    };

    expect(validateExpense(expense)).toBe(true);
  });

  it('should reject expense with negative amount', () => {
    const expense = {
      id: 'exp-2',
      type: 'recurring' as const,
      name: 'Rent',
      amount: -2000,
      frequency: 'monthly' as const,
      startDate: '2024-01-01',
      category: 'housing',
      mandatory: true,
      variable: false,
    };

    expect(validateExpense(expense)).toBe(false);
  });

  it('should reject expense with invalid date', () => {
    const expense = {
      id: 'exp-3',
      type: 'recurring' as const,
      name: 'Rent',
      amount: 2000,
      frequency: 'monthly' as const,
      startDate: 'not-a-date',
      category: 'housing',
      mandatory: true,
      variable: false,
    };

    expect(validateExpense(expense)).toBe(false);
  });

  it('should reject expense with empty name', () => {
    const expense = {
      id: 'exp-4',
      type: 'recurring' as const,
      name: '',
      amount: 2000,
      frequency: 'monthly' as const,
      startDate: '2024-01-01',
      category: 'housing',
      mandatory: true,
      variable: false,
    };

    expect(validateExpense(expense)).toBe(false);
  });
});

describe('filterByCategory', () => {
  it('should filter incomes by category', () => {
    const incomes: Income[] = [
      {
        id: 'inc-1',
        type: 'work',
        name: 'Salary',
        amount: 5000,
        frequency: 'monthly',
        startDate: '2024-01-01',
        category: 'salary',
        taxable: true,
      },
      {
        id: 'inc-2',
        type: 'work',
        name: 'Bonus',
        amount: 15000,
        frequency: 'yearly',
        startDate: '2024-12-01',
        category: 'bonus',
        taxable: true,
      },
      {
        id: 'inc-3',
        type: 'work',
        name: 'Part-time',
        amount: 2000,
        frequency: 'monthly',
        startDate: '2024-01-01',
        category: 'salary',
        taxable: true,
      },
    ];

    const filtered = filterByCategory(incomes, 'salary');
    expect(filtered).toHaveLength(2);
    expect(filtered[0].name).toBe('Salary');
    expect(filtered[1].name).toBe('Part-time');
  });

  it('should filter expenses by category', () => {
    const expenses: Expense[] = [
      {
        id: 'exp-1',
        type: 'recurring',
        name: 'Rent',
        amount: 2000,
        frequency: 'monthly',
        startDate: '2024-01-01',
        category: 'housing',
        mandatory: true,
        variable: false,
      },
      {
        id: 'exp-2',
        type: 'recurring',
        name: 'Groceries',
        amount: 600,
        frequency: 'monthly',
        startDate: '2024-01-01',
        category: 'food',
        mandatory: true,
        variable: true,
      },
    ];

    const filtered = filterByCategory(expenses, 'housing');
    expect(filtered).toHaveLength(1);
    expect(filtered[0].name).toBe('Rent');
  });
});

describe('filterByTags', () => {
  it('should filter incomes by tags', () => {
    const incomes: Income[] = [
      {
        id: 'inc-1',
        type: 'work',
        name: 'Salary',
        amount: 5000,
        frequency: 'monthly',
        startDate: '2024-01-01',
        category: 'salary',
        taxable: true,
        tags: ['primary', 'full-time'],
      },
      {
        id: 'inc-2',
        type: 'work',
        name: 'Bonus',
        amount: 15000,
        frequency: 'yearly',
        startDate: '2024-12-01',
        category: 'bonus',
        taxable: true,
        tags: ['performance'],
      },
      {
        id: 'inc-3',
        type: 'work',
        name: 'Part-time',
        amount: 2000,
        frequency: 'monthly',
        startDate: '2024-01-01',
        category: 'salary',
        taxable: true,
        tags: ['secondary', 'part-time'],
      },
    ];

    const filtered = filterByTags(incomes, 'primary');
    expect(filtered).toHaveLength(1);
    expect(filtered[0].name).toBe('Salary');
  });

  it('should filter expenses by tags', () => {
    const expenses: Expense[] = [
      {
        id: 'exp-1',
        type: 'recurring',
        name: 'Rent',
        amount: 2000,
        frequency: 'monthly',
        startDate: '2024-01-01',
        category: 'housing',
        mandatory: true,
        variable: false,
        tags: ['essential'],
      },
      {
        id: 'exp-2',
        type: 'recurring',
        name: 'Dining Out',
        amount: 300,
        frequency: 'monthly',
        startDate: '2024-01-01',
        category: 'food',
        mandatory: false,
        variable: true,
        tags: ['discretionary'],
      },
    ];

    const filtered = filterByTags(expenses, 'essential');
    expect(filtered).toHaveLength(1);
    expect(filtered[0].name).toBe('Rent');
  });
});

describe('filterByDateRange', () => {
  it('should filter incomes by date range', () => {
    const incomes: Income[] = [
      {
        id: 'inc-1',
        type: 'work',
        name: 'Current Job',
        amount: 5000,
        frequency: 'monthly',
        startDate: '2024-01-01',
        category: 'salary',
        taxable: true,
      },
      {
        id: 'inc-2',
        type: 'work',
        name: 'Future Job',
        amount: 6000,
        frequency: 'monthly',
        startDate: '2030-01-01',
        category: 'salary',
        taxable: true,
      },
      {
        id: 'inc-3',
        type: 'work',
        name: 'Past Job',
        amount: 4000,
        frequency: 'monthly',
        startDate: '2015-01-01',
        endDate: '2023-12-31',
        category: 'salary',
        taxable: true,
      },
    ];

    const filtered = filterByDateRange(incomes, '2024-01-01', '2029-12-31');
    expect(filtered).toHaveLength(1);
    expect(filtered[0].name).toBe('Current Job');
  });

  it('should filter expenses by date range', () => {
    const expenses: Expense[] = [
      {
        id: 'exp-1',
        type: 'one-time',
        name: 'Past Vacation',
        amount: 3000,
        frequency: 'once',
        startDate: '2020-06-15',
        category: 'entertainment',
        status: 'confirmed',
      },
      {
        id: 'exp-2',
        type: 'one-time',
        name: 'Upcoming Vacation',
        amount: 4000,
        frequency: 'once',
        startDate: '2025-06-15',
        category: 'entertainment',
        status: 'estimated',
      },
    ];

    const filtered = filterByDateRange(expenses, '2024-01-01', '2029-12-31');
    expect(filtered).toHaveLength(1);
    expect(filtered[0].name).toBe('Upcoming Vacation');
  });
});
