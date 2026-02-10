type ValidationRule = (value: unknown) => string | null;

export function validateRequired(value: unknown): string | null {
  if (value === undefined || value === null || value === '') {
    return 'This field is required';
  }
  return null;
}

export function validateNumber(value: unknown): string | null {
  const num = Number(value);
  if (isNaN(num)) {
    return 'Must be a valid number';
  }
  return null;
}

export function validatePositive(value: number): string | null {
  if (value <= 0) {
    return 'Must be greater than 0';
  }
  return null;
}

export function validateEmail(value: string): string | null {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value)) {
    return 'Must be a valid email address';
  }
  return null;
}

export function validateDate(value: unknown): string | null {
  const date = new Date(value as string | Date);
  if (isNaN(date.getTime())) {
    return 'Must be a valid date';
  }
  return null;
}

export function validateMin(
  value: number,
  min: number,
  message?: string
): string | null {
  if (value < min) {
    return message || `Must be at least ${min}`;
  }
  return null;
}

export function validateMax(
  value: number,
  max: number,
  message?: string
): string | null {
  if (value > max) {
    return message || `Must be at most ${max}`;
  }
  return null;
}

export function validateLength(
  value: string,
  min?: number | null,
  max?: number | null,
  minMessage?: string,
  maxMessage?: string
): string | null {
  const length = value.length;
  if (min !== null && min !== undefined && length < min) {
    return minMessage || `Must be at least ${min} characters`;
  }
  if (max !== null && max !== undefined && length > max) {
    return maxMessage || `Must be at most ${max} characters`;
  }
  return null;
}

export function validatePattern(
  value: string,
  pattern: RegExp,
  message?: string
): string | null {
  if (!pattern.test(value)) {
    return message || 'Invalid format';
  }
  return null;
}

export function validateFutureDate(
  value: Date | string,
  inclusive = false,
  message?: string
): string | null {
  const date = new Date(value);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const inputDate = new Date(date);
  inputDate.setHours(0, 0, 0, 0);

  if (inclusive) {
    if (inputDate < now) {
      return message || 'Date must be in the future';
    }
  } else {
    if (inputDate <= now) {
      return message || 'Date must be in the future';
    }
  }
  return null;
}

export function validatePastDate(
  value: Date | string,
  inclusive = false,
  message?: string
): string | null {
  const date = new Date(value);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const inputDate = new Date(date);
  inputDate.setHours(0, 0, 0, 0);

  if (inclusive) {
    if (inputDate > now) {
      return message || 'Date must be in the past';
    }
  } else {
    if (inputDate >= now) {
      return message || 'Date must be in the past';
    }
  }
  return null;
}

export function composeRules(...rules: ValidationRule[]): ValidationRule {
  return (value: unknown) => {
    for (const rule of rules) {
      const error = rule(value);
      if (error) {
        return error;
      }
    }
    return null;
  };
}

export function validateAge(value: unknown): string | null {
  const errors = composeRules(
    validateNumber,
    (v: unknown) => {
      const num = Number(v);
      if (isNaN(num)) return 'Must be a valid number';
      return validateMin(num, 18);
    },
    (v: unknown) => {
      const num = Number(v);
      if (isNaN(num)) return 'Must be a valid number';
      return validateMax(num, 100);
    }
  );
  return errors(value);
}

export function validateCurrency(value: unknown): string | null {
  const errors = composeRules(validateNumber, (v: unknown) => {
    const num = Number(v);
    if (isNaN(num)) return 'Must be a valid number';
    return validatePositive(num);
  });
  return errors(value);
}

export function validatePercentage(value: unknown): string | null {
  const errors = composeRules(
    validateNumber,
    (v: unknown) => {
      const n = Number(v);
      if (isNaN(n)) return 'Must be a valid number';
      return validateMin(n, 0);
    },
    (v: unknown) => {
      const n = Number(v);
      if (isNaN(n)) return 'Must be a valid number';
      return validateMax(n, 100);
    }
  );
  return errors(value);
}
