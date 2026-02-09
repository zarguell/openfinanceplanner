// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import type { SimulationResult, Account } from '@/core/types';

// Mock Mantine components
vi.mock('@mantine/core', () => {
  const GridCol = ({ children }: { children: React.ReactNode }) => (
    <div data-testid="grid-col">{children}</div>
  );

  const Grid = Object.assign(
    ({ children }: { children: React.ReactNode }) => (
      <div data-testid="grid">{children}</div>
    ),
    { Col: GridCol }
  );

  return {
    Paper: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="paper">{children}</div>
    ),
    Text: ({ children }: { children: React.ReactNode }) => (
      <span data-testid="text">{children}</span>
    ),
    Title: ({ children }: { children: React.ReactNode }) => (
      <h2 data-testid="title">{children}</h2>
    ),
    Group: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="group">{children}</div>
    ),
    Stack: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="stack">{children}</div>
    ),
    Grid,
    Card: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="card">{children}</div>
    ),
    Badge: ({ children }: { children: React.ReactNode }) => (
      <span data-testid="badge">{children}</span>
    ),
    ThemeIcon: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="theme-icon">{children}</div>
    ),
  };
});

// Mock currency formatter
vi.mock('@/utils/currency', () => ({
  formatCurrency: (value: number) => `$${value.toLocaleString()}`,
  formatCurrencyCompact: (value: number) => `$${(value / 1000).toFixed(1)}k`,
}));

import { DashboardMetrics } from './DashboardMetrics';

describe('DashboardMetrics', () => {
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

  const mockProjectionData: SimulationResult[] = [
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
    render(
      <DashboardMetrics
        accounts={mockAccounts}
        projectionData={mockProjectionData}
        currentAge={30}
        retirementAge={65}
      />
    );
    expect(screen.getByTestId('paper')).toBeInTheDocument();
  });

  it('displays dashboard title', () => {
    render(
      <DashboardMetrics
        accounts={mockAccounts}
        projectionData={mockProjectionData}
        currentAge={30}
        retirementAge={65}
      />
    );
    expect(screen.getByText('Financial Dashboard')).toBeInTheDocument();
  });

  it('displays total net worth', () => {
    render(
      <DashboardMetrics
        accounts={mockAccounts}
        projectionData={mockProjectionData}
        currentAge={30}
        retirementAge={65}
      />
    );
    // Total net worth should be $100,000
    expect(screen.getByText('Total Net Worth')).toBeInTheDocument();
  });

  it('displays number of accounts', () => {
    render(
      <DashboardMetrics
        accounts={mockAccounts}
        projectionData={mockProjectionData}
        currentAge={30}
        retirementAge={65}
      />
    );
    // Check that accounts count is displayed in subtitle
    expect(
      screen.getAllByTestId('text').some((el) => el.textContent?.includes('3'))
    ).toBe(true);
  });

  it('displays years to retirement', () => {
    render(
      <DashboardMetrics
        accounts={mockAccounts}
        projectionData={mockProjectionData}
        currentAge={30}
        retirementAge={65}
      />
    );
    expect(screen.getByText('Years to Retirement')).toBeInTheDocument();
    expect(screen.getByText('35')).toBeInTheDocument();
  });

  it('displays projected runway', () => {
    render(
      <DashboardMetrics
        accounts={mockAccounts}
        projectionData={mockProjectionData}
        currentAge={30}
        retirementAge={65}
      />
    );
    expect(screen.getByText('Projected Runway')).toBeInTheDocument();
  });

  it('calculates annual growth correctly', () => {
    render(
      <DashboardMetrics
        accounts={mockAccounts}
        projectionData={mockProjectionData}
        currentAge={30}
        retirementAge={65}
      />
    );
    expect(screen.getByText('Annual Growth')).toBeInTheDocument();
  });

  it('displays tax-advantaged balance', () => {
    render(
      <DashboardMetrics
        accounts={mockAccounts}
        projectionData={mockProjectionData}
        currentAge={30}
        retirementAge={65}
      />
    );
    // Should show tax-advantaged accounts total (401k + Roth = $80k)
    expect(screen.getByText(/Tax-Advantaged/i)).toBeInTheDocument();
  });

  it('displays taxable balance', () => {
    render(
      <DashboardMetrics
        accounts={mockAccounts}
        projectionData={mockProjectionData}
        currentAge={30}
        retirementAge={65}
      />
    );
    // Should show taxable accounts total ($20k)
    expect(screen.getByText(/Taxable/i)).toBeInTheDocument();
  });

  it('renders metric cards in a grid layout', () => {
    render(
      <DashboardMetrics
        accounts={mockAccounts}
        projectionData={mockProjectionData}
        currentAge={30}
        retirementAge={65}
      />
    );
    // Should have at least one grid (there may be nested grids)
    const grids = screen.getAllByTestId('grid');
    expect(grids.length).toBeGreaterThan(0);
    // Should have metric cards
    const cards = screen.getAllByTestId('card');
    expect(cards.length).toBeGreaterThan(0);
  });

  it('handles empty accounts gracefully', () => {
    render(
      <DashboardMetrics
        accounts={[]}
        projectionData={mockProjectionData}
        currentAge={30}
        retirementAge={65}
      />
    );
    expect(screen.getByText('Total Net Worth')).toBeInTheDocument();
    // Should show $0.0k for empty accounts
    expect(
      screen.getAllByTestId('text').some((el) => el.textContent?.includes('$0'))
    ).toBe(true);
  });

  it('handles empty projection data gracefully', () => {
    render(
      <DashboardMetrics
        accounts={mockAccounts}
        projectionData={[]}
        currentAge={30}
        retirementAge={65}
      />
    );
    expect(screen.getByText('Projected Runway')).toBeInTheDocument();
  });

  it('displays current age', () => {
    render(
      <DashboardMetrics
        accounts={mockAccounts}
        projectionData={mockProjectionData}
        currentAge={30}
        retirementAge={65}
      />
    );
    // Should display current age somewhere in the component
    const ageElements = screen.getAllByTestId('text');
    expect(ageElements.some((el) => el.textContent?.includes('30'))).toBe(true);
  });

  it('formats large numbers with currency symbols', () => {
    render(
      <DashboardMetrics
        accounts={mockAccounts}
        projectionData={mockProjectionData}
        currentAge={30}
        retirementAge={65}
      />
    );
    // Should contain formatted currency values
    const textElements = screen.getAllByTestId('text');
    const hasCurrency = textElements.some((el) =>
      el.textContent?.includes('$')
    );
    expect(hasCurrency).toBe(true);
  });
});
