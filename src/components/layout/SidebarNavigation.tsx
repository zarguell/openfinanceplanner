import { useState, useCallback } from 'react';
import {
  Group,
  Title,
  Text,
  Button,
  UnstyledButton,
  Stack,
  Box,
} from '@mantine/core';
import {
  Home,
  Calculator,
  TrendingUp,
  PieChart,
  FileText,
  Settings,
  Menu,
  X,
  Target,
  Flag,
  DollarSign,
  BarChart3,
  Layers,
} from 'lucide-react';

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

const navigationItems: NavigationItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <Home size={20} /> },
  { id: 'goals', label: 'Goals', icon: <Target size={20} /> },
  { id: 'milestones', label: 'Milestones', icon: <Flag size={20} /> },
  { id: 'projection', label: 'Projection', icon: <Calculator size={20} /> },
  { id: 'analytics', label: 'Analytics', icon: <TrendingUp size={20} /> },
  { id: 'accounts', label: 'Accounts', icon: <PieChart size={20} /> },
  { id: 'tax', label: 'Tax', icon: <DollarSign size={20} /> },
  { id: 'monte-carlo', label: 'Monte Carlo', icon: <BarChart3 size={20} /> },
  { id: 'scenarios', label: 'Scenarios', icon: <Layers size={20} /> },
  { id: 'reports', label: 'Reports', icon: <FileText size={20} /> },
  { id: 'settings', label: 'Settings', icon: <Settings size={20} /> },
];

interface SidebarNavigationProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  mobileOnly?: boolean;
}

export default function SidebarNavigation({
  activeSection,
  onSectionChange,
  mobileOnly = false,
}: SidebarNavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Wrap in useCallback for performance
  const handleNavClick = useCallback((section: string) => {
    onSectionChange(section);
    setMobileMenuOpen(false);
  }, [onSectionChange]);

  // Handle Escape key to close mobile menu
  const handleKeyDown = useCallback((e: React.KeyboardEvent, section: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleNavClick(section);
    }
  }, [handleNavClick]);

  const navContent = (
    <Stack gap="sm">
      <Group gap="xs" mb="md">
        <Title order={4}>Open Finance Planner</Title>
      </Group>

      <nav role="navigation" aria-label="Main navigation">
        {navigationItems.map((item) => (
          <UnstyledButton
            key={item.id}
            onClick={() => handleNavClick(item.id)}
            onKeyDown={(e) => handleKeyDown(e, item.id)}
            data-active={activeSection === item.id ? 'true' : undefined}
            aria-current={activeSection === item.id ? 'page' : undefined}
            aria-label={`Navigate to ${item.label}`}
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: '8px',
              backgroundColor:
                activeSection === item.id
                  ? 'rgba(34, 139, 34, 0.1)'
                  : 'transparent',
              color: activeSection === item.id ? 'rgb(34, 139, 34)' : 'inherit',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              outline: 'none',
            }}
            onMouseEnter={(e) => {
              if (activeSection !== item.id) {
                e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.05)';
              }
            }}
            onMouseLeave={(e) => {
              if (activeSection !== item.id) {
                e.currentTarget.style.backgroundColor = 'transparent';
              }
            }}
            tabIndex={0}
          >
            {item.icon}
            <Text size="sm" fw={500}>
              {item.label}
            </Text>
          </UnstyledButton>
        ))}
      </nav>

      <Box mt="auto">
        <Text size="xs" c="dimmed">
          v1.0.0
        </Text>
      </Box>
    </Stack>
  );

  // Mobile-only component: shows hamburger button and mobile menu
  if (mobileOnly) {
    return (
      <>
        <Button
          leftSection={<Menu size={20} />}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          variant="light"
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-menu"
          aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
        >
          {mobileMenuOpen ? 'Close' : 'Menu'}
        </Button>

        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <Box
              onClick={() => setMobileMenuOpen(false)}
              style={{
                position: 'fixed',
                top: '0',
                left: '0',
                right: '0',
                bottom: '0',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                zIndex: 999,
              }}
              aria-hidden="true"
            />
            {/* Mobile menu */}
            <Box
              p="md"
              display={{ base: 'block', md: 'none' }}
              style={{
                position: 'fixed',
                top: '60px',
                left: '0',
                right: '0',
                bottom: '0',
                backgroundColor: 'white',
                zIndex: 1000,
                overflowY: 'auto',
              }}
              id="mobile-menu"
              role="dialog"
              aria-modal="true"
              aria-label="Mobile navigation menu"
              onKeyDown={(e) => {
                // Close menu on Escape key
                if (e.key === 'Escape') {
                  setMobileMenuOpen(false);
                }
              }}
            >
            <Group justify="space-between" align="center" mb="md">
              <Title order={4}>Navigation</Title>
              <Button
                variant="subtle"
                leftSection={<X size={18} />}
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close menu"
              >
                Close
              </Button>
            </Group>
            <nav role="navigation" aria-label="Main navigation">
              {navigationItems.map((item) => (
                <UnstyledButton
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  onKeyDown={(e) => handleKeyDown(e, item.id)}
                  data-active={activeSection === item.id ? 'true' : undefined}
                  aria-current={activeSection === item.id ? 'page' : undefined}
                  aria-label={`Navigate to ${item.label}`}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    backgroundColor:
                      activeSection === item.id
                        ? 'rgba(34, 139, 34, 0.1)'
                        : 'transparent',
                    color: activeSection === item.id ? 'rgb(34, 139, 34)' : 'inherit',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    outline: 'none',
                  }}
                  onMouseEnter={(e) => {
                    if (activeSection !== item.id) {
                      e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.05)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeSection !== item.id) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                  tabIndex={0}
                >
                  {item.icon}
                  <Text size="sm" fw={500}>
                    {item.label}
                  </Text>
                </UnstyledButton>
              ))}
            </nav>
            <Box mt="auto">
              <Text size="xs" c="dimmed">
                v1.0.0
              </Text>
            </Box>
          </Box>
          </>
        )}
      </>
    );
  }

  // Desktop component: shows only the sidebar navigation
  return (
    <Box
      p="md"
      display={{ base: 'none', md: 'block' }}
      style={{
        position: 'sticky',
        top: '0',
      }}
    >
      {navContent}
    </Box>
  );
}
