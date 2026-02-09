// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PlanForm } from './PlanForm';

vi.mock('@mantine/core', () => ({
  Button: ({ children, onClick }: any) => (
    <button onClick={onClick} data-testid="button">
      {children}
    </button>
  ),
  Stack: ({ children }: any) => <div data-testid="stack">{children}</div>,
  Paper: ({ children }: any) => <div data-testid="paper">{children}</div>,
  Text: ({ children }: any) => <span data-testid="text">{children}</span>,
  Group: ({ children }: any) => <div data-testid="group">{children}</div>,
  Select: ({ label, children, ...props }: any) => (
    <div data-testid="select">
      <label>{label}</label>
      <select {...props}>{children}</select>
    </div>
  ),
  TextInput: ({ label, ...props }: any) => (
    <div data-testid="text-input">
      <label>{label}</label>
      <input {...props} />
    </div>
  ),
  NumberInput: ({ label, ...props }: any) => (
    <div data-testid="number-input">
      <label>{label}</label>
      <input type="number" {...props} />
    </div>
  ),
  Checkbox: ({ label, ...props }: any) => (
    <div data-testid="checkbox">
      <label>{label}</label>
      <input type="checkbox" {...props} />
    </div>
  ),
  Divider: ({ label }: any) => <div data-testid="divider">{label}</div>,
}));

vi.mock('@/store/index', () => ({
  useStore: vi.fn(),
}));

describe('PlanForm Component', () => {
  it('should render the plan configuration form', () => {
    render(<PlanForm />);

    expect(screen.getByText(/Plan Name/)).toBeInTheDocument();
    expect(screen.getByText(/Plan Type/)).toBeInTheDocument();
    expect(screen.getByText(/Start Date/)).toBeInTheDocument();
    expect(screen.getByText(/Time Horizon/)).toBeInTheDocument();
    expect(screen.getByText(/Inflation Rate/)).toBeInTheDocument();
    expect(screen.getByText(/Default Growth Rate/)).toBeInTheDocument();
    expect(screen.getByText(/Withdrawal Strategy/)).toBeInTheDocument();
    expect(screen.getByText(/Retirement Age/)).toBeInTheDocument();
    expect(screen.getByText(/Max Projection Years/)).toBeInTheDocument();
  });

  it('should display Social Security section', () => {
    render(<PlanForm />);

    expect(screen.getByText(/Social Security.*Optional/)).toBeInTheDocument();
    expect(screen.getByText(/Enable Social Security/)).toBeInTheDocument();
  });

  it('should display RMD Settings section', () => {
    render(<PlanForm />);

    expect(screen.getByText(/RMD Settings.*Optional/)).toBeInTheDocument();
    expect(
      screen.getByText(/Enable Required Minimum Distributions/)
    ).toBeInTheDocument();
  });

  it('should have Save Plan button', () => {
    render(<PlanForm />);

    expect(
      screen.getByRole('button', { name: /Save Plan/ })
    ).toBeInTheDocument();
  });
});
