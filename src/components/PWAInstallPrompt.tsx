import { Button, Container, Group, Paper, Text } from '@mantine/core';
import { usePWAContext } from '@/components/PWAProvider';

/**
 * PWAInstallPrompt Component
 *
 * Displays a button to trigger the PWA installation prompt.
 * Uses the PWAProvider context to access install prompt state.
 * Only shows on devices that support PWA installation
 * and when the app hasn't been installed yet.
 *
 * Features:
 * - Checks if installation is available via context
 * - Provides button to trigger install prompt
 * - Handles user acceptance/rejection
 * - Removes prompt after use
 */
export function PWAInstallPrompt() {
  const { canInstall, promptInstall } = usePWAContext();

  const handleInstallClick = async () => {
    await promptInstall();
  };

  if (!canInstall) {
    return null;
  }

  return (
    <Container size="sm" mt="md">
      <Paper p="md" withBorder shadow="sm">
        <Group justify="space-between" align="center">
          <Text size="sm">
            Install this app on your device for offline access
          </Text>
          <Button onClick={handleInstallClick} size="sm">
            Install
          </Button>
        </Group>
      </Paper>
    </Container>
  );
}
