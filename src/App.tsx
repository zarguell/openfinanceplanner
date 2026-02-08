import '@mantine/core/styles.css';
import { MantineProvider, Container, Stack, Title, Text } from '@mantine/core';

function App() {
  return (
    <MantineProvider defaultColorScheme="light">
      <Container size="md" p={{ base: 'sm', md: 'xl' }}>
        <Stack gap="lg">
          <Title order={1}>Open Finance Planner</Title>
          <Text c="dimmed">
            Privacy-first financial projections. Your data stays on your device.
          </Text>
        </Stack>
      </Container>
    </MantineProvider>
  );
}

export default App;
