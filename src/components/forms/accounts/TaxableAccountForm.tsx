import { useRef } from 'react';
import { useForm } from '@mantine/form';
import { Button, Stack, TextInput, Group } from '@mantine/core';
import type { TaxableAccount } from '@/core/types';
import { NumericInput } from '../NumericInput';

interface TaxableAccountFormProps {
  account?: TaxableAccount;
  onSave: (account: TaxableAccount) => void;
  onCancel: () => void;
}

export function TaxableAccountForm({
  account,
  onSave,
  onCancel,
}: TaxableAccountFormProps) {
  const idRef = useRef(
    account?.id || `taxable-${Math.random().toString(36).substr(2, 9)}`
  );

  const form = useForm<Omit<TaxableAccount, 'type' | 'taxCharacteristics'>>({
    mode: 'uncontrolled',
    initialValues: {
      id: account?.id || '',
      name: account?.name || '',
      balance: account?.balance || 0,
      institution: account?.institution || '',
      accountNumber: account?.accountNumber || '',
      costBasis: account?.costBasis || 0,
    },

    validate: {
      name: (value) => (value ? null : 'Account name is required'),
      balance: (value) => (value >= 0 ? null : 'Balance must be positive'),
    },
  });

  const handleSubmit = (values: typeof form.values) => {
    const accountData: TaxableAccount = {
      ...values,
      id: values.id || idRef.current,
      type: 'taxable',
      taxCharacteristics: 'taxable',
    };
    onSave(accountData);
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack gap="md">
        <TextInput
          label="Account Name"
          placeholder="e.g., Fidelity Brokerage"
          withAsterisk
          key={form.key('name')}
          {...form.getInputProps('name')}
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
          label="Cost Basis"
          placeholder="5000"
          prefix="$ "
          thousandSeparator
          key={form.key('costBasis')}
          {...form.getInputProps('costBasis')}
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
