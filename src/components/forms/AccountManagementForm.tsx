import { useState } from 'react';
import { Modal, Tabs, Text, Alert, Box } from '@mantine/core';
import { AlertCircle } from 'lucide-react';
import type { Account } from '@/core/types';
import {
  TaxableAccountForm,
  TaxAdvantagedAccountForm,
  AssetForm,
  LiabilityForm,
} from './accounts';

interface AccountManagementFormProps {
  opened: boolean;
  onClose: () => void;
  account?: Account;
  onSave: (account: Account) => void;
}

export function AccountManagementForm({
  opened,
  onClose,
  account,
  onSave,
}: AccountManagementFormProps) {
  const [activeTab, setActiveTab] = useState<string | null>(
    account?.type || 'taxable'
  );

  const handleSave = (accountData: Account) => {
    onSave(accountData);
    onClose();
  };

  const renderForm = () => {
    switch (activeTab) {
      case 'taxable':
        return (
          <TaxableAccountForm
            account={
              account && account.type === 'taxable' ? account : undefined
            }
            onSave={handleSave}
            onCancel={onClose}
          />
        );
      case 'tax-advantaged':
        return (
          <TaxAdvantagedAccountForm
            account={
              account && account.type === 'tax-advantaged' ? account : undefined
            }
            onSave={handleSave}
            onCancel={onClose}
          />
        );
      case 'real-assets':
        return (
          <AssetForm
            asset={
              account && account.type === 'real-assets' ? account : undefined
            }
            onSave={handleSave}
            onCancel={onClose}
          />
        );
      case 'debts':
        return (
          <LiabilityForm
            liability={
              account && account.type === 'debts' ? account : undefined
            }
            onSave={handleSave}
            onCancel={onClose}
          />
        );
      default:
        return (
          <Alert
            icon={<AlertCircle size={16} />}
            title="Unsupported Account Type"
            color="red"
          >
            The selected account type is not supported.
          </Alert>
        );
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Text fw={500} size="lg">
          {account ? 'Edit Account' : 'Add New Account'}
        </Text>
      }
      size="lg"
      centered
    >
      <Tabs value={activeTab} onChange={setActiveTab}>
        <Tabs.List>
          <Tabs.Tab value="taxable">Taxable</Tabs.Tab>
          <Tabs.Tab value="tax-advantaged">Tax-Advantaged</Tabs.Tab>
          <Tabs.Tab value="real-assets">Assets</Tabs.Tab>
          <Tabs.Tab value="debts">Liabilities</Tabs.Tab>
        </Tabs.List>

        <Box pt="md">{renderForm()}</Box>
      </Tabs>
    </Modal>
  );
}
