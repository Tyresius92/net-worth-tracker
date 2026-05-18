import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { Link } from './Link';

const meta = {
  component: Link,
  tags: ['ai-generated'],
} satisfies Meta<typeof Link>;

export default meta;
type Story = StoryObj<typeof meta>;

export const External: Story = {
  args: { href: 'https://example.com', children: 'Visit example.com' },
  play: async ({ canvas }) => {
    const link = canvas.getByRole('link', { name: /visit example\.com/i });
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute('href', 'https://example.com');
  },
};

export const ExternalNewTab: Story = {
  args: {
    href: 'https://example.com',
    children: 'Open in new tab',
    target: '_blank',
    rel: 'noopener noreferrer',
  },
};
