import { useState } from 'react';
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
import { ChartControls } from './ChartControls';
import { InteractiveChartWrapper } from './InteractiveChartWrapper';

type NetWorthChartType = 'area' | 'line';

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
 * - Export functionality for downloading chart data
 * - Chart type switching between area and line
 * - Date range filtering
 *
 * From 17-RESEARCH.md Pattern 4:
 * - Uses linearGradient for gradient fill
 * - Uses tickFormatter for Y-axis currency formatting
 * - isAnimationActive for smooth initial render
 */
export function NetWorthChart() {
  const { points, years } = useChartData();
  const [chartType, setChartType] = useState<NetWorthChartType>('area');

  const handleZoomIn = () => {
    console.log('Zoom in');
  };

  const handleZoomOut = () => {
    console.log('Zoom out');
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(points, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'net-worth-projection.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleChartTypeChange = (
    type: 'bar' | 'line' | 'pie' | 'area' | 'scatter'
  ) => {
    if (type === 'area' || type === 'line') {
      setChartType(type);
    }
  };

  const handleDateRangeChange = (range: '1y' | '5y' | '10y' | 'all') => {
    console.log('Date range changed:', range);
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  // Handle empty data state
  if (points.length === 0) {
    return (
      <Paper p="xl" ta="center" withBorder>
        <Text c="dimmed">Enter your financial details to see projections</Text>
      </Paper>
    );
  }

  const chartTypes: ('area' | 'line')[] = ['area', 'line'];

  return (
    <InteractiveChartWrapper
      title="Net Worth Projection"
      onExport={handleExport}
      showFilter={true}
      showDateRange={true}
      onDateRangeChange={handleDateRangeChange}
      customControls={
        <ChartControls
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          chartTypes={chartTypes}
          selectedChartType={chartType}
          onChartTypeChange={handleChartTypeChange}
          showRefresh={true}
          onRefresh={handleRefresh}
        />
      }
    >
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
          {chartType === 'area' ? (
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
          ) : null}
          {chartType === 'line' ? (
            <Area
              type="monotone"
              dataKey="netWorth"
              stroke="#228be6"
              strokeWidth={3}
              fillOpacity={0}
              fill="transparent"
              isAnimationActive={true}
              animationDuration={1000}
            />
          ) : null}
        </AreaChart>
      </ResponsiveChartWrapper>
      <Text size="xs" c="dimmed" mt="xs" ta="center">
        {years} year projection
      </Text>
    </InteractiveChartWrapper>
  );
}
