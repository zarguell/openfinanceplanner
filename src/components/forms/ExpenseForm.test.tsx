// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ExpenseForm } from './ExpenseForm';

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

describe('ExpenseForm Component', () => {
  it('should render expense form with all basic fields', () => {
    render(<ExpenseForm />);

    expect(screen.getByTestId('text')).toHaveTextContent('Create Expense');
    expect(screen.getByTestId('select-expense-type')).toBeInTheDocument();
    expect(screen.getByTestId('select-category')).toBeInTheDocument();
    expect(screen.getByTestId('number-input-amount-($)')).toBeInTheDocument();
    expect(screen.getByTestId('select-frequency')).toBeInTheDocument();
    expect(screen.getByTestId('text-input-date')).toBeInTheDocument();
  });

  it('should show required field indicators', () => {
    render(<ExpenseForm />);

    const requiredFields = [
      'text-input-expense-name',
      'select-expense-type',
      'select-category',
      'number-input-amount-($)',
      'select-frequency',
      'text-input-date',
    ];

    requiredFields.forEach((field) => {
      const fieldElement = screen.getByTestId(field);
      expect(fieldElement.innerHTML).toContain('*');
    });
  });

  it('should display recurring expense fields when recurring type is selected', async () => {
    render(<ExpenseForm />);

    const typeSelect = screen
      .getByTestId('select-expense-type')
      .querySelector('select');
    if (typeSelect) {
      fireEvent.change(typeSelect, { target: { value: 'recurring' } });
    }

    await waitFor(() => {
      expect(
        screen.getByTestId('text-input-end-date-(optional)')
      ).toBeInTheDocument();
      expect(screen.getByText(/mandatory expense/i)).toBeInTheDocument();
      expect(screen.getByText(/variable amount/i)).toBeInTheDocument();
    });
  });

  it('should display one-time expense fields when one-time type is selected', async () => {
    render(<ExpenseForm />);

    const typeSelect = screen
      .getByTestId('select-expense-type')
      .querySelector('select');
    if (typeSelect) {
      fireEvent.change(typeSelect, { target: { value: 'one-time' } });
    }

    await waitFor(() => {
      expect(screen.getByTestId('select-status')).toBeInTheDocument();
      const frequencySelect = screen
        .getByTestId('select-frequency')
        .querySelector('select');
      if (frequencySelect) {
        expect(frequencySelect.value).toBe('once');
      }
    });
  });

  it('should call onSuccess when form is submitted with valid data', async () => {
    const onSuccess = vi.fn();
    render(<ExpenseForm onSuccess={onSuccess} />);

    const nameInput = screen
      .getByTestId('text-input-expense-name')
      .querySelector('input');
    const amountInput = screen
      .getByTestId('number-input-amount-($)')
      .querySelector('input');
    const dateInput = screen
      .getByTestId('text-input-date')
      .querySelector('input');
    const submitButton = screen.getByRole('button', {
      name: /create expense/i,
    });

    if (nameInput)
      fireEvent.change(nameInput, { target: { value: 'Monthly Rent' } });
    if (amountInput)
      fireEvent.change(amountInput, { target: { value: '2000' } });
    if (dateInput)
      fireEvent.change(dateInput, { target: { value: '2024-01-01' } });

    if (submitButton) fireEvent.click(submitButton);

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
      const expense = onSuccess.mock.calls[0][0];
      expect(expense).toMatchObject({
        name: 'Monthly Rent',
        type: 'recurring',
      });
      expect(expense.amount).toBeDefined();
    });
  });

  it('should call onCancel when cancel button is clicked', () => {
    const onCancel = vi.fn();
    render(<ExpenseForm onCancel={onCancel} />);

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    if (cancelButton) {
      fireEvent.click(cancelButton);
    }

    expect(onCancel).toHaveBeenCalled();
  });

  it('should render optional fields', () => {
    render(<ExpenseForm />);

    expect(
      screen.getByTestId('text-input-tags-(comma-separated)')
    ).toBeInTheDocument();
  });

  it('should display frequency selector for recurring expenses', async () => {
    render(<ExpenseForm />);

    const typeSelect = screen
      .getByTestId('select-expense-type')
      .querySelector('select');
    if (typeSelect) {
      fireEvent.change(typeSelect, { target: { value: 'recurring' } });
    }

    await waitFor(() => {
      const frequencySelect = screen
        .getByTestId('select-frequency')
        .querySelector('select');
      if (frequencySelect) {
        const options = Array.from(frequencySelect.options || []).map(
          (opt) => opt.value
        );
        expect(options).toContain('monthly');
        expect(options).toContain('weekly');
      }
    });
  });

  it('should limit frequency to "once" for one-time expenses', async () => {
    render(<ExpenseForm />);

    const typeSelect = screen
      .getByTestId('select-expense-type')
      .querySelector('select');
    if (typeSelect) {
      fireEvent.change(typeSelect, { target: { value: 'one-time' } });
    }

    await waitFor(() => {
      const frequencySelect = screen
        .getByTestId('select-frequency')
        .querySelector('select');
      if (frequencySelect) {
        const options = Array.from(frequencySelect.options || []).map(
          (opt) => opt.value
        );
        expect(options).toEqual(['once']);
      }
    });
  });
});
