// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import type { ReactElement } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MantineProvider } from '@mantine/core';
import { ProjectionTable } from './ProjectionTable';

// Mock matchMedia for Mantine
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock ResizeObserver for Mantine ScrollArea
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}
Object.defineProperty(window, 'ResizeObserver', {
  writable: true,
  value: ResizeObserverMock,
});

// Mock useChartData hook
vi.mock('@/hooks/useChartData', () => ({
  useChartData: vi.fn(),
}));

// Mock useMediaQuery hook
vi.mock('@mantine/hooks', () => ({
  useMediaQuery: vi.fn(),
}));

import { useChartData } from '@/hooks/useChartData';
import { useMediaQuery } from '@mantine/hooks';

const mockUseChartData = vi.mocked(useChartData);
const mockUseMediaQuery = vi.mocked(useMediaQuery);

// Wrapper with MantineProvider
function renderWithMantine(ui: ReactElement) {
  return render(<MantineProvider>{ui}</MantineProvider>);
}

describe('ProjectionTable', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default to desktop view
    mockUseMediaQuery.mockReturnValue(false);
  });

  it('renders empty state when no data', () => {
    mockUseChartData.mockReturnValue({
      points: [],
      minNetWorth: 0,
      maxNetWorth: 0,
      years: 0,
    });

    renderWithMantine(<ProjectionTable />);
    expect(
      screen.getByText(
        'Enter your financial details to see year-by-year projections'
      )
    ).toBeInTheDocument();
  });

  it('renders table title', () => {
    mockUseChartData.mockReturnValue({
      points: [
        {
          year: 2024,
          age: 30,
          netWorth: 100000,
          startingBalance: 95000,
          growth: 15000,
          spending: 10000,
          endingBalance: 100000,
        },
      ],
      minNetWorth: 100000,
      maxNetWorth: 100000,
      years: 1,
    });

    renderWithMantine(<ProjectionTable />);
    expect(screen.getByText('Year-by-Year Projection')).toBeInTheDocument();
  });

  it('displays year count', () => {
    mockUseChartData.mockReturnValue({
      points: [
        {
          year: 2024,
          age: 30,
          netWorth: 100000,
          startingBalance: 95000,
          growth: 15000,
          spending: 10000,
          endingBalance: 100000,
        },
        {
          year: 2025,
          age: 31,
          netWorth: 108000,
          startingBalance: 100000,
          growth: 18000,
          spending: 10000,
          endingBalance: 108000,
        },
      ],
      minNetWorth: 100000,
      maxNetWorth: 108000,
      years: 2,
    });

    renderWithMantine(<ProjectionTable />);
    expect(screen.getByText('2 years projected')).toBeInTheDocument();
  });

  it('shows formatted currency values', () => {
    mockUseChartData.mockReturnValue({
      points: [
        {
          year: 2024,
          age: 30,
          netWorth: 100000,
          startingBalance: 100000,
          growth: 7000,
          spending: 50000,
          endingBalance: 57000,
        },
      ],
      minNetWorth: 57000,
      maxNetWorth: 100000,
      years: 1,
    });

    renderWithMantine(<ProjectionTable />);
    // Check for formatted currency (exact format may vary by locale)
    expect(screen.getByText('$57,000')).toBeInTheDocument();
  });

  it('renders correct number of rows on desktop', () => {
    mockUseMediaQuery.mockReturnValue(false); // Desktop
    mockUseChartData.mockReturnValue({
      points: [
        {
          year: 2024,
          age: 30,
          netWorth: 100000,
          startingBalance: 95000,
          growth: 15000,
          spending: 10000,
          endingBalance: 100000,
        },
        {
          year: 2025,
          age: 31,
          netWorth: 108000,
          startingBalance: 100000,
          growth: 18000,
          spending: 10000,
          endingBalance: 108000,
        },
      ],
      minNetWorth: 100000,
      maxNetWorth: 108000,
      years: 2,
    });

    renderWithMantine(<ProjectionTable />);
    const rows = screen.getAllByRole('row');
    // Header row + 2 data rows
    expect(rows.length).toBe(3);
  });

  it('renders correct number of rows on mobile', () => {
    mockUseMediaQuery.mockReturnValue(true); // Mobile
    mockUseChartData.mockReturnValue({
      points: [
        {
          year: 2024,
          age: 30,
          netWorth: 100000,
          startingBalance: 95000,
          growth: 15000,
          spending: 10000,
          endingBalance: 100000,
        },
        {
          year: 2025,
          age: 31,
          netWorth: 108000,
          startingBalance: 100000,
          growth: 18000,
          spending: 10000,
          endingBalance: 108000,
        },
      ],
      minNetWorth: 100000,
      maxNetWorth: 108000,
      years: 2,
    });

    renderWithMantine(<ProjectionTable />);
    const rows = screen.getAllByRole('row');
    // Header row + 2 data rows (fewer columns on mobile but same row count)
    expect(rows.length).toBe(3);
  });

  it('displays growth with positive badge', () => {
    mockUseChartData.mockReturnValue({
      points: [
        {
          year: 2024,
          age: 30,
          netWorth: 100000,
          startingBalance: 100000,
          growth: 7000,
          spending: 50000,
          endingBalance: 57000,
        },
      ],
      minNetWorth: 57000,
      maxNetWorth: 100000,
      years: 1,
    });

    renderWithMantine(<ProjectionTable />);
    expect(screen.getByText('+$7,000')).toBeInTheDocument();
  });

  it('displays spending with negative indicator', () => {
    mockUseChartData.mockReturnValue({
      points: [
        {
          year: 2024,
          age: 30,
          netWorth: 100000,
          startingBalance: 100000,
          growth: 7000,
          spending: 50000,
          endingBalance: 57000,
        },
      ],
      minNetWorth: 57000,
      maxNetWorth: 100000,
      years: 1,
    });

    renderWithMantine(<ProjectionTable />);
    // Spending is shown with minus sign prefix
    expect(screen.getByText('-$50,000')).toBeInTheDocument();
  });
});
