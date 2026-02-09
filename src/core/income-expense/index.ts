import type { Income, Expense, ChangeOverTimeEntry } from '../types';

const FREQUENCY_MULTIPLIERS: Readonly<Record<string, number>> = {
  once: 1,
  yearly: 1,
  monthly: 12,
  quarterly: 4,
  biweekly: 26,
  weekly: 52,
  daily: 365,
};

function isValidDate(dateString: string): boolean {
  return !isNaN(Date.parse(dateString));
}

export function calculateIncomeAmount(income: Income): number {
  let netIncome = income.amount * FREQUENCY_MULTIPLIERS[income.frequency];

  if (income.type === 'business' || income.type === 'rental') {
    netIncome -= income.associatedExpenses;
  }

  return Math.max(0, netIncome);
}

export function calculateExpenseAmount(expense: Expense): number {
  return expense.amount * FREQUENCY_MULTIPLIERS[expense.frequency];
}

export function applyChangeOverTime(
  baseAmount: number,
  year: number,
  changes: ReadonlyArray<ChangeOverTimeEntry>
): number {
  if (!changes || changes.length === 0) {
    return baseAmount;
  }

  const sortedChanges = [...changes].sort((a, b) => a.year - b.year);

  let applicableAmount = baseAmount;

  for (const change of sortedChanges) {
    if (year >= change.year) {
      applicableAmount = change.newAmount;
    }
  }

  return applicableAmount;
}

export function getAmountForYear(item: Income | Expense, year: number): number {
  const isIncome =
    'taxable' in item ||
    'inflationAdjusted' in item ||
    'associatedExpenses' in item ||
    'investmentType' in item;

  let baseAmount: number;

  if (isIncome) {
    const income = item as Income;
    baseAmount = income.amount;

    const changes = item.changes;
    if (changes) {
      baseAmount = applyChangeOverTime(baseAmount, year, changes);
    }

    if (income.type === 'business' || income.type === 'rental') {
      baseAmount -=
        income.associatedExpenses / FREQUENCY_MULTIPLIERS[income.frequency];
    }
  } else {
    baseAmount = (item as Expense).amount;

    const changes = item.changes;
    if (changes) {
      baseAmount = applyChangeOverTime(baseAmount, year, changes);
    }
  }

  baseAmount = Math.max(0, baseAmount);

  return baseAmount * FREQUENCY_MULTIPLIERS[item.frequency];
}

export function calculateAnnualIncome(
  incomes: ReadonlyArray<Income>,
  year: number
): number {
  return incomes.reduce((total, income) => {
    return total + getAmountForYear(income, year);
  }, 0);
}

export function calculateAnnualExpense(
  expenses: ReadonlyArray<Expense>,
  year: number
): number {
  return expenses.reduce((total, expense) => {
    return total + getAmountForYear(expense, year);
  }, 0);
}

export function createIncome(params: Omit<Income, 'id'>): Income {
  const id = `inc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  return {
    id,
    ...params,
  } as Income;
}

export function createExpense(params: Omit<Expense, 'id'>): Expense {
  const id = `exp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  return {
    id,
    ...params,
  } as Expense;
}

export function validateIncome(income: Income): boolean {
  if (!income.name || income.name.trim() === '') {
    return false;
  }

  if (income.amount < 0) {
    return false;
  }

  if (!isValidDate(income.startDate)) {
    return false;
  }

  if (
    (income.type === 'business' || income.type === 'rental') &&
    income.associatedExpenses >=
      income.amount * FREQUENCY_MULTIPLIERS[income.frequency]
  ) {
    return false;
  }

  return true;
}

export function validateExpense(expense: Expense): boolean {
  if (!expense.name || expense.name.trim() === '') {
    return false;
  }

  if (expense.amount < 0) {
    return false;
  }

  if (!isValidDate(expense.startDate)) {
    return false;
  }

  return true;
}

export function filterByCategory<T extends Income | Expense>(
  items: ReadonlyArray<T>,
  category: string
): ReadonlyArray<T> {
  return items.filter((item) => item.category === category);
}

export function filterByTags<T extends Income | Expense>(
  items: ReadonlyArray<T>,
  tag: string
): ReadonlyArray<T> {
  return items.filter((item) => item.tags?.includes(tag) ?? false);
}

export function filterByDateRange<T extends Income | Expense>(
  items: ReadonlyArray<T>,
  startDate: string,
  endDate: string
): ReadonlyArray<T> {
  const start = new Date(startDate);
  const end = new Date(endDate);

  return items.filter((item) => {
    const itemStart = new Date(item.startDate);
    const isOnce = item.frequency === 'once';

    if (isOnce) {
      return itemStart >= start && itemStart <= end;
    }

    const itemEnd = item.endDate
      ? new Date(item.endDate)
      : new Date('2100-12-31');

    return itemStart <= end && itemEnd >= start;
  });
}
