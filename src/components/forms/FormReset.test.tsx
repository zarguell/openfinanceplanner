// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { FormReset } from './FormReset';
import { useForm } from '@mantine/form';

describe('FormReset', () => {
  it('renders reset button with correct label', () => {
    const form = useForm({
      initialValues: { name: 'test', age: 30 },
    });

    render(<FormReset form={form} label="Reset Form" />);

    expect(screen.getByText('Reset Form')).toBeVisible();
  });

  it('resets form values when clicked', () => {
    const form = useForm({
      initialValues: { name: 'test', age: 30 },
    });

    render(<FormReset form={form} />);

    fireEvent.change(screen.getByRole('button', { name: /reset/i }), {
      target: { value: '' },
    });
    fireEvent.click(screen.getByRole('button', { name: /reset/i }));

    expect(form.values).toEqual({ name: 'test', age: 30 });
  });

  it('resets form values after changes', () => {
    const form = useForm({
      initialValues: { name: 'test', age: 30 },
    });

    render(<FormReset form={form} />);

    act(() => {
      form.setFieldValue('name', 'updated');
      form.setFieldValue('age', 40);
    });

    expect(form.values).toEqual({ name: 'updated', age: 40 });

    fireEvent.click(screen.getByRole('button', { name: /reset/i }));

    expect(form.values).toEqual({ name: 'test', age: 30 });
  });

  it('shows confirmation dialog when confirm is enabled', () => {
    const form = useForm({
      initialValues: { name: 'test', age: 30 },
    });

    render(<FormReset form={form} confirm />);

    const button = screen.getByRole('button', { name: /reset/i });
    fireEvent.click(button);

    expect(screen.getByText(/are you sure you want to reset/i)).toBeVisible();
  });

  it('resets form after confirmation', () => {
    const form = useForm({
      initialValues: { name: 'test', age: 30 },
    });

    render(<FormReset form={form} confirm />);

    act(() => {
      form.setFieldValue('name', 'updated');
    });

    fireEvent.click(screen.getByRole('button', { name: /reset/i }));
    fireEvent.click(screen.getByRole('button', { name: /confirm/i }));

    expect(form.values).toEqual({ name: 'test', age: 30 });
  });

  it('does not reset when confirmation is cancelled', () => {
    const form = useForm({
      initialValues: { name: 'test', age: 30 },
    });

    render(<FormReset form={form} confirm />);

    act(() => {
      form.setFieldValue('name', 'updated');
    });

    fireEvent.click(screen.getByRole('button', { name: /reset/i }));
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));

    expect(form.values).toEqual({ name: 'updated', age: 30 });
  });

  it('calls onReset callback when form is reset', () => {
    const form = useForm({
      initialValues: { name: 'test', age: 30 },
    });
    const onReset = vi.fn();

    render(<FormReset form={form} onReset={onReset} />);

    act(() => {
      form.setFieldValue('name', 'updated');
    });

    fireEvent.click(screen.getByRole('button', { name: /reset/i }));

    expect(onReset).toHaveBeenCalled();
  });

  it('is disabled when form is not dirty', () => {
    const form = useForm({
      initialValues: { name: 'test', age: 30 },
    });

    render(<FormReset form={form} disableWhenClean />);

    expect(screen.getByRole('button', { name: /reset/i })).toBeDisabled();
  });

  it('is enabled when form is dirty', () => {
    const form = useForm({
      initialValues: { name: 'test', age: 30 },
    });

    render(<FormReset form={form} disableWhenClean />);

    act(() => {
      form.setFieldValue('name', 'updated');
    });

    expect(screen.getByRole('button', { name: /reset/i })).toBeEnabled();
  });

  it('custom confirmation message', () => {
    const form = useForm({
      initialValues: { name: 'test', age: 30 },
    });

    render(
      <FormReset form={form} confirm confirmMessage="Discard all changes?" />
    );

    fireEvent.click(screen.getByRole('button', { name: /reset/i }));

    expect(screen.getByText('Discard all changes?')).toBeVisible();
  });

  it('applies custom className', () => {
    const form = useForm({
      initialValues: { name: 'test', age: 30 },
    });

    render(<FormReset form={form} className="custom-class" />);

    expect(screen.getByRole('button', { name: /reset/i })).toHaveClass(
      'custom-class'
    );
  });

  it('shows left section icon when provided', () => {
    const form = useForm({
      initialValues: { name: 'test', age: 30 },
    });

    render(
      <FormReset
        form={form}
        leftSection={<span data-testid="icon">Icon</span>}
      />
    );

    expect(screen.getByTestId('icon')).toBeVisible();
  });
});
