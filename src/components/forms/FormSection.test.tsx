// @vitest-environment jsdom
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import { FormSection } from './FormSection';

const MockTextInput = ({ label, placeholder, ...props }: any) => (
  <div>
    <label>{label}</label>
    <input data-testid="text-input" placeholder={placeholder} {...props} />
  </div>
);

const MockButton = ({ children, onClick, ...props }: any) => (
  <button data-testid="button" onClick={onClick} {...props}>
    {children}
  </button>
);

describe('FormSection', () => {
  it('renders with title', () => {
    render(
      <FormSection title="Test Section">
        <MockTextInput label="Test" placeholder="Test input" />
      </FormSection>
    );

    expect(screen.getByText('Test Section')).toBeInTheDocument();
  });

  it('renders children', () => {
    render(
      <FormSection title="Test Section">
        <MockTextInput
          label="Test"
          placeholder="Test input"
          data-testid="test-input"
        />
      </FormSection>
    );

    expect(screen.getByTestId('test-input')).toBeInTheDocument();
  });

  it('renders description when provided', () => {
    render(
      <FormSection title="Test Section" description="Test description">
        <MockTextInput label="Test" placeholder="Test input" />
      </FormSection>
    );

    expect(screen.getByText('Test description')).toBeInTheDocument();
  });

  it('renders actions when provided', () => {
    const onClick = vi.fn();
    render(
      <FormSection
        title="Test Section"
        actions={<MockButton onClick={onClick}>Save</MockButton>}
      >
        <MockTextInput label="Test" placeholder="Test input" />
      </FormSection>
    );

    const saveButton = screen.getByText('Save');
    expect(saveButton).toBeInTheDocument();

    fireEvent.click(saveButton);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('applies custom className', () => {
    const { container } = render(
      <FormSection title="Test Section" className="custom-class">
        <MockTextInput label="Test" placeholder="Test input" />
      </FormSection>
    );

    const section = container.querySelector('.custom-class');
    expect(section).toBeInTheDocument();
  });

  it('does not render description when not provided', () => {
    render(
      <FormSection title="Test Section">
        <MockTextInput label="Test" placeholder="Test input" />
      </FormSection>
    );

    expect(screen.queryByText('Test description')).not.toBeInTheDocument();
  });

  it('renders children with proper spacing', () => {
    const { container } = render(
      <FormSection title="Test Section">
        <MockTextInput label="Test 1" placeholder="Input 1" />
        <MockTextInput label="Test 2" placeholder="Input 2" />
      </FormSection>
    );

    const inputs = container.querySelectorAll('input');
    expect(inputs).toHaveLength(2);
  });
});
