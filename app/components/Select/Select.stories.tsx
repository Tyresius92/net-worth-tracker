import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { Select } from './Select';

const meta = {
  component: Select,
  tags: ['ai-generated'],
  args: {
    name: 'account-type',
    label: 'Account type',
    options: [
      { value: 'checking', label: 'Checking' },
      { value: 'savings', label: 'Savings' },
      { value: 'investment', label: 'Investment' },
    ],
  },
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    const select = canvas.getByLabelText(/account type/i);
    await expect(select).toBeVisible();
    await expect(select).not.toHaveAttribute('aria-invalid');
  },
};

export const WithDefaultValue: Story = {
  args: { defaultValue: 'savings' },
};

export const WithError: Story = {
  args: { errorMessage: 'Please select an account type' },
  play: async ({ canvas }) => {
    const select = canvas.getByLabelText(/account type/i);
    await expect(select).toHaveAttribute('aria-invalid', 'true');
    await expect(canvas.getByText(/please select an account type/i)).toBeVisible();
  },
};

export const Disabled: Story = {
  args: { disabled: true },
};
