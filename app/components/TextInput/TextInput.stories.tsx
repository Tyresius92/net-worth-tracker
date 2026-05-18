import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { TextInput } from './TextInput';

const meta = {
  component: TextInput,
  tags: ['ai-generated'],
} satisfies Meta<typeof TextInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { label: 'Email address', name: 'email', type: 'email' },
  play: async ({ canvas }) => {
    const input = canvas.getByLabelText(/email address/i);
    await expect(input).toBeVisible();
    await expect(input).toHaveAttribute('type', 'email');
  },
};

export const WithError: Story = {
  args: {
    label: 'Username',
    name: 'username',
    type: 'text',
    errorMessage: 'Username is already taken',
  },
  play: async ({ canvas }) => {
    const input = canvas.getByLabelText(/username/i);
    await expect(input).toHaveAttribute('aria-invalid', 'true');
    await expect(canvas.getByText(/username is already taken/i)).toBeVisible();
  },
};

export const WithHint: Story = {
  args: {
    label: 'Password',
    name: 'password',
    type: 'password',
    hintText: 'Must be at least 8 characters',
  },
};

export const Disabled: Story = {
  args: { label: 'Read-only field', name: 'readonly', type: 'text', disabled: true },
};
