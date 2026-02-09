import { useState } from 'react';
import {
  Button,
  TextInput,
  NumberInput,
  Select,
  Group,
  Stack,
  Paper,
  Switch,
  TagsInput,
  Textarea,
  Title,
} from '@mantine/core';
import type { Goal } from '@/core/types';
import { createGoal } from '@/core/goals';

interface GoalFormProps {
  onSubmit: (goal: Goal) => void;
  onCancel: () => void;
  initialValues?: Partial<Goal>;
}

export function GoalForm({ onSubmit, onCancel, initialValues }: GoalFormProps) {
  const [name, setName] = useState(initialValues?.name ?? '');
  const [type, setType] = useState<Goal['type']>(
    initialValues?.type ?? 'retirement-savings'
  );
  const [targetAmount, setTargetAmount] = useState(
    initialValues?.targetAmount ?? 0
  );
  const [currentAmount, setCurrentAmount] = useState(
    initialValues?.currentAmount ?? 0
  );
  const [targetDate, setTargetDate] = useState(initialValues?.targetDate ?? '');
  const [startDate, setStartDate] = useState(
    initialValues?.startDate ?? new Date().toISOString().split('T')[0]
  );
  const [priority, setPriority] = useState<Goal['priority']>(
    initialValues?.priority ?? 'medium'
  );
  const [mandatory, setMandatory] = useState(initialValues?.mandatory ?? false);
  const [monthlyContribution, setMonthlyContribution] = useState(
    initialValues?.monthlyContribution ?? 0
  );
  const [description, setDescription] = useState(
    initialValues?.description ?? ''
  );
  const [accountId, setAccountId] = useState(initialValues?.accountId ?? '');
  const [tags, setTags] = useState<readonly string[]>(
    initialValues?.tags ?? []
  );

  const handleSubmit = () => {
    if (!targetDate || !startDate || !name) {
      return;
    }

    const goal = createGoal({
      name,
      type,
      targetAmount,
      currentAmount,
      targetDate,
      startDate,
      priority,
      mandatory,
      monthlyContribution,
      description,
      accountId: accountId || undefined,
      tags,
    });

    onSubmit(goal);
  };

  return (
    <Paper withBorder p="md" shadow="sm">
      <Stack>
        <Title order={3}>
          {initialValues ? 'Edit Goal' : 'Create New Goal'}
        </Title>

        <TextInput
          label="Goal Name"
          value={name}
          onChange={(event) => setName(event.currentTarget.value)}
          required
        />

        <Select
          label="Goal Type"
          data={[
            { value: 'retirement-savings', label: 'Retirement Savings' },
            { value: 'emergency-fund', label: 'Emergency Fund' },
            { value: 'debt-payoff', label: 'Debt Payoff' },
            { value: 'home-purchase', label: 'Home Purchase' },
            { value: 'education', label: 'Education' },
            { value: 'vacation', label: 'Vacation' },
            { value: 'major-purchase', label: 'Major Purchase' },
            { value: 'investment-growth', label: 'Investment Growth' },
            { value: 'charitable-giving', label: 'Charitable Giving' },
            { value: 'other-goal', label: 'Other Goal' },
          ]}
          value={type}
          onChange={(value) => setType(value as Goal['type'])}
          required
        />

        <Group grow>
          <NumberInput
            label="Target Amount ($)"
            value={targetAmount}
            onChange={(value) => setTargetAmount(value as number)}
            min={0}
            required
          />
          <NumberInput
            label="Current Amount ($)"
            value={currentAmount}
            onChange={(value) => setCurrentAmount(value as number)}
            min={0}
          />
        </Group>

        <Group grow>
          <TextInput
            label="Start Date (YYYY-MM-DD)"
            value={startDate}
            onChange={(event) => setStartDate(event.currentTarget.value)}
            required
          />
          <TextInput
            label="Target Date (YYYY-MM-DD)"
            value={targetDate}
            onChange={(event) => setTargetDate(event.currentTarget.value)}
            required
          />
        </Group>

        <Select
          label="Priority"
          data={[
            { value: 'critical', label: 'Critical' },
            { value: 'high', label: 'High' },
            { value: 'medium', label: 'Medium' },
            { value: 'low', label: 'Low' },
          ]}
          value={priority}
          onChange={(value) => setPriority(value as Goal['priority'])}
          required
        />

        <Switch
          label="Mandatory Goal"
          description="Must be funded before flexible goals"
          checked={mandatory}
          onChange={(event) => setMandatory(event.currentTarget.checked)}
        />

        <NumberInput
          label="Monthly Contribution ($)"
          value={monthlyContribution}
          onChange={(value) => setMonthlyContribution(value as number)}
          min={0}
        />

        <Textarea
          label="Description"
          value={description}
          onChange={(event) => setDescription(event.currentTarget.value)}
          rows={3}
        />

        <TextInput
          label="Available Account ID"
          value={accountId}
          onChange={(event) => setAccountId(event.currentTarget.value)}
        />

        <TagsInput
          label="Tags"
          value={tags as string[]}
          onChange={setTags}
          placeholder="Add tags for filtering"
        />

        <Group justify="flex-end" mt="md">
          <Button variant="default" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Save Goal</Button>
        </Group>
      </Stack>
    </Paper>
  );
}
