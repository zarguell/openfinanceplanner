import type { FC } from 'react';
import { useStore } from '@/store';
import {
  Button,
  Card,
  Group,
  Stack,
  Text,
  Title,
  TextInput,
  NumberInput,
  Select,
  Switch,
  ActionIcon,
  Badge,
  Box,
} from '@mantine/core';
import { Plus, Trash, ChevronUp, ChevronDown } from 'lucide-react';

const RULE_TYPES = [
  { value: 'percentage-of-income', label: 'Percentage of Income' },
  { value: 'fixed-amount', label: 'Fixed Amount' },
  { value: 'inflation-adjusted', label: 'Inflation Adjusted' },
  { value: 'goal-based', label: 'Goal Based' },
  { value: 'rule-of-thumb', label: 'Rule of Thumb' },
] as const;

const CONDITION_TYPES = [
  { value: 'age', label: 'Age' },
  { value: 'year', label: 'Year' },
  { value: 'net-worth', label: 'Net Worth' },
  { value: 'retirement-date', label: 'Retirement Date' },
  { value: 'always', label: 'Always' },
] as const;

const OPERATORS = [
  { value: '>', label: 'Greater than (>)' },
  { value: '>=', label: 'Greater than or equal (>=)' },
  { value: '<', label: 'Less than (<)' },
  { value: '<=', label: 'Less than or equal (<=)' },
  { value: '==', label: 'Equal to (==)' },
  { value: '!=', label: 'Not equal (!=)' },
] as const;

