// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import SidebarNavigation from './SidebarNavigation';

vi.mock('@mantine/core', () => ({
  Group: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="group">{children}</div>
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
  Button: ({
    children,
    onClick,
  }: {
    children: React.ReactNode;
    onClick: () => void;
  }) => (
    <button data-testid="button" onClick={onClick}>
      {children}
    </button>
  ),
  UnstyledButton: ({
    children,
    onClick,
    ...props
  }: {
    children: React.ReactNode;
    onClick: () => void;
    [key: string]: unknown;
  }) => (
    <button data-testid="unstyled-button" onClick={onClick} {...props}>
      {children}
    </button>
  ),
  Stack: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="stack">{children}</div>
  ),
  Box: ({ children }: { children: React.ReactNode; display?: unknown }) => (
    <div data-testid="box">{children}</div>
  ),
}));

vi.mock('lucide-react', () => ({
  Home: () => <span data-testid="icon-home" />,
  Calculator: () => <span data-testid="icon-calculator" />,
  TrendingUp: () => <span data-testid="icon-trending" />,
  PieChart: () => <span data-testid="icon-chart" />,
  FileText: () => <span data-testid="icon-file" />,
  Settings: () => <span data-testid="icon-settings" />,
  Menu: () => <span data-testid="icon-menu" />,
  X: () => <span data-testid="icon-close" />,
}));

describe('SidebarNavigation', () => {
  it('should render sidebar with navigation items', () => {
    render(
      <SidebarNavigation activeSection="dashboard" onSectionChange={() => {}} />
    );

    expect(screen.getByTestId('button')).toBeInTheDocument();
    expect(screen.getByTestId('stack')).toBeInTheDocument();
  });

  it('should display dashboard navigation item', () => {
    render(
      <SidebarNavigation activeSection="dashboard" onSectionChange={() => {}} />
    );

    expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
  });

  it('should display projection navigation item', () => {
    render(
      <SidebarNavigation activeSection="dashboard" onSectionChange={() => {}} />
    );

    expect(screen.getByText(/projection/i)).toBeInTheDocument();
  });

  it('should display analytics navigation item', () => {
    render(
      <SidebarNavigation activeSection="dashboard" onSectionChange={() => {}} />
    );

    expect(screen.getByText(/analytics/i)).toBeInTheDocument();
  });

  it('should display settings navigation item', () => {
    render(
      <SidebarNavigation activeSection="dashboard" onSectionChange={() => {}} />
    );

    expect(screen.getByText(/settings/i)).toBeInTheDocument();
  });

  it('should highlight active section', () => {
    render(
      <SidebarNavigation activeSection="analytics" onSectionChange={() => {}} />
    );

    const analyticsLink = screen.getByText(/analytics/i).closest('button');
    expect(analyticsLink).toHaveAttribute('data-active', 'true');
  });

  it('should call onSectionChange when navigation item is clicked', () => {
    const onSectionChange = vi.fn();
    render(
      <SidebarNavigation
        activeSection="dashboard"
        onSectionChange={onSectionChange}
      />
    );

    const projectionLink = screen.getByText(/projection/i);
    projectionLink.click();

    expect(onSectionChange).toHaveBeenCalledWith('projection');
  });
});
