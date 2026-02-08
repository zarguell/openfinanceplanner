import { Table, NumberFormatter, Box } from '@mantine/core';
import type { SimulationResult } from '@/core/types';

interface ProjectionTableProps {
  data: SimulationResult[];
}

export function ProjectionTable({ data }: ProjectionTableProps) {
  if (data.length === 0) {
    return null;
  }

  return (
    <Box
      sx={(theme) => ({
        // Mobile-first table-to-card transformation
        '@media (max-width: 768px)': {
          '& table, & thead, & tbody, & th, & td, & tr': {
            display: 'block',
          },
          '& thead tr': {
            position: 'absolute',
            top: '-9999px',
            left: '-9999px',
          },
          '& tr': {
            marginBottom: theme.spacing.md,
            border: `1px solid ${theme.colors.gray[3]}`,
            borderRadius: theme.radius.md,
            padding: theme.spacing.sm,
            display: 'block',
          },
          '& td': {
            border: 'none',
            borderBottom: `1px solid ${theme.colors.gray[3]}`,
            position: 'relative',
            paddingLeft: '50%',
            textAlign: 'left',
            display: 'block',
            padding: '0.5rem 0.5rem 0.5rem 50%',
          },
          '& td:before': {
            position: 'absolute',
            top: '0.5rem',
            left: '0.5rem',
            width: '45%',
            paddingRight: '0.5rem',
            whiteSpace: 'nowrap',
            fontWeight: 700,
            content: 'attr(data-label)',
            color: theme.colors.gray[7],
          },
          '& td:last-child': {
            borderBottom: 'none',
          },
        },
      })}
    >
      <Table striped highlightOnHover withTableBorder>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Year</Table.Th>
            <Table.Th>Age</Table.Th>
            <Table.Th>Starting</Table.Th>
            <Table.Th>Growth</Table.Th>
            <Table.Th>Spending</Table.Th>
            <Table.Th>Ending</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {data.map((row) => (
            <Table.Tr key={row.year}>
              <Table.Td data-label="Year">{row.year}</Table.Td>
              <Table.Td data-label="Age">{row.age}</Table.Td>
              <Table.Td data-label="Starting">
                <NumberFormatter
                  prefix="$ "
                  value={row.startingBalance}
                  thousandSeparator
                />
              </Table.Td>
              <Table.Td data-label="Growth">
                <NumberFormatter
                  prefix="$ "
                  value={row.growth}
                  thousandSeparator
                />
              </Table.Td>
              <Table.Td data-label="Spending">
                <NumberFormatter
                  prefix="$ "
                  value={row.spending}
                  thousandSeparator
                />
              </Table.Td>
              <Table.Td data-label="Ending">
                <NumberFormatter
                  prefix="$ "
                  value={row.endingBalance}
                  thousandSeparator
                />
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Box>
  );
}
