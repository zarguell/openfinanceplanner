import { useState } from 'react';
import { Button, Stack, Text } from '@mantine/core';
import { RotateCcw } from 'lucide-react';

interface FormResetProps {
  form: {
    reset: () => void;
    isDirty: () => boolean;
  };
  label?: string;
  onReset?: () => void;
  confirm?: boolean;
  confirmMessage?: string;
  disableWhenClean?: boolean;
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
  confirm = false,
  confirmMessage = 'Are you sure you want to reset?',
  disableWhenClean = false,
  variant = 'default',
  size = 'sm',
  disabled = false,
  leftSection,
  className,
}: FormResetProps) {
  const [showConfirm, setShowConfirm] = useState(false);

  const isFormDirty = form.isDirty();
  const shouldDisable = disabled || (disableWhenClean && !isFormDirty);

  const handleReset = () => {
    if (confirm) {
      setShowConfirm(true);
    } else {
      form.reset();
      onReset?.();
    }
  };

  const handleConfirm = () => {
    form.reset();
    onReset?.();
    setShowConfirm(false);
  };

  const handleCancel = () => {
    setShowConfirm(false);
  };

  return (
    <>
      {showConfirm ? (
        <Stack
          gap="md"
          p="md"
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'white',
            border: '1px solid #dee2e6',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: 9999,
            padding: '16px',
            minWidth: '300px',
          }}
        >
          <Text fw={500}>{confirmMessage}</Text>
          <Stack gap="sm" mt="md">
            <Button variant="default" onClick={handleConfirm}>
              Confirm
            </Button>
            <Button variant="light" onClick={handleCancel}>
              Cancel
            </Button>
          </Stack>
        </Stack>
      ) : (
        <Button
          variant={variant}
          size={size}
          onClick={handleReset}
          disabled={shouldDisable}
          leftSection={leftSection}
          className={className}
        >
          {leftSection || <RotateCcw size={size} />}
          {label}
        </Button>
      )}
    </>
  );
}
