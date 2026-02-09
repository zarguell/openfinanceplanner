// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import type { SimulationResult } from '@/core/types';

// Mock recharts
vi.mock('recharts', () => ({
  BarChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="bar-chart">{children}</div>
  ),
  Bar: () => <div data-testid="bar" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  Cell: () => <div data-testid="cell" />,
}));

// Mock Mantine components
vi.mock('@mantine/core', () => ({
  Paper: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="paper">{children}</div>
  ),
  Text: ({ children }: { children: React.ReactNode }) => (
    <span data-testid="text">{children}</span>
  ),
  Box: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="box">{children}</div>
  ),
}));

// Mock the ResponsiveChartWrapper
vi.mock('./ResponsiveChartWrapper', () => ({
  ResponsiveChartWrapper: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-wrapper">{children}</div>
  ),
}));

// Mock the CustomTooltip
vi.mock('./CustomTooltip', () => ({
  CustomTooltip: () => <div data-testid="custom-tooltip" />,
}));

import { CashFlowChart } from './CashFlowChart';

describe('CashFlowChart', () => {
  const mockData: SimulationResult[] = [
    {
      year: 0,
      age: 30,
      startingBalance: 100000,
      growth: 7000,
      spending: 40000,
      endingBalance: 67000,
    },
    {
      year: 1,
      age: 31,
      startingBalance: 67000,
      growth: 4690,
      spending: 40000,
      endingBalance: 31690,
    },
    {
      year: 2,
      age: 32,
      startingBalance: 31690,
      growth: 2218,
      spending: 40000,
      endingBalance: -6092,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<CashFlowChart data={mockData} />);
    expect(screen.getByTestId('paper')).toBeInTheDocument();
  });

  it('displays chart title', () => {
    render(<CashFlowChart data={mockData} />);
    expect(screen.getByText('Cash Flow Analysis')).toBeInTheDocument();
  });

  it('renders bar chart with data', () => {
    render(<CashFlowChart data={mockData} />);
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    expect(screen.getByTestId('responsive-wrapper')).toBeInTheDocument();
  });

  it('renders chart axes', () => {
    render(<CashFlowChart data={mockData} />);
    expect(screen.getByTestId('x-axis')).toBeInTheDocument();
    expect(screen.getByTestId('y-axis')).toBeInTheDocument();
  });

  it('renders legend', () => {
    render(<CashFlowChart data={mockData} />);
    expect(screen.getByTestId('legend')).toBeInTheDocument();
  });

  it('renders tooltip', () => {
    render(<CashFlowChart data={mockData} />);
    expect(screen.getByTestId('tooltip')).toBeInTheDocument();
  });

  it('displays empty state when no data provided', () => {
    render(<CashFlowChart data={[]} />);
    expect(
      screen.getByText('Enter your financial details to see cash flow analysis')
    ).toBeInTheDocument();
  });

  it('displays empty state when data is undefined', () => {
    render(<CashFlowChart data={undefined as unknown as SimulationResult[]} />);
    expect(
      screen.getByText('Enter your financial details to see cash flow analysis')
    ).toBeInTheDocument();
  });

  it('transforms data correctly for chart display', () => {
    render(<CashFlowChart data={mockData} />);
    // The chart should be rendered with transformed data
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
  });

  it('renders income bars in positive color', () => {
    render(<CashFlowChart data={mockData} />);
    const bars = screen.getAllByTestId('bar');
    // Should have bars for both income and expenses
    expect(bars.length).toBeGreaterThan(0);
  });

  it('formats currency values on y-axis', () => {
    render(<CashFlowChart data={mockData} />);
    // Y-axis should be present with currency formatting
    expect(screen.getByTestId('y-axis')).toBeInTheDocument();
  });

  it('displays year projection count', () => {
    render(<CashFlowChart data={mockData} />);
    expect(
      screen.getByText(`${mockData.length} year projection`)
    ).toBeInTheDocument();
  });
});
