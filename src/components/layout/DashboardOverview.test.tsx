// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import DashboardOverview from './DashboardOverview';
import type { UserProfile, SimulationResult } from '@/core/types';

vi.mock('@mantine/core', () => ({
  Grid: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="grid">{children}</div>
  ),
  GridCol: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="grid-col">{children}</div>
  ),
  Card: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="card">{children}</div>
  ),
  Stack: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="stack">{children}</div>
  ),
  Title: ({
    children,
    order,
  }: {
    children: React.ReactNode;
    order: number;
  }) => <h1 data-testid={`title-${order}`}>{children}</h1>,
  Text: ({ children }: { children: React.ReactNode }) => (
    <span data-testid="text">{children}</span>
  ),
  Group: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="group">{children}</div>
  ),
  Flex: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="flex">{children}</div>
  ),
  Badge: ({ children }: { children: React.ReactNode }) => (
    <span data-testid="badge">{children}</span>
  ),
}));

vi.mock('@/utils/currency', () => ({
  formatCurrency: (amount: number) => `$${amount.toLocaleString()}`,
}));

vi.mock('@/components/charts/NetWorthChart', () => ({
  NetWorthChart: () => <div data-testid="net-worth-chart" />,
}));

vi.mock('@/components/charts/CashFlowChart', () => ({
  CashFlowChart: () => <div data-testid="cash-flow-chart" />,
}));

describe('DashboardOverview', () => {
  const mockProfile: UserProfile = {
    age: 35,
    currentSavings: 250000,
    annualGrowthRate: 7,
    annualSpending: 60000,
  };

  const mockSimulation: SimulationResult[] = [
    {
      year: 0,
      age: 35,
      startingBalance: 250000,
      growth: 17500,
      spending: 60000,
      endingBalance: 207500,
    },
    {
      year: 1,
      age: 36,
      startingBalance: 207500,
      growth: 14525,
      spending: 60000,
      endingBalance: 162025,
    },
  ];

  it('should render dashboard title', () => {
    render(
      <DashboardOverview profile={mockProfile} simulation={mockSimulation} />
    );

    expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
  });

  it('should display current net worth metric', () => {
    render(
      <DashboardOverview profile={mockProfile} simulation={mockSimulation} />
    );

    expect(screen.getByText(/250,000/i)).toBeInTheDocument();
  });

  it('should display current age metric', () => {
    render(
      <DashboardOverview profile={mockProfile} simulation={mockSimulation} />
    );

    expect(screen.getByText(/35/i)).toBeInTheDocument();
  });

  it('should display annual growth rate metric', () => {
    render(
      <DashboardOverview profile={mockProfile} simulation={mockSimulation} />
    );

    expect(screen.getByText(/7%/i)).toBeInTheDocument();
  });

  it('should display annual spending metric', () => {
    render(
      <DashboardOverview profile={mockProfile} simulation={mockSimulation} />
    );

    expect(screen.getByText(/60,000/i)).toBeInTheDocument();
  });

  it('should render net worth chart', () => {
    render(
      <DashboardOverview profile={mockProfile} simulation={mockSimulation} />
    );

    expect(screen.getByTestId('net-worth-chart')).toBeInTheDocument();
  });

  it('should render cash flow chart', () => {
    render(
      <DashboardOverview profile={mockProfile} simulation={mockSimulation} />
    );

    expect(screen.getByTestId('cash-flow-chart')).toBeInTheDocument();
  });

  it('should display projection years count', () => {
    render(
      <DashboardOverview profile={mockProfile} simulation={mockSimulation} />
    );

    expect(screen.getByText(/2 years/i)).toBeInTheDocument();
  });

  it('should handle empty simulation results', () => {
    render(<DashboardOverview profile={mockProfile} simulation={[]} />);

    expect(screen.getByText(/no projection data/i)).toBeInTheDocument();
  });

  it('should display key metrics cards', () => {
    render(
      <DashboardOverview profile={mockProfile} simulation={mockSimulation} />
    );

    const cards = screen.getAllByTestId('card');
    expect(cards.length).toBeGreaterThan(0);
  });
});
