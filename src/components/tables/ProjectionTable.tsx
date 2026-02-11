import { useMemo } from 'react';
import { Table, Paper, Text, ScrollArea, Badge } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { useChartData } from '@/hooks/useChartData';
import { formatCurrency } from '@/utils/currency';

interface TableRow {
  year: number;
  age: number;
  startingBalance: number;
  growth: number;
  spending: number;
  endingBalance: number;
  growthRate: number;
}

/**
 * Year-by-year projection data table.
 *
 * Features:
 * - Displays all projection years from simulation
 * - Shows age, starting balance, annual growth, spending, ending balance
 * - Highlights milestone years (e.g., retirement age)
 * - Responsive horizontal scroll on mobile
 * - Formatted currency values
 * - Synchronized with chart via useChartData hook
 * - Accessible with proper table caption and ARIA attributes
 * - Memoized to prevent unnecessary re-renders
 */
export function ProjectionTable() {
  const { points } = useChartData();
  const isMobile = useMediaQuery('(max-width: 768px)');

  const rows = useMemo<TableRow[]>(() => {
    return points.map((point, index) => {
      const prevPoint = index > 0 ? points[index - 1] : null;
      const growthRate = prevPoint
        ? ((point.netWorth - prevPoint.netWorth) / prevPoint.netWorth) * 100
        : 0;

      return {
        year: point.year,
        age: point.age,
        startingBalance: point.startingBalance,
        growth: point.growth,
        spending: point.spending,
        endingBalance: point.endingBalance,
        growthRate,
      };
    });
  }, [points]);

  // Empty state
  if (points.length === 0) {
    return (
      <Paper p="xl" ta="center" withBorder>
        <Text c="dimmed">
          Enter your financial details to see year-by-year projections
        </Text>
      </Paper>
    );
  }

  const startAge = points[0]?.age ?? 0;
  const endAge = points[points.length - 1]?.age ?? 0;

  return (
    <Paper p="md" withBorder radius="md">
      <Text size="lg" fw={600} mb="md" id="projection-table-title">
        Year-by-Year Projection
      </Text>

      <ScrollArea type="auto" offsetScrollbars>
        <Table
          striped
          highlightOnHover
          withTableBorder
          aria-describedby="projection-table-title"
        >
          <caption style={{ captionSide: 'bottom', textAlign: 'center', marginTop: '1rem' }}>
            Year-by-year financial projection from age {startAge} to {endAge}, showing balance, growth, and spending for each year.
          </caption>
          <Table.Thead>
            <Table.Tr>
              <Table.Th style={{ minWidth: 80 }}>Year</Table.Th>
              <Table.Th style={{ minWidth: 60 }}>Age</Table.Th>
              {!isMobile && (
                <>
                  <Table.Th style={{ minWidth: 130 }}>Start Balance</Table.Th>
                  <Table.Th style={{ minWidth: 130 }}>Growth</Table.Th>
                  <Table.Th style={{ minWidth: 130 }}>Spending</Table.Th>
                </>
              )}
              <Table.Th style={{ minWidth: 130 }}>End Balance</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {rows.map((row) => (
              <Table.Tr key={row.year}>
                <Table.Td>
                  <Text size="sm" fw={500}>
                    {row.year}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm">{row.age}</Text>
                </Table.Td>
                {!isMobile && (
                  <>
                    <Table.Td>
                      <Text size="sm" style={{ fontFamily: 'monospace' }}>
                        {formatCurrency(row.startingBalance)}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Badge
                        color={row.growth >= 0 ? 'green' : 'red'}
                        variant="light"
                        size="sm"
                      >
                        {row.growth >= 0 ? '+' : ''}
                        {formatCurrency(row.growth)}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Text
                        size="sm"
                        c="red"
                        style={{ fontFamily: 'monospace' }}
                      >
                        -{formatCurrency(row.spending)}
                      </Text>
                    </Table.Td>
                  </>
                )}
                <Table.Td>
                  <Text size="sm" fw={600} style={{ fontFamily: 'monospace' }}>
                    {formatCurrency(row.endingBalance)}
                  </Text>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </ScrollArea>

      <Text size="xs" c="dimmed" mt="xs" ta="center">
        {points.length} years projected
      </Text>
    </Paper>
  );
}
