// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MilestoneForm } from './MilestoneForm';

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
  Text: ({ children, size, fw, mb, c }: any) => (
    <div
      data-testid="text"
      data-size={size}
      data-fw={fw}
      data-mb={mb}
      data-c={c}
    >
      {children}
    </div>
  ),
  Stack: ({ children, pl }: any) => (
    <div data-testid="stack" data-pl={pl}>
      {children}
    </div>
  ),
  Group: ({ children, justify, gap, mt }: any) => (
    <div data-testid="group" data-justify={justify} data-gap={gap} data-mt={mt}>
      {children}
    </div>
  ),
  TextInput: ({
    label,
    placeholder,
    type,
    withAsterisk,
    minRows,
    ...props
  }: any) => (
    <div
      data-testid={`text-input-${label?.toLowerCase().replace(/\s+/g, '-')}`}
    >
      {withAsterisk && <span>*</span>}
      <label>{label}</label>
      <input
        type={type || 'text'}
        placeholder={placeholder}
        // eslint-disable-next-line react/no-unknown-property
        minRows={minRows}
        {...props}
      />
    </div>
  ),
  NumberInput: ({
    label,
    placeholder,
    min,
    max,
    size,
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
        size={size}
        {...props}
      />
    </div>
  ),
  Textarea: ({ label, placeholder, minRows, ...props }: any) => (
    <div data-testid="textarea">
      <label>{label}</label>
      <textarea placeholder={placeholder} minRows={minRows} {...props} />
    </div>
  ),
  Select: ({ label, placeholder, data, withAsterisk, size, ...props }: any) => (
    <div data-testid={`select-${label?.toLowerCase().replace(/\s+/g, '-')}`}>
      {withAsterisk && <span>*</span>}
      <label>{label}</label>
      <select size={size} {...props}>
        {data?.map((opt: any) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  ),
  Switch: ({ label, ...props }: any) => (
    <div data-testid="switch">
      <input type="checkbox" {...props} />
      <label>{label}</label>
    </div>
  ),
  Button: ({ children, variant, type, size, color, onClick }: any) => (
    <button
      type={type || 'button'}
      data-variant={variant}
      data-size={size}
      data-color={color}
      onClick={onClick}
    >
      {children}
    </button>
  ),
}));

describe('MilestoneForm Component', () => {
  it('should render milestone form with basic fields', () => {
    render(<MilestoneForm />);

    const textElements = screen.getAllByTestId('text');
    expect(
      textElements.some((el) => el.textContent?.includes('Create Milestone'))
    ).toBe(true);
    expect(screen.getByTestId('select-milestone-type')).toBeInTheDocument();
    expect(screen.getByTestId('text-input-target-date')).toBeInTheDocument();
    expect(
      screen.getByTestId('number-input-priority-(lower-=-higher-priority)')
    ).toBeInTheDocument();
    expect(screen.getByTestId('textarea')).toBeInTheDocument();
  });

  it('should show required field indicators', () => {
    render(<MilestoneForm />);

    const requiredFields = [
      'text-input-milestone-name',
      'select-milestone-type',
      'text-input-target-date',
    ];

    requiredFields.forEach((field) => {
      const fieldElement = screen.getByTestId(field);
      expect(fieldElement.innerHTML).toContain('*');
    });
  });

  it('should display financial impact section when switch is enabled', async () => {
    render(<MilestoneForm />);

    const switchElements = screen.getAllByTestId('switch');
    const financialImpactSwitch = switchElements[0];
    if (financialImpactSwitch) {
      const checkbox = financialImpactSwitch.querySelector('input');
      if (checkbox) {
        fireEvent.click(checkbox);
      }
    }

    await waitFor(() => {
      expect(
        screen.getByTestId('select-financial-impact-type')
      ).toBeInTheDocument();
      expect(screen.getByTestId('number-input-amount-($)')).toBeInTheDocument();
    });
  });

  it('should display conditions section with add button', () => {
    render(<MilestoneForm />);

    expect(screen.getByText(/conditions \(optional\)/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /add condition/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/no conditions added/i)).toBeInTheDocument();
  });

  it('should call onSuccess when form is submitted with valid data', async () => {
    const onSuccess = vi.fn();
    render(<MilestoneForm onSuccess={onSuccess} />);

    const nameInput = screen
      .getByTestId('text-input-milestone-name')
      .querySelector('input');
    const dateInput = screen
      .getByTestId('text-input-target-date')
      .querySelector('input');
    const submitButton = screen.getByRole('button', {
      name: /create milestone/i,
    });

    if (nameInput)
      fireEvent.change(nameInput, { target: { value: 'Retirement' } });
    if (dateInput)
      fireEvent.change(dateInput, { target: { value: '2040-01-01' } });

    if (submitButton) fireEvent.click(submitButton);

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
      const milestone = onSuccess.mock.calls[0][0];
      expect(milestone).toMatchObject({
        name: 'Retirement',
        type: 'retirement',
      });
    });
  });

  it('should call onCancel when cancel button is clicked', () => {
    const onCancel = vi.fn();
    render(<MilestoneForm onCancel={onCancel} />);

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    if (cancelButton) {
      fireEvent.click(cancelButton);
    }

    expect(onCancel).toHaveBeenCalled();
  });

  it('should remove condition when remove button is clicked', async () => {
    render(<MilestoneForm />);

    const addButton = screen.getByRole('button', { name: /add condition/i });
    if (addButton) {
      fireEvent.click(addButton);
    }

    await waitFor(() => {
      expect(
        screen.queryByText(/no conditions added/i)
      ).not.toBeInTheDocument();
    });

    const removeButton = screen.getByRole('button', { name: /remove/i });
    if (removeButton) {
      fireEvent.click(removeButton);
    }

    await waitFor(() => {
      expect(screen.getByText(/no conditions added/i)).toBeInTheDocument();
    });
  });
});
