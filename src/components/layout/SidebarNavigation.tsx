import { useState } from 'react';
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
} from 'lucide-react';

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

const navigationItems: NavigationItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <Home size={20} /> },
  { id: 'projection', label: 'Projection', icon: <Calculator size={20} /> },
  { id: 'analytics', label: 'Analytics', icon: <TrendingUp size={20} /> },
  { id: 'accounts', label: 'Accounts', icon: <PieChart size={20} /> },
  { id: 'reports', label: 'Reports', icon: <FileText size={20} /> },
  { id: 'settings', label: 'Settings', icon: <Settings size={20} /> },
];

interface SidebarNavigationProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export default function SidebarNavigation({
  activeSection,
  onSectionChange,
}: SidebarNavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (section: string) => {
    onSectionChange(section);
    setMobileMenuOpen(false);
  };

  const navContent = (
    <Stack gap="sm">
      <Group gap="xs" mb="md">
        <Title order={4}>Open Finance Planner</Title>
      </Group>

      {navigationItems.map((item) => (
        <UnstyledButton
          key={item.id}
          onClick={() => handleNavClick(item.id)}
          data-active={activeSection === item.id ? 'true' : undefined}
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
        >
          {item.icon}
          <Text size="sm" fw={500}>
            {item.label}
          </Text>
        </UnstyledButton>
      ))}

      <Box mt="auto">
        <Text size="xs" c="dimmed">
          v1.0.0
        </Text>
      </Box>
    </Stack>
  );

  return (
    <>
      <Box display={{ base: 'block', md: 'none' }} p="md">
        <Button
          leftSection={<Menu size={20} />}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          variant="light"
          fullWidth
        >
          {mobileMenuOpen ? 'Close Menu' : 'Menu'}
        </Button>
      </Box>

      {mobileMenuOpen && (
        <Box
          p="md"
          display={{ base: 'block', md: 'none' }}
          style={{
            position: 'fixed',
            top: '0',
            left: '0',
            right: '0',
            bottom: '0',
            backgroundColor: 'white',
            zIndex: 1000,
            overflowY: 'auto',
          }}
        >
          {navContent}
        </Box>
      )}

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
    </>
  );
}
