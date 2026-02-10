import { Paper, Stack, Text, Group, PaperProps } from '@mantine/core';
import type { ReactNode } from 'react';

interface FormSectionProps extends PaperProps {
  children: ReactNode;
  title: string;
  description?: string;
  actions?: ReactNode;
}

export function FormSection({
  children,
  title,
  description,
  actions,
  className,
  ...props
}: FormSectionProps) {
  return (
    <Paper shadow="xs" p="md" withBorder className={className} {...props}>
      <Stack gap="md">
        <Stack gap="xs">
          <Text size="lg" fw={500}>
            {title}
          </Text>
          {description && (
            <Text size="sm" c="dimmed">
              {description}
            </Text>
          )}
        </Stack>

        <Stack gap="md">{children}</Stack>

        {actions && <Group justify="flex-end">{actions}</Group>}
      </Stack>
    </Paper>
  );
}
