// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import { FormStatus } from './FormStatus';

vi.mock('@mantine/core', () => ({
  Group: ({ children, gap, p, bg, style, className, ...props }: any) => (
    <div
      data-testid="group"
      data-gap={gap}
      data-p={p}
      data-bg={bg}
      style={style}
      className={className}
      {...props}
    >
      {children}
    </div>
  ),
  Text: ({ children, size, c, className, ...props }: any) => (
    <div
      data-testid="text"
      data-size={size}
      data-c={c}
      className={className}
      {...props}
    >
      {children}
    </div>
  ),
  Button: ({ children, onClick, size, variant, color, p, ...props }: any) => (
    <button data-testid="button" onClick={onClick} {...props}>
      {children}
    </button>
  ),
  Loader: ({ size, color, ...props }: any) => (
    <div data-testid="loader" data-size={size} data-color={color} {...props}>
      Loading...
    </div>
  ),
}));

describe('FormStatus', () => {
  it('renders success message when status is success', () => {
    render(
      <FormStatus status="success" message="Form submitted successfully" />
    );

    expect(screen.getByText('Form submitted successfully')).toBeInTheDocument();
  });

  it('renders error message when status is error', () => {
    render(<FormStatus status="error" message="Form submission failed" />);

    expect(screen.getByText('Form submission failed')).toBeInTheDocument();
  });

  it('renders info message when status is info', () => {
    render(<FormStatus status="info" message="Please fill out all fields" />);

    expect(screen.getByText('Please fill out all fields')).toBeInTheDocument();
  });

  it('renders loading indicator when status is loading', () => {
    render(<FormStatus status="loading" message="Saving..." />);

    expect(screen.getByText('Saving...')).toBeInTheDocument();
  });

  it('does not render when status is null', () => {
    const { container } = render(
      <FormStatus status={null} message="No status" />
    );

    expect(container.firstChild).toBeNull();
  });

  it('applies custom className', () => {
    const { container } = render(
      <FormStatus status="success" message="Success" className="custom-class" />
    );

    expect(container.querySelector('.custom-class')).toBeInTheDocument();
  });

  it('allows onDismiss callback', () => {
    const onDismiss = vi.fn();
    render(<FormStatus status="error" message="Error" onDismiss={onDismiss} />);

    const closeButton = screen.getByRole('button');
    closeButton.click();
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('does not show close button when onDismiss is not provided', () => {
    render(<FormStatus status="success" message="Success" />);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
