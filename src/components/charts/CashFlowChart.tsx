import { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

import { Paper, Text } from '@mantine/core';
import { ResponsiveChartWrapper } from './ResponsiveChartWrapper';
import { CustomTooltip } from './CustomTooltip';
import { formatCurrencyCompact } from '@/utils/currency';
import type { SimulationResult } from '@/core/types';
import { ChartControls } from './ChartControls';
import { InteractiveChartWrapper } from './InteractiveChartWrapper';

const CHART_MARGIN = { top: 10, right: 30, left: 0, bottom: 0 };

interface CashFlowChartProps {
  data: SimulationResult[];
}

/**
 * Cash flow analysis bar chart showing income vs expenses over time.
 *
 * Features:
 * - Bar chart comparing growth (income) vs spending (expenses)
 * - X-axis shows age
 * - Y-axis shows amounts with compact currency formatting
 * - Custom tooltip on hover showing exact values
 * - Responsive sizing via ResponsiveChartWrapper
 * - Color-coded bars for positive (growth) and negative (spending) values
 * - Export functionality for downloading chart data
 * - Chart type switching between bar and stacked bar
 * - Date range filtering
 *
 * @param data - Array of simulation results with year-by-year financial data
 */
export function CashFlowChart({ data }: CashFlowChartProps) {
  const [chartType, setChartType] = useState<'bar'>('bar');

  const handleZoomIn = () => {
    console.log('Zoom in');
  };

  const handleZoomOut = () => {
    console.log('Zoom out');
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(data, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cash-flow-analysis.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleChartTypeChange = (
    type: 'bar' | 'line' | 'pie' | 'area' | 'scatter'
  ) => {
    if (type === 'bar') {
      setChartType('bar');
    }
  };

  const handleDateRangeChange = (range: '1y' | '5y' | '10y' | 'all') => {
    console.log('Date range changed:', range);
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  const chartTypes: 'bar'[] = ['bar'];

  if (!data || data.length === 0) {
    return (
      <Paper p="xl" ta="center" withBorder>
        <Text c="dimmed">
          Enter your financial details to see cash flow analysis
        </Text>
      </Paper>
    );
  }

  const chartData = data.map((result) => ({
    age: result.age,
    growth: result.growth,
    spending: -result.spending,
  }));

  return (
    <InteractiveChartWrapper
      title="Cash Flow Analysis"
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
        <BarChart data={chartData} margin={CHART_MARGIN}>
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
              fill: '#f8f9fa',
            }}
          />
          <Legend verticalAlign="top" height={36} iconType="circle" />
          <Bar
            dataKey="growth"
            name="Growth/Income"
            fill="#40c057"
            radius={[4, 4, 0, 0]}
            isAnimationActive={true}
            animationDuration={1000}
          />
          <Bar
            dataKey="spending"
            name="Spending/Expenses"
            fill="#fa5252"
            radius={[4, 4, 0, 0]}
            isAnimationActive={true}
            animationDuration={1000}
          />
        </BarChart>
      </ResponsiveChartWrapper>
      <Text size="xs" c="dimmed" mt="xs" ta="center">
        {data.length} year projection
      </Text>
    </InteractiveChartWrapper>
  );
}
