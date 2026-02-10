// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { InteractiveChartWrapper } from './InteractiveChartWrapper';

vi.mock('lucide-react', () => ({
  Download: () => <div>Download Icon</div>,
  X: () => <div>X Icon</div>,
  Filter: () => <div>Filter Icon</div>,
  Calendar: () => <div>Calendar Icon</div>,
}));

vi.mock('@mantine/core', () => ({
  Paper: ({ children }: any) => <div data-testid="paper">{children}</div>,
  Group: ({ children }: any) => <div data-testid="group">{children}</div>,
  ActionIcon: ({ children, onClick, 'data-testid': testId }: any) => (
    <button onClick={onClick} data-testid={testId}>
      {children}
    </button>
  ),
  Menu: ({ children }: any) => <div data-testid="menu">{children}</div>,
  Text: ({ children }: any) => <span data-testid="text">{children}</span>,
  Select: ({ children, data, onChange, ...props }: any) => (
    <select
      onChange={(e) => onChange(e.target.value)}
      data-testid={props['data-testid']}
    >
      {data.map((d: any) => (
        <option key={d.value} value={d.value}>
          {d.label}
        </option>
      ))}
    </select>
  ),
  Modal: ({ children, onClose, opened, 'data-testid': testId }: any) =>
    opened ? (
      <div data-testid={testId || 'modal'}>
        <button onClick={onClose} data-testid="close-modal">
          Close
        </button>
        {children}
      </div>
    ) : null,
  Button: ({ children, onClick, 'data-testid': testId }: any) => (
    <button onClick={onClick} data-testid={testId}>
      {children}
    </button>
  ),
  Stack: ({ children }: any) => <div data-testid="stack">{children}</div>,
}));

describe('InteractiveChartWrapper', () => {
  it('renders chart content', () => {
    render(
      <InteractiveChartWrapper title="Test Chart">
        <div data-testid="chart-content">Chart Content</div>
      </InteractiveChartWrapper>
    );
    expect(screen.getByTestId('chart-content')).toBeInTheDocument();
  });

  it('shows title', () => {
    render(
      <InteractiveChartWrapper title="Test Chart">
        <div>Chart Content</div>
      </InteractiveChartWrapper>
    );
    expect(screen.getByText('Test Chart')).toBeInTheDocument();
  });

  it('shows export button when onExport is provided', () => {
    const onExport = vi.fn();
    render(
      <InteractiveChartWrapper title="Test Chart" onExport={onExport}>
        <div>Chart Content</div>
      </InteractiveChartWrapper>
    );
    expect(screen.getByTestId('export-button')).toBeInTheDocument();
  });

  it('calls onExport when export button is clicked', () => {
    const onExport = vi.fn();
    render(
      <InteractiveChartWrapper title="Test Chart" onExport={onExport}>
        <div>Chart Content</div>
      </InteractiveChartWrapper>
    );
    fireEvent.click(screen.getByTestId('export-button'));
    expect(onExport).toHaveBeenCalledTimes(1);
  });

  it('shows filter button when showFilter is true', () => {
    render(
      <InteractiveChartWrapper title="Test Chart" showFilter={true}>
        <div>Chart Content</div>
      </InteractiveChartWrapper>
    );
    expect(screen.getByTestId('filter-button')).toBeInTheDocument();
  });

  it('opens filter modal when filter button is clicked', () => {
    render(
      <InteractiveChartWrapper title="Test Chart" showFilter={true}>
        <div>Chart Content</div>
      </InteractiveChartWrapper>
    );
    fireEvent.click(screen.getByTestId('filter-button'));
    expect(screen.getByTestId('filter-modal')).toBeInTheDocument();
  });

  it('closes filter modal when close button is clicked', () => {
    render(
      <InteractiveChartWrapper title="Test Chart" showFilter={true}>
        <div>Chart Content</div>
      </InteractiveChartWrapper>
    );
    fireEvent.click(screen.getByTestId('filter-button'));
    expect(screen.getByTestId('filter-modal')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('close-filter-modal'));
    expect(screen.queryByTestId('filter-modal')).not.toBeInTheDocument();
  });

  it('shows date range selector when showDateRange is true', () => {
    render(
      <InteractiveChartWrapper title="Test Chart" showDateRange={true}>
        <div>Chart Content</div>
      </InteractiveChartWrapper>
    );
    expect(screen.getByTestId('date-range-selector')).toBeInTheDocument();
  });

  it('calls onDateRangeChange when date range is changed', () => {
    const onDateRangeChange = vi.fn();
    render(
      <InteractiveChartWrapper
        title="Test Chart"
        showDateRange={true}
        onDateRangeChange={onDateRangeChange}
      >
        <div>Chart Content</div>
      </InteractiveChartWrapper>
    );
    const select = screen.getByTestId(
      'date-range-selector'
    ) as HTMLSelectElement;
    fireEvent.change(select, { target: { value: '1y' } });
    expect(onDateRangeChange).toHaveBeenCalledWith('1y');
  });

  it('does not show optional controls by default', () => {
    render(
      <InteractiveChartWrapper title="Test Chart">
        <div>Chart Content</div>
      </InteractiveChartWrapper>
    );
    expect(screen.queryByTestId('export-button')).not.toBeInTheDocument();
    expect(screen.queryByTestId('filter-button')).not.toBeInTheDocument();
    expect(screen.queryByTestId('date-range-selector')).not.toBeInTheDocument();
  });

  it('renders custom controls when provided', () => {
    render(
      <InteractiveChartWrapper
        title="Test Chart"
        customControls={
          <div data-testid="custom-controls">Custom Controls</div>
        }
      >
        <div>Chart Content</div>
      </InteractiveChartWrapper>
    );
    expect(screen.getByTestId('custom-controls')).toBeInTheDocument();
  });
});
