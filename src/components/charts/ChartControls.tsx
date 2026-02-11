import { ActionIcon, Tooltip, Group, SegmentedControl } from '@mantine/core';
import {
  ZoomIn,
  ZoomOut,
  Download,
  Settings,
  Filter,
  RefreshCw,
  BarChart3,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
} from 'lucide-react';

type ChartType = 'bar' | 'line' | 'pie' | 'area' | 'scatter';

interface ChartControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onDownload?: () => void;
  onSettingsToggle?: () => void;
  onFilterToggle?: () => void;
  onRefresh?: () => void;
  chartTypes?: ChartType[];
  selectedChartType?: ChartType;
  onChartTypeChange?: (type: ChartType) => void;
  showSettings?: boolean;
  showFilter?: boolean;
  showRefresh?: boolean;
  disabled?: boolean;
}

function getChartTypeIcon(type: ChartType) {
  switch (type) {
    case 'bar':
      return <BarChart3 size={16} />;
    case 'line':
      return <LineChartIcon size={16} />;
    case 'pie':
      return <PieChartIcon size={16} />;
    case 'area':
    case 'scatter':
    default:
      return null;
  }
}

export function ChartControls({
  onZoomIn,
  onZoomOut,
  onDownload,
  onSettingsToggle,
  onFilterToggle,
  onRefresh,
  chartTypes,
  selectedChartType,
  onChartTypeChange,
  showSettings = false,
  showFilter = false,
  showRefresh = false,
  disabled = false,
}: ChartControlsProps) {
  return (
    <Group gap={8} role="group" aria-label="Chart controls">
      {chartTypes && chartTypes.length > 0 && onChartTypeChange && (
        <SegmentedControl
          data={chartTypes.map((type) => ({
            value: type,
            label: getChartTypeIcon(type) ?? type,
          }))}
          value={selectedChartType ?? chartTypes[0]}
          onChange={(value) => onChartTypeChange(value as ChartType)}
          disabled={disabled}
          aria-label="Select chart type"
        />
      )}

      {onDownload && (
        <Tooltip label="Download chart" withArrow>
          <ActionIcon
            variant="light"
            size="sm"
            onClick={onDownload}
            disabled={disabled}
            data-testid="download"
            aria-label="Download chart as PNG"
          >
            <Download size={16} />
          </ActionIcon>
        </Tooltip>
      )}

      <Tooltip label="Zoom in" withArrow>
        <ActionIcon
          variant="light"
          size="sm"
          onClick={onZoomIn}
          disabled={disabled}
          data-testid="zoom-in"
          aria-label="Zoom in on chart"
        >
          <ZoomIn size={16} />
        </ActionIcon>
      </Tooltip>

      <Tooltip label="Zoom out" withArrow>
        <ActionIcon
          variant="light"
          size="sm"
          onClick={onZoomOut}
          disabled={disabled}
          data-testid="zoom-out"
          aria-label="Zoom out on chart"
        >
          <ZoomOut size={16} />
        </ActionIcon>
      </Tooltip>

      {showFilter && onFilterToggle && (
        <Tooltip label="Filter data" withArrow>
          <ActionIcon
            variant="light"
            size="sm"
            onClick={onFilterToggle}
            disabled={disabled}
            data-testid="filter"
            aria-label="Filter chart data"
          >
            <Filter size={16} />
          </ActionIcon>
        </Tooltip>
      )}

      {showRefresh && onRefresh && (
        <Tooltip label="Refresh data" withArrow>
          <ActionIcon
            variant="light"
            size="sm"
            onClick={onRefresh}
            disabled={disabled}
            data-testid="refresh"
            aria-label="Refresh chart data"
          >
            <RefreshCw size={16} />
          </ActionIcon>
        </Tooltip>
      )}

      {showSettings && onSettingsToggle && (
        <Tooltip label="Chart settings" withArrow>
          <ActionIcon
            variant="light"
            size="sm"
            onClick={onSettingsToggle}
            disabled={disabled}
            data-testid="settings"
            aria-label="Open chart settings"
          >
            <Settings size={16} />
          </ActionIcon>
        </Tooltip>
      )}
    </Group>
  );
}
