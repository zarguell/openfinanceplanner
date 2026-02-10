// @vitest-environment jsdom
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import { FormActions } from './FormActions';

vi.mock('@mantine/core', () => ({
  Button: ({
    children,
    onClick,
    disabled,
    loading,
    leftSection,
    rightSection,
    className,
    ...props
  }: any) => (
    <button
      data-testid="button"
      onClick={onClick}
      disabled={disabled || loading}
      className={className}
      {...props}
    >
      {leftSection}
      {children}
      {rightSection}
    </button>
  ),
  Group: ({ children, justify, gap, className, ...props }: any) => (
    <div
      data-testid="group"
      data-justify={justify}
      data-gap={gap}
      className={className}
      {...props}
    >
      {children}
    </div>
  ),
}));

describe('FormActions', () => {
  it('renders primary button', () => {
    render(<FormActions primaryLabel="Save" onPrimaryClick={vi.fn()} />);

    expect(screen.getByText('Save')).toBeInTheDocument();
  });

  it('renders secondary button when label provided', () => {
    render(
      <FormActions
        primaryLabel="Save"
        onPrimaryClick={vi.fn()}
        secondaryLabel="Cancel"
        onSecondaryClick={vi.fn()}
      />
    );

    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('does not render secondary button when label not provided', () => {
    render(<FormActions primaryLabel="Save" onPrimaryClick={vi.fn()} />);

    expect(screen.queryByText('Cancel')).not.toBeInTheDocument();
  });

  it('calls onPrimaryClick when primary button clicked', () => {
    const onPrimaryClick = vi.fn();
    render(<FormActions primaryLabel="Save" onPrimaryClick={onPrimaryClick} />);

    fireEvent.click(screen.getByText('Save'));
    expect(onPrimaryClick).toHaveBeenCalledTimes(1);
  });

  it('calls onSecondaryClick when secondary button clicked', () => {
    const onSecondaryClick = vi.fn();
    render(
      <FormActions
        primaryLabel="Save"
        onPrimaryClick={vi.fn()}
        secondaryLabel="Cancel"
        onSecondaryClick={onSecondaryClick}
      />
    );

    fireEvent.click(screen.getByText('Cancel'));
    expect(onSecondaryClick).toHaveBeenCalledTimes(1);
  });

  it('disables primary button when primaryDisabled is true', () => {
    render(
      <FormActions
        primaryLabel="Save"
        onPrimaryClick={vi.fn()}
        primaryDisabled
      />
    );

    const saveButton = screen.getByText('Save');
    expect(saveButton).toBeDisabled();
  });

  it('disables secondary button when secondaryDisabled is true', () => {
    render(
      <FormActions
        primaryLabel="Save"
        onPrimaryClick={vi.fn()}
        secondaryLabel="Cancel"
        onSecondaryClick={vi.fn()}
        secondaryDisabled
      />
    );

    const cancelButton = screen.getByText('Cancel');
    expect(cancelButton).toBeDisabled();
  });

  it('shows loading state on primary button when isLoading is true', () => {
    render(
      <FormActions primaryLabel="Save" onPrimaryClick={vi.fn()} isLoading />
    );

    const saveButton = screen.getByText('Save');
    expect(saveButton).toBeDisabled();
  });

  it('applies custom className to container', () => {
    const { container } = render(
      <FormActions
        primaryLabel="Save"
        onPrimaryClick={vi.fn()}
        className="custom-class"
      />
    );

    expect(container.querySelector('.custom-class')).toBeInTheDocument();
  });

  it('renders primary button with left icon when provided', () => {
    render(
      <FormActions
        primaryLabel="Save"
        onPrimaryClick={vi.fn()}
        primaryLeftSection={<span data-testid="icon">★</span>}
      />
    );

    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });
});
