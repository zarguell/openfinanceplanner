import { useState } from 'react';
import {
  Button,
  Stack,
  Paper,
  Title,
  Text,
  Group,
  NumberInput,
  TextInput,
  Select,
  Switch,
  Divider,
  Badge,
} from '@mantine/core';
import { GripVertical, Plus, Trash2 } from 'lucide-react';
import type { CashFlowPriority, Goal } from '@/core/types';
import { createCashFlowPriority } from '@/core/goals';

interface PriorityManagerProps {
  priorities: CashFlowPriority[];
  goals: Goal[];
  onUpdatePriorities: (priorities: CashFlowPriority[]) => void;
}

export function PriorityManager({
  priorities,
  goals,
  onUpdatePriorities,
}: PriorityManagerProps) {
  const [newPriorityName, setNewPriorityName] = useState('');
  const [newAllocationPercentage, setNewAllocationPercentage] = useState(0);
  const [newIsMandatory, setNewIsMandatory] = useState(false);
  const [newDescription, setNewDescription] = useState('');
  const [selectedGoalIds, setSelectedGoalIds] = useState<readonly string[]>([]);

  const sortedPriorities = [...priorities].sort((a, b) => a.order - b.order);

  const totalAllocation = priorities.reduce(
    (sum, p) => sum + p.allocationPercentage,
    0
  );

  const handleAddPriority = () => {
    if (!newPriorityName) return;

    const priority = createCashFlowPriority({
      name: newPriorityName,
      order: sortedPriorities.length + 1,
      goalIds: selectedGoalIds,
      allocationPercentage: newAllocationPercentage,
      mandatory: newIsMandatory,
      description: newDescription || undefined,
    });

    onUpdatePriorities([...priorities, priority]);

    setNewPriorityName('');
    setNewAllocationPercentage(0);
    setNewIsMandatory(false);
    setNewDescription('');
    setSelectedGoalIds([]);
  };

  const handleDeletePriority = (priorityId: string) => {
    const updated = priorities
      .filter((p) => p.id !== priorityId)
      .map((p, index) => ({ ...p, order: index + 1 }));
    onUpdatePriorities(updated);
  };

  const handleMovePriority = (priorityId: string, direction: 'up' | 'down') => {
    const index = sortedPriorities.findIndex((p) => p.id === priorityId);
    if (index < 0) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= sortedPriorities.length) return;

    const reordered = [...sortedPriorities];
    [reordered[index], reordered[newIndex]] = [
      reordered[newIndex],
      reordered[index],
    ];

    onUpdatePriorities(reordered.map((p, i) => ({ ...p, order: i + 1 })));
  };

  return (
    <Paper withBorder p="md" shadow="sm">
      <Stack>
        <Group justify="space-between" align="center">
          <Title order={3}>Cash Flow Priorities</Title>
          <Badge
            color={
              totalAllocation > 100
                ? 'red'
                : totalAllocation === 100
                  ? 'green'
                  : 'yellow'
            }
            variant="filled"
          >
            Total: {totalAllocation}%
          </Badge>
        </Group>

        {totalAllocation > 100 && (
          <Text c="red" size="sm">
            Warning: Total allocation exceeds 100%. Adjust priorities to avoid
            overdrafting.
          </Text>
        )}

        <Divider />

        <Stack gap="xs">
          {sortedPriorities.map((priority) => (
            <Paper key={priority.id} withBorder p="xs" bg="gray.0">
              <Group gap="xs">
                <Group gap={4}>
                  <Button
                    variant="subtle"
                    size="xs"
                    onClick={() => handleMovePriority(priority.id, 'up')}
                    disabled={priority.order === 1}
                  >
                    ↑
                  </Button>
                  <Button
                    variant="subtle"
                    size="xs"
                    onClick={() => handleMovePriority(priority.id, 'down')}
                    disabled={priority.order === sortedPriorities.length}
                  >
                    ↓
                  </Button>
                  <GripVertical size={16} />
                </Group>

                <Stack gap={0} style={{ flex: 1 }}>
                  <Group justify="space-between">
                    <Text fw={500}>{priority.name}</Text>
                    <Group gap={4}>
                      {priority.mandatory && (
                        <Badge size="xs" color="blue" variant="filled">
                          Mandatory
                        </Badge>
                      )}
                      <Badge size="xs" variant="filled">
                        {priority.allocationPercentage}%
                      </Badge>
                    </Group>
                  </Group>

                  {priority.description && (
                    <Text size="xs" c="dimmed">
                      {priority.description}
                    </Text>
                  )}

                  {priority.goalIds.length > 0 && (
                    <Text size="xs" c="dimmed">
                      Goals:{' '}
                      {priority.goalIds
                        .map((id) => goals.find((g) => g.id === id)?.name)
                        .filter(Boolean)
                        .join(', ')}
                    </Text>
                  )}
                </Stack>

                <Button
                  variant="subtle"
                  color="red"
                  size="xs"
                  onClick={() => handleDeletePriority(priority.id)}
                >
                  <Trash2 size={16} />
                </Button>
              </Group>
            </Paper>
          ))}

          {sortedPriorities.length === 0 && (
            <Text c="dimmed" ta="center" py="md">
              No priorities configured. Add your first priority below.
            </Text>
          )}
        </Stack>

        <Divider />

        <Stack gap="xs">
          <Text fw={500}>Add New Priority</Text>

          <TextInput
            label="Priority Name"
            value={newPriorityName}
            onChange={(event) => setNewPriorityName(event.currentTarget.value)}
            placeholder="e.g., Essential Expenses"
          />

          <Group grow>
            <NumberInput
              label="Allocation Percentage"
              value={newAllocationPercentage}
              onChange={(value) => setNewAllocationPercentage(value as number)}
              min={0}
              max={100}
              suffix="%"
              placeholder="e.g., 30"
            />
            <Switch
              label="Mandatory"
              checked={newIsMandatory}
              onChange={(event) =>
                setNewIsMandatory(event.currentTarget.checked)
              }
              description="Must be funded before flexible priorities"
            />
          </Group>

          <TextInput
            label="Description (optional)"
            value={newDescription}
            onChange={(event) => setNewDescription(event.currentTarget.value)}
            placeholder="e.g., Housing, utilities, groceries"
          />

          <Select
            label="Associated Goals (optional)"
            data={goals.map((g) => ({ value: g.id, label: g.name }))}
            value={null}
            onChange={(value) => {
              if (value && !selectedGoalIds.includes(value)) {
                setSelectedGoalIds([...selectedGoalIds, value]);
              }
            }}
            placeholder="Select goals to include"
          />

          {selectedGoalIds.length > 0 && (
            <Group gap="xs">
              {selectedGoalIds.map((id) => {
                const goal = goals.find((g) => g.id === id);
                return (
                  <Badge
                    key={id}
                    rightSection={
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedGoalIds(
                            selectedGoalIds.filter((i) => i !== id)
                          )
                        }
                        style={{ cursor: 'pointer' }}
                      >
                        ✕
                      </button>
                    }
                  >
                    {goal?.name}
                  </Badge>
                );
              })}
            </Group>
          )}

          <Button onClick={handleAddPriority} leftSection={<Plus size={16} />}>
            Add Priority
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
}
