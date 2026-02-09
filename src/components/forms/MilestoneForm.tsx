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
  Textarea,
  Switch,
} from '@mantine/core';
import type {
  Milestone,
  MilestoneCondition,
  MilestoneType,
  RecurrenceFrequency,
} from '@/core/types';
import { createMilestone, validateMilestoneCondition } from '@/core/milestones';

export interface MilestoneFormProps {
  onSuccess?: (milestone: Milestone) => void;
  onCancel?: () => void;
}

const MILESTONE_TYPES = [
  { value: 'retirement', label: 'Retirement' },
  { value: 'career-change', label: 'Career Change' },
  { value: 'asset-purchase', label: 'Asset Purchase' },
  { value: 'asset-sale', label: 'Asset Sale' },
  { value: 'family-change', label: 'Family Change' },
  { value: 'other-milestone', label: 'Other' },
] as const;

const CONDITION_TYPES = [
  { value: 'age', label: 'Age' },
  { value: 'net-worth', label: 'Net Worth' },
  { value: 'savings-rate', label: 'Savings Rate (%)' },
  { value: 'debt-ratio', label: 'Debt Ratio' },
  { value: 'date', label: 'Date' },
] as const;

const OPERATORS = [
  { value: '>', label: 'Greater than (>)' },
  { value: '>=', label: 'Greater than or equal (>=)' },
  { value: '<', label: 'Less than (<)' },
  { value: '<=', label: 'Less than or equal (<=)' },
  { value: '==', label: 'Equal (==)' },
  { value: '!=', label: 'Not equal (!=)' },
] as const;

