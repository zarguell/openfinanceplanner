import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';

import { Paper, Text, Stack, Badge } from '@mantine/core';
import type { NetWorthComposition } from '@/core/types';
import { formatCurrency } from '@/utils/currency';

interface NetWorthCompositionChartProps {
  data: NetWorthComposition;
}

const CHART_COLORS: Record<string, string> = {
  taxable: '#40c057',
  'tax-advantaged': '#228be6',
  'real-assets': '#fd7e14',
  debts: '#fa5252',
};

function prepareChartData(data: NetWorthComposition) {
  const chartData = Object.entries(data.byType)
    .filter((entry) => entry[1] > 0)
    .map(([type, value]) => ({
      type,
      value: Math.abs(value),
      color: CHART_COLORS[type] ?? '#868e96',
    }));

  return chartData;
}

export function NetWorthCompositionChart({
  data,
}: NetWorthCompositionChartProps) {
  if (!data || Object.keys(data.byType).length === 0) {
    return (
      <Paper p="xl" ta="center" withBorder>
        <Text c="dimmed">Add accounts to see net worth composition</Text>
      </Paper>
    );
  }

  const chartData = prepareChartData(data);

  return (
    <Paper p="md" withBorder radius="md">
      <Stack gap="md">
        <Text size="lg" fw={600}>
          Net Worth Composition
        </Text>

        <Stack gap="xs">
          <Text size="sm" c="dimmed">
            Total Net Worth
          </Text>
          <Text size="xl" fw={700}>
            {formatCurrency(data.totalNetWorth)}
          </Text>
        </Stack>

        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="type"
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              label={(entry) => {
                if (!entry || !entry.name) return '';
                const type = entry.name;
                const percent = entry.percent;
                const pct = percent ? (percent * 100).toFixed(0) : '0';
                return `${type} ${pct}%`;
              }}
              labelLine={false}
            >
              {chartData.map((entry) => (
                <Cell key={entry.type} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number | undefined) =>
                value !== undefined ? formatCurrency(value) : ''
              }
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #e9ecef',
                borderRadius: '4px',
              }}
            />
            <Legend verticalAlign="bottom" height={36} iconType="circle" />
          </PieChart>
        </ResponsiveContainer>

        <Stack gap="sm">
          <Text size="sm" fw={600}>
            Breakdown
          </Text>
          {data.byAccount.map((account) => (
            <Stack key={account.id} gap={4}>
              <Group justify="space-between">
                <Text size="sm">{account.name}</Text>
                <Badge
                  color={CHART_COLORS[account.type] ?? 'gray'}
                  variant="light"
                >
                  {account.type}
                </Badge>
              </Group>
              <Text size="sm" c="dimmed" ta="right">
                {formatCurrency(account.balance)}
              </Text>
            </Stack>
          ))}
        </Stack>
      </Stack>
    </Paper>
  );
}

function Group({ children, ...props }: React.ComponentProps<typeof Stack>) {
  return <Stack {...props}>{children}</Stack>;
}
