/* eslint-disable react/prop-types */
import { memo } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

import { Paper, Text, Group, Stack, Badge } from '@mantine/core';
import { ResponsiveChartWrapper } from './ResponsiveChartWrapper';
import { formatCurrencyCompact } from '@/utils/currency';
import type { Account } from '@/core/types';

interface AccountBreakdownChartProps {
  accounts: Account[];
}

interface ChartDataItem {
  name: string;
  value: number;
  type: string;
}

// Colorblind-friendly color palette
const COLORS = [
  '#228be6', // Blue
  '#40c057', // Green
  '#fa5252', // Red
  '#fab005', // Yellow
  '#7950f2', // Purple
  '#15aabf', // Cyan
  '#e64980', // Pink
  '#fd7e14', // Orange
];

/**
 * Account breakdown pie chart showing portfolio composition.
 *
 * Features:
 * - Pie chart displaying account type distribution
 * - Colorblind-friendly color scheme
 * - Legend showing account types
 * - Tooltip with exact values on hover
 * - Summary statistics (total value, account count)
 * - Responsive sizing via ResponsiveChartWrapper
 * - Memoized to prevent unnecessary re-renders
 *
 * @param accounts - Array of account objects with balances
 */
export const AccountBreakdownChart = memo(function AccountBreakdownChart({
  accounts,
}: AccountBreakdownChartProps) {
  // Calculate total portfolio value first (needed for empty check and tooltip)
  const totalValue =
    accounts?.reduce((sum, account) => sum + account.balance, 0) ?? 0;

  // Handle empty accounts state
  if (!accounts || accounts.length === 0) {
    return (
      <Paper p="xl" ta="center" withBorder>
        <Text c="dimmed">Add accounts to see portfolio breakdown</Text>
      </Paper>
    );
  }

  // Group accounts by type and calculate totals
  const accountTypeTotals: Record<string, number> = {};
  accounts.forEach((account) => {
    const typeLabel = getAccountTypeLabel(account);
    accountTypeTotals[typeLabel] =
      (accountTypeTotals[typeLabel] || 0) + account.balance;
  });

  // Transform to chart data format
  const chartData: ChartDataItem[] = Object.entries(accountTypeTotals).map(
    ([name, value]) => ({
      name,
      value,
      type: name.toLowerCase().replace(/\s+/g, '-'),
    })
  );

  // Custom tooltip component - defined as regular function outside component scope
  const renderTooltip = (props: {
    active?: boolean;
    payload?: ReadonlyArray<{ name: string; value: number }>;
  }) => {
    const { active, payload } = props;
    if (active && payload && payload.length > 0) {
      const data = payload[0];
      const percentage = ((data.value / totalValue) * 100).toFixed(1);
      return (
        <Paper p="xs" withBorder shadow="sm">
          <Text size="sm" fw={500}>
            {data.name}
          </Text>
          <Text size="sm">{formatCurrencyCompact(data.value)}</Text>
          <Text size="xs" c="dimmed">
            {percentage}% of portfolio
          </Text>
        </Paper>
      );
    }
    return null;
  };

  return (
    <Paper p="md" withBorder radius="md">
      <Text size="lg" fw={600} mb="md">
        Account Breakdown
      </Text>
      <ResponsiveChartWrapper height={300} minHeight={250}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            dataKey="value"
            isAnimationActive={true}
            animationDuration={1000}
          >
            {chartData.map((_entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip content={renderTooltip} />
          <Legend
            verticalAlign="bottom"
            height={36}
            iconType="circle"
            formatter={(value: string) => (
              <span style={{ color: '#495057' }}>{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveChartWrapper>
      <Stack gap="xs" mt="md">
        <Group justify="space-between">
          <Text size="sm" c="dimmed">
            Total:
          </Text>
          <Text size="sm" fw={600}>
            {formatCurrencyCompact(totalValue)}
          </Text>
        </Group>
        <Group justify="space-between">
          <Text size="sm" c="dimmed">
            Accounts:
          </Text>
          <Badge size="sm" variant="light">
            {accounts.length} accounts
          </Badge>
        </Group>
      </Stack>
    </Paper>
  );
});

/**
 * Get a human-readable label for account type
 */
function getAccountTypeLabel(account: Account): string {
  switch (account.type) {
    case 'taxable':
      return 'Taxable';
    case 'tax-advantaged':
      return 'Tax-Advantaged';
    case 'real-assets':
      return 'Real Assets';
    case 'debts':
      return 'Debts';
    default:
      return 'Other';
  }
}
