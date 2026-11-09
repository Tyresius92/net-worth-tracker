import type { Meta, StoryObj } from "@storybook/react-vite";

import { Button } from "../Button/Button";
import { TextInput } from "../TextInput/TextInput";

import { Honeypot } from "./Honeypot";

const meta = {
  component: Honeypot,
  tags: [],
} satisfies Meta<typeof Honeypot>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    name: "website",
  },
};

export const InForm: Story = {
  args: { name: "website" },
  render: (args) => (
    <form
      onSubmit={(event) => {
        event.preventDefault();
      }}
    >
      <Honeypot {...args} />
      <TextInput type="email" label="Email address" name="email" />
      <TextInput type="password" label="Password" name="password" />
      <Button type="submit">Apply</Button>
    </form>
  ),
};
