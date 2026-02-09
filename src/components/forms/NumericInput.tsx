import { TextInput, TextInputProps, Group } from '@mantine/core';
import { forwardRef, useState } from 'react';

interface NumericInputProps extends Omit<TextInputProps, 'type' | 'inputMode'> {
  /** Show prefix before value (e.g., "$") */
  prefix?: string;
  /** Show suffix after value (e.g., "%") */
  suffix?: string;
  /** Add thousand separators */
  thousandSeparator?: boolean;
  /** Decimal places to show */
  decimalScale?: number;
}

export const NumericInput = forwardRef<HTMLInputElement, NumericInputProps>(
  (
    { prefix, suffix, thousandSeparator, decimalScale, onChange, ...props },
    ref
  ) => {
    const [displayValue, setDisplayValue] = useState('');

    const formatValue = (value: string): string => {
      const num = parseFloat(value);
      if (isNaN(num)) return value;

      let formatted = value;
      if (thousandSeparator) {
        const parts = num.toFixed(decimalScale ?? 0).split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        formatted = parts.join('.');
      }
      return formatted;
    };

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = event.target.value.replace(/[^\d.-]/g, '');
      setDisplayValue(formatValue(rawValue));
      onChange?.(event);
    };

    return (
      <TextInput
        ref={ref}
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        {...props}
        onChange={handleChange}
        value={displayValue}
        styles={{
          input: {
            textAlign: 'right',
          },
        }}
        rightSection={(prefix || suffix) && <Group gap={0}>{suffix}</Group>}
        leftSection={prefix}
        leftSectionProps={{ style: { pointerEvents: 'none' } }}
      />
    );
  }
);

NumericInput.displayName = 'NumericInput';
