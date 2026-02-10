// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CollapsibleFormField } from './CollapsibleFormField';

vi.mock('@mantine/core', () => ({
  Paper: ({ children, className, withBorder, p, ...props }: any) => (
    <div data-testid="paper" className={className} {...props}>
      {children}
    </div>
  ),
  Stack: ({ children, gap, p, ...props }: any) => (
    <div data-testid="stack" {...props}>
      {children}
    </div>
  ),
  Text: ({ children, fw, size, c, className, ...props }: any) => (
    <span data-testid="text" {...props}>
      {children}
    </span>
  ),
  Group: ({
    children,
    gap,
    p,
    w,
    style,
    className,
    justify,
    ...props
  }: any) => (
    <div data-testid="group" {...props}>
      {children}
    </div>
  ),
  UnstyledButton: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  ),
  Transition: ({ mounted, children }: any) => (mounted ? children({}) : null),
}));

vi.mock('lucide-react', () => ({
  ChevronDown: ({ style }: any) => (
    <svg data-testid="chevron-icon" style={style}>
      <path d="M6 9l6 6 6-6" />
    </svg>
  ),
}));

describe('CollapsibleFormField', () => {
  it('renders children when expanded', () => {
    render(
      <CollapsibleFormField label="Test Section" defaultExpanded>
        <div data-testid="content">Content</div>
      </CollapsibleFormField>
    );

    expect(screen.getByTestId('content')).toBeVisible();
    expect(screen.getByText('Test Section')).toBeVisible();
  });

  it('hides children when collapsed', () => {
    render(
      <CollapsibleFormField label="Test Section" defaultExpanded={false}>
        <div data-testid="content">Content</div>
      </CollapsibleFormField>
    );

    expect(screen.queryByTestId('content')).not.toBeInTheDocument();
  });

  it('toggles visibility when clicking the header', () => {
    render(
      <CollapsibleFormField label="Test Section" defaultExpanded={false}>
        <div data-testid="content">Content</div>
      </CollapsibleFormField>
    );

    const header = screen.getByText('Test Section').closest('button');
    expect(screen.queryByTestId('content')).not.toBeInTheDocument();

    fireEvent.click(header!);
    expect(screen.getByTestId('content')).toBeVisible();

    fireEvent.click(header!);
    expect(screen.queryByTestId('content')).not.toBeInTheDocument();
  });

  it('displays description when provided', () => {
    render(
      <CollapsibleFormField
        label="Test Section"
        description="Section description"
      >
        <div data-testid="content">Content</div>
      </CollapsibleFormField>
    );

    expect(screen.getByText('Section description')).toBeVisible();
  });

  it('displays optional badge when marked as optional', () => {
    render(
      <CollapsibleFormField label="Test Section" optional>
        <div data-testid="content">Content</div>
      </CollapsibleFormField>
    );

    expect(screen.getByText('(optional)')).toBeVisible();
  });

  it('calls onToggle when toggling', () => {
    const onToggle = vi.fn();
    render(
      <CollapsibleFormField
        label="Test Section"
        defaultExpanded={false}
        onToggle={onToggle}
      >
        <div data-testid="content">Content</div>
      </CollapsibleFormField>
    );

    const header = screen.getByText('Test Section').closest('button');
    fireEvent.click(header!);

    expect(onToggle).toHaveBeenCalledWith(true);
  });

  it('supports controlled expanded state', () => {
    const { rerender } = render(
      <CollapsibleFormField label="Test Section" expanded={false}>
        <div data-testid="content">Content</div>
      </CollapsibleFormField>
    );

    expect(screen.queryByTestId('content')).not.toBeInTheDocument();

    rerender(
      <CollapsibleFormField label="Test Section" expanded>
        <div data-testid="content">Content</div>
      </CollapsibleFormField>
    );

    expect(screen.getByTestId('content')).toBeVisible();
  });

  it('displays error message when provided', () => {
    render(
      <CollapsibleFormField label="Test Section" error="This field is required">
        <div data-testid="content">Content</div>
      </CollapsibleFormField>
    );

    expect(screen.getByText('This field is required')).toBeVisible();
  });

  it('shows chevron icon that rotates based on state', () => {
    const { rerender } = render(
      <CollapsibleFormField label="Test Section" expanded={false}>
        <div data-testid="content">Content</div>
      </CollapsibleFormField>
    );

    const icon = screen.getByTestId('chevron-icon');
    expect(icon).toHaveStyle({ transform: 'rotate(0deg)' });

    rerender(
      <CollapsibleFormField label="Test Section" expanded>
        <div data-testid="content">Content</div>
      </CollapsibleFormField>
    );

    expect(icon).toHaveStyle({ transform: 'rotate(180deg)' });
  });
});
