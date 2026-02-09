import { useForm } from '@mantine/form';
import { Button, Stack, TextInput, Select, Group } from '@mantine/core';
import type { Asset } from '@/core/types';
import { NumericInput } from '../NumericInput';

interface AssetFormProps {
  asset?: Asset;
  onSave: (asset: Asset) => void;
  onCancel: () => void;
}

const REAL_ASSET_TYPES = [
  { value: 'primary-home', label: 'Primary Home' },
  { value: 'rental-property', label: 'Rental Property' },
  { value: 'vacation-home', label: 'Vacation Home' },
  { value: 'vehicle', label: 'Vehicle' },
  { value: 'boat', label: 'Boat/Watercraft' },
  { value: 'art', label: 'Art' },
  { value: 'jewelry', label: 'Jewelry' },
  { value: 'business', label: 'Business' },
  { value: 'precious-metals', label: 'Precious Metals' },
  { value: 'other-real-asset', label: 'Other Real Asset' },
];

export function AssetForm({ asset, onSave, onCancel }: AssetFormProps) {
  const form = useForm<Omit<Asset, 'type' | 'taxCharacteristics'>>({
    mode: 'uncontrolled',
    initialValues: {
      id: asset?.id || '',
      name: asset?.name || '',
      balance: asset?.balance || 0,
      assetType: asset?.assetType || 'primary-home',
      purchasePrice: asset?.purchasePrice || 0,
      purchaseDate: asset?.purchaseDate || '',
      appreciationRate: asset?.appreciationRate || 0,
      ongoingExpenses: asset?.ongoingExpenses || 0,
    },

    validate: {
      name: (value) => (value ? null : 'Asset name is required'),
      balance: (value) => (value >= 0 ? null : 'Value must be positive'),
      assetType: (value) => (value ? null : 'Asset type is required'),
    },
  });

  const handleSubmit = (values: typeof form.values) => {
    const assetData: Asset = {
      ...values,
      id: values.id || `asset-${Date.now()}`,
      type: 'real-assets',
      taxCharacteristics: 'taxable', // Default assumption
    };
    onSave(assetData);
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack gap="md">
        <TextInput
          label="Asset Name"
          placeholder="e.g., Primary Residence"
          withAsterisk
          key={form.key('name')}
          {...form.getInputProps('name')}
        />

        <Select
          label="Asset Type"
          placeholder="Select asset type"
          data={REAL_ASSET_TYPES}
          withAsterisk
          key={form.key('assetType')}
          {...form.getInputProps('assetType')}
        />

        <NumericInput
          label="Current Value"
          placeholder="500000"
          prefix="$ "
          thousandSeparator
          withAsterisk
          key={form.key('balance')}
          {...form.getInputProps('balance')}
        />

        <NumericInput
          label="Purchase Price"
          placeholder="400000"
          prefix="$ "
          thousandSeparator
          key={form.key('purchasePrice')}
          {...form.getInputProps('purchasePrice')}
        />

        <TextInput
          label="Purchase Date"
          placeholder="YYYY-MM-DD"
          key={form.key('purchaseDate')}
          {...form.getInputProps('purchaseDate')}
        />

        <NumericInput
          label="Annual Appreciation Rate"
          placeholder="3.5"
          suffix="%"
          decimalScale={2}
          key={form.key('appreciationRate')}
          {...form.getInputProps('appreciationRate')}
        />

        <NumericInput
          label="Ongoing Expenses (% of value)"
          placeholder="1.5"
          suffix="%"
          decimalScale={2}
          key={form.key('ongoingExpenses')}
          {...form.getInputProps('ongoingExpenses')}
        />

        <Group justify="flex-end" mt="md">
          <Button variant="default" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">{asset ? 'Update Asset' : 'Add Asset'}</Button>
        </Group>
      </Stack>
    </form>
  );
}
