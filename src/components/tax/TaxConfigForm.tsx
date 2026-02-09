import { useState } from 'react';
import {
  Card,
  Stack,
  Text,
  Title,
  Flex,
  Select,
  NumberInput,
  Button,
  TextInput,
  Group,
  SimpleGrid,
} from '@mantine/core';
import type { FilingStatus, TaxRegion } from '@/core/types';

interface TaxConfigFormProps {
  taxRegion: TaxRegion;
  filingStatus: FilingStatus;
  standardDeduction: number;
  onSubmit: (data: {
    filingStatus: FilingStatus;
    taxRegion: TaxRegion;
    standardDeduction: number;
  }) => void;
}

export default function TaxConfigForm({
  taxRegion,
  filingStatus,
  standardDeduction,
  onSubmit,
}: TaxConfigFormProps) {
  const [selectedFilingStatus, setSelectedFilingStatus] =
    useState<FilingStatus>(filingStatus);
  const [stateCode, setStateCode] = useState(taxRegion.state ?? '');
  const [locality, setLocality] = useState(taxRegion.locality ?? '');
  const [customDeduction, setCustomDeduction] = useState(standardDeduction);

  const handleSubmit = () => {
    onSubmit({
      filingStatus: selectedFilingStatus,
      taxRegion: {
        country: taxRegion.country,
        state: stateCode || undefined,
        locality: locality || undefined,
      },
      standardDeduction: customDeduction,
    });
  };

  return (
    <Stack gap="md">
      <Title order={3}>Tax Configuration</Title>

      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Stack gap="md">
          <Flex direction="column" gap="sm">
            <Text size="sm" fw={500}>
              Filing Status
            </Text>
            <Select
              label="Select your filing status for tax calculations"
              data={[
                { value: 'single', label: 'Single' },
                {
                  value: 'married-filing-jointly',
                  label: 'Married Filing Jointly',
                },
                {
                  value: 'married-filing-separately',
                  label: 'Married Filing Separately',
                },
                { value: 'head-of-household', label: 'Head of Household' },
              ]}
              value={selectedFilingStatus}
              onChange={(value) =>
                setSelectedFilingStatus(value as FilingStatus)
              }
            />
          </Flex>

          <SimpleGrid cols={2}>
            <Flex direction="column" gap="sm">
              <Text size="sm" fw={500}>
                State Code
              </Text>
              <TextInput
                label="State or province code (e.g., CA, NY)"
                placeholder="CA"
                value={stateCode}
                onChange={(event) => setStateCode(event.currentTarget.value)}
                maxLength={2}
              />
            </Flex>

            <Flex direction="column" gap="sm">
              <Text size="sm" fw={500}>
                Locality
              </Text>
              <TextInput
                label="City or locality (optional)"
                placeholder="San Francisco"
                value={locality}
                onChange={(event) => setLocality(event.currentTarget.value)}
              />
            </Flex>
          </SimpleGrid>

          <Flex direction="column" gap="sm">
            <Text size="sm" fw={500}>
              Standard Deduction
            </Text>
            <NumberInput
              label="Custom standard deduction amount"
              placeholder="14600"
              value={customDeduction}
              onChange={(value) => setCustomDeduction(Number(value))}
              min={0}
              thousandSeparator=","
              prefix="$"
            />
            <Text size="xs" c="dimmed">
              Leave empty to use default standard deduction for your filing
              status
            </Text>
          </Flex>

          <Group justify="flex-end" mt="md">
            <Button onClick={handleSubmit}>Save Configuration</Button>
          </Group>
        </Stack>
      </Card>

      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Text size="sm" fw={500} mb="sm">
          Tax Information
        </Text>

        <Stack gap="xs">
          <Text size="xs">
            <strong>Filing Status:</strong> {selectedFilingStatus}
          </Text>
          <Text size="xs">
            <strong>Country:</strong> {taxRegion.country}
          </Text>
          {stateCode && (
            <Text size="xs">
              <strong>State:</strong> {stateCode}
            </Text>
          )}
          {locality && (
            <Text size="xs">
              <strong>Locality:</strong> {locality}
            </Text>
          )}
          <Text size="xs">
            <strong>Custom Deduction:</strong> $
            {customDeduction.toLocaleString()}
          </Text>
        </Stack>
      </Card>
    </Stack>
  );
}
