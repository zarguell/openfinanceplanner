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
import type { Income, IncomeType, RecurrenceFrequency } from '@/core/types';
import { createIncome, validateIncome } from '@/core/income-expense';

export interface IncomeFormProps {
  onSuccess?: (income: Income) => void;
  onCancel?: () => void;
}

const INCOME_TYPES = [
  { value: 'work', label: 'Work Income' },
  { value: 'social-security', label: 'Social Security / Pension' },
  { value: 'business', label: 'Business Income' },
  { value: 'rental', label: 'Rental Income' },
  { value: 'investment', label: 'Investment Income' },
] as const;

const INCOME_CATEGORIES = {
  work: [
    { value: 'salary', label: 'Salary' },
    { value: 'bonus', label: 'Bonus' },
    { value: 'part-time', label: 'Part-time' },
  ] as const,
  'social-security': [{ value: 'pension', label: 'Pension' }] as const,
  business: [{ value: 'business', label: 'Business' }] as const,
  rental: [{ value: 'rental', label: 'Rental' }] as const,
  investment: [
    { value: 'dividends', label: 'Dividends' },
    { value: 'capital-gains', label: 'Capital Gains' },
    { value: 'interest', label: 'Interest' },
  ] as const,
} as const;

const FREQUENCIES = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Bi-weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'yearly', label: 'Yearly' },
] as const;

