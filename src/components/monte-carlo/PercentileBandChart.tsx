import { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Card, Stack, Text, Title } from '@mantine/core';
import type { PercentileBandData } from '@/core/types';

interface PercentileBandChartProps {
  percentileBands: readonly PercentileBandData[];
  percentiles: readonly number[];
}

export default function PercentileBandChart({
  percentileBands,
  percentiles,
}: PercentileBandChartProps) {
  const chartData = useMemo(() => {
    return percentileBands.map((band) => ({
      year: band.year,
      age: band.age,
      ...Object.fromEntries(percentiles.map((p) => [`p${p}`, band[p]])),
    }));
  }, [percentileBands, percentiles]);

  const sortedPercentiles = [...percentiles].sort((a, b) => a - b);

  const getColorForPercentile = (_percentile: number, index: number) => {
    const colors = [
      '#10b981',
      '#22c55e',
      '#84cc16',
      '#eab308',
      '#f97316',
      '#ef4444',
    ];
    return colors[index % colors.length];
  };

  return (
    <Stack gap="md">
      <Title order={3}>Monte Carlo Percentile Bands</Title>

      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Stack gap="md">
          <Text size="sm" c="dimmed">
            Visualize the range of possible outcomes across all simulations
          </Text>

          <div style={{ width: '100%', height: 400 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />

                <XAxis
                  dataKey="year"
                  label={{
                    value: 'Year',
                    position: 'insideBottom',
                    offset: -5,
                  }}
                  tick={{ fontSize: 12 }}
                />

                <YAxis
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                  tick={{ fontSize: 12 }}
                  label={{
                    value: 'Portfolio Value',
                    angle: -90,
                    position: 'insideLeft',
                  }}
                />

                <Tooltip
                  formatter={(value: number | undefined) => [
                    value !== undefined
                      ? `$${value.toLocaleString(undefined, {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        })}`
                      : '$0',
                    'Balance',
                  ]}
                  labelFormatter={(label, payload) => {
                    if (!payload || payload.length === 0) return `${label}`;
                    return `Year ${label} (Age ${payload[0]?.payload?.age})`;
                  }}
                />

                {sortedPercentiles.map((percentile, index) => (
                  <Area
                    key={`p${percentile}`}
                    type="monotone"
                    dataKey={`p${percentile}`}
                    stroke={getColorForPercentile(percentile, index)}
                    strokeWidth={2}
                    fill={getColorForPercentile(percentile, index)}
                    fillOpacity={0.1}
                    name={`${percentile}th Percentile`}
                  />
                ))}

                <Legend />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <Stack gap="sm">
            <Text size="sm" fw={500}>
              Interpretation Guide
            </Text>

            {sortedPercentiles.map((percentile) => (
              <Text key={percentile} size="sm">
                <Text fw={500} inherit>
                  {percentile}th Percentile:
                </Text>{' '}
                {percentile <= 10
                  ? 'Pessimistic scenario - worst outcomes'
                  : percentile <= 25
                    ? 'Poor scenario - below average outcomes'
                    : percentile === 50
                      ? 'Median scenario - average outcome'
                      : percentile <= 75
                        ? 'Good scenario - above average outcomes'
                        : percentile <= 90
                          ? 'Optimistic scenario - best outcomes'
                          : 'Very optimistic scenario - exceptional outcomes'}
              </Text>
            ))}
          </Stack>
        </Stack>
      </Card>
    </Stack>
  );
}
