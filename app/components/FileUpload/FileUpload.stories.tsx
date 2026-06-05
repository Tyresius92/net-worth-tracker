import type { Meta, StoryObj } from "@storybook/react-vite";

import { FileUpload } from "./FileUpload";

const meta = {
  component: FileUpload,
  tags: ["ai-generated"],
  args: {
    label: "Upload figures",
    name: "import_file",
    accept: ["csv"],
  },
} satisfies Meta<typeof FileUpload>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithHint: Story = {
  args: { hintText: "CSV files only." },
};

export const WithError: Story = {
  args: { errorMessage: "File must be a CSV." },
};

export const Disabled: Story = {
  args: { disabled: true, hintText: "CSV files only." },
};

export const Multiple: Story = {
  args: { multiple: true, hintText: "Select one or more CSV files." },
};
