import {
  Card,
  Stack,
  Text,
  Title,
  Flex,
  Button,
  Badge,
  Group,
  Divider,
} from '@mantine/core';
import { Plus, Trash2 } from 'lucide-react';
import type { TaxStrategy } from '@/core/types';

interface TaxStrategyPanelProps {
  strategies: readonly TaxStrategy[];
  onAdd: () => void;
  onRemove: (index: number) => void;
}

export default function TaxStrategyPanel({
  strategies,
  onAdd,
  onRemove,
}: TaxStrategyPanelProps) {
  const getStrategyBadgeColor = (type: TaxStrategy['type']): string => {
    switch (type) {
      case 'roth-conversion':
        return 'blue';
      case 'sepp-distribution':
        return 'green';
      case 'tax-loss-harvesting':
        return 'orange';
      case 'location-based':
        return 'purple';
      default:
        return 'gray';
    }
  };

  const formatStrategyTitle = (strategy: TaxStrategy): string => {
    switch (strategy.type) {
      case 'roth-conversion':
        return 'Roth Conversion';
      case 'sepp-distribution':
        return '72t/SEPP Distribution';
      case 'tax-loss-harvesting':
        return 'Tax Loss Harvesting';
      case 'location-based':
        return 'Location-Based Optimization';
      default:
        return 'Tax Strategy';
    }
  };

  return (
    <Stack gap="md">
      <Flex justify="space-between" align="center">
        <Title order={3}>Tax Strategies</Title>
        <Button
          leftSection={<Plus size={16} />}
          onClick={onAdd}
          variant="light"
        >
          Add Strategy
        </Button>
      </Flex>

      {strategies.length === 0 ? (
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Stack align="center" gap="sm">
            <Text size="sm" c="dimmed">
              No tax strategies configured. Add a strategy to optimize your tax
              planning.
            </Text>
          </Stack>
        </Card>
      ) : (
        <Stack gap="sm">
          {strategies.map((strategy, index) => (
            <Card key={index} shadow="sm" padding="md" radius="md" withBorder>
              <Stack gap="xs">
                <Flex justify="space-between" align="flex-start">
                  <Stack gap="xs" style={{ flex: 1 }}>
                    <Group gap="xs" align="center">
                      <Badge color={getStrategyBadgeColor(strategy.type)}>
                        {formatStrategyTitle(strategy)}
                      </Badge>
                    </Group>

                    <Text size="sm" fw={500}>
                      {strategy.description}
                    </Text>

                    {strategy.amount !== undefined && (
                      <Text size="xs" c="dimmed">
                        Amount: ${strategy.amount.toLocaleString()}
                      </Text>
                    )}

                    {strategy.targetYear !== undefined && (
                      <Text size="xs" c="dimmed">
                        Target Year: {strategy.targetYear}
                      </Text>
                    )}

                    {strategy.accountBalance !== undefined && (
                      <Text size="xs" c="dimmed">
                        Account Balance: $
                        {strategy.accountBalance.toLocaleString()}
                      </Text>
                    )}

                    {strategy.lifeExpectancy !== undefined && (
                      <Text size="xs" c="dimmed">
                        Life Expectancy: {strategy.lifeExpectancy} years
                      </Text>
                    )}
                  </Stack>

                  <Button
                    variant="subtle"
                    color="red"
                    size="xs"
                    onClick={() => onRemove(index)}
                  >
                    <Trash2 size={16} />
                  </Button>
                </Flex>
              </Stack>
            </Card>
          ))}
        </Stack>
      )}

      {strategies.length > 0 && (
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Stack gap="sm">
            <Text size="sm" fw={500}>
              Strategy Information
            </Text>

            <Divider />

            <Stack gap="xs">
              <Text size="xs">
                <strong>Roth Conversion:</strong> Convert traditional IRA funds
                to Roth to pay taxes now and enjoy tax-free withdrawals later.
              </Text>
              <Text size="xs">
                <strong>72t/SEPP:</strong> Substantially Equal Periodic Payments
                allow early access to retirement funds without penalty.
              </Text>
              <Text size="xs">
                <strong>Tax Loss Harvesting:</strong> Sell investments at a loss
                to offset capital gains and reduce taxable income.
              </Text>
            </Stack>
          </Stack>
        </Card>
      )}
    </Stack>
  );
}
