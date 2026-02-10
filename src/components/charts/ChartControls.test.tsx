// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

vi.mock('@mantine/core', () => ({
  ActionIcon: ({ children, onClick, 'data-testid': testId, ...props }: any) => (
    <button onClick={onClick} data-testid={testId} disabled={props.disabled}>
      {children}
    </button>
  ),
  Tooltip: ({ children }: any) => <>{children}</>,
  Group: ({ children }: any) => <div>{children}</div>,
  SegmentedControl: ({ data, value, onChange, ...props }: any) => (
    <div>
      {data.map((item: any) => (
        <button
          key={item.value}
          onClick={() => onChange(item.value)}
          disabled={props.disabled}
          data-testid={
            item.value === 'bar'
              ? 'bar-chart'
              : item.value === 'line'
                ? 'line-chart'
                : item.value === 'pie'
                  ? 'pie-chart'
                  : null
          }
        >
          {item.label}
        </button>
      ))}
    </div>
  ),
}));
import { ChartControls } from './ChartControls';

vi.mock('lucide-react', () => ({
  ZoomIn: () => <div>Zoom In</div>,
  ZoomOut: () => <div>Zoom Out</div>,
  Download: () => <div>Download</div>,
  Settings: () => <div>Settings</div>,
  Filter: () => <div>Filter</div>,
  RefreshCw: () => <div>Refresh</div>,
  BarChart3: () => <div>Bar Chart</div>,
  LineChart: () => <div>Line Chart</div>,
  PieChart: () => <div>Pie Chart</div>,
}));

describe('ChartControls', () => {
  it('renders default controls', () => {
    render(<ChartControls onZoomIn={vi.fn()} onZoomOut={vi.fn()} />);
    expect(screen.getByTestId('zoom-in')).toBeInTheDocument();
    expect(screen.getByTestId('zoom-out')).toBeInTheDocument();
  });

  it('calls onZoomIn when zoom in button is clicked', () => {
    const onZoomIn = vi.fn();
    render(<ChartControls onZoomIn={onZoomIn} onZoomOut={vi.fn()} />);
    fireEvent.click(screen.getByTestId('zoom-in'));
    expect(onZoomIn).toHaveBeenCalledTimes(1);
  });

  it('calls onZoomOut when zoom out button is clicked', () => {
    const onZoomOut = vi.fn();
    render(<ChartControls onZoomIn={vi.fn()} onZoomOut={onZoomOut} />);
    fireEvent.click(screen.getByTestId('zoom-out'));
    expect(onZoomOut).toHaveBeenCalledTimes(1);
  });

  it('shows download button when onDownload is provided', () => {
    render(
      <ChartControls
        onZoomIn={vi.fn()}
        onZoomOut={vi.fn()}
        onDownload={vi.fn()}
      />
    );
    expect(screen.getByTestId('download')).toBeInTheDocument();
  });

  it('calls onDownload when download button is clicked', () => {
    const onDownload = vi.fn();
    render(
      <ChartControls
        onZoomIn={vi.fn()}
        onZoomOut={vi.fn()}
        onDownload={onDownload}
      />
    );
    fireEvent.click(screen.getByTestId('download'));
    expect(onDownload).toHaveBeenCalledTimes(1);
  });

  it('shows settings button when showSettings is true', () => {
    render(
      <ChartControls
        onZoomIn={vi.fn()}
        onZoomOut={vi.fn()}
        showSettings={true}
        onSettingsToggle={vi.fn()}
      />
    );
    expect(screen.getByTestId('settings')).toBeInTheDocument();
  });

  it('calls onSettingsToggle when settings button is clicked', () => {
    const onSettingsToggle = vi.fn();
    render(
      <ChartControls
        onZoomIn={vi.fn()}
        onZoomOut={vi.fn()}
        showSettings={true}
        onSettingsToggle={onSettingsToggle}
      />
    );
    fireEvent.click(screen.getByTestId('settings'));
    expect(onSettingsToggle).toHaveBeenCalledTimes(1);
  });

  it('shows filter button when showFilter is true', () => {
    render(
      <ChartControls
        onZoomIn={vi.fn()}
        onZoomOut={vi.fn()}
        showFilter={true}
        onFilterToggle={vi.fn()}
      />
    );
    expect(screen.getByTestId('filter')).toBeInTheDocument();
  });

  it('calls onFilterToggle when filter button is clicked', () => {
    const onFilterToggle = vi.fn();
    render(
      <ChartControls
        onZoomIn={vi.fn()}
        onZoomOut={vi.fn()}
        showFilter={true}
        onFilterToggle={onFilterToggle}
      />
    );
    fireEvent.click(screen.getByTestId('filter'));
    expect(onFilterToggle).toHaveBeenCalledTimes(1);
  });

  it('shows refresh button when showRefresh is true', () => {
    render(
      <ChartControls
        onZoomIn={vi.fn()}
        onZoomOut={vi.fn()}
        showRefresh={true}
        onRefresh={vi.fn()}
      />
    );
    expect(screen.getByTestId('refresh')).toBeInTheDocument();
  });

  it('calls onRefresh when refresh button is clicked', () => {
    const onRefresh = vi.fn();
    render(
      <ChartControls
        onZoomIn={vi.fn()}
        onZoomOut={vi.fn()}
        showRefresh={true}
        onRefresh={onRefresh}
      />
    );
    fireEvent.click(screen.getByTestId('refresh'));
    expect(onRefresh).toHaveBeenCalledTimes(1);
  });

  it('shows chart type selector when chartTypes are provided', () => {
    render(
      <ChartControls
        onZoomIn={vi.fn()}
        onZoomOut={vi.fn()}
        chartTypes={['bar', 'line', 'pie']}
        selectedChartType="bar"
        onChartTypeChange={vi.fn()}
      />
    );
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
  });

  it('calls onChartTypeChange when chart type button is clicked', () => {
    const onChartTypeChange = vi.fn();
    render(
      <ChartControls
        onZoomIn={vi.fn()}
        onZoomOut={vi.fn()}
        chartTypes={['bar', 'line']}
        selectedChartType="bar"
        onChartTypeChange={onChartTypeChange}
      />
    );
    fireEvent.click(screen.getByTestId('line-chart'));
    expect(onChartTypeChange).toHaveBeenCalledWith('line');
  });

  it('does not show optional controls by default', () => {
    render(<ChartControls onZoomIn={vi.fn()} onZoomOut={vi.fn()} />);
    expect(screen.queryByTestId('download')).not.toBeInTheDocument();
    expect(screen.queryByTestId('settings')).not.toBeInTheDocument();
    expect(screen.queryByTestId('filter')).not.toBeInTheDocument();
    expect(screen.queryByTestId('refresh')).not.toBeInTheDocument();
    expect(screen.queryByTestId('bar-chart')).not.toBeInTheDocument();
  });
});
