import type { TooltipContentProps } from 'recharts';
import { Paper, Text, Stack } from '@mantine/core';
import { formatCurrency } from '@/utils/currency';
import type {
  ValueType,
  NameType,
} from 'recharts/types/component/DefaultTooltipContent';

type CustomTooltipProps = Partial<TooltipContentProps<ValueType, NameType>>;

/**
 * Custom tooltip for financial charts.
 *
 * From 17-RESEARCH.md Pattern 2:
 * - Custom tooltip for formatting currency values and dates
 * - Uses Mantine Paper for consistent styling
 * - Formats monetary values with formatCurrency utility
 */
export function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    const data = payload[0];
    const value = data.value as number;

    return (
      <Paper
        shadow="sm"
        radius="md"
        p="sm"
        withBorder
        style={{
          backgroundColor: 'white',
        }}
      >
        <Stack gap={4}>
          <Text size="sm" fw={600} c="dimmed">
            Age {label}
          </Text>
          <Text size="md" fw={700} c="blue">
            {formatCurrency(value)}
          </Text>
        </Stack>
      </Paper>
    );
  }

  return null;
}
