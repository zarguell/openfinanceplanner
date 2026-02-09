// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import TaxStrategyPanel from './TaxStrategyPanel';
import type { TaxStrategy } from '@/core/types';

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
  Button: ({ children, onClick, leftSection, variant }: any) => (
    <button
      onClick={onClick}
      data-testid={leftSection ? 'add-button' : 'remove-button'}
      data-variant={variant}
    >
      {children}
    </button>
  ),
  Badge: ({ children }: { children: React.ReactNode }) => (
    <span data-testid="badge">{children}</span>
  ),
  Group: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="group">{children}</div>
  ),
  Divider: () => <hr data-testid="divider" />,
}));

vi.mock('lucide-react', () => ({
  Plus: () => <span data-testid="plus-icon" />,
  Trash2: () => <span data-testid="trash-icon" />,
}));

describe('TaxStrategyPanel', () => {
  const mockStrategies: TaxStrategy[] = [
    {
      type: 'roth-conversion',
      amount: 10000,
      targetYear: 2024,
      description: 'Convert $10,000 from traditional IRA to Roth',
    },
    {
      type: 'sepp-distribution',
      accountBalance: 500000,
      lifeExpectancy: 25,
      description: 'SEPP distribution from retirement account',
    },
  ];

  const mockOnAdd = vi.fn();
  const mockOnRemove = vi.fn();

  it('should render tax strategy panel', () => {
    render(
      <TaxStrategyPanel
        strategies={mockStrategies}
        onAdd={mockOnAdd}
        onRemove={mockOnRemove}
      />
    );

    expect(screen.getByTestId('title')).toHaveTextContent('Tax Strategies');
  });

  it('should display list of strategies', () => {
    render(
      <TaxStrategyPanel
        strategies={mockStrategies}
        onAdd={mockOnAdd}
        onRemove={mockOnRemove}
      />
    );

    expect(screen.getByText(/Convert \$10,000/)).toBeInTheDocument();
    expect(screen.getByText(/SEPP distribution/)).toBeInTheDocument();
  });

  it('should display strategy type badges', () => {
    render(
      <TaxStrategyPanel
        strategies={mockStrategies}
        onAdd={mockOnAdd}
        onRemove={mockOnRemove}
      />
    );

    const badges = screen.getAllByTestId('badge');
    expect(badges.length).toBeGreaterThan(0);
  });

  it('should display add button', () => {
    render(
      <TaxStrategyPanel
        strategies={mockStrategies}
        onAdd={mockOnAdd}
        onRemove={mockOnRemove}
      />
    );

    expect(screen.getByTestId('add-button')).toBeInTheDocument();
  });
});
