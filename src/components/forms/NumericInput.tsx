import { TextInput, TextInputProps, Group } from '@mantine/core';
import { forwardRef, useState, useEffect } from 'react';

interface NumericInputProps extends Omit<
  TextInputProps,
  'type' | 'inputMode' | 'value' | 'onChange'
> {
  /** Show prefix before value (e.g., "$") */
  prefix?: string;
  /** Show suffix after value (e.g., "%") */
  suffix?: string;
  /** Add thousand separators */
  thousandSeparator?: boolean;
  /** Decimal places to show */
  decimalScale?: number;
  /** Value as string or number */
  value?: string | number;
  /** Change handler */
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const NumericInput = forwardRef<HTMLInputElement, NumericInputProps>(
  (
    {
      prefix,
      suffix,
      thousandSeparator,
      decimalScale,
      value,
      onChange,
      ...props
    },
    ref
  ) => {
    const [displayValue, setDisplayValue] = useState('');

    useEffect(() => {
      const stringValue = String(value ?? '');
      const num = parseFloat(stringValue);
      if (isNaN(num)) {
        setDisplayValue(stringValue);
        return;
      }

      let formatted = stringValue;
      if (thousandSeparator) {
        const parts = num.toFixed(decimalScale ?? 0).split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        formatted = parts.join('.');
      }
      setDisplayValue(formatted);
      // eslint-disable-next-line react-hooks/set-state-in-effect
    }, [value, thousandSeparator, decimalScale]);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = event.target.value.replace(/[^\d.-]/g, '');
      const num = parseFloat(rawValue);

      let formatted = rawValue;
      if (!isNaN(num) && thousandSeparator) {
        const parts = num.toFixed(decimalScale ?? 0).split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        formatted = parts.join('.');
      }
      setDisplayValue(formatted);
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
