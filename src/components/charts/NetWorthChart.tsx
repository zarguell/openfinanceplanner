import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

import { Paper, Text } from '@mantine/core';
import { useChartData } from '@/hooks/useChartData';
import { ResponsiveChartWrapper } from './ResponsiveChartWrapper';
import { CustomTooltip } from './CustomTooltip';
import { formatCurrencyCompact } from '@/utils/currency';

const CHART_MARGIN = { top: 10, right: 30, left: 0, bottom: 0 };

/**
 * Net worth projection area chart with gradient fill.
 *
 * Features:
 * - Area chart with gradient fill for visual appeal
 * - X-axis shows age
 * - Y-axis shows net worth with compact currency formatting
 * - Custom tooltip on hover showing exact values
 * - Responsive sizing via ResponsiveChartWrapper
 * - Synchronized with Zustand store via useChartData hook
 *
 * From 17-RESEARCH.md Pattern 4:
 * - Uses linearGradient for gradient fill
 * - Uses tickFormatter for Y-axis currency formatting
 * - isAnimationActive for smooth initial render
 */
export function NetWorthChart() {
  const { points, years } = useChartData();

  // Handle empty data state
  if (points.length === 0) {
    return (
      <Paper p="xl" ta="center" withBorder>
        <Text c="dimmed">Enter your financial details to see projections</Text>
      </Paper>
    );
  }

  return (
    <Paper p="md" withBorder radius="md">
      <Text size="lg" fw={600} mb="md">
        Net Worth Projection
      </Text>
      <ResponsiveChartWrapper height={350} minHeight={250}>
        <AreaChart data={points} margin={CHART_MARGIN}>
          <defs>
            <linearGradient id="colorNetWorth" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#228be6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#228be6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="#e9ecef"
          />
          <XAxis
            dataKey="age"
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: '#ced4da' }}
          />
          <YAxis
            tickFormatter={formatCurrencyCompact}
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            width={60}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{
              stroke: '#228be6',
              strokeWidth: 2,
              strokeDasharray: '5 5',
            }}
          />
          <Area
            type="monotone"
            dataKey="netWorth"
            stroke="#228be6"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorNetWorth)"
            isAnimationActive={true}
            animationDuration={1000}
          />
        </AreaChart>
      </ResponsiveChartWrapper>
      <Text size="xs" c="dimmed" mt="xs" ta="center">
        {years} year projection
      </Text>
    </Paper>
  );
}
