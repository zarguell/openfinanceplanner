import { Calculator, TrendingUp, Wallet, Settings } from 'lucide-react';
import { Group, Text } from '@mantine/core';

export function TestIcons() {
  return (
    <Group>
      <Calculator size={24} />
      <Text>Calculator Icon</Text>

      <TrendingUp size={24} />
      <Text>Trending Up Icon</Text>

      <Wallet size={24} />
      <Text>Wallet Icon</Text>

      <Settings size={24} />
      <Text>Settings Icon</Text>
    </Group>
  );
}