export function IncomeForm({ onSuccess, onCancel }: IncomeFormProps) {
  const form = useForm<{
    name: string;
    type: string;
    amount: number;
    frequency: string;
    startDate: string;
    endDate: string;
    category: string;
    tags: string;
    taxable: boolean;
    employer: string;
    jobTitle: string;
    inflationAdjusted: boolean;
    claimingAge: number;
    associatedExpenses: number;
    businessName: string;
    taxId: string;
    propertyId: string;
    investmentType: string;
    accountId: string;
  }>({
    mode: 'uncontrolled',
    initialValues: {
      name: '',
      type: 'work',
      amount: 0,
      frequency: 'monthly',
      startDate: '',
      endDate: '',
      category: 'salary',
      tags: '',
      taxable: true,
      employer: '',
      jobTitle: '',
      inflationAdjusted: false,
      claimingAge: 65,
      associatedExpenses: 0,
      businessName: '',
      taxId: '',
      propertyId: '',
      investmentType: 'dividends',
      accountId: '',
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
      case 'work':
        baseData.type = 'work';
        baseData.taxable = values.taxable;
        baseData.employer = values.employer || undefined;
        baseData.jobTitle = values.jobTitle || undefined;
        break;
      case 'social-security':
        baseData.type = 'social-security';
        baseData.inflationAdjusted = values.inflationAdjusted;
        baseData.claimingAge = values.claimingAge || undefined;
        break;
      case 'business':
        baseData.type = 'business';
        baseData.associatedExpenses = values.associatedExpenses || 0;
        baseData.businessName = values.businessName || undefined;
        baseData.taxId = values.taxId || undefined;
        break;
      case 'rental':
        baseData.type = 'rental';
        baseData.associatedExpenses = values.associatedExpenses || 0;
        baseData.propertyId = values.propertyId || undefined;
        break;
      case 'investment':
        baseData.type = 'investment';
        baseData.investmentType = values.investmentType;
        baseData.accountId = values.accountId || undefined;
        break;
    }

    const income = createIncome(baseData as Omit<Income, 'id'>);

    if (validateIncome(income)) {
      onSuccess?.(income);
    }
  };

  const incomeType = form.values.type as IncomeType;

  return (
    <Paper shadow="xs" p="md" withBorder>
      <Text size="lg" fw={500} mb="md">
        Create Income Source
      </Text>

      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack>
          <TextInput
            withAsterisk
            label="Income Name"
            placeholder="e.g., Primary Salary, Rental Property"
            key={form.key('name')}
            {...form.getInputProps('name')}
          />

          <Select
            withAsterisk
            label="Income Type"
            placeholder="Select type"
            data={INCOME_TYPES}
            key={form.key('type')}
            {...form.getInputProps('type')}
          />

          <Select
            withAsterisk
            label="Category"
            placeholder="Select category"
            data={
              INCOME_CATEGORIES[incomeType as keyof typeof INCOME_CATEGORIES] ||
              []
            }
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

          <Select
            withAsterisk
            label="Frequency"
            placeholder="Select frequency"
            data={FREQUENCIES}
            key={form.key('frequency')}
            {...form.getInputProps('frequency')}
          />

          <TextInput
            withAsterisk
            label="Start Date"
            type="date"
            key={form.key('startDate')}
            {...form.getInputProps('startDate')}
          />

          <TextInput
            label="End Date (optional)"
            type="date"
            key={form.key('endDate')}
            {...form.getInputProps('endDate')}
          />

          <TextInput
            label="Tags (comma-separated)"
            placeholder="e.g., primary, full-time"
            key={form.key('tags')}
            {...form.getInputProps('tags')}
          />

          {incomeType === 'work' && (
            <Stack>
              <Switch
                label="Taxable Income"
                key={form.key('taxable')}
                {...form.getInputProps('taxable', { type: 'checkbox' })}
              />

              <TextInput
                label="Employer (optional)"
                placeholder="Company name"
                key={form.key('employer')}
                {...form.getInputProps('employer')}
              />

              <TextInput
                label="Job Title (optional)"
                placeholder="e.g., Software Engineer"
                key={form.key('jobTitle')}
                {...form.getInputProps('jobTitle')}
              />
            </Stack>
          )}

          {incomeType === 'social-security' && (
            <Stack>
              <Switch
                label="Inflation Adjusted"
                description="Benefits will be adjusted for inflation over time"
                key={form.key('inflationAdjusted')}
                {...form.getInputProps('inflationAdjusted', {
                  type: 'checkbox',
                })}
              />

              <NumberInput
                label="Claiming Age (optional)"
                placeholder="65"
                min={62}
                max={70}
                key={form.key('claimingAge')}
                {...form.getInputProps('claimingAge')}
              />
            </Stack>
          )}

          {(incomeType === 'business' || incomeType === 'rental') && (
            <Stack>
              <NumberInput
                withAsterisk
                label="Associated Expenses ($)"
                description="Annual expenses associated with this income"
                placeholder="0"
                min={0}
                decimalScale={2}
                key={form.key('associatedExpenses')}
                {...form.getInputProps('associatedExpenses')}
              />

              {incomeType === 'business' && (
                <TextInput
                  label="Business Name (optional)"
                  placeholder="e.g., Consulting Business"
                  key={form.key('businessName')}
                  {...form.getInputProps('businessName')}
                />
              )}

              {incomeType === 'business' && (
                <TextInput
                  label="Tax ID (optional)"
                  placeholder="Tax identification number"
                  key={form.key('taxId')}
                  {...form.getInputProps('taxId')}
                />
              )}

              {incomeType === 'rental' && (
                <TextInput
                  label="Property ID (optional)"
                  placeholder="Associated asset ID"
                  key={form.key('propertyId')}
                  {...form.getInputProps('propertyId')}
                />
              )}
            </Stack>
          )}

          {incomeType === 'investment' && (
            <Stack>
              <Select
                withAsterisk
                label="Investment Type"
                placeholder="Select type"
                data={[
                  { value: 'dividends', label: 'Dividends' },
                  { value: 'capital-gains', label: 'Capital Gains' },
                  { value: 'interest', label: 'Interest' },
                ]}
                key={form.key('investmentType')}
                {...form.getInputProps('investmentType')}
              />

              <TextInput
                label="Account ID (optional)"
                placeholder="Associated investment account"
                key={form.key('accountId')}
                {...form.getInputProps('accountId')}
              />
            </Stack>
          )}

          <Group justify="flex-end" mt="md">
            {onCancel && (
              <Button variant="default" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button type="submit">Create Income</Button>
          </Group>
        </Stack>
      </form>
    </Paper>
  );
}
