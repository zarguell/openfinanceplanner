import { Paper, Text, Stack, Progress, Badge, Group } from '@mantine/core';
import type { ProgressMetrics, ProgressPoint } from '@/core/types';

interface ProgressTimelineChartProps {
  data: ProgressMetrics;
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'completed':
      return 'green';
    case 'on-track':
      return 'blue';
    case 'behind-schedule':
      return 'yellow';
    case 'at-risk':
      return 'red';
    case 'not-started':
      return 'gray';
    default:
      return 'gray';
  }
}

function ProgressPointCard({ point }: { point: ProgressPoint }) {
  const progressPercent = point.progress * 100;

  return (
    <Stack gap="xs">
      <Group justify="space-between">
        <Text size="sm" fw={600}>
          {point.goalName}
        </Text>
        <Badge color={getStatusColor(point.status)} variant="light">
          {point.status}
        </Badge>
      </Group>
      <Progress
        value={progressPercent}
        color={getStatusColor(point.status)}
        size="sm"
        animated
      />
      <Group justify="space-between">
        <Text size="xs" c="dimmed">
          {progressPercent.toFixed(0)}% complete
        </Text>
        <Text size="xs" c="dimmed">
          Due: {new Date(point.targetDate).toLocaleDateString()}
        </Text>
      </Group>
    </Stack>
  );
}

export function ProgressTimelineChart({ data }: ProgressTimelineChartProps) {
  if (!data || data.progressPoints.length === 0) {
    return (
      <Paper p="xl" ta="center" withBorder>
        <Text c="dimmed">Add goals to track progress</Text>
      </Paper>
    );
  }

  const sortedPoints = [...data.progressPoints].sort(
    (a, b) =>
      new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime()
  );

  return (
    <Paper p="md" withBorder radius="md">
      <Stack gap="md">
        <Text size="lg" fw={600}>
          Goal Progress Tracking
        </Text>

        <Stack gap="sm">
          <Group justify="space-between">
            <Text size="sm" fw={600}>
              Overall Progress
            </Text>
            <Text size="sm" c="dimmed">
              {(data.totalProgress * 100).toFixed(0)}%
            </Text>
          </Group>
          <Progress
            value={data.totalProgress * 100}
            color="blue"
            size="lg"
            striped
            animated
          />
        </Stack>

        <Stack gap="xs">
          <Group justify="space-between">
            <Text size="sm" fw={600}>
              Summary
            </Text>
          </Group>
          <Group gap="xs">
            <Badge color="green" variant="light">
              {data.completedGoals} Completed
            </Badge>
            <Badge color="blue" variant="light">
              {data.inProgressGoals} In Progress
            </Badge>
            <Badge color="cyan" variant="light">
              {data.onTrackGoals} On Track
            </Badge>
          </Group>
        </Stack>

        <Stack gap="md" mt="md">
          <Text size="sm" fw={600}>
            Goals Timeline
          </Text>
          {sortedPoints.map((point) => (
            <ProgressPointCard key={point.goalId} point={point} />
          ))}
        </Stack>
      </Stack>
    </Paper>
  );
}
