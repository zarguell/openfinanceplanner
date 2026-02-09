import {
  Grid,
  GridCol,
  Card,
  Stack,
  Title,
  Text,
  Group,
  Flex,
  Badge,
} from '@mantine/core';
import { formatCurrency } from '@/utils/currency';
import { NetWorthChart } from '@/components/charts';
import { CashFlowChart } from '@/components/charts';
import type { UserProfile, SimulationResult } from '@/core/types';

interface DashboardOverviewProps {
  profile: UserProfile;
  simulation: SimulationResult[];
}

export default function DashboardOverview({
  profile,
  simulation,
}: DashboardOverviewProps) {
  if (simulation.length === 0) {
    return (
      <Stack gap="md">
        <Title order={2}>Dashboard</Title>
        <Card padding="lg">
          <Text c="dimmed">No projection data available</Text>
        </Card>
      </Stack>
    );
  }

  const latestResult = simulation[simulation.length - 1];
  const totalYears = simulation.length;
  const projectedNetWorth = latestResult.endingBalance;
  const netWorthChange =
    simulation.length > 1
      ? latestResult.endingBalance - simulation[0].endingBalance
      : 0;

  const metricCards = [
    {
      title: 'Current Age',
      value: `${profile.age} years`,
      color: 'blue',
      icon: '👤',
    },
    {
      title: 'Current Savings',
      value: formatCurrency(profile.currentSavings),
      color: 'green',
      icon: '💰',
    },
    {
      title: 'Annual Spending',
      value: formatCurrency(profile.annualSpending),
      color: 'orange',
      icon: '📊',
    },
    {
      title: 'Growth Rate',
      value: `${profile.annualGrowthRate}%`,
      color: 'purple',
      icon: '📈',
    },
    {
      title: 'Projected Net Worth',
      value: formatCurrency(projectedNetWorth),
      color: netWorthChange >= 0 ? 'green' : 'red',
      icon: netWorthChange >= 0 ? '🎯' : '⚠️',
    },
    {
      title: 'Projection Years',
      value: `${totalYears} years`,
      color: 'gray',
      icon: '📅',
    },
  ];

  return (
    <Stack gap="xl">
      <Group justify="space-between" align="center">
        <Title order={2}>Dashboard</Title>
        <Badge size="lg" variant="light">
          {totalYears} Year Projection
        </Badge>
      </Group>

      <Grid>
        {metricCards.map((metric, index) => (
          <GridCol key={index} span={{ base: 12, md: 6, lg: 4 }}>
            <Card
              padding="lg"
              radius="md"
              withBorder
              style={{
                borderTop: `3px solid ${
                  metric.color === 'green'
                    ? 'rgb(52, 211, 153)'
                    : metric.color === 'blue'
                      ? 'rgb(59, 130, 246)'
                      : metric.color === 'orange'
                        ? 'rgb(251, 146, 60)'
                        : metric.color === 'purple'
                          ? 'rgb(168, 85, 247)'
                          : metric.color === 'red'
                            ? 'rgb(239, 68, 68)'
                            : 'rgb(107, 114, 128)'
                }`,
              }}
            >
              <Stack gap="xs">
                <Flex justify="space-between" align="center">
                  <Text size="sm" c="dimmed">
                    {metric.title}
                  </Text>
                  <Text size="lg">{metric.icon}</Text>
                </Flex>
                <Text size="lg" fw={600}>
                  {metric.value}
                </Text>
              </Stack>
            </Card>
          </GridCol>
        ))}
      </Grid>

      <Grid>
        <GridCol span={{ base: 12, lg: 8 }}>
          <Card padding="lg" radius="md" withBorder>
            <Stack gap="md">
              <Title order={4}>Net Worth Over Time</Title>
              <Box style={{ height: '400px' }}>
                <NetWorthChart />
              </Box>
            </Stack>
          </Card>
        </GridCol>

        <GridCol span={{ base: 12, lg: 4 }}>
          <Card padding="lg" radius="md" withBorder>
            <Stack gap="md">
              <Title order={4}>Cash Flow</Title>
              <Box style={{ height: '400px' }}>
                <CashFlowChart data={simulation} />
              </Box>
            </Stack>
          </Card>
        </GridCol>
      </Grid>

      {netWorthChange !== 0 && (
        <Card padding="lg" radius="md" withBorder>
          <Group gap="md">
            <Text size="lg" fw={500}>
              {netWorthChange >= 0 ? '📈' : '📉'}
            </Text>
            <Stack gap={0}>
              <Text size="sm" c="dimmed">
                Net Worth Change
              </Text>
              <Text
                size="lg"
                fw={600}
                c={netWorthChange >= 0 ? 'green' : 'red'}
              >
                {netWorthChange >= 0 ? '+' : ''}
                {formatCurrency(netWorthChange)}
              </Text>
            </Stack>
          </Group>
        </Card>
      )}
    </Stack>
  );
}

function Box({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return <div style={style}>{children}</div>;
}
