import { useForm } from '@mantine/form';
import { Button, Stack, Paper, Text, Group } from '@mantine/core';
import { useStore } from '@/store';
import type { UserProfile } from '@/core/types';
import { NumericInput } from './NumericInput';

export function ProfileForm() {
  const setProfile = useStore((state) => state.setProfile);

  const form = useForm<{
    age: number | string;
    currentSavings: number | string;
    annualSpending: number | string;
    annualGrowthRate: number | string;
  }>({
    mode: 'uncontrolled',
    initialValues: {
      age: '',
      currentSavings: '',
      annualSpending: '',
      annualGrowthRate: 7,
    },
    validate: {
      age: (value) => {
        if (!value || value === '') return 'Age is required';
        const num = typeof value === 'string' ? parseFloat(value) : value;
        if (isNaN(num)) return 'Must be a valid number';
        if (num < 18) return 'Must be at least 18';
        if (num > 100) return 'Must be less than 100';
        return null;
      },
      currentSavings: (value) => {
        if (!value || value === '') return 'Savings is required';
        const num = typeof value === 'string' ? parseFloat(value) : value;
        if (isNaN(num) || num < 0) return 'Must be a positive number';
        return null;
      },
      annualSpending: (value) => {
        if (!value || value === '') return 'Annual spending is required';
        const num = typeof value === 'string' ? parseFloat(value) : value;
        if (isNaN(num) || num < 0) return 'Must be a positive number';
        return null;
      },
      annualGrowthRate: (value) => {
        const num = typeof value === 'string' ? parseFloat(value) : value;
        if (isNaN(num)) return 'Must be a valid number';
        if (num < 0) return 'Cannot be negative';
        if (num > 100) return 'Unrealistic growth rate';
        return null;
      },
    },
  });

  const handleSubmit = (values: typeof form.values) => {
    const profile: UserProfile = {
      age: Number(values.age),
      currentSavings: Number(values.currentSavings),
      annualSpending: Number(values.annualSpending),
      annualGrowthRate: Number(values.annualGrowthRate),
    };
    setProfile(profile);
  };

  return (
    <Paper shadow="xs" p="md" withBorder>
      <Stack gap="md">
        <Text size="lg" fw={500}>Enter Your Financial Profile</Text>

        <NumericInput
          label="Age"
          placeholder="Your age"
          withAsterisk
          key={form.key('age')}
          {...form.getInputProps('age')}
        />

        <NumericInput
          label="Current Savings"
          placeholder="100000"
          prefix="$ "
          thousandSeparator
          withAsterisk
          key={form.key('currentSavings')}
          {...form.getInputProps('currentSavings')}
        />

        <NumericInput
          label="Annual Spending"
          placeholder="50000"
          prefix="$ "
          thousandSeparator
          withAsterisk
          key={form.key('annualSpending')}
          {...form.getInputProps('annualSpending')}
        />

        <NumericInput
          label="Annual Growth Rate"
          placeholder="7"
          suffix="%"
          decimalScale={2}
          key={form.key('annualGrowthRate')}
          {...form.getInputProps('annualGrowthRate')}
        />

        <Group justify="flex-end">
          <Button type="submit" onClick={() => form.onSubmit(handleSubmit)()}>
            Save Profile
          </Button>
        </Group>
      </Stack>
    </Paper>
  );
}
