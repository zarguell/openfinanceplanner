import type { FC } from 'react';
import React from 'react';
import { useStore } from '@/store';
import {
  Box,
  Button,
  Card,
  Group,
  Stack,
  Text,
  Title,
  Table,
  Badge,
} from '@mantine/core';
import { BarChart3, Play, X } from 'lucide-react';

export const ScenarioCompare: FC = () => {
  const scenarios = useStore((state) => state.scenarios);
  const comparisonResult = useStore((state) => state.comparisonResult);
  const setComparisonResult = useStore((state) => state.setComparisonResult);
  const clearComparisonResult = useStore(
    (state) => state.clearComparisonResult
  );

  const [selectedScenarioIds, setSelectedScenarioIds] = React.useState<
    string[]
  >([]);

  const handleCompare = () => {
    if (selectedScenarioIds.length < 2) {
      alert('Please select at least 2 scenarios to compare');
      return;
    }

    const selectedScenarios = scenarios.filter((s) =>
      selectedScenarioIds.includes(s.id)
    );

    const scenarioData = selectedScenarios.map((scenario) => ({
      scenarioId: scenario.id,
      scenarioName: scenario.name,
      netWorth: 0,
      income: 0,
      expenses: 0,
      cashFlow: 0,
    }));

    const comparison = {
      id: `comparison-${Date.now()}`,
      scenarioIds: selectedScenarioIds,
      comparisonData: [
        {
          year: 0,
          age: 0,
          scenarios: scenarioData,
        },
      ],
      summary: {
        avgNetWorthDiff: 0,
        maxNetWorthDiff: 0,
        maxDiffYear: 0,
        highestScenarioId: '',
        lowestScenarioId: '',
      },
      createdAt: new Date().toISOString().split('T')[0],
    } as const;

    setComparisonResult(comparison);
  };

  const handleClear = () => {
    clearComparisonResult();
    setSelectedScenarioIds([]);
  };

  if (!comparisonResult) {
    return (
      <Stack gap="md">
        <Title order={3}>Compare Scenarios</Title>
        <Card withBorder p="xl">
          <Stack gap="md">
            <Text>Select scenarios to compare:</Text>
            <Group gap="sm" wrap="wrap">
              {scenarios.map((scenario) => (
                <Badge
                  key={scenario.id}
                  variant={
                    selectedScenarioIds.includes(scenario.id)
                      ? 'filled'
                      : 'outline'
                  }
                  style={{ cursor: 'pointer' }}
                  onClick={() =>
                    setSelectedScenarioIds((prev) =>
                      prev.includes(scenario.id)
                        ? prev.filter((id) => id !== scenario.id)
                        : [...prev, scenario.id]
                    )
                  }
                >
                  {scenario.name}
                </Badge>
              ))}
            </Group>
            <Group>
              <Button
                leftSection={<Play size={16} />}
                onClick={handleCompare}
                disabled={selectedScenarioIds.length < 2}
              >
                Compare Scenarios
              </Button>
            </Group>
          </Stack>
        </Card>
      </Stack>
    );
  }

  const comparedScenarios = scenarios.filter((s) =>
    comparisonResult.scenarioIds.includes(s.id)
  );

  return (
    <Stack gap="md">
      <Group justify="space-between" align="center">
        <Title order={3}>Scenario Comparison</Title>
        <Button
          leftSection={<X size={16} />}
          variant="light"
          onClick={handleClear}
        >
          Clear Comparison
        </Button>
      </Group>

      <Card withBorder>
        <Stack gap="md">
          <Box style={{ textAlign: 'center', padding: 'md' }}>
            <Group gap="xs" justify="center" mb="xs">
              <BarChart3 size={24} />
              <Title order={4}>Comparison Results</Title>
            </Group>
            <Text size="sm" c="dimmed">
              Comparing {comparedScenarios.length} scenarios
            </Text>
          </Box>

          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Scenario</Table.Th>
                {comparedScenarios.map((scenario) => (
                  <Table.Th key={scenario.id}>{scenario.name}</Table.Th>
                ))}
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              <Table.Tr>
                <Table.Td>Status</Table.Td>
                {comparedScenarios.map((scenario) => (
                  <Table.Td key={scenario.id}>
                    <Badge
                      color={
                        scenario.id ===
                        comparisonResult.summary.highestScenarioId
                          ? 'green'
                          : 'gray'
                      }
                      variant="light"
                    >
                      {scenario.id ===
                      comparisonResult.summary.highestScenarioId
                        ? 'Highest'
                        : '-'}
                    </Badge>
                  </Table.Td>
                ))}
              </Table.Tr>
            </Table.Tbody>
          </Table>

          <Card withBorder p="md" bg="gray.0">
            <Stack gap="sm">
              <Text fw={500}>Summary</Text>
              <Text size="sm">
                Maximum difference:{' '}
                <Text span fw={500}>
                  ${comparisonResult.summary.maxNetWorthDiff.toLocaleString()}
                </Text>
              </Text>
              <Text size="sm" c="dimmed">
                Comparison created: {comparisonResult.createdAt}
              </Text>
            </Stack>
          </Card>
        </Stack>
      </Card>
    </Stack>
  );
};
