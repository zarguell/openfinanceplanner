import { useState, useCallback, useEffect, useRef } from 'react';
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
 * - Notifications can be dismissed and stay dismissed
 * - Uses Portal for proper z-index layering
 * - Keyboard accessible with Escape key support
 * - Focus trap for modal behavior
 * - ARIA attributes for screen readers
 */
export function PWAUpdateNotice() {
  const { offlineReady, needRefresh, updateServiceWorker } = usePWAContext();
  const [offlineNoticeDismissed, setOfflineNoticeDismissed] = useState(false);
  const [refreshNoticeDismissed, setRefreshNoticeDismissed] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const handleClose = useCallback(() => {
    if (offlineReady) {
      setOfflineNoticeDismissed(true);
    } else if (needRefresh) {
      setRefreshNoticeDismissed(true);
    }
  }, [offlineReady, needRefresh]);

  const handleReload = useCallback(() => {
    if (updateServiceWorker) {
      updateServiceWorker();
    }
  }, [updateServiceWorker]);

  // Handle Escape key to close notice
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleClose();
    }
  }, [handleClose]);

  // Focus close button when notice appears
  useEffect(() => {
    if ((offlineReady && !offlineNoticeDismissed) ||
        (needRefresh && !refreshNoticeDismissed)) {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 100);
      return () => {
        clearTimeout(timer);
      };
    }
    return undefined;
  }, [offlineReady, offlineNoticeDismissed, needRefresh, refreshNoticeDismissed]);

  const shouldShowOfflineNotice = offlineReady && !offlineNoticeDismissed;
  const shouldShowRefreshNotice = needRefresh && !refreshNoticeDismissed;

  if (!shouldShowOfflineNotice && !shouldShowRefreshNotice) {
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
        role="dialog"
        aria-modal="true"
        aria-labelledby="pwa-notice-title"
        aria-describedby="pwa-notice-message"
        onKeyDown={handleKeyDown}
      >
        <Paper p="md" withBorder shadow="lg" radius="md">
          <Group justify="space-between" align="center" gap="md">
            <Text
              id="pwa-notice-message"
              size="sm"
              fw={500}
            >
              {message}
            </Text>
            <Button
              ref={closeButtonRef}
              onClick={handleButtonClick}
              size="sm"
              aria-label={offlineReady ? 'Close offline ready notice' : 'Reload to update'}
            >
              {buttonText}
            </Button>
          </Group>
        </Paper>
      </Container>
    </Portal>
  );
}
