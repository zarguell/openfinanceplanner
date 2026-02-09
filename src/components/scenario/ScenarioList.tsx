import type { FC } from 'react';
import { useStore } from '@/store';
import {
  Button,
  Card,
  Group,
  Stack,
  Text,
  Title,
  ActionIcon,
  Menu,
  Badge,
} from '@mantine/core';
import { MoreHorizontal, Copy, Trash, Plus, Camera } from 'lucide-react';

export const ScenarioList: FC = () => {
  const scenarios = useStore((state) => state.scenarios);
  const currentScenarioId = useStore((state) => state.currentScenarioId);
  const deleteScenario = useStore((state) => state.deleteScenario);
  const cloneScenario = useStore((state) => state.cloneScenario);
  const setCurrentScenario = useStore((state) => state.setCurrentScenario);
  const addSnapshot = useStore((state) => state.addSnapshot);

  const handleClone = (id: string, name: string) => {
    const newName = `${name} (Copy)`;
    cloneScenario(id, newName);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this scenario?')) {
      deleteScenario(id);
    }
  };

  const handleSelect = (id: string) => {
    setCurrentScenario(id);
  };

  const handleSnapshot = (scenarioId: string, scenarioName: string) => {
    const currentPlan = useStore.getState().getCurrentPlan();
    if (!currentPlan) {
      alert('No plan selected to snapshot');
      return;
    }

    const projection = useStore.getState().projection;
    const profile = useStore.getState().profile;
    const incomes = useStore.getState().incomes;
    const expenses = useStore.getState().expenses;

    const snapshotName = window.prompt(
      `Create a snapshot of "${scenarioName}"`,
      `Snapshot ${new Date().toLocaleDateString()}`
    );

    if (snapshotName) {
      addSnapshot({
        id: `snapshot-${Date.now()}`,
        scenarioId,
        name: snapshotName,
        createdAt: new Date().toISOString().split('T')[0],
        planData: currentPlan,
        simulationData: projection ?? undefined,
        profileData: profile ?? undefined,
        incomeData: incomes ?? undefined,
        expenseData: expenses ?? undefined,
      });
    }
  };

  return (
    <Stack gap="md">
      <Group justify="space-between" align="center">
        <Title order={3}>Scenarios</Title>
        <Button leftSection={<Plus size={16} />} size="sm">
          New Scenario
        </Button>
      </Group>

      {scenarios.length === 0 ? (
        <Card withBorder p="xl" ta="center">
          <Stack gap="sm" align="center">
            <Text c="dimmed">No scenarios created yet</Text>
            <Text size="sm" c="dimmed">
              Create your first scenario to compare different financial plans
            </Text>
          </Stack>
        </Card>
      ) : (
        <Stack gap="sm">
          {scenarios.map((scenario) => (
            <Card
              key={scenario.id}
              withBorder
              p="md"
              style={{
                cursor: 'pointer',
                borderColor:
                  scenario.id === currentScenarioId
                    ? 'var(--mantine-color-blue-6)'
                    : undefined,
              }}
              onClick={() => handleSelect(scenario.id)}
            >
              <Group justify="space-between" align="center">
                <Stack gap={4} flex={1}>
                  <Group gap="xs" align="center">
                    <Text fw={500}>{scenario.name}</Text>
                    {scenario.id === currentScenarioId && (
                      <Badge variant="light" color="blue" size="xs">
                        Active
                      </Badge>
                    )}
                    {scenario.status === 'archived' && (
                      <Badge variant="light" color="gray" size="xs">
                        Archived
                      </Badge>
                    )}
                  </Group>
                  {scenario.description && (
                    <Text size="sm" c="dimmed" lineClamp={1}>
                      {scenario.description}
                    </Text>
                  )}
                  <Text size="xs" c="dimmed">
                    Modified: {scenario.modifiedAt} • Version {scenario.version}
                  </Text>
                </Stack>

                <Menu shadow="md" width={200} position="bottom-end">
                  <Menu.Target>
                    <ActionIcon variant="subtle">
                      <MoreHorizontal size={16} />
                    </ActionIcon>
                  </Menu.Target>

                  <Menu.Dropdown>
                    <Menu.Label>Actions</Menu.Label>
                    <Menu.Item
                      leftSection={<Copy size={14} />}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleClone(scenario.id, scenario.name);
                      }}
                    >
                      Clone Scenario
                    </Menu.Item>
                    <Menu.Item
                      leftSection={<Camera size={14} />}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSnapshot(scenario.id, scenario.name);
                      }}
                    >
                      Create Snapshot
                    </Menu.Item>
                    <Menu.Divider />
                    <Menu.Item
                      leftSection={<Trash size={14} />}
                      color="red"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(scenario.id);
                      }}
                    >
                      Delete Scenario
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              </Group>
            </Card>
          ))}
        </Stack>
      )}
    </Stack>
  );
};
