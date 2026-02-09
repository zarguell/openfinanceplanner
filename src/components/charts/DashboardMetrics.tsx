import {
  Paper,
  Text,
  Title,
  Group,
  Stack,
  Grid,
  Card,
  Badge,
  ThemeIcon,
} from '@mantine/core';
import {
  Wallet,
  PiggyBank,
  Calendar,
  TrendingUp,
  Building2,
  Coins,
  Landmark,
} from 'lucide-react';
import { formatCurrencyCompact } from '@/utils/currency';
import type { SimulationResult, Account } from '@/core/types';

interface DashboardMetricsProps {
  accounts: Account[];
  projectionData: SimulationResult[];
  currentAge: number;
  retirementAge: number;
}

interface MetricCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ReactNode;
  color: string;
}

/**
 * Financial dashboard displaying key metrics and statistics.
 *
 * Features:
 * - Total net worth calculation
 * - Account type breakdown (taxable vs tax-advantaged)
 * - Years to retirement counter
 * - Projected runway (years until depletion)
 * - Annual growth estimate
 * - Responsive grid layout with metric cards
 * - Color-coded icons for visual distinction
 *
 * @param accounts - Array of user accounts
 * @param projectionData - Array of simulation results
 * @param currentAge - User's current age
 * @param retirementAge - Target retirement age
 */
export function DashboardMetrics({
  accounts,
  projectionData,
  currentAge,
  retirementAge,
}: DashboardMetricsProps) {
  // Calculate total net worth
  const totalNetWorth = accounts.reduce(
    (sum, account) => sum + account.balance,
    0
  );

  // Calculate account type totals
  const taxAdvantagedTotal = accounts
    .filter((acc) => acc.type === 'tax-advantaged')
    .reduce((sum, acc) => sum + acc.balance, 0);

  const taxableTotal = accounts
    .filter((acc) => acc.type === 'taxable')
    .reduce((sum, acc) => sum + acc.balance, 0);

  const realAssetsTotal = accounts
    .filter((acc) => acc.type === 'real-assets')
    .reduce((sum, acc) => sum + acc.balance, 0);

  const debtsTotal = accounts
    .filter((acc) => acc.type === 'debts')
    .reduce((sum, acc) => sum + acc.balance, 0);

  // Calculate years to retirement
  const yearsToRetirement = Math.max(0, retirementAge - currentAge);

  // Calculate projected runway (years until depletion)
  const projectedRunway = projectionData.length;

  // Calculate average annual growth from first year
  const avgAnnualGrowth =
    projectionData.length > 0
      ? projectionData.reduce((sum, year) => sum + year.growth, 0) /
        projectionData.length
      : 0;

  const metrics: MetricCardProps[] = [
    {
      title: 'Total Net Worth',
      value: formatCurrencyCompact(totalNetWorth),
      subtitle: `${accounts.length} accounts`,
      icon: <Wallet size={24} />,
      color: 'blue',
    },
    {
      title: 'Years to Retirement',
      value: yearsToRetirement.toString(),
      subtitle: `Target age: ${retirementAge}`,
      icon: <Calendar size={24} />,
      color: 'green',
    },
    {
      title: 'Projected Runway',
      value: `${projectedRunway} years`,
      subtitle:
        projectionData.length > 0
          ? `Until age ${projectionData[projectionData.length - 1]?.age}`
          : 'N/A',
      icon: <TrendingUp size={24} />,
      color: projectedRunway < yearsToRetirement ? 'red' : 'teal',
    },
    {
      title: 'Annual Growth',
      value: formatCurrencyCompact(avgAnnualGrowth),
      subtitle: 'Average per year',
      icon: <PiggyBank size={24} />,
      color: 'violet',
    },
  ];

  return (
    <Paper p="md" withBorder radius="md">
      <Title order={3} mb="lg">
        Financial Dashboard
      </Title>

      <Grid gutter="md">
        {metrics.map((metric) => (
          <Grid.Col key={metric.title} span={{ base: 12, sm: 6, md: 3 }}>
            <Card withBorder padding="md">
              <Group justify="space-between" mb="xs">
                <Text size="sm" c="dimmed">
                  {metric.title}
                </Text>
                <ThemeIcon color={metric.color} variant="light" size="md">
                  {metric.icon}
                </ThemeIcon>
              </Group>
              <Text size="xl" fw={700}>
                {metric.value}
              </Text>
              {metric.subtitle && (
                <Text size="xs" c="dimmed">
                  {metric.subtitle}
                </Text>
              )}
            </Card>
          </Grid.Col>
        ))}
      </Grid>

      <Stack gap="xs" mt="lg">
        <Text size="sm" fw={600}>
          Portfolio Breakdown
        </Text>
        <Grid gutter="xs">
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Group justify="space-between">
              <Group gap="xs">
                <ThemeIcon color="green" variant="light" size="sm">
                  <Building2 size={16} />
                </ThemeIcon>
                <Text size="sm">Tax-Advantaged</Text>
              </Group>
              <Badge variant="light" color="green">
                {formatCurrencyCompact(taxAdvantagedTotal)}
              </Badge>
            </Group>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Group justify="space-between">
              <Group gap="xs">
                <ThemeIcon color="blue" variant="light" size="sm">
                  <Coins size={16} />
                </ThemeIcon>
                <Text size="sm">Taxable</Text>
              </Group>
              <Badge variant="light" color="blue">
                {formatCurrencyCompact(taxableTotal)}
              </Badge>
            </Group>
          </Grid.Col>
          {realAssetsTotal > 0 && (
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Group justify="space-between">
                <Group gap="xs">
                  <ThemeIcon color="orange" variant="light" size="sm">
                    <Landmark size={16} />
                  </ThemeIcon>
                  <Text size="sm">Real Assets</Text>
                </Group>
                <Badge variant="light" color="orange">
                  {formatCurrencyCompact(realAssetsTotal)}
                </Badge>
              </Group>
            </Grid.Col>
          )}
          {debtsTotal > 0 && (
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Group justify="space-between">
                <Group gap="xs">
                  <ThemeIcon color="red" variant="light" size="sm">
                    <TrendingUp size={16} />
                  </ThemeIcon>
                  <Text size="sm">Debts</Text>
                </Group>
                <Badge variant="light" color="red">
                  {formatCurrencyCompact(debtsTotal)}
                </Badge>
              </Group>
            </Grid.Col>
          )}
        </Grid>
      </Stack>

      <Group justify="space-between" mt="lg">
        <Text size="sm" c="dimmed">
          Current Age: {currentAge}
        </Text>
        <Text size="sm" c="dimmed">
          Last Updated: {new Date().toLocaleDateString()}
        </Text>
      </Group>
    </Paper>
  );
}
