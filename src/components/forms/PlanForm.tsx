// PlanForm.tsx
import { useForm } from '@mantine/form';
import {
  Button,
  Stack,
  Paper,
  Text,
  Group,
  Select,
  TextInput,
  NumberInput,
  Checkbox,
  Divider,
} from '@mantine/core';
import type { Plan } from '@/core/types';
import { NumericInput } from './NumericInput';

interface PlanFormValues {
  id: string;
  name: string;
  type: 'fixed-date' | 'rolling';
  startDate: string;
  timeHorizon: number;
  inflationRate: number;
  adjustSpendingForInflation: boolean;
  adjustGrowthForInflation: boolean;
  defaultGrowthRate: number;
  withdrawalStrategy: 'sequential' | 'proportional' | 'tax-efficient';
  retirementAge: number;
  maxProjectionYears: number;
  enableSocialSecurity: boolean;
  socialSecurityStartAge: number;
  socialSecurityMonthlyBenefit: number;
  socialSecurityInflationAdjusted: boolean;
  enableRMD: boolean;
  rmdStartAge: number;
  rmdTable: 'uniform' | 'joint';
}

export function PlanForm() {
  const form = useForm<PlanFormValues>({
    mode: 'uncontrolled',
    initialValues: {
      id: '',
      name: '',
      type: 'fixed-date',
      startDate: new Date().toISOString().split('T')[0],
      timeHorizon: 30,
      inflationRate: 2.5,
      adjustSpendingForInflation: true,
      adjustGrowthForInflation: true,
      defaultGrowthRate: 7.0,
      withdrawalStrategy: 'tax-efficient',
      retirementAge: 65,
      maxProjectionYears: 30,
      enableSocialSecurity: false,
      socialSecurityStartAge: 70,
      socialSecurityMonthlyBenefit: 2000,
      socialSecurityInflationAdjusted: true,
      enableRMD: false,
      rmdStartAge: 72,
      rmdTable: 'uniform',
    },
  });

  const handleSubmit = (values: PlanFormValues) => {
    const plan: Plan = {
      id: values.id || 'plan-' + Date.now(),
      name: values.name,
      type: values.type as 'fixed-date' | 'rolling',
      startDate: values.startDate,
      timeHorizon: values.timeHorizon,
      assumptions: {
        inflation: {
          rate: values.inflationRate,
          adjustSpending: values.adjustSpendingForInflation,
          adjustGrowth: values.adjustGrowthForInflation,
        },
        growthModel: {
          defaultRate: values.defaultGrowthRate,
        },
        withdrawalRules: {
          strategy: values.withdrawalStrategy,
          retirementAge: values.retirementAge,
          maxProjectionYears: values.maxProjectionYears,
        },
        socialSecurity: values.enableSocialSecurity
          ? {
              startAge: values.socialSecurityStartAge,
              monthlyBenefit: values.socialSecurityMonthlyBenefit,
              inflationAdjusted: values.socialSecurityInflationAdjusted,
            }
          : undefined,
        rmdSettings: values.enableRMD
          ? {
              rmdStartAge: values.rmdStartAge,
              rmdTable: values.rmdTable,
            }
          : undefined,
      },
    };

    import('@/store/index').then(({ useStore }) => {
      useStore.getState().addPlan(plan);
      useStore.getState().setCurrentPlan(plan.id);
    });

    form.reset();
  };

  return (
    <Paper shadow="xs" p="md" withBorder>
      <Stack gap="md">
        <Text size="lg" fw={500}>
          Configure Your Financial Plan
        </Text>

        <TextInput
          label="Plan Name"
          placeholder="Retirement Plan"
          withAsterisk
          key={form.key('name')}
          {...form.getInputProps('name')}
        />

        <Select
          label="Plan Type"
          placeholder="Select plan type"
          data={[
            { value: 'fixed-date', label: 'Fixed Date Plan' },
            { value: 'rolling', label: 'Rolling Plan (from today)' },
          ]}
          withAsterisk
          key={form.key('type')}
          {...form.getInputProps('type')}
        />

        <TextInput
          label="Start Date"
          placeholder="YYYY-MM-DD"
          withAsterisk
          key={form.key('startDate')}
          {...form.getInputProps('startDate')}
        />

        <NumberInput
          label="Time Horizon (years)"
          placeholder="30"
          min={1}
          max={100}
          withAsterisk
          key={form.key('timeHorizon')}
          {...form.getInputProps('timeHorizon')}
        />

        <NumericInput
          label="Inflation Rate"
          placeholder="2.5"
          suffix="%"
          decimalScale={2}
          key={form.key('inflationRate')}
          {...form.getInputProps('inflationRate')}
        />

        <Group>
          <input
            type="checkbox"
            key={form.key('adjustSpendingForInflation')}
            {...form.getInputProps('adjustSpendingForInflation', {
              type: 'checkbox',
            })}
          />
          <Text size="sm">Adjust spending for inflation</Text>
        </Group>

        <Group>
          <input
            type="checkbox"
            key={form.key('adjustGrowthForInflation')}
            {...form.getInputProps('adjustGrowthForInflation', {
              type: 'checkbox',
            })}
          />
          <Text size="sm">Adjust growth rates for inflation</Text>
        </Group>

        <NumericInput
          label="Default Growth Rate"
          placeholder="7.0"
          suffix="%"
          decimalScale={2}
          key={form.key('defaultGrowthRate')}
          {...form.getInputProps('defaultGrowthRate')}
        />

        <Select
          label="Withdrawal Strategy"
          placeholder="Select withdrawal strategy"
          data={[
            { value: 'sequential', label: 'Sequential' },
            { value: 'proportional', label: 'Proportional' },
            { value: 'tax-efficient', label: 'Tax-Efficient' },
          ]}
          withAsterisk
          key={form.key('withdrawalStrategy')}
          {...form.getInputProps('withdrawalStrategy')}
        />

        <NumberInput
          label="Retirement Age"
          placeholder="65"
          min={18}
          max={100}
          withAsterisk
          key={form.key('retirementAge')}
          {...form.getInputProps('retirementAge')}
        />

        <NumberInput
          label="Max Projection Years"
          placeholder="30"
          min={1}
          max={100}
          withAsterisk
          key={form.key('maxProjectionYears')}
          {...form.getInputProps('maxProjectionYears')}
        />

        <Divider label="Social Security (Optional)" />

        <Checkbox
          label="Enable Social Security"
          key={form.key('enableSocialSecurity')}
          {...form.getInputProps('enableSocialSecurity')}
        />

        {form.values.enableSocialSecurity && (
          <>
            <NumberInput
              label="Social Security Start Age"
              placeholder="70"
              min={62}
              max={70}
              key={form.key('socialSecurityStartAge')}
              {...form.getInputProps('socialSecurityStartAge')}
            />

            <NumericInput
              label="Monthly Benefit Amount"
              placeholder="2000"
              prefix="$"
              decimalScale={2}
              key={form.key('socialSecurityMonthlyBenefit')}
              {...form.getInputProps('socialSecurityMonthlyBenefit')}
            />

            <Group>
              <input
                type="checkbox"
                key={form.key('socialSecurityInflationAdjusted')}
                {...form.getInputProps('socialSecurityInflationAdjusted', {
                  type: 'checkbox',
                })}
              />
              <Text size="sm">Adjust for inflation</Text>
            </Group>
          </>
        )}

        <Divider label="RMD Settings (Optional)" />

        <Checkbox
          label="Enable Required Minimum Distributions"
          key={form.key('enableRMD')}
          {...form.getInputProps('enableRMD')}
        />

        {form.values.enableRMD && (
          <>
            <NumberInput
              label="RMD Start Age"
              placeholder="72"
              min={59}
              max={75}
              key={form.key('rmdStartAge')}
              {...form.getInputProps('rmdStartAge')}
            />

            <Select
              label="RMD Table Type"
              placeholder="Select table type"
              data={[
                { value: 'uniform', label: 'Uniform Lifetime Table' },
                { value: 'joint', label: 'Joint Life Expectancy Table' },
              ]}
              key={form.key('rmdTable')}
              {...form.getInputProps('rmdTable')}
            />
          </>
        )}

        <Group justify="flex-end">
          <Button type="submit" onClick={() => form.onSubmit(handleSubmit)()}>
            Save Plan
          </Button>
        </Group>
      </Stack>
    </Paper>
  );
}
