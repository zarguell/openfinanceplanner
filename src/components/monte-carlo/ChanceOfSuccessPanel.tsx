import { Card, Stack, Text, Title, Progress, Flex } from '@mantine/core';
import type { ChanceOfSuccess } from '@/core/types';
import {
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { useMantineTheme } from '@mantine/core';

interface ChanceOfSuccessPanelProps {
  chanceOfSuccess: ChanceOfSuccess;
}

export default function ChanceOfSuccessPanel({
  chanceOfSuccess,
}: ChanceOfSuccessPanelProps) {
  const theme = useMantineTheme();

  const getSuccessColor = (rate: number) => {
    if (rate >= 90) return 'green';
    if (rate >= 75) return 'lime';
    if (rate >= 50) return 'yellow';
    if (rate >= 25) return 'orange';
    return 'red';
  };

  const getSuccessIcon = (rate: number) => {
    if (rate >= 75) return <CheckCircle size={32} />;
    return <AlertTriangle size={32} />;
  };

  const successColor = getSuccessColor(chanceOfSuccess.successRate);
  const successIcon = getSuccessIcon(chanceOfSuccess.successRate);

  return (
    <Stack gap="md">
      <Title order={3}>Chance of Success Analysis</Title>

      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Stack gap="lg">
          <Flex align="center" gap="md">
            {successIcon}

            <Stack gap={0}>
              <Text size="xl" fw={700} c={successColor}>
                {chanceOfSuccess.successRate.toFixed(1)}%
              </Text>
              <Text size="sm" c="dimmed">
                Probability of success
              </Text>
            </Stack>
          </Flex>

          <Progress
            value={chanceOfSuccess.successRate}
            color={successColor}
            size="xl"
            radius="md"
            striped
            animated
          />

          <Flex justify="space-between" align="center">
            <Text size="sm">Successful Simulations</Text>
            <Text size="lg" fw={500} c="green">
              {chanceOfSuccess.successfulSimulations} /{' '}
              {chanceOfSuccess.totalSimulations}
            </Text>
          </Flex>
        </Stack>
      </Card>

      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Stack gap="md">
          <Text size="sm" fw={500}>
            Yearly Success Rates
          </Text>

          <Stack gap="sm">
            {chanceOfSuccess.yearlySuccessRates.map((rate, index) => {
              const yearlyColor = getSuccessColor(rate);
              const showTrend = index > 0;
              const previousRate =
                chanceOfSuccess.yearlySuccessRates[index - 1];
              const trend = showTrend ? rate - previousRate : 0;

              return (
                <Flex key={index} justify="space-between" align="center">
                  <Text size="sm">Year {index + 1}</Text>

                  <Flex gap="xs" align="center">
                    {showTrend &&
                      (trend > 0 ? (
                        <TrendingUp size={16} color={theme.colors.green[6]} />
                      ) : (
                        <TrendingDown size={16} color={theme.colors.red[6]} />
                      ))}

                    <Text size="sm" fw={500} c={yearlyColor}>
                      {rate.toFixed(1)}%
                    </Text>
                  </Flex>
                </Flex>
              );
            })}
          </Stack>
        </Stack>
      </Card>
    </Stack>
  );
}
