import { Table, NumberFormatter, Box } from '@mantine/core';
import type { SimulationResult } from '@/core/types';
import classes from './ProjectionTable.module.css';

interface ProjectionTableProps {
  data: SimulationResult[];
}

export function ProjectionTable({ data }: ProjectionTableProps) {
  if (data.length === 0) {
    return null;
  }

  return (
    <Box className={classes.wrapper}>
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
