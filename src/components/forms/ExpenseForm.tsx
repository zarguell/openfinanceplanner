import { useForm } from '@mantine/form';
import {
  Button,
  Stack,
  Paper,
  Text,
  Group,
  Select,
  TextInput,
  NumberInput,
  Switch,
} from '@mantine/core';
import type { Expense, ExpenseType, RecurrenceFrequency } from '@/core/types';
import { createExpense, validateExpense } from '@/core/income-expense';

export interface ExpenseFormProps {
  onSuccess?: (expense: Expense) => void;
  onCancel?: () => void;
}

const EXPENSE_TYPES = [
  { value: 'recurring', label: 'Recurring Expense' },
  { value: 'one-time', label: 'One-time Expense' },
] as const;

const EXPENSE_CATEGORIES = [
  { value: 'housing', label: 'Housing' },
  { value: 'food', label: 'Food' },
  { value: 'transportation', label: 'Transportation' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'insurance', label: 'Insurance' },
  { value: 'education', label: 'Education' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'shopping', label: 'Shopping' },
  { value: 'debt-payment', label: 'Debt Payment' },
  { value: 'savings', label: 'Savings' },
  { value: 'taxes', label: 'Taxes' },
  { value: 'celebration', label: 'Celebration' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'other-expense', label: 'Other' },
] as const;

const FREQUENCIES = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Bi-weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'yearly', label: 'Yearly' },
] as const;

export function ExpenseForm({ onSuccess, onCancel }: ExpenseFormProps) {
  const form = useForm<{
    name: string;
    type: string;
    amount: number;
    frequency: string;
    startDate: string;
    endDate: string;
    category: string;
    tags: string;
    mandatory: boolean;
    variable: boolean;
    status: string;
  }>({
    mode: 'uncontrolled',
    initialValues: {
      name: '',
      type: 'recurring',
      amount: 0,
      frequency: 'monthly',
      startDate: '',
      endDate: '',
      category: 'housing',
      tags: '',
      mandatory: true,
      variable: false,
      status: 'estimated',
    },
    validate: {
      name: (value) => {
        if (!value || value.trim() === '') return 'Name is required';
        return null;
      },
      amount: (value) => {
        if (!value || value < 0)
          return 'Amount is required and must be positive';
        return null;
      },
      startDate: (value) => {
        if (!value || value.trim() === '') return 'Start date is required';
        if (isNaN(Date.parse(value))) return 'Invalid date';
        return null;
      },
      category: (value) => {
        if (!value || value.trim() === '') return 'Category is required';
        return null;
      },
    },
  });

  const handleSubmit = (values: typeof form.values) => {
    const baseData: any = {
      name: values.name,
      amount: values.amount,
      frequency: values.frequency as RecurrenceFrequency | 'once',
      startDate: values.startDate,
      category: values.category,
      ...(values.tags &&
        values.tags.trim() !== '' && {
          tags: values.tags
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean),
        }),
      ...(values.endDate &&
        values.endDate.trim() !== '' && { endDate: values.endDate }),
    };

    switch (values.type) {
      case 'recurring':
        baseData.type = 'recurring';
        baseData.mandatory = values.mandatory;
        baseData.variable = values.variable;
        break;
      case 'one-time':
        baseData.type = 'one-time';
        baseData.frequency = 'once';
        baseData.status = values.status as 'estimated' | 'confirmed';
        break;
    }

    const expense = createExpense(baseData as Omit<Expense, 'id'>);

    if (validateExpense(expense)) {
      onSuccess?.(expense);
    }
  };

  const expenseType = form.values.type as ExpenseType;

  return (
    <Paper shadow="xs" p="md" withBorder>
      <Text size="lg" fw={500} mb="md">
        Create Expense
      </Text>

      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack>
          <TextInput
            withAsterisk
            label="Expense Name"
            placeholder="e.g., Rent, Groceries, Vacation"
            key={form.key('name')}
            {...form.getInputProps('name')}
          />

          <Select
            withAsterisk
            label="Expense Type"
            placeholder="Select type"
            data={EXPENSE_TYPES}
            key={form.key('type')}
            {...form.getInputProps('type')}
          />

          <Select
            withAsterisk
            label="Category"
            placeholder="Select category"
            data={EXPENSE_CATEGORIES}
            key={form.key('category')}
            {...form.getInputProps('category')}
          />

          <NumberInput
            withAsterisk
            label="Amount ($)"
            placeholder="0"
            min={0}
            decimalScale={2}
            key={form.key('amount')}
            {...form.getInputProps('amount')}
          />

          {expenseType === 'recurring' ? (
            <Select
              withAsterisk
              label="Frequency"
              placeholder="Select frequency"
              data={FREQUENCIES}
              key={form.key('frequency')}
              {...form.getInputProps('frequency')}
            />
          ) : (
            <Select
              withAsterisk
              label="Frequency"
              placeholder="Select frequency"
              data={[{ value: 'once', label: 'Once' }]}
              key={form.key('frequency')}
              {...form.getInputProps('frequency')}
            />
          )}

          <TextInput
            withAsterisk
            label="Date"
            type="date"
            key={form.key('startDate')}
            {...form.getInputProps('startDate')}
          />

          {expenseType === 'recurring' && (
            <TextInput
              label="End Date (optional)"
              type="date"
              placeholder="Optional end date"
              key={form.key('endDate')}
              {...form.getInputProps('endDate')}
            />
          )}

          <TextInput
            label="Tags (comma-separated)"
            placeholder="e.g., essential, groceries"
            key={form.key('tags')}
            {...form.getInputProps('tags')}
          />

          {expenseType === 'recurring' && (
            <Stack>
              <Switch
                label="Mandatory Expense"
                description="Fixed expenses like rent, insurance, utilities"
                key={form.key('mandatory')}
                {...form.getInputProps('mandatory', { type: 'checkbox' })}
              />

              <Switch
                label="Variable Amount"
                description="Amount can vary (e.g., groceries, dining out)"
                key={form.key('variable')}
                {...form.getInputProps('variable', { type: 'checkbox' })}
              />
            </Stack>
          )}

          {expenseType === 'one-time' && (
            <Select
              withAsterisk
              label="Status"
              placeholder="Select status"
              data={[
                { value: 'estimated', label: 'Estimated' },
                { value: 'confirmed', label: 'Confirmed' },
              ]}
              key={form.key('status')}
              {...form.getInputProps('status')}
            />
          )}

          <Group justify="flex-end" mt="md">
            {onCancel && (
              <Button variant="default" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button type="submit">Create Expense</Button>
          </Group>
        </Stack>
      </form>
    </Paper>
  );
}
