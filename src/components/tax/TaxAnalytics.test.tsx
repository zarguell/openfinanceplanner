// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import TaxAnalytics from './TaxAnalytics';
import type { TaxAnalytics as TaxAnalyticsType } from '@/core/tax';

vi.mock('@mantine/core', () => ({
  Card: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="card">{children}</div>
  ),
  Stack: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="stack">{children}</div>
  ),
  Text: ({ children }: { children: React.ReactNode }) => (
    <span data-testid="text">{children}</span>
  ),
  Title: ({ children }: { children: React.ReactNode }) => (
    <h2 data-testid="title">{children}</h2>
  ),
  Flex: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="flex">{children}</div>
  ),
  useMantineTheme: () => ({
    colors: {
      red: ['#FFF0F0', '#FFD7D7', '#FFB3B3', '#FF8F8F', '#FF6B6B', '#FF4747'],
      green: ['#F0FFF0', '#D7FFD7', '#B3FFB3', '#8FFF8F', '#6BFF6B', '#47FF47'],
      orange: [
        '#FFF8F0',
        '#FFEED7',
        '#FFE4B3',
        '#FFD98F',
        '#FFCE6B',
        '#FFC247',
      ],
      blue: ['#F0F8FF', '#D7EEFF', '#B3E4FF', '#8FDAFF', '#6BCFFF', '#47C4FF'],
    },
  }),
}));

vi.mock('@/utils/currency', () => ({
  formatCurrency: (amount: number) => `$${amount.toLocaleString()}`,
}));

describe('TaxAnalytics', () => {
  const mockAnalytics: TaxAnalyticsType = {
    yearlyBreakdown: [
      {
        federalTax: 15000,
        ordinaryIncomeTax: 12000,
        capitalGainsTax: 3000,
        marginalRate: 22,
        effectiveRate: 15,
        stateTax: 5000,
      },
      {
        federalTax: 16000,
        ordinaryIncomeTax: 13000,
        capitalGainsTax: 3000,
        marginalRate: 24,
        effectiveRate: 16,
        stateTax: 5200,
      },
    ],
    totalFederalTax: 31000,
    totalStateTax: 10200,
    totalTax: 41200,
    averageEffectiveRate: 15.5,
    taxBurdenTrend: [41200, 42500],
    optimizationOpportunities: [
      {
        type: 'tax-loss-harvesting',
        description: 'Consider tax-loss harvesting to offset capital gains',
        potentialSavings: 1500,
        priority: 'high',
      },
    ],
  };

  it('should render tax analytics summary', () => {
    render(<TaxAnalytics analytics={mockAnalytics} />);

    expect(screen.getByTestId('title')).toHaveTextContent('Tax Analytics');
  });

  it('should display total federal tax', () => {
    render(<TaxAnalytics analytics={mockAnalytics} />);

    const texts = screen.getAllByTestId('text');
    const federalText = texts.find((t) => t.textContent?.includes('31,000'));
    expect(federalText).toBeInTheDocument();
  });

  it('should display total state tax', () => {
    render(<TaxAnalytics analytics={mockAnalytics} />);

    const texts = screen.getAllByTestId('text');
    const stateText = texts.find((t) => t.textContent?.includes('10,200'));
    expect(stateText).toBeInTheDocument();
  });

  it('should display average effective rate', () => {
    render(<TaxAnalytics analytics={mockAnalytics} />);

    const texts = screen.getAllByTestId('text');
    const rateText = texts.find((t) => t.textContent?.includes('15.5%'));
    expect(rateText).toBeInTheDocument();
  });

  it('should display optimization opportunities', () => {
    render(<TaxAnalytics analytics={mockAnalytics} />);

    const texts = screen.getAllByTestId('text');
    const optText = texts.find((t) =>
      t.textContent?.includes('tax-loss harvesting')
    );
    expect(optText).toBeInTheDocument();
  });
});
