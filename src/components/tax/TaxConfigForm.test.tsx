// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import TaxConfigForm from './TaxConfigForm';
import type { TaxRegion } from '@/core/types';

void fireEvent;

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
  Select: ({ onChange }: any) => (
    <select data-testid="filing-status" onChange={onChange}>
      <option value="single">Single</option>
      <option value="married-filing-jointly">Married Filing Jointly</option>
      <option value="married-filing-separately">
        Married Filing Separately
      </option>
      <option value="head-of-household">Head of Household</option>
    </select>
  ),
  NumberInput: ({ onChange }: any) => (
    <input type="number" data-testid="deduction" onChange={onChange} />
  ),
  Button: ({ children, onClick }: any) => (
    <button onClick={onClick} data-testid="save-button">
      {children}
    </button>
  ),
  TextInput: ({ onChange, label, placeholder, 'data-testid': testId }: any) => (
    <input
      type="text"
      data-testid={testId || label?.toLowerCase().replace(/\s+/g, '-')}
      placeholder={placeholder}
      onChange={onChange}
    />
  ),
  SimpleGrid: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="simple-grid">{children}</div>
  ),
  Group: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="group">{children}</div>
  ),
}));

describe('TaxConfigForm', () => {
  const mockTaxRegion: TaxRegion = {
    country: 'US',
    state: 'CA',
  };

  const mockOnSubmit = vi.fn();

  it('should render tax configuration form', () => {
    render(
      <TaxConfigForm
        taxRegion={mockTaxRegion}
        filingStatus="single"
        standardDeduction={14600}
        onSubmit={mockOnSubmit}
      />
    );

    expect(screen.getByTestId('title')).toHaveTextContent('Tax Configuration');
  });

  it('should display filing status selector', () => {
    render(
      <TaxConfigForm
        taxRegion={mockTaxRegion}
        filingStatus="single"
        standardDeduction={14600}
        onSubmit={mockOnSubmit}
      />
    );

    expect(screen.getByTestId('filing-status')).toBeInTheDocument();
  });

  it('should display state code input', () => {
    render(
      <TaxConfigForm
        taxRegion={mockTaxRegion}
        filingStatus="single"
        standardDeduction={14600}
        onSubmit={mockOnSubmit}
      />
    );

    expect(
      screen.getByTestId('state-or-province-code-(e.g.,-ca,-ny)')
    ).toBeInTheDocument();
  });

  it('should display deduction input', () => {
    render(
      <TaxConfigForm
        taxRegion={mockTaxRegion}
        filingStatus="single"
        standardDeduction={14600}
        onSubmit={mockOnSubmit}
      />
    );

    expect(screen.getByTestId('deduction')).toBeInTheDocument();
  });

  it('should call onSubmit when form is submitted', () => {
    render(
      <TaxConfigForm
        taxRegion={mockTaxRegion}
        filingStatus="single"
        standardDeduction={14600}
        onSubmit={mockOnSubmit}
      />
    );

    const saveButton = screen.getByTestId('save-button');
    fireEvent.click(saveButton);

    expect(mockOnSubmit).toHaveBeenCalled();
  });
});