export function MilestoneForm({ onSuccess, onCancel }: MilestoneFormProps) {
  const form = useForm<{
    name: string;
    type: string;
    targetDate: string;
    description: string;
    priority: number;
    hasFinancialImpact: boolean;
    financialAmount: number | '';
    financialType: string;
    recurring: boolean;
    frequency: string;
    conditions: Array<{
      type: string;
      operator: string;
      value: string | number;
    }>;
  }>({
    mode: 'uncontrolled',
    initialValues: {
      name: '',
      type: 'retirement',
      targetDate: '',
      description: '',
      priority: 5,
      hasFinancialImpact: false,
      financialAmount: '',
      financialType: 'expense',
      recurring: false,
      frequency: 'monthly',
      conditions: [],
    },
    validate: {
      name: (value) => {
        if (!value || value.trim() === '') return 'Name is required';
        return null;
      },
      type: (value) => {
        if (!value || value.trim() === '') return 'Type is required';
        return null;
      },
      targetDate: (value) => {
        if (!value || value.trim() === '') return 'Target date is required';
        if (isNaN(Date.parse(value))) return 'Invalid date';
        return null;
      },
      priority: (value) => {
        if (isNaN(Number(value))) return 'Priority must be a number';
        if (value < 0) return 'Priority cannot be negative';
        return null;
      },
      financialAmount: (value, values) => {
        if (
          values.hasFinancialImpact &&
          (value === '' || isNaN(Number(value)))
        ) {
          return 'Amount is required when financial impact is enabled';
        }
        if (values.hasFinancialImpact && Number(value) < 0) {
          return 'Amount cannot be negative';
        }
        return null;
      },
    },
  });

  const addCondition = () => {
    form.insertListItem('conditions', {
      type: 'age',
      operator: '>=',
      value: '',
    });
  };

  const removeCondition = (index: number) => {
    form.removeListItem('conditions', index);
  };

  const handleSubmit = (values: typeof form.values) => {
    const conditions: MilestoneCondition[] = values.conditions
      .filter((c) => c.type && c.operator && c.value !== '')
      .map((c) => ({
        type: c.type as MilestoneCondition['type'],
        operator: c.operator as MilestoneCondition['operator'],
        value: c.value,
      }))
      .filter(validateMilestoneCondition);

    const financialImpact = values.hasFinancialImpact
      ? {
          amount: Number(values.financialAmount),
          type: values.financialType as 'income' | 'expense',
          recurring: values.recurring,
          ...(values.recurring && {
            frequency: values.frequency as RecurrenceFrequency,
          }),
        }
      : undefined;

    const milestone = createMilestone({
      name: values.name,
      type: values.type as MilestoneType,
      targetDate: values.targetDate,
      description: values.description || undefined,
      priority: values.priority,
      financialImpact,
      conditions: conditions.length > 0 ? conditions : undefined,
    });

    if (onSuccess) {
      onSuccess(milestone);
    }
  };

  return (
    <Paper shadow="xs" p="md" withBorder>
      <Text size="lg" fw={500} mb="md">
        Create Milestone
      </Text>

      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack>
          <TextInput
            withAsterisk
            label="Milestone Name"
            placeholder="e.g., Retirement, Buy House"
            key={form.key('name')}
            {...form.getInputProps('name')}
          />

          <Select
            withAsterisk
            label="Milestone Type"
            placeholder="Select type"
            data={MILESTONE_TYPES}
            key={form.key('type')}
            {...form.getInputProps('type')}
          />

          <TextInput
            withAsterisk
            label="Target Date"
            type="date"
            key={form.key('targetDate')}
            {...form.getInputProps('targetDate')}
          />

          <NumberInput
            label="Priority (lower = higher priority)"
            placeholder="5"
            min={0}
            key={form.key('priority')}
            {...form.getInputProps('priority')}
          />

          <Textarea
            label="Description"
            placeholder="Optional description of this milestone"
            minRows={2}
            key={form.key('description')}
            {...form.getInputProps('description')}
          />

          <Switch
            label="This milestone has a financial impact"
            key={form.key('hasFinancialImpact')}
            {...form.getInputProps('hasFinancialImpact', { type: 'checkbox' })}
          />

          {form.values.hasFinancialImpact && (
            <Stack pl="md">
              <Select
                label="Financial Impact Type"
                data={[
                  { value: 'income', label: 'Income' },
                  { value: 'expense', label: 'Expense' },
                ]}
                key={form.key('financialType')}
                {...form.getInputProps('financialType')}
              />

              <NumberInput
                withAsterisk
                label="Amount ($)"
                placeholder="0"
                min={0}
                key={form.key('financialAmount')}
                {...form.getInputProps('financialAmount')}
              />

              <Switch
                label="Recurring"
                key={form.key('recurring')}
                {...form.getInputProps('recurring', { type: 'checkbox' })}
              />

              {form.values.recurring && (
                <Select
                  label="Frequency"
                  data={[
                    { value: 'daily', label: 'Daily' },
                    { value: 'weekly', label: 'Weekly' },
                    { value: 'biweekly', label: 'Bi-weekly' },
                    { value: 'monthly', label: 'Monthly' },
                    { value: 'quarterly', label: 'Quarterly' },
                    { value: 'yearly', label: 'Yearly' },
                  ]}
                  key={form.key('frequency')}
                  {...form.getInputProps('frequency')}
                />
              )}
            </Stack>
          )}

          <Stack>
            <Group justify="space-between">
              <Text fw={500}>Conditions (optional)</Text>
              <Button size="xs" variant="light" onClick={addCondition}>
                Add Condition
              </Button>
            </Group>

            {form.values.conditions.length === 0 && (
              <Text size="sm" c="dimmed">
                No conditions added. This milestone will activate on the target
                date.
              </Text>
            )}

            {form.values.conditions.map((condition, index) => (
              <Group key={index} gap="xs">
                <Select
                  size="xs"
                  placeholder="Type"
                  data={CONDITION_TYPES}
                  key={form.key(`conditions.${index}.type`)}
                  {...form.getInputProps(`conditions.${index}.type`)}
                />

                <Select
                  size="xs"
                  placeholder="Operator"
                  data={OPERATORS}
                  key={form.key(`conditions.${index}.operator`)}
                  {...form.getInputProps(`conditions.${index}.operator`)}
                />

                {condition.type === 'date' ? (
                  <TextInput
                    size="xs"
                    placeholder="Date"
                    type="date"
                    key={form.key(`conditions.${index}.value`)}
                    {...form.getInputProps(`conditions.${index}.value`)}
                  />
                ) : (
                  <NumberInput
                    size="xs"
                    placeholder="Value"
                    key={form.key(`conditions.${index}.value`)}
                    {...form.getInputProps(`conditions.${index}.value`)}
                  />
                )}

                <Button
                  size="xs"
                  variant="subtle"
                  color="red"
                  onClick={() => removeCondition(index)}
                >
                  Remove
                </Button>
              </Group>
            ))}
          </Stack>

          <Group justify="flex-end" mt="md">
            {onCancel && (
              <Button variant="default" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button type="submit">Create Milestone</Button>
          </Group>
        </Stack>
      </form>
    </Paper>
  );
}
