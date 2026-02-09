import { useForm } from '@mantine/form';
import { Button, Stack, TextInput, Select, Group } from '@mantine/core';
import type { TaxAdvantagedAccount } from '@/core/types';
import { NumericInput } from '../NumericInput';

interface TaxAdvantagedAccountFormProps {
  account?: TaxAdvantagedAccount;
  onSave: (account: TaxAdvantagedAccount) => void;
  onCancel: () => void;
}

const TAX_ADVANTAGED_ACCOUNT_TYPES = [
  { value: '401k', label: '401(k)' },
  { value: '403b', label: '403(b)' },
  { value: '457', label: '457 Plan' },
  { value: 'traditional-ira', label: 'Traditional IRA' },
  { value: 'roth-ira', label: 'Roth IRA' },
  { value: 'rollover-ira', label: 'Rollover IRA' },
  { value: 'inherited-traditional-ira', label: 'Inherited Traditional IRA' },
  { value: 'inherited-roth-ira', label: 'Inherited Roth IRA' },
  { value: 'hsa', label: 'Health Savings Account (HSA)' },
  { value: 'sep-ira', label: 'SEP IRA' },
  { value: 'simple-ira', label: 'SIMPLE IRA' },
  { value: 'defined-benefit', label: 'Defined Benefit Plan' },
  { value: 'employee-stock-option', label: 'Employee Stock Option' },
  { value: 'espp', label: 'Employee Stock Purchase Plan' },
];

export function TaxAdvantagedAccountForm({
  account,
  onSave,
  onCancel,
}: TaxAdvantagedAccountFormProps) {
  const form = useForm<
    Omit<TaxAdvantagedAccount, 'type' | 'taxCharacteristics'>
  >({
    mode: 'uncontrolled',
    initialValues: {
      id: account?.id || '',
      name: account?.name || '',
      balance: account?.balance || 0,
      accountType: account?.accountType || '401k',
      institution: account?.institution || '',
      accountNumber: account?.accountNumber || '',
      contributionLimit: account?.contributionLimit || 0,
      catchUpContribution: account?.catchUpContribution || 0,
    },

    validate: {
      name: (value) => (value ? null : 'Account name is required'),
      balance: (value) => (value >= 0 ? null : 'Balance must be positive'),
      accountType: (value) => (value ? null : 'Account type is required'),
    },
  });

  const handleSubmit = (values: typeof form.values) => {
    const accountData: TaxAdvantagedAccount = {
      ...values,
      id: values.id || `tax-advantaged-${Date.now()}`,
      type: 'tax-advantaged',
      taxCharacteristics: 'tax-deferred', // Default assumption
    };
    onSave(accountData);
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack gap="md">
        <TextInput
          label="Account Name"
          placeholder="e.g., Company 401(k)"
          withAsterisk
          key={form.key('name')}
          {...form.getInputProps('name')}
        />

        <Select
          label="Account Type"
          placeholder="Select account type"
          data={TAX_ADVANTAGED_ACCOUNT_TYPES}
          withAsterisk
          key={form.key('accountType')}
          {...form.getInputProps('accountType')}
        />

        <TextInput
          label="Financial Institution"
          placeholder="e.g., Fidelity, Vanguard"
          key={form.key('institution')}
          {...form.getInputProps('institution')}
        />

        <TextInput
          label="Account Number"
          placeholder="Last 4 digits"
          key={form.key('accountNumber')}
          {...form.getInputProps('accountNumber')}
        />

        <NumericInput
          label="Current Balance"
          placeholder="10000"
          prefix="$ "
          thousandSeparator
          withAsterisk
          key={form.key('balance')}
          {...form.getInputProps('balance')}
        />

        <NumericInput
          label="Annual Contribution Limit"
          placeholder="22500"
          prefix="$ "
          thousandSeparator
          key={form.key('contributionLimit')}
          {...form.getInputProps('contributionLimit')}
        />

        <NumericInput
          label="Catch-up Contribution Amount"
          placeholder="7500"
          prefix="$ "
          thousandSeparator
          key={form.key('catchUpContribution')}
          {...form.getInputProps('catchUpContribution')}
        />

        <Group justify="flex-end" mt="md">
          <Button variant="default" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            {account ? 'Update Account' : 'Add Account'}
          </Button>
        </Group>
      </Stack>
    </form>
  );
}
