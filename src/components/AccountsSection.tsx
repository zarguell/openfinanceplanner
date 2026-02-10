import { useState } from 'react';
import {
  Button,
  Stack,
  Paper,
  Text,
  Group,
  Table,
  Badge,
  ActionIcon,
  Title,
} from '@mantine/core';
import { Pencil, Trash2, Plus } from 'lucide-react';
import { useStore } from '@/store';
import type { Account } from '@/core/types';
import { AccountManagementForm } from '@/components/forms/AccountManagementForm';
import { AccountBreakdownChart } from '@/components/charts/AccountBreakdownChart';

export function AccountsSection() {
  const accounts = useStore((state) => state.profile?.accounts) || [];
  const [modalOpened, setModalOpened] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | undefined>();

  const handleAddAccount = () => {
    setEditingAccount(undefined);
    setModalOpened(true);
  };

  const handleEditAccount = (account: Account) => {
    setEditingAccount(account);
    setModalOpened(true);
  };

  const handleSaveAccount = (account: Account) => {
    const profile = useStore.getState().profile;
    if (!profile) return;

    const updatedAccounts = editingAccount
      ? accounts.map((a) => (a.id === account.id ? account : a))
      : [...accounts, account];

    useStore.getState().setProfile({
      ...profile,
      accounts: updatedAccounts,
    });
  };

  const handleDeleteAccount = (accountId: string) => {
    const profile = useStore.getState().profile;
    if (!profile) return;

    const updatedAccounts = accounts.filter((a) => a.id !== accountId);
    useStore.getState().setProfile({
      ...profile,
      accounts: updatedAccounts,
    });
  };

  const getAccountTypeColor = (type: string) => {
    switch (type) {
      case 'taxable':
        return 'blue';
      case 'tax-advantaged':
        return 'green';
      case 'real-assets':
        return 'orange';
      case 'debts':
        return 'red';
      default:
        return 'gray';
    }
  };

  const getAccountTypeLabel = (type: string) => {
    switch (type) {
      case 'taxable':
        return 'Taxable';
      case 'tax-advantaged':
        return 'Tax-Advantaged';
      case 'real-assets':
        return 'Asset';
      case 'debts':
        return 'Liability';
      default:
        return 'Unknown';
    }
  };

  const totalAssets = accounts
    .filter(
      (a) =>
        a.type === 'taxable' ||
        a.type === 'tax-advantaged' ||
        a.type === 'real-assets'
    )
    .reduce((sum, a) => sum + a.balance, 0);

  const totalLiabilities = accounts
    .filter((a) => a.type === 'debts')
    .reduce((sum, a) => sum + a.balance, 0);

  const netWorth = totalAssets - Math.abs(totalLiabilities);

  return (
    <Stack gap="xl">
      <Stack gap="xs">
        <Title order={2}>Accounts Management</Title>
        <Text c="dimmed">
          Manage your financial accounts, assets, and liabilities
        </Text>
      </Stack>

      <Paper p="md" withBorder>
        <Stack gap="md">
          <Group justify="space-between" align="flex-end">
            <Stack gap={4}>
              <Text size="sm" c="dimmed">
                Total Assets
              </Text>
              <Text size="lg" fw={600} c="green">
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                }).format(totalAssets)}
              </Text>
            </Stack>
            <Stack gap={4}>
              <Text size="sm" c="dimmed">
                Total Liabilities
              </Text>
              <Text size="lg" fw={600} c="red">
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                }).format(Math.abs(totalLiabilities))}
              </Text>
            </Stack>
            <Stack gap={4}>
              <Text size="sm" c="dimmed">
                Net Worth
              </Text>
              <Text size="lg" fw={600} c={netWorth >= 0 ? 'green' : 'red'}>
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                }).format(netWorth)}
              </Text>
            </Stack>
            <Button leftSection={<Plus size={16} />} onClick={handleAddAccount}>
              Add Account
            </Button>
          </Group>

          {accounts.length > 0 && <AccountBreakdownChart accounts={accounts} />}
        </Stack>
      </Paper>

      <Paper p="md" withBorder>
        <Stack gap="md">
          <Text size="lg" fw={500}>
            Account List
          </Text>

          {accounts.length === 0 ? (
            <Text c="dimmed" ta="center" py="xl">
              No accounts yet. Click &quot;Add Account&quot; to get started.
            </Text>
          ) : (
            <Table striped highlightOnHover withTableBorder>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Name</Table.Th>
                  <Table.Th>Type</Table.Th>
                  <Table.Th>Tax Characteristic</Table.Th>
                  <Table.Th>Balance</Table.Th>
                  <Table.Th ta="right">Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {accounts.map((account) => (
                  <Table.Tr key={account.id}>
                    <Table.Td>
                      <Text fw={500}>{account.name}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Badge color={getAccountTypeColor(account.type)}>
                        {getAccountTypeLabel(account.type)}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Badge variant="light">
                        {account.taxCharacteristics}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Text style={{ fontFamily: 'monospace' }}>
                        {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: 'USD',
                        }).format(account.balance)}
                      </Text>
                    </Table.Td>
                    <Table.Td ta="right">
                      <Group gap={8} justify="flex-end">
                        <ActionIcon
                          variant="light"
                          size="sm"
                          onClick={() => handleEditAccount(account)}
                        >
                          <Pencil size={14} />
                        </ActionIcon>
                        <ActionIcon
                          variant="light"
                          color="red"
                          size="sm"
                          onClick={() => handleDeleteAccount(account.id)}
                        >
                          <Trash2 size={14} />
                        </ActionIcon>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          )}
        </Stack>
      </Paper>

      <AccountManagementForm
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        account={editingAccount}
        onSave={handleSaveAccount}
      />
    </Stack>
  );
}
