// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { IncomeForm } from './IncomeForm';

vi.mock('@mantine/core', () => ({
  Paper: ({ children, shadow, p, withBorder }: any) => (
    <div
      data-testid="paper"
      data-shadow={shadow}
      data-p={p}
      data-with-border={withBorder}
    >
      {children}
    </div>
  ),
  Text: ({ children, size, fw, mb }: any) => (
    <div data-testid="text" data-size={size} data-fw={fw} data-mb={mb}>
      {children}
    </div>
  ),
  Stack: ({ children }: any) => <div data-testid="stack">{children}</div>,
  Group: ({ children, justify, mt }: any) => (
    <div data-testid="group" data-justify={justify} data-mt={mt}>
      {children}
    </div>
  ),
  TextInput: ({ label, placeholder, type, withAsterisk, ...props }: any) => (
    <div
      data-testid={`text-input-${label?.toLowerCase().replace(/\s+/g, '-')}`}
    >
      {withAsterisk && <span>*</span>}
      <label>{label}</label>
      <input type={type || 'text'} placeholder={placeholder} {...props} />
    </div>
  ),
  NumberInput: ({
    label,
    placeholder,
    min,
    max,
    withAsterisk,
    ...props
  }: any) => (
    <div
      data-testid={`number-input-${label?.toLowerCase().replace(/\s+/g, '-')}`}
    >
      {withAsterisk && <span>*</span>}
      <label>{label}</label>
      <input
        type="number"
        placeholder={placeholder}
        min={min}
        max={max}
        {...props}
      />
    </div>
  ),
  Select: ({ label, placeholder, data, withAsterisk, ...props }: any) => (
    <div data-testid={`select-${label?.toLowerCase().replace(/\s+/g, '-')}`}>
      {withAsterisk && <span>*</span>}
      <label>{label}</label>
      <select {...props}>
        {data?.map((opt: any) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  ),
  Switch: ({ label, description, ...props }: any) => (
    <div data-testid="switch">
      <input type="checkbox" {...props} />
      <label>{label}</label>
      {description && <small>{description}</small>}
    </div>
  ),
  Button: ({ children, variant, type, onClick }: any) => (
    <button type={type || 'button'} data-variant={variant} onClick={onClick}>
      {children}
    </button>
  ),
}));

describe('IncomeForm Component', () => {
  it('should render income form with all basic fields', () => {
    render(<IncomeForm />);

    expect(screen.getByTestId('text')).toHaveTextContent(
      'Create Income Source'
    );
    expect(screen.getByTestId('select-income-type')).toBeInTheDocument();
    expect(screen.getByTestId('select-category')).toBeInTheDocument();
    expect(screen.getByTestId('number-input-amount-($)')).toBeInTheDocument();
    expect(screen.getByTestId('select-frequency')).toBeInTheDocument();
    expect(screen.getByTestId('text-input-start-date')).toBeInTheDocument();
  });

  it('should show required field indicators', () => {
    render(<IncomeForm />);

    const requiredFields = [
      'text-input-income-name',
      'select-income-type',
      'select-category',
      'number-input-amount-($)',
      'select-frequency',
      'text-input-start-date',
    ];

    requiredFields.forEach((field) => {
      const fieldElement = screen.getByTestId(field);
      expect(fieldElement.innerHTML).toContain('*');
    });
  });

  it('should display work income specific fields when work type is selected', async () => {
    render(<IncomeForm />);

    const typeSelect = screen
      .getByTestId('select-income-type')
      .querySelector('select');
    if (typeSelect) {
      fireEvent.change(typeSelect, { target: { value: 'work' } });
    }

    await waitFor(() => {
      expect(screen.getByTestId('switch')).toBeInTheDocument();
      expect(screen.getByText(/taxable income/i)).toBeInTheDocument();
    });
  });

  it('should display social security specific fields when social-security type is selected', async () => {
    render(<IncomeForm />);

    const typeSelect = screen
      .getByTestId('select-income-type')
      .querySelector('select');
    if (typeSelect) {
      fireEvent.change(typeSelect, { target: { value: 'social-security' } });
    }

    await waitFor(() => {
      expect(screen.getByText(/inflation adjusted/i)).toBeInTheDocument();
      expect(
        screen.getByTestId('number-input-claiming-age-(optional)')
      ).toBeInTheDocument();
    });
  });

  it('should display business income specific fields when business type is selected', async () => {
    render(<IncomeForm />);

    const typeSelect = screen
      .getByTestId('select-income-type')
      .querySelector('select');
    if (typeSelect) {
      fireEvent.change(typeSelect, { target: { value: 'business' } });
    }

    await waitFor(() => {
      expect(
        screen.getByTestId('number-input-associated-expenses-($)')
      ).toBeInTheDocument();
      expect(
        screen.getByTestId('text-input-business-name-(optional)')
      ).toBeInTheDocument();
      expect(
        screen.getByTestId('text-input-tax-id-(optional)')
      ).toBeInTheDocument();
    });
  });

  it('should display rental income specific fields when rental type is selected', async () => {
    render(<IncomeForm />);

    const typeSelect = screen
      .getByTestId('select-income-type')
      .querySelector('select');
    if (typeSelect) {
      fireEvent.change(typeSelect, { target: { value: 'rental' } });
    }

    await waitFor(() => {
      expect(
        screen.getByTestId('number-input-associated-expenses-($)')
      ).toBeInTheDocument();
      expect(
        screen.getByTestId('text-input-property-id-(optional)')
      ).toBeInTheDocument();
    });
  });

  it('should display investment income specific fields when investment type is selected', async () => {
    render(<IncomeForm />);

    const typeSelect = screen
      .getByTestId('select-income-type')
      .querySelector('select');
    if (typeSelect) {
      fireEvent.change(typeSelect, { target: { value: 'investment' } });
    }

    await waitFor(() => {
      expect(screen.getByTestId('select-investment-type')).toBeInTheDocument();
      expect(
        screen.getByTestId('text-input-account-id-(optional)')
      ).toBeInTheDocument();
    });
  });

  it('should call onSuccess when form is submitted with valid data', async () => {
    const onSuccess = vi.fn();
    render(<IncomeForm onSuccess={onSuccess} />);

    const nameInput = screen
      .getByTestId('text-input-income-name')
      .querySelector('input');
    const amountInput = screen
      .getByTestId('number-input-amount-($)')
      .querySelector('input');
    const startDateInput = screen
      .getByTestId('text-input-start-date')
      .querySelector('input');
    const submitButton = screen.getByRole('button', { name: /create income/i });

    if (nameInput)
      fireEvent.change(nameInput, { target: { value: 'Primary Salary' } });
    if (amountInput)
      fireEvent.change(amountInput, { target: { value: '5000' } });
    if (startDateInput)
      fireEvent.change(startDateInput, { target: { value: '2024-01-01' } });

    if (submitButton) fireEvent.click(submitButton);

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
      const income = onSuccess.mock.calls[0][0];
      expect(income).toMatchObject({
        name: 'Primary Salary',
        type: 'work',
      });
      expect(income.amount).toBeDefined();
    });
  });

  it('should call onCancel when cancel button is clicked', () => {
    const onCancel = vi.fn();
    render(<IncomeForm onCancel={onCancel} />);

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    if (cancelButton) {
      fireEvent.click(cancelButton);
    }

    expect(onCancel).toHaveBeenCalled();
  });

  it('should render optional fields', () => {
    render(<IncomeForm />);

    expect(
      screen.getByTestId('text-input-end-date-(optional)')
    ).toBeInTheDocument();
    expect(
      screen.getByTestId('text-input-tags-(comma-separated)')
    ).toBeInTheDocument();
  });
});
