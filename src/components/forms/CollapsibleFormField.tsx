import { useState } from 'react';
import {
  Paper,
  Stack,
  Text,
  Group,
  UnstyledButton,
  Transition,
} from '@mantine/core';
import { ChevronDown } from 'lucide-react';
import type { ReactNode } from 'react';

interface CollapsibleFormFieldProps {
  children: ReactNode;
  label: string;
  description?: string;
  optional?: boolean;
  error?: string;
  defaultExpanded?: boolean;
  expanded?: boolean;
  onToggle?: (expanded: boolean) => void;
  className?: string;
}

export function CollapsibleFormField({
  children,
  label,
  description,
  optional,
  error,
  defaultExpanded = true,
  expanded: controlledExpanded,
  onToggle,
  className,
}: CollapsibleFormFieldProps) {
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded);

  const isControlled = controlledExpanded !== undefined;
  const expanded = isControlled ? controlledExpanded : internalExpanded;

  const handleToggle = () => {
    const newExpanded = !expanded;
    if (!isControlled) {
      setInternalExpanded(newExpanded);
    }
    onToggle?.(newExpanded);
  };

  return (
    <Paper className={className} withBorder p={0}>
      <UnstyledButton
        onClick={handleToggle}
        w="100%"
        p="md"
        style={{
          borderBottom: expanded
            ? '1px solid var(--mantine-color-gray-3)'
            : 'none',
        }}
      >
        <Group justify="space-between" w="100%">
          <Stack gap={0}>
            <Group gap="xs">
              <Text fw={500}>{label}</Text>
              {optional && (
                <Text size="xs" c="dimmed">
                  (optional)
                </Text>
              )}
            </Group>
            {description && (
              <Text size="sm" c="dimmed">
                {description}
              </Text>
            )}
            {error && (
              <Text size="sm" c="red">
                {error}
              </Text>
            )}
          </Stack>
          <ChevronDown
            data-testid="chevron-icon"
            size={20}
            style={{
              transform: `rotate(${expanded ? 180 : 0}deg)`,
              transition: 'transform 200ms ease',
            }}
          />
        </Group>
      </UnstyledButton>

      <Transition mounted={expanded} transition="scale-y" duration={200}>
        {(styles) => (
          <Stack p="md" style={styles}>
            {children}
          </Stack>
        )}
      </Transition>
    </Paper>
  );
}
