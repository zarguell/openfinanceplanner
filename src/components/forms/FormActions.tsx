import { Button, Group } from '@mantine/core';

interface FormActionsProps {
  primaryLabel: string;
  onPrimaryClick: () => void;
  primaryDisabled?: boolean;
  primaryLeftSection?: React.ReactNode;
  primaryRightSection?: React.ReactNode;
  secondaryLabel?: string;
  onSecondaryClick?: () => void;
  secondaryDisabled?: boolean;
  isLoading?: boolean;
  className?: string;
}

export function FormActions({
  primaryLabel,
  onPrimaryClick,
  primaryDisabled,
  primaryLeftSection,
  primaryRightSection,
  secondaryLabel,
  onSecondaryClick,
  secondaryDisabled,
  isLoading,
  className,
}: FormActionsProps) {
  return (
    <Group className={className} justify="flex-end">
      {secondaryLabel && onSecondaryClick && (
        <Button
          variant="default"
          onClick={onSecondaryClick}
          disabled={secondaryDisabled}
        >
          {secondaryLabel}
        </Button>
      )}
      <Button
        onClick={onPrimaryClick}
        disabled={primaryDisabled || isLoading}
        loading={isLoading}
        leftSection={primaryLeftSection}
        rightSection={primaryRightSection}
      >
        {primaryLabel}
      </Button>
    </Group>
  );
}
