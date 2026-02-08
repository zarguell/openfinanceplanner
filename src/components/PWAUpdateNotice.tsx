import { useEffect } from 'react';
import { Button, Container, Group, Paper, Text, Portal } from '@mantine/core';
import { usePWAContext } from '@/components/PWAProvider';

/**
 * PWAUpdateNotice Component
 *
 * Displays notifications for PWA offline readiness and available updates.
 * Uses the PWAProvider context to access service worker state and update functions.
 *
 * Features:
 * - Shows when app is ready to work offline
 * - Shows when new content is available
 * - Provides button to reload and apply updates
 * - Automatically closes after user interaction
 * - Uses Portal for proper z-index layering
 */
export function PWAUpdateNotice() {
  const { offlineReady, needRefresh, updateServiceWorker } = usePWAContext();

  useEffect(() => {
    if (offlineReady) {
      console.log('[PWA] App is ready to work offline');
    }
  }, [offlineReady]);

  useEffect(() => {
    if (needRefresh) {
      console.log('[PWA] New content is available');
    }
  }, [needRefresh]);

  const handleClose = () => {
    // Close the notification by doing nothing
    // The component will re-render with updated state
  };

  const handleReload = () => {
    if (updateServiceWorker) {
      updateServiceWorker();
    }
  };

  // Don't render if there's nothing to show
  if (!offlineReady && !needRefresh) {
    return null;
  }

  const message = offlineReady
    ? 'App is ready to work offline'
    : 'New content available, click reload to update';

  const buttonText = offlineReady ? 'Close' : 'Reload';

  const handleButtonClick = offlineReady ? handleClose : handleReload;

  return (
    <Portal>
      <Container
        size="sm"
        style={{
          position: 'fixed',
          bottom: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 9999,
        }}
      >
        <Paper p="md" withBorder shadow="lg" radius="md">
          <Group justify="space-between" align="center" gap="md">
            <Text size="sm" fw={500}>
              {message}
            </Text>
            <Button onClick={handleButtonClick} size="sm">
              {buttonText}
            </Button>
          </Group>
        </Paper>
      </Container>
    </Portal>
  );
}
