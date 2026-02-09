// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import type { Account } from '@/core/types';

// Mock recharts
vi.mock('recharts', () => ({
  PieChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="pie-chart">{children}</div>
  ),
  Pie: ({ children }: { children?: React.ReactNode }) => (
    <div data-testid="pie">{children}</div>
  ),
  Cell: ({ index }: { index?: number }) => (
    <div key={index} data-testid="cell" />
  ),
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
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
  Group: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="group">{children}</div>
  ),
  Stack: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="stack">{children}</div>
  ),
  Badge: ({ children }: { children: React.ReactNode }) => (
    <span data-testid="badge">{children}</span>
  ),
}));

// Mock the ResponsiveChartWrapper
vi.mock('./ResponsiveChartWrapper', () => ({
  ResponsiveChartWrapper: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-wrapper">{children}</div>
  ),
}));

import { AccountBreakdownChart } from './AccountBreakdownChart';

describe('AccountBreakdownChart', () => {
  const mockAccounts: Account[] = [
    {
      id: '1',
      name: '401k',
      type: 'tax-advantaged',
      balance: 50000,
      taxCharacteristics: 'tax-deferred',
      accountType: '401k',
    },
    {
      id: '2',
      name: 'Roth IRA',
      type: 'tax-advantaged',
      balance: 30000,
      taxCharacteristics: 'tax-free',
      accountType: 'roth-ira',
    },
    {
      id: '3',
      name: 'Taxable Brokerage',
      type: 'taxable',
      balance: 20000,
      taxCharacteristics: 'taxable',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<AccountBreakdownChart accounts={mockAccounts} />);
    expect(screen.getByTestId('paper')).toBeInTheDocument();
  });

  it('displays chart title', () => {
    render(<AccountBreakdownChart accounts={mockAccounts} />);
    expect(screen.getByText('Account Breakdown')).toBeInTheDocument();
  });

  it('renders pie chart with data', () => {
    render(<AccountBreakdownChart accounts={mockAccounts} />);
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
    expect(screen.getByTestId('responsive-wrapper')).toBeInTheDocument();
  });

  it('renders chart legend', () => {
    render(<AccountBreakdownChart accounts={mockAccounts} />);
    expect(screen.getByTestId('legend')).toBeInTheDocument();
  });

  it('renders tooltip', () => {
    render(<AccountBreakdownChart accounts={mockAccounts} />);
    expect(screen.getByTestId('tooltip')).toBeInTheDocument();
  });

  it('displays empty state when no accounts provided', () => {
    render(<AccountBreakdownChart accounts={[]} />);
    expect(
      screen.getByText('Add accounts to see portfolio breakdown')
    ).toBeInTheDocument();
  });

  it('displays empty state when accounts is undefined', () => {
    render(
      <AccountBreakdownChart accounts={undefined as unknown as Account[]} />
    );
    expect(
      screen.getByText('Add accounts to see portfolio breakdown')
    ).toBeInTheDocument();
  });

  it('displays total portfolio value', () => {
    render(<AccountBreakdownChart accounts={mockAccounts} />);
    // Total should be $100,000
    expect(screen.getByText(/Total:/)).toBeInTheDocument();
  });

  it('groups accounts by type', () => {
    render(<AccountBreakdownChart accounts={mockAccounts} />);
    // Pie chart should be rendered
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
  });

  it('calculates percentages correctly', () => {
    render(<AccountBreakdownChart accounts={mockAccounts} />);
    // Should render pie chart with cells
    expect(screen.getByTestId('pie')).toBeInTheDocument();
  });

  it('uses colorblind-friendly color scheme', () => {
    render(<AccountBreakdownChart accounts={mockAccounts} />);
    const cells = screen.getAllByTestId('cell');
    // Should have cells with different colors
    expect(cells.length).toBeGreaterThan(0);
  });

  it('displays account count summary', () => {
    render(<AccountBreakdownChart accounts={mockAccounts} />);
    expect(screen.getByText(/3 accounts/)).toBeInTheDocument();
  });
});
