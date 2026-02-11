import '@mantine/core/styles.css';
import {
  MantineProvider,
  Container,
  Stack,
  Title,
  Text,
  AppShell,
  Box,
  Group,
  Button,
  Burger,
} from '@mantine/core';
import { ProfileForm } from './components/forms';
import { ProjectionTable } from '@/components/tables';
import { NetWorthChart } from '@/components/charts';
import { PWAProvider } from '@/components/PWAProvider';
import SidebarNavigation from '@/components/layout/SidebarNavigation';
import { useProjectionCalculator } from '@/hooks/useProjectionCalculator';
import { AccountsSection } from '@/components/AccountsSection';
import { useState } from 'react';

function App() {
  useProjectionCalculator();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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

            {/* Live region for screen readers to announce projection updates */}
            <div role="status" aria-live="polite" aria-atomic="true">
              <Title order={2} ta="center">
                Projection Results
              </Title>
              <NetWorthChart />
              <ProjectionTable />
            </div>
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
        {/* Skip navigation link for keyboard users */}
        <a
          href="#main-content"
          style={{
            position: 'absolute',
            left: '-9999px',
            top: '0',
            zIndex: 9999,
            padding: '8px 16px',
            backgroundColor: '#228b22',
            color: 'white',
            textDecoration: 'none',
          }}
          onFocus={(e: React.FocusEvent<HTMLAnchorElement>) => {
            e.currentTarget.style.left = '8px';
            e.currentTarget.style.top = '8px';
          }}
          onBlur={(e: React.FocusEvent<HTMLAnchorElement>) => {
            e.currentTarget.style.left = '-9999px';
            e.currentTarget.style.top = '0';
          }}
        >
          Skip to main content
        </a>

        <AppShell
          padding="md"
          header={{ height: 60 }}
        >
          <AppShell.Header>
            <Group justify="space-between" w="100%" h="100%" px="md" align="center">
              <Title order={4}>Open Finance Planner</Title>
              <Group gap="sm">
                {/* Desktop sidebar toggle button */}
                <Box display={{ base: 'none', md: 'block' }}>
                  <Button
                    onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                    variant="subtle"
                    aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                  >
                    <Burger opened={!sidebarCollapsed} />
                  </Button>
                </Box>
                {/* Mobile hamburger button */}
                <Box display={{ base: 'block', md: 'none' }}>
                  <SidebarNavigation
                    activeSection={activeSection}
                    onSectionChange={setActiveSection}
                    mobileOnly={true}
                  />
                </Box>
              </Group>
            </Group>
          </AppShell.Header>

          <AppShell.Navbar p="md" w={{ base: 0, md: sidebarCollapsed ? 0 : 250 }}>
            {/* Desktop sidebar navigation */}
            <Box display={{ base: 'none', md: sidebarCollapsed ? 'none' : 'block' }}>
              <SidebarNavigation
                activeSection={activeSection}
                onSectionChange={setActiveSection}
                mobileOnly={false}
              />
            </Box>
          </AppShell.Navbar>

          <AppShell.Main>
            <main id="main-content">
              <Container size="lg" py="xl">
                {renderContent()}
              </Container>
            </main>
          </AppShell.Main>
        </AppShell>
      </MantineProvider>
    </PWAProvider>
  );
}

export default App;
