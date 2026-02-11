import { useForm } from '@mantine/form';
import {
  Button,
  Stack,
  Paper,
  Text,
  Group,
  Select,
  TextInput,
} from '@mantine/core';
import { useStore } from '@/store';
import type { UserProfile } from '@/core/types';
import { NumericInput } from './NumericInput';
import { useEffect, useCallback, useMemo } from 'react';

export function ProfileForm() {
  const profile = useStore((state) => state.profile);
  const setProfile = useStore((state) => state.setProfile);

  const getInitialValues = useCallback(() => {
    if (profile) {
      return {
        age: profile.age,
        currentSavings: profile.currentSavings,
        annualSpending: profile.annualSpending,
        annualGrowthRate: profile.annualGrowthRate,
        householdStatus: profile.householdStatus || '',
        country: profile.location?.country || '',
        state: profile.location?.state || '',
        city: profile.location?.city || '',
        currency: profile.currency || 'USD',
      };
    }
    return {
      age: '',
      currentSavings: '',
      annualSpending: '',
      annualGrowthRate: 7,
      householdStatus: '',
      country: '',
      state: '',
      city: '',
      currency: 'USD',
    };
  }, [profile]);

  // Move validation outside component or use useMemo to prevent recreation on each render
  const validate = useMemo(() => ({
    age: (value: number | string) => {
      if (!value || value === '') return 'Age is required';
      const num = typeof value === 'string' ? parseFloat(value) : value;
      if (isNaN(num)) return 'Must be a valid number';
      if (num < 18 || num > 100) return 'Age must be between 18 and 100';
      return null;
    },
    currentSavings: (value: number | string) => {
      if (!value || value === '') return 'Savings is required';
      const num = typeof value === 'string' ? parseFloat(value) : value;
      if (isNaN(num) || num < 0) return 'Must be a positive number';
      return null;
    },
    annualSpending: (value: number | string) => {
      if (!value || value === '') return 'Annual spending is required';
      const num = typeof value === 'string' ? parseFloat(value) : value;
      if (isNaN(num) || num < 0) return 'Must be a positive number';
      return null;
    },
    annualGrowthRate: (value: number | string) => {
      const num = typeof value === 'string' ? parseFloat(value) : value;
      if (isNaN(num)) return 'Must be a valid number';
      if (num < 0) return 'Cannot be negative';
      if (num > 100) return 'Unrealistic growth rate';
      return null;
    },
  }), []);

  const form = useForm<{
    age: number | string;
    currentSavings: number | string;
    annualSpending: number | string;
    annualGrowthRate: number | string;
    householdStatus: string;
    country: string;
    state: string;
    city: string;
    currency: string;
  }>({
    mode: 'controlled',
    initialValues: getInitialValues(),
    validate,
  });

  useEffect(() => {
    const initialValues = getInitialValues();
    form.setValues(initialValues);
  }, [profile, form, getInitialValues]);

  // Memoize error IDs for accessibility
  const ageErrorId = useMemo(() => 'age-error', []);
  const savingsErrorId = useMemo(() => 'savings-error', []);
  const spendingErrorId = useMemo(() => 'spending-error', []);
  const growthErrorId = useMemo(() => 'growth-error', []);

  // Wrap handleSubmit in useCallback for performance
  const handleSubmit = useCallback((values: typeof form.values) => {
    const toNumber = (value: number | string | undefined | null): number => {
      if (value === '' || value === undefined || value === null) return 0;
      if (typeof value === 'number') return value;
      const num = parseFloat(String(value).replace(/,/g, ''));
      return isNaN(num) ? 0 : num;
    };

    try {
      const profileData: UserProfile = {
        age: toNumber(values.age),
        currentSavings: toNumber(values.currentSavings),
        annualSpending: toNumber(values.annualSpending),
        annualGrowthRate: toNumber(values.annualGrowthRate),
        ...(values.householdStatus && {
          householdStatus: values.householdStatus as
            | 'single'
            | 'married'
            | 'partnered'
            | 'other',
        }),
        ...((values.country || values.state || values.city) && {
          location: {
            country: values.country || '',
            ...(values.state && { state: values.state }),
            ...(values.city && { city: values.city }),
          },
        }),
        ...(values.currency && { currency: values.currency }),
      };

      setProfile(profileData);
    } catch (error) {
      console.error('Failed to save profile:', error);
      // Re-throw to let form handle error display
      throw error;
    }
  }, [setProfile]);

  // Get input props with accessibility attributes
  const getInputProps = (field: string, errorId: string) => {
    const props = form.getInputProps(field);
    const hasError = form.errors[field] !== undefined;

    return {
      ...props,
      'aria-describedby': hasError ? errorId : undefined,
      'aria-invalid': hasError ? true : undefined,
      id: field,
    };
  };

  return (
    <Paper shadow="xs" p="md" withBorder>
      <Stack gap="md">
        <Text size="lg" fw={500}>
          Enter Your Financial Profile
        </Text>

        {/* Live region for form-level errors */}
        {Object.keys(form.errors).length > 0 && (
          <div role="alert" aria-live="assertive" aria-atomic="true">
            <Text c="red" size="sm">
              Please correct the errors below before submitting.
            </Text>
          </div>
        )}

        <NumericInput
          label="Age"
          placeholder="Your age"
          withAsterisk
          key={form.key('age')}
          {...getInputProps('age', ageErrorId)}
        />

        <NumericInput
          label="Current Savings"
          placeholder="100000"
          prefix="$ "
          thousandSeparator
          withAsterisk
          key={form.key('currentSavings')}
          {...getInputProps('currentSavings', savingsErrorId)}
        />

        <NumericInput
          label="Annual Spending"
          placeholder="50000"
          prefix="$ "
          thousandSeparator
          withAsterisk
          key={form.key('annualSpending')}
          {...getInputProps('annualSpending', spendingErrorId)}
        />

        <NumericInput
          label="Annual Growth Rate"
          placeholder="7"
          suffix="%"
          decimalScale={2}
          key={form.key('annualGrowthRate')}
          {...getInputProps('annualGrowthRate', growthErrorId)}
        />

        <Select
          label="Household Status"
          placeholder="Select your household status"
          data={[
            { value: 'single', label: 'Single' },
            { value: 'married', label: 'Married' },
            { value: 'partnered', label: 'Partnered' },
            { value: 'other', label: 'Other' },
          ]}
          key={form.key('householdStatus')}
          {...form.getInputProps('householdStatus')}
        />

        <TextInput
          label="Country"
          placeholder="US"
          key={form.key('country')}
          {...form.getInputProps('country')}
        />

        <TextInput
          label="State/Province"
          placeholder="CA"
          key={form.key('state')}
          {...form.getInputProps('state')}
        />

        <TextInput
          label="City"
          placeholder="San Francisco"
          key={form.key('city')}
          {...form.getInputProps('city')}
        />

        <Select
          label="Currency"
          placeholder="Select your preferred currency"
          data={[
            { value: 'USD', label: 'USD ($)' },
            { value: 'EUR', label: 'EUR (€)' },
            { value: 'GBP', label: 'GBP (£)' },
            { value: 'CAD', label: 'CAD (C$)' },
            { value: 'AUD', label: 'AUD (A$)' },
          ]}
          key={form.key('currency')}
          {...form.getInputProps('currency')}
        />

        <Group justify="flex-end">
          <Button
            type="submit"
            onClick={() => form.onSubmit(handleSubmit)()}
            aria-describedby={
              Object.keys(form.errors).length > 0 ? 'form-errors' : undefined
            }
          >
            Save Profile
          </Button>
        </Group>
      </Stack>
    </Paper>
  );
}
