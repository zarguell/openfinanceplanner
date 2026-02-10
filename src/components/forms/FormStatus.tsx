import { Button, Group, Loader, Text } from '@mantine/core';
import { X } from 'lucide-react';

export type FormStatusType = 'success' | 'error' | 'info' | 'loading' | null;

interface FormStatusProps {
  status: FormStatusType;
  message: string;
  className?: string;
  onDismiss?: () => void;
}

const statusColors = {
  success: 'green',
  error: 'red',
  info: 'blue',
  loading: 'gray',
} as const;

export function FormStatus({
  status,
  message,
  className,
  onDismiss,
}: FormStatusProps) {
  if (!status) return null;

  return (
    <div className={className}>
      <Group
        gap="xs"
        p="sm"
        bg={statusColors[status] + '.0'}
        style={{
          borderRadius: '4px',
        }}
      >
        {status === 'loading' && (
          <Loader size="sm" color={statusColors[status]} />
        )}
        <Text size="sm" c={statusColors[status] + '.9'}>
          {message}
        </Text>
        {onDismiss && (
          <Button
            size="xs"
            variant="subtle"
            color={statusColors[status]}
            p={0}
            onClick={onDismiss}
          >
            <X size={16} />
          </Button>
        )}
      </Group>
    </div>
  );
}
