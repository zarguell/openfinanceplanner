import '@mantine/core/styles.css';
import {
  MantineProvider,
  Container,
  Stack,
  Title,
  Text,
  AppShell,
} from '@mantine/core';
import { ProfileForm } from './components/forms';
import { ProjectionTable } from '@/components/tables';
import { NetWorthChart } from '@/components/charts';
import { PWAInstallPrompt } from '@/components/PWAInstallPrompt';
import { PWAUpdateNotice } from '@/components/PWAUpdateNotice';
import { PWAProvider } from '@/components/PWAProvider';
import SidebarNavigation from '@/components/layout/SidebarNavigation';
import { useProjectionCalculator } from '@/hooks/useProjectionCalculator';
import { AccountsSection } from '@/components/AccountsSection';
import { useState } from 'react';

function App() {
  useProjectionCalculator();
  const [activeSection, setActiveSection] = useState('dashboard');

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return (
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
        );
      case 'goals':
        return (
          <Stack gap="xl">
            <Title order={2}>Goals Management</Title>
            <Text c="dimmed">
              Manage your financial goals, priorities, and track progress with
              heatmaps.
            </Text>
          </Stack>
        );
      case 'milestones':
        return (
          <Stack gap="xl">
            <Title order={2}>Milestones & Events</Title>
            <Text c="dimmed">
              Plan retirement, career changes, asset purchases, and family
              events.
            </Text>
          </Stack>
        );
      case 'projection':
        return (
          <Stack gap="xl">
            <Title order={2}>Projection Analysis</Title>
            <Text c="dimmed">Advanced projection features coming soon</Text>
          </Stack>
        );
      case 'analytics':
        return (
          <Stack gap="xl">
            <Title order={2}>Analytics</Title>
            <Text c="dimmed">Analytics features coming soon</Text>
          </Stack>
        );
      case 'accounts':
        return <AccountsSection />;
      case 'tax':
        return (
          <Stack gap="xl">
            <Title order={2}>Tax Engine</Title>
            <Text c="dimmed">
              Tax calculation, analytics, and strategy optimization tools.
            </Text>
          </Stack>
        );
      case 'monte-carlo':
        return (
          <Stack gap="xl">
            <Title order={2}>Monte Carlo Simulation</Title>
            <Text c="dimmed">
              Monte Carlo analysis with percentile bands and historical
              backtesting.
            </Text>
          </Stack>
        );
      case 'scenarios':
        return (
          <Stack gap="xl">
            <Title order={2}>Scenario Management</Title>
            <Text c="dimmed">
              Compare multiple scenarios and manage flex spending rules.
            </Text>
          </Stack>
        );
      case 'reports':
        return (
          <Stack gap="xl">
            <Title order={2}>Reports</Title>
            <Text c="dimmed">Report generation features coming soon</Text>
          </Stack>
        );
      case 'settings':
        return (
          <Stack gap="xl">
            <Title order={2}>Settings</Title>
            <Text c="dimmed">Settings features coming soon</Text>
          </Stack>
        );
      default:
        return null;
    }
  };

  return (
    <PWAProvider>
      <MantineProvider defaultColorScheme="light">
        <PWAInstallPrompt />
        <PWAUpdateNotice />
        <AppShell padding="md">
          <AppShell.Header p="md">
            <Title order={4}>Open Finance Planner</Title>
          </AppShell.Header>
          <AppShell.Navbar p="md" w={{ base: 0, md: 250 }}>
            <SidebarNavigation
              activeSection={activeSection}
              onSectionChange={setActiveSection}
            />
          </AppShell.Navbar>
          <AppShell.Main>
            <Container size="lg" py="xl">
              {renderContent()}
            </Container>
          </AppShell.Main>
        </AppShell>
      </MantineProvider>
    </PWAProvider>
  );
}

export default App;
