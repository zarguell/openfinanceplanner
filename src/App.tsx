import '@mantine/core/styles.css';
import { MantineProvider, Container, Stack, Title, Text, Paper } from '@mantine/core';
import { ProjectionTable } from './components/ui';

// Sample data for demonstration - will be replaced with store integration in Phase 17
const sampleData = [
  {
    year: 0,
    age: 35,
    startingBalance: 100000,
    growth: 7000,
    spending: 50000,
    endingBalance: 57000,
  },
  {
    year: 1,
    age: 36,
    startingBalance: 57000,
    growth: 3990,
    spending: 50000,
    endingBalance: 10990,
  },
  {
    year: 2,
    age: 37,
    startingBalance: 10990,
    growth: 769.30,
    spending: 50000,
    endingBalance: 0,
  },
];

function App() {
  return (
    <MantineProvider defaultColorScheme="light">
      <Container size={{ base: 'xs', sm: 'md', md: 'lg' }} p={{ base: 'sm', md: 'xl' }}>
        <Stack gap="xl">
          <Stack gap="xs">
            <Title order={1}>Open Finance Planner</Title>
            <Text c="dimmed">
              Privacy-first financial projections. Your data stays on your device.
            </Text>
          </Stack>

          {sampleData.length > 0 && (
            <>
              <Title order={2}>Projection Results</Title>
              <Paper shadow="xs" p="md" withBorder>
                <ProjectionTable data={sampleData} />
              </Paper>
            </>
          )}
        </Stack>
      </Container>
    </MantineProvider>
  );
}

export default App;
