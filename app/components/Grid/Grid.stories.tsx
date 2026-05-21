import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";

import { Box } from "../Box/Box";

import { Grid } from "./Grid";

const meta = {
  component: Grid,
  tags: [],
} satisfies Meta<typeof Grid>;

export default meta;
type Story = StoryObj<typeof meta>;

const Cell = ({ children }: { children: React.ReactNode }) => (
  <Box bg="sand-3" p={16} borderColor="red-10">
    {children}
  </Box>
);

export const Default: Story = {
  args: {
    gap: 16,
    children: (
      <>
        <Grid.Item m={6}>
          <Cell>Left</Cell>
        </Grid.Item>
        <Grid.Item m={6}>
          <Cell>Right</Cell>
        </Grid.Item>
      </>
    ),
  },
};

export const TwoColumns: Story = {
  args: {
    gap: 16,
    rowGap: 16,
    children: (
      <>
        <Grid.Item m={6}>
          <Cell>Column A — full width on mobile, half at medium+</Cell>
        </Grid.Item>
        <Grid.Item m={6}>
          <Cell>Column B — full width on mobile, half at medium+</Cell>
        </Grid.Item>
        <Grid.Item m={6}>
          <Cell>Column A — row 2</Cell>
        </Grid.Item>
        <Grid.Item m={6}>
          <Cell>Column B — row 2</Cell>
        </Grid.Item>
      </>
    ),
  },
};

export const ThreeColumns: Story = {
  args: {
    gap: 16,
    children: (
      <>
        <Grid.Item m={3}>
          <Cell>Sidebar</Cell>
        </Grid.Item>
        <Grid.Item m={6}>
          <Cell>Main content</Cell>
        </Grid.Item>
        <Grid.Item m={3}>
          <Cell>Aside</Cell>
        </Grid.Item>
      </>
    ),
  },
};

export const WithOffset: Story = {
  args: {
    gap: 16,
    rowGap: 16,
    children: (
      <>
        <Grid.Item m={6} mOffset={3}>
          <Cell>Centered at medium+ (6 columns, offset 3)</Cell>
        </Grid.Item>
        <Grid.Item m={8} mOffset={2}>
          <Cell>Centered at medium+ (8 columns, offset 2)</Cell>
        </Grid.Item>
      </>
    ),
  },
};

export const Wrapping: Story = {
  args: {
    gap: 16,
    rowGap: 16,
    children: (
      <>
        <Grid.Item xs={8}>
          <Cell>8 columns</Cell>
        </Grid.Item>
        <Grid.Item xs={6}>
          <Cell>6 columns — wraps to next row (8 + 6 &gt; 12)</Cell>
        </Grid.Item>
      </>
    ),
  },
};

export const Reordered: Story = {
  args: {
    gap: 16,
    rowGap: 16,
    children: (
      <>
        <Grid.Item m={3} xs={6} xsOrder={2}>
          <Cell>Hello world (DOM order 1 → visual order 2 on mobile)</Cell>
        </Grid.Item>
        <Grid.Item m={6} xs={12} xsOrder={1}>
          <Cell>Goodbye world (DOM order 2 → visual order 1 on mobile)</Cell>
        </Grid.Item>
        <Grid.Item m={3} xs={6} xsOrder={3}>
          <Cell>Flooglebinder (DOM order 3 → visual order 3 on mobile)</Cell>
        </Grid.Item>
      </>
    ),
  },
};
