import '@mantine/core/styles.css';
import { MantineProvider, Container, Stack, Title, Text } from '@mantine/core';
import { ProfileForm } from './components/forms';
import { ProjectionTable } from '@/components/tables';
import { NetWorthChart } from '@/components/charts';
import { PWAInstallPrompt } from '@/components/PWAInstallPrompt';
import { PWAUpdateNotice } from '@/components/PWAUpdateNotice';
import { PWAProvider } from '@/components/PWAProvider';

function App() {
  return (
    <PWAProvider>
      <MantineProvider defaultColorScheme="light">
        <PWAInstallPrompt />
        <PWAUpdateNotice />
        <Container size="lg" py="xl">
          <Stack gap="xl">
            <Stack gap="xs">
              <Title order={1} ta="center">
                Open Finance Planner
              </Title>
              <Text c="dimmed" ta="center">
                Privacy-first financial projections. Your data stays on your
                device.
              </Text>
            </Stack>

            <ProfileForm />

            <Title order={2} ta="center">
              Projection Results
            </Title>
            <NetWorthChart />
            <ProjectionTable />
          </Stack>
        </Container>
      </MantineProvider>
    </PWAProvider>
  );
}

export default App;