export const FlexSpendingEditor: FC = () => {
  const flexSpendingConfig = useStore((state) => state.flexSpendingConfig);
  const setFlexSpendingConfig = useStore(
    (state) => state.setFlexSpendingConfig
  );

  const handleAddRule = () => {
    if (!flexSpendingConfig) return;

    const newRule = {
      id: `rule-${Date.now()}`,
      name: `Rule ${flexSpendingConfig.rules.length + 1}`,
      type: 'percentage-of-income' as const,
      baseValue: 10,
      isPercentage: true,
      conditions: [
        {
          type: 'always' as const,
          operator: '==' as const,
          value: 1,
        },
      ],
      enabled: true,
      priority: flexSpendingConfig.rules.length,
    };

    setFlexSpendingConfig({
      ...flexSpendingConfig,
      rules: [...flexSpendingConfig.rules, newRule],
    });
  };

  const handleRemoveRule = (ruleId: string) => {
    if (!flexSpendingConfig) return;

    setFlexSpendingConfig({
      ...flexSpendingConfig,
      rules: flexSpendingConfig.rules.filter((r) => r.id !== ruleId),
    });
  };

  const handleUpdateRule = (
    ruleId: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    updates: Partial<any>
  ) => {
    if (!flexSpendingConfig) return;

    const rules = flexSpendingConfig.rules.map((r) =>
      r.id === ruleId ? { ...r, ...updates } : r
    );

    setFlexSpendingConfig({
      ...flexSpendingConfig,
      rules,
    });

    setFlexSpendingConfig({
      ...flexSpendingConfig,
      rules: flexSpendingConfig.rules.map((r) =>
        r.id === ruleId ? { ...r, ...updates } : r
      ),
    });
  };

  const handleMoveRule = (ruleId: string, direction: 'up' | 'down') => {
    if (!flexSpendingConfig) return;

    const rules = [...flexSpendingConfig.rules];
    const index = rules.findIndex((r) => r.id === ruleId);

    if (index < 0) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= rules.length) return;

    const temp = rules[index];
    rules[index] = rules[newIndex];
    rules[newIndex] = temp;

    setFlexSpendingConfig({
      ...flexSpendingConfig,
      rules,
    });
  };

  const handleToggleEnabled = () => {
    if (!flexSpendingConfig) return;

    setFlexSpendingConfig({
      ...flexSpendingConfig,
      enabled: !flexSpendingConfig.enabled,
    });
  };

  return (
    <Stack gap="md">
      <Group justify="space-between" align="center">
        <Title order={3}>Flex Spending Rules</Title>
        <Switch
          label="Enable Flex Spending"
          checked={flexSpendingConfig?.enabled ?? false}
          onChange={handleToggleEnabled}
        />
      </Group>

      <Card withBorder p="md">
        {!flexSpendingConfig || flexSpendingConfig.rules.length === 0 ? (
          <Stack gap="sm" align="center" p="xl">
            <Text c="dimmed">No flex spending rules configured</Text>
            <Button leftSection={<Plus size={16} />} onClick={handleAddRule}>
              Add First Rule
            </Button>
          </Stack>
        ) : (
          <Stack gap="md">
            {flexSpendingConfig.rules.map((rule, index) => (
              <Card key={rule.id} withBorder p="md">
                <Stack gap="sm">
                  <Group justify="space-between" align="center">
                    <Group gap="xs" align="center">
                      <ActionIcon
                        size="sm"
                        variant="subtle"
                        disabled={index === 0}
                        onClick={() => handleMoveRule(rule.id, 'up')}
                      >
                        <ChevronUp size={14} />
                      </ActionIcon>
                      <ActionIcon
                        size="sm"
                        variant="subtle"
                        disabled={
                          index === flexSpendingConfig!.rules.length - 1
                        }
                        onClick={() => handleMoveRule(rule.id, 'down')}
                      >
                        <ChevronDown size={14} />
                      </ActionIcon>
                      <Text fw={500}>Priority {index + 1}</Text>
                      <Badge variant={rule.enabled ? 'filled' : 'outline'}>
                        {rule.enabled ? 'Active' : 'Disabled'}
                      </Badge>
                    </Group>
                    <Group gap="xs">
                      <Switch
                        size="sm"
                        checked={rule.enabled}
                        onChange={(e) =>
                          handleUpdateRule(rule.id, {
                            enabled: e.currentTarget.checked,
                          })
                        }
                      />
                      <ActionIcon
                        size="sm"
                        variant="subtle"
                        color="red"
                        onClick={() => handleRemoveRule(rule.id)}
                      >
                        <Trash size={14} />
                      </ActionIcon>
                    </Group>
                  </Group>

                  <Stack gap="xs">
                    <TextInput
                      label="Rule Name"
                      value={rule.name}
                      onChange={(e) =>
                        handleUpdateRule(rule.id, { name: e.target.value })
                      }
                    />

                    <Select
                      label="Rule Type"
                      data={RULE_TYPES}
                      value={rule.type}
                      onChange={(value) =>
                        value &&
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        handleUpdateRule(rule.id, { type: value as any })
                      }
                    />

                    <Group gap="sm">
                      <NumberInput
                        label="Base Value"
                        value={rule.baseValue}
                        onChange={(value) =>
                          handleUpdateRule(rule.id, {
                            baseValue: Number(value) || 0,
                          })
                        }
                        min={0}
                        flex={1}
                      />
                      <Switch
                        label="Is Percentage"
                        checked={rule.isPercentage}
                        onChange={(e) =>
                          handleUpdateRule(rule.id, {
                            isPercentage: e.currentTarget.checked,
                          })
                        }
                        mt={28}
                      />
                    </Group>

                    <Group gap="sm">
                      <NumberInput
                        label="Minimum Amount"
                        value={rule.minimumAmount ?? 0}
                        onChange={(value) =>
                          handleUpdateRule(rule.id, {
                            minimumAmount: value ? Number(value) : undefined,
                          })
                        }
                        min={0}
                        flex={1}
                      />
                      <NumberInput
                        label="Maximum Amount"
                        value={rule.maximumAmount ?? 0}
                        onChange={(value) =>
                          handleUpdateRule(rule.id, {
                            maximumAmount: value ? Number(value) : undefined,
                          })
                        }
                        min={0}
                        flex={1}
                      />
                    </Group>

                    <Box>
                      <Text size="sm" fw={500} mb="xs">
                        Conditions (all must be met)
                      </Text>
                      <Stack gap="xs">
                        {rule.conditions.map((condition, condIndex) => (
                          <Group gap="xs" key={condIndex}>
                            <Select
                              data={CONDITION_TYPES}
                              value={condition.type}
                              onChange={(value) =>
                                value &&
                                handleUpdateRule(rule.id, {
                                  conditions: rule.conditions.map((c, i) =>
                                    i === condIndex
                                      ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                        { ...c, type: value as any }
                                      : c
                                  ),
                                })
                              }
                              style={{ flex: 1 }}
                            />
                            <Select
                              data={OPERATORS}
                              value={condition.operator}
                              onChange={(value) =>
                                value &&
                                handleUpdateRule(rule.id, {
                                  conditions: rule.conditions.map((c, i) =>
                                    i === condIndex
                                      ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                        { ...c, operator: value as any }
                                      : c
                                  ),
                                })
                              }
                              style={{ flex: 1 }}
                            />
                            <NumberInput
                              value={condition.value}
                              onChange={(value) =>
                                handleUpdateRule(rule.id, {
                                  conditions: rule.conditions.map((c, i) =>
                                    i === condIndex
                                      ? { ...c, value: Number(value) || 0 }
                                      : c
                                  ),
                                })
                              }
                              style={{ flex: 1 }}
                            />
                          </Group>
                        ))}
                      </Stack>
                    </Box>
                  </Stack>
                </Stack>
              </Card>
            ))}

            <Button leftSection={<Plus size={16} />} onClick={handleAddRule}>
              Add Rule
            </Button>
          </Stack>
        )}
      </Card>
    </Stack>
  );
};
