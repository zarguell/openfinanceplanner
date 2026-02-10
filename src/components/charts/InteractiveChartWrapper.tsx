import { useState } from 'react';
import {
  Paper,
  Group,
  ActionIcon,
  Text,
  Select,
  Modal,
  Button,
  Stack,
} from '@mantine/core';
import { Download, Filter } from 'lucide-react';

type DateRangeOption = '1y' | '5y' | '10y' | 'all';

interface InteractiveChartWrapperProps {
  title: string;
  children: React.ReactNode;
  onExport?: () => void;
  showFilter?: boolean;
  showDateRange?: boolean;
  onDateRangeChange?: (range: DateRangeOption) => void;
  customControls?: React.ReactNode;
}

const DATE_RANGE_OPTIONS = [
  { value: '1y', label: 'Last 1 Year' },
  { value: '5y', label: 'Last 5 Years' },
  { value: '10y', label: 'Last 10 Years' },
  { value: 'all', label: 'All Time' },
];

export function InteractiveChartWrapper({
  title,
  children,
  onExport,
  showFilter = false,
  showDateRange = false,
  onDateRangeChange,
  customControls,
}: InteractiveChartWrapperProps) {
  const [filterOpened, setFilterOpened] = useState(false);
  const [selectedDateRange, setSelectedDateRange] =
    useState<DateRangeOption>('all');

  const handleExport = () => {
    if (onExport) {
      onExport();
    }
  };

  const handleDateRangeChange = (value: string | null) => {
    if (
      value &&
      (['1y', '5y', '10y', 'all'] as const).includes(value as DateRangeOption)
    ) {
      setSelectedDateRange(value as DateRangeOption);
      if (onDateRangeChange) {
        onDateRangeChange(value as DateRangeOption);
      }
    }
  };

  return (
    <Paper p="md" withBorder radius="md">
      <Stack gap="md">
        <Group justify="space-between" align="center">
          <Text size="lg" fw={600}>
            {title}
          </Text>

          <Group gap={8}>
            {showDateRange && (
              <Select
                data-testid="date-range-selector"
                value={selectedDateRange}
                onChange={handleDateRangeChange}
                data={DATE_RANGE_OPTIONS}
                w={140}
                size="sm"
              />
            )}

            {showFilter && (
              <ActionIcon
                variant="light"
                size="sm"
                onClick={() => setFilterOpened(true)}
                data-testid="filter-button"
              >
                <Filter size={16} />
              </ActionIcon>
            )}

            {onExport && (
              <ActionIcon
                variant="light"
                size="sm"
                onClick={handleExport}
                data-testid="export-button"
              >
                <Download size={16} />
              </ActionIcon>
            )}

            {customControls}
          </Group>
        </Group>

        {children}

        <Modal
          opened={filterOpened}
          onClose={() => setFilterOpened(false)}
          title="Filter Options"
          centered
          data-testid="filter-modal"
        >
          <Stack p="md">
            <Text c="dimmed">
              Filter options will be displayed here. Customize this section for
              specific chart filtering needs.
            </Text>
            <Group justify="flex-end" mt="md">
              <Button
                variant="light"
                onClick={() => setFilterOpened(false)}
                data-testid="close-filter-modal"
              >
                Close
              </Button>
            </Group>
          </Stack>
        </Modal>
      </Stack>
    </Paper>
  );
}
