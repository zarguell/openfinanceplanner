import { Card, Stack, Text, Title, useMantineTheme, Flex } from '@mantine/core';
import type { TaxAnalytics as TaxAnalyticsType } from '@/core/tax';
import { formatCurrency } from '@/utils/currency';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';

interface TaxAnalyticsProps {
  analytics: TaxAnalyticsType;
}

export default function TaxAnalytics({ analytics }: TaxAnalyticsProps) {
  const theme = useMantineTheme();

  const trend =
    analytics.taxBurdenTrend.length > 1
      ? analytics.taxBurdenTrend[analytics.taxBurdenTrend.length - 1] -
        analytics.taxBurdenTrend[0]
      : 0;

  return (
    <Stack gap="md">
      <Title order={3}>Tax Analytics</Title>

      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Stack gap="sm">
          <Text size="lg" fw={500}>
            Tax Summary
          </Text>

          <Flex justify="space-between" align="center">
            <Text size="sm">Total Federal Tax</Text>
            <Text size="lg" fw={500} c="blue">
              {formatCurrency(analytics.totalFederalTax)}
            </Text>
          </Flex>

          <Flex justify="space-between" align="center">
            <Text size="sm">Total State Tax</Text>
            <Text size="lg" fw={500} c="green">
              {formatCurrency(analytics.totalStateTax)}
            </Text>
          </Flex>

          <Flex justify="space-between" align="center">
            <Text size="sm">Total Tax</Text>
            <Text size="lg" fw={500} c="red">
              {formatCurrency(analytics.totalTax)}
            </Text>
          </Flex>

          <Flex justify="space-between" align="center">
            <Text size="sm">Average Effective Rate</Text>
            <Text size="lg" fw={500}>
              {analytics.averageEffectiveRate.toFixed(1)}%
            </Text>
          </Flex>

          <Flex justify="space-between" align="center" mt="md">
            <Text size="sm">Tax Burden Trend</Text>
            <Flex gap="xs" align="center">
              {trend > 0 ? (
                <TrendingUp size={20} color={theme.colors.red[6]} />
              ) : (
                <TrendingDown size={20} color={theme.colors.green[6]} />
              )}
              <Text size="sm" fw={500}>
                {trend > 0 ? '+' : ''}
                {formatCurrency(trend)}
              </Text>
            </Flex>
          </Flex>
        </Stack>
      </Card>

      {analytics.optimizationOpportunities.length > 0 && (
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Text size="lg" fw={500} mb="sm">
            Optimization Opportunities
          </Text>

          <Stack gap="sm">
            {analytics.optimizationOpportunities.map((opportunity, index) => (
              <Flex key={index} gap="sm" align="flex-start">
                {opportunity.priority === 'high' ? (
                  <AlertTriangle size={20} color={theme.colors.red[6]} />
                ) : opportunity.priority === 'medium' ? (
                  <AlertTriangle size={20} color={theme.colors.orange[6]} />
                ) : (
                  <CheckCircle size={20} color={theme.colors.green[6]} />
                )}
                <Flex style={{ flex: 1 }} direction="column" gap={2}>
                  <Text size="sm" fw={500}>
                    {opportunity.description}
                  </Text>
                  <Text size="xs" c="dimmed">
                    Potential Savings:{' '}
                    {formatCurrency(opportunity.potentialSavings)}
                  </Text>
                </Flex>
              </Flex>
            ))}
          </Stack>
        </Card>
      )}

      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Text size="lg" fw={500} mb="sm">
          Yearly Breakdown
        </Text>

        <Stack gap="sm">
          {analytics.yearlyBreakdown.map((year, index) => (
            <Flex key={index} justify="space-between" align="center">
              <Text size="sm">Year {index + 1}</Text>
              <Flex gap="xl">
                <Text size="xs">
                  Federal: {formatCurrency(year.federalTax)}
                </Text>
                {year.stateTax !== undefined && (
                  <Text size="xs">State: {formatCurrency(year.stateTax)}</Text>
                )}
                <Text size="xs">
                  Effective: {year.effectiveRate.toFixed(1)}%
                </Text>
              </Flex>
            </Flex>
          ))}
        </Stack>
      </Card>
    </Stack>
  );
}
