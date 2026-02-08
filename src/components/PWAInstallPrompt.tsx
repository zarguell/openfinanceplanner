import { useEffect, useState } from 'react';
import { Button, Container, Group, Paper, Text } from '@mantine/core';

/**
 * TypeScript extension for the beforeinstallprompt event
 * This is not part of the standard DOM API but is used by PWA-capable browsers
 */
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

/**
 * PWAInstallPrompt Component
 *
 * Captures the beforeinstallprompt event and displays a button to trigger
 * the PWA installation prompt. Only shows on devices that support PWA installation
 * and when the app hasn't been installed yet.
 *
 * Features:
 * - Listens for beforeinstallprompt event
 * - Stores the event for later use
 * - Provides button to trigger install prompt
 * - Handles user acceptance/rejection
 * - Removes prompt after use
 */
export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  useEffect(() => {
    // Listen for the beforeinstallprompt event
    const handler = (e: Event) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Store the event for later use
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Show the install button
      setShowInstallPrompt(true);
      console.log('[PWA] beforeinstallprompt event captured');
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setShowInstallPrompt(false);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      console.log('[PWA] No deferred prompt available');
      return;
    }

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;

    console.log(`[PWA] User response to install prompt: ${outcome}`);

    // Clear the deferred prompt
    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  if (!showInstallPrompt) {
    return null;
  }

  return (
    <Container size="sm" mt="md">
      <Paper p="md" withBorder shadow="sm">
        <Group justify="space-between" align="center">
          <Text size="sm">Install this app on your device for offline access</Text>
          <Button onClick={handleInstallClick} size="sm">
            Install
          </Button>
        </Group>
      </Paper>
    </Container>
  );
}
