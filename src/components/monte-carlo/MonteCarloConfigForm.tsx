import { useState } from 'react';
import {
  Card,
  Stack,
  Text,
  Title,
  NumberInput,
  Select,
  Switch,
  Button,
  SimpleGrid,
  Group,
  TextInput,
} from '@mantine/core';
import type { MonteCarloConfig, ReturnSequenceConfig } from '@/core/types';

interface MonteCarloConfigFormProps {
  config: MonteCarloConfig;
  onSave: (config: MonteCarloConfig) => void;
}

export default function MonteCarloConfigForm({
  config,
  onSave,
}: MonteCarloConfigFormProps) {
  const [numSimulations, setNumSimulations] = useState(config.numSimulations);
  const [meanReturn, setMeanReturn] = useState(
    config.returnSequenceConfig.meanReturn || 7
  );
  const [volatility, setVolatility] = useState(
    config.returnSequenceConfig.volatility || 15
  );
  const [years, setYears] = useState(config.returnSequenceConfig.years);
  const [percentiles, setPercentiles] = useState(config.percentiles.join(', '));
  const [deterministic, setDeterministic] = useState(
    config.deterministic || false
  );
  const [returnType, setReturnType] = useState<
    'random' | 'historical' | 'bootstrap'
  >(config.returnSequenceConfig.type);

  const handleSave = () => {
    const percentileArray = percentiles
      .split(',')
      .map((p) => parseFloat(p.trim()))
      .filter((p) => !isNaN(p) && p >= 0 && p <= 100);

    const returnSequenceConfig: ReturnSequenceConfig = {
      type: returnType,
      meanReturn,
      volatility,
      years,
      ...(returnType === 'random' && { seed: deterministic ? 42 : undefined }),
    };

    const newConfig: MonteCarloConfig = {
      numSimulations,
      returnSequenceConfig,
      percentiles: percentileArray,
      deterministic,
    };

    onSave(newConfig);
  };

  return (
    <Stack gap="md">
      <Title order={3}>Monte Carlo Configuration</Title>

      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Stack gap="md">
          <Text size="sm" fw={500}>
            Simulation Settings
          </Text>

          <SimpleGrid cols={{ base: 1, sm: 2 }}>
            <NumberInput
              label="Number of Simulations"
              description="Higher values provide more accurate results"
              min={100}
              max={10000}
              value={numSimulations}
              onChange={(value) => setNumSimulations(Number(value) || 1000)}
            />

            <NumberInput
              label="Projection Years"
              description="Number of years to simulate"
              min={1}
              max={100}
              value={years}
              onChange={(value) => setYears(Number(value) || 30)}
            />
          </SimpleGrid>

          <Switch
            label="Deterministic Mode"
            description="Use same seed for reproducible results"
            checked={deterministic}
            onChange={(event) => setDeterministic(event.currentTarget.checked)}
          />
        </Stack>
      </Card>

      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Stack gap="md">
          <Text size="sm" fw={500}>
            Return Sequence Configuration
          </Text>

          <Select
            label="Return Sequence Type"
            data={[
              { value: 'random', label: 'Random (Monte Carlo)' },
              { value: 'historical', label: 'Historical Backtesting' },
              { value: 'bootstrap', label: 'Bootstrap Sampling' },
            ]}
            value={returnType}
            onChange={(value) =>
              setReturnType(value as 'random' | 'historical' | 'bootstrap')
            }
          />

          <SimpleGrid cols={{ base: 1, sm: 2 }}>
            <NumberInput
              label="Mean Annual Return (%)"
              description="Expected average return"
              min={-50}
              max={100}
              decimalScale={2}
              value={meanReturn}
              onChange={(value) => setMeanReturn(Number(value) || 7)}
              disabled={returnType !== 'random'}
            />

            <NumberInput
              label="Volatility (%)"
              description="Standard deviation of returns"
              min={0}
              max={100}
              decimalScale={2}
              value={volatility}
              onChange={(value) => setVolatility(Number(value) || 15)}
              disabled={returnType !== 'random'}
            />
          </SimpleGrid>
        </Stack>
      </Card>

      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Stack gap="md">
          <Text size="sm" fw={500}>
            Percentile Analysis
          </Text>

          <TextInput
            label="Percentiles (comma-separated)"
            description="Percentiles to calculate (e.g., 10, 25, 50, 75, 90)"
            value={percentiles}
            onChange={(event) => setPercentiles(event.currentTarget.value)}
          />
        </Stack>
      </Card>

      <Group justify="flex-end">
        <Button onClick={handleSave} size="md">
          Save Configuration
        </Button>
      </Group>
    </Stack>
  );
}
