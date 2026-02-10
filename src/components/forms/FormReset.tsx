import { Button } from '@mantine/core';
import { RotateCcw } from 'lucide-react';

interface FormResetProps {
  form: {
    reset: () => void;
  };
  label?: string;
  onReset?: () => void;
  variant?: 'default' | 'light' | 'outline' | 'subtle';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  disabled?: boolean;
  leftSection?: React.ReactNode;
  className?: string;
}

export function FormReset({
  form,
  label = 'Reset Form',
  onReset,
  variant = 'default',
  size = 'sm',
  disabled = false,
  leftSection,
  className,
}: FormResetProps) {
  const handleReset = () => {
    form.reset();
    onReset?.();
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleReset}
      disabled={disabled}
      leftSection={leftSection}
      className={className}
    >
      {leftSection || <RotateCcw size={size} />}
      {label}
    </Button>
  );
}
