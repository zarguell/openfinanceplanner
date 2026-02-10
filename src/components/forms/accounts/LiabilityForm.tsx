import { useForm } from '@mantine/form';
import { Button, Stack, TextInput, Select, Group } from '@mantine/core';
import type { Liability } from '@/core/types';
import { NumericInput } from '../NumericInput';

interface LiabilityFormProps {
  liability?: Liability;
  onSave: (liability: Liability) => void;
  onCancel: () => void;
}

const LIABILITY_TYPES = [
  { value: 'mortgage', label: 'Mortgage' },
  { value: 'student-loan', label: 'Student Loan' },
  { value: 'credit-card', label: 'Credit Card' },
  { value: 'auto-loan', label: 'Auto Loan' },
  { value: 'personal-loan', label: 'Personal Loan' },
  { value: 'business-loan', label: 'Business Loan' },
  { value: 'medical-debt', label: 'Medical Debt' },
  { value: 'other-liability', label: 'Other Liability' },
];

const AMORTIZATION_TYPES = [
  { value: 'amortized', label: 'Amortized (Principal + Interest)' },
  { value: 'interest-only', label: 'Interest Only' },
  { value: 'revolving', label: 'Revolving' },
];

const TAX_CHARACTERISTICS = [
  { value: 'tax-deductible', label: 'Tax Deductible' },
  { value: 'non-deductible', label: 'Non-Deductible' },
];

export function LiabilityForm({
  liability,
  onSave,
  onCancel,
}: LiabilityFormProps) {
  const form = useForm<Omit<Liability, 'type'>>({
    mode: 'uncontrolled',
    initialValues: {
      id: liability?.id || '',
      name: liability?.name || '',
      balance: liability?.balance || 0,
      liabilityType: liability?.liabilityType || 'mortgage',
      interestRate: liability?.interestRate || 0,
      startDate: liability?.startDate || '',
      endDate: liability?.endDate || '',
      minimumPayment: liability?.minimumPayment || 0,
      amortizationType: liability?.amortizationType || 'amortized',
      taxCharacteristics: liability?.taxCharacteristics || 'tax-deductible',
    },

    validate: {
      name: (value) => (value ? null : 'Liability name is required'),
      balance: (value) =>
        value <= 0 ? null : 'Balance must be negative or zero',
      liabilityType: (value) => (value ? null : 'Liability type is required'),
      interestRate: (value) =>
        value >= 0 ? null : 'Interest rate must be positive',
    },
  });

  const handleSubmit = (values: typeof form.values) => {
    const liabilityData: Liability = {
      ...values,
      // eslint-disable-next-line react-hooks/purity
      id: values.id || `liability-${Math.random().toString(36).substr(2, 9)}`,
      type: 'debts',
      balance: values.balance <= 0 ? values.balance : -Math.abs(values.balance), // Ensure negative balance
    };
    onSave(liabilityData);
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack gap="md">
        <TextInput
          label="Liability Name"
          placeholder="e.g., Mortgage"
          withAsterisk
          key={form.key('name')}
          {...form.getInputProps('name')}
        />

        <Select
          label="Liability Type"
          placeholder="Select liability type"
          data={LIABILITY_TYPES}
          withAsterisk
          key={form.key('liabilityType')}
          {...form.getInputProps('liabilityType')}
        />

        <NumericInput
          label="Current Balance"
          placeholder="250000"
          prefix="$ "
          thousandSeparator
          withAsterisk
          key={form.key('balance')}
          {...form.getInputProps('balance')}
        />

        <NumericInput
          label="Interest Rate"
          placeholder="3.75"
          suffix="%"
          decimalScale={2}
          withAsterisk
          key={form.key('interestRate')}
          {...form.getInputProps('interestRate')}
        />

        <TextInput
          label="Start Date"
          placeholder="YYYY-MM-DD"
          key={form.key('startDate')}
          {...form.getInputProps('startDate')}
        />

        <TextInput
          label="End Date"
          placeholder="YYYY-MM-DD"
          key={form.key('endDate')}
          {...form.getInputProps('endDate')}
        />

        <NumericInput
          label="Minimum Monthly Payment"
          placeholder="1200"
          prefix="$ "
          thousandSeparator
          key={form.key('minimumPayment')}
          {...form.getInputProps('minimumPayment')}
        />

        <Select
          label="Amortization Type"
          placeholder="Select amortization type"
          data={AMORTIZATION_TYPES}
          key={form.key('amortizationType')}
          {...form.getInputProps('amortizationType')}
        />

        <Select
          label="Tax Characteristics"
          placeholder="Select tax characteristics"
          data={TAX_CHARACTERISTICS}
          key={form.key('taxCharacteristics')}
          {...form.getInputProps('taxCharacteristics')}
        />

        <Group justify="flex-end" mt="md">
          <Button variant="default" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            {liability ? 'Update Liability' : 'Add Liability'}
          </Button>
        </Group>
      </Stack>
    </form>
  );
}
