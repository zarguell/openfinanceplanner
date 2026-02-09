import {
  Paper,
  Title,
  Stack,
  Text,
  Group,
  Badge,
  Progress,
  SimpleGrid,
  Card,
  Center,
} from '@mantine/core';
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import type { Goal } from '@/core/types';
import { calculateGoalProgress } from '@/core/goals';

interface GoalHeatmapProps {
  goals: Goal[];
  currentDate?: string;
}

export function GoalHeatmap({ goals, currentDate }: GoalHeatmapProps) {
  const today = currentDate ?? new Date().toISOString().split('T')[0];

  const getGoalStatusColor = (status: Goal['status']) => {
    switch (status) {
      case 'completed':
        return 'green';
      case 'on-track':
        return 'green';
      case 'not-started':
        return 'gray';
      case 'behind-schedule':
        return 'orange';
      case 'at-risk':
        return 'red';
      case 'cancelled':
        return 'gray';
      default:
        return 'gray';
    }
  };

  const getGoalStatusIcon = (status: Goal['status']) => {
    switch (status) {
      case 'completed':
      case 'on-track':
        return <CheckCircle size={16} />;
      case 'behind-schedule':
        return <Clock size={16} />;
      case 'at-risk':
        return <AlertTriangle size={16} />;
      case 'not-started':
      case 'cancelled':
      default:
        return null;
    }
  };

  const getPriorityColor = (priority: Goal['priority']) => {
    switch (priority) {
      case 'critical':
        return 'red';
      case 'high':
        return 'orange';
      case 'medium':
        return 'yellow';
      case 'low':
        return 'gray';
    }
  };

  const getProgressTrend = (goal: Goal) => {
    if (goal.status === 'completed') return null;

    const targetDate = new Date(goal.targetDate);
    const startDate = new Date(goal.startDate);
    const todayDate = new Date(today);

    const totalDays = Math.floor(
      (targetDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    const elapsedDays = Math.floor(
      (todayDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    const expectedProgress = (elapsedDays / totalDays) * 100;
    const actualProgress = calculateGoalProgress(
      goal.currentAmount,
      goal.targetAmount
    );

    if (actualProgress > expectedProgress) {
      return <TrendingUp size={16} color="green" />;
    } else if (actualProgress < expectedProgress * 0.8) {
      return <TrendingDown size={16} color="red" />;
    }
    return null;
  };

  return (
    <Paper withBorder p="md" shadow="sm">
      <Stack>
        <Title order={3}>Goals Overview</Title>
        <Text size="sm" c="dimmed">
          Track progress on your financial goals across all priorities.
        </Text>

        {goals.length === 0 ? (
          <Center py="xl">
            <Text c="dimmed">No goals configured yet.</Text>
          </Center>
        ) : (
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
            {goals.map((goal) => {
              const progress = calculateGoalProgress(
                goal.currentAmount,
                goal.targetAmount
              );
              const statusColor = getGoalStatusColor(goal.status);
              const priorityColor = getPriorityColor(goal.priority);
              const trendIcon = getProgressTrend(goal);

              return (
                <Card key={goal.id} withBorder padding="md">
                  <Stack gap="xs">
                    <Group justify="space-between" align="flex-start">
                      <Stack gap={0}>
                        <Group gap="xs">
                          <Text fw={500} size="sm">
                            {goal.name}
                          </Text>
                          <Badge
                            size="xs"
                            color={priorityColor}
                            variant="light"
                          >
                            {goal.priority}
                          </Badge>
                        </Group>
                        <Group gap="xs">
                          {goal.mandatory && (
                            <Badge size="xs" color="blue" variant="filled">
                              Mandatory
                            </Badge>
                          )}
                          <Badge
                            size="xs"
                            color={statusColor}
                            variant="light"
                            leftSection={getGoalStatusIcon(goal.status)}
                          >
                            {goal.status
                              .split('-')
                              .map(
                                (word) =>
                                  word.charAt(0).toUpperCase() + word.slice(1)
                              )
                              .join(' ')}
                          </Badge>
                        </Group>
                      </Stack>
                      {trendIcon}
                    </Group>

                    <Progress value={progress} color={statusColor} size="md" />

                    <Group justify="space-between" mt="xs">
                      <Stack gap={0}>
                        <Text size="xs" c="dimmed">
                          Progress
                        </Text>
                        <Text size="sm" fw={500}>
                          ${goal.currentAmount.toLocaleString()} / $
                          {goal.targetAmount.toLocaleString()} (
                          {progress.toFixed(1)}%)
                        </Text>
                      </Stack>

                      {goal.monthlyContribution && (
                        <Stack gap={0} ta="right">
                          <Text size="xs" c="dimmed">
                            Monthly
                          </Text>
                          <Text size="sm" fw={500}>
                            ${goal.monthlyContribution.toLocaleString()}
                          </Text>
                        </Stack>
                      )}
                    </Group>

                    {goal.description && (
                      <Text size="xs" c="dimmed" lineClamp={2}>
                        {goal.description}
                      </Text>
                    )}

                    {goal.tags && goal.tags.length > 0 && (
                      <Group gap={4} mt="xs">
                        {goal.tags.map((tag) => (
                          <Badge key={tag} size="xs" variant="light">
                            {tag}
                          </Badge>
                        ))}
                      </Group>
                    )}
                  </Stack>
                </Card>
              );
            })}
          </SimpleGrid>
        )}

        <Stack gap="xs">
          <Text size="sm" fw={500}>
            Summary
          </Text>
          <Group grow>
            <Stack gap={0} style={{ flex: 1 }}>
              <Text size="xs" c="dimmed">
                Total Goals
              </Text>
              <Text size="lg" fw={500}>
                {goals.length}
              </Text>
            </Stack>
            <Stack gap={0} style={{ flex: 1 }}>
              <Text size="xs" c="dimmed">
                Completed
              </Text>
              <Text size="lg" fw={500} c="green">
                {goals.filter((g) => g.status === 'completed').length}
              </Text>
            </Stack>
            <Stack gap={0} style={{ flex: 1 }}>
              <Text size="xs" c="dimmed">
                On Track
              </Text>
              <Text size="lg" fw={500} c="green">
                {goals.filter((g) => g.status === 'on-track').length}
              </Text>
            </Stack>
            <Stack gap={0} style={{ flex: 1 }}>
              <Text size="xs" c="dimmed">
                Behind Schedule
              </Text>
              <Text size="lg" fw={500} c="orange">
                {goals.filter((g) => g.status === 'behind-schedule').length}
              </Text>
            </Stack>
            <Stack gap={0} style={{ flex: 1 }}>
              <Text size="xs" c="dimmed">
                At Risk
              </Text>
              <Text size="lg" fw={500} c="red">
                {goals.filter((g) => g.status === 'at-risk').length}
              </Text>
            </Stack>
          </Group>
        </Stack>
      </Stack>
    </Paper>
  );
}
