import type { Meta, StoryObj } from "@storybook/react-vite";

import { Box } from "./Box/Box";
import { Currency } from "./Currency/Currency";
import { Divider } from "./Divider/Divider";
import { Grid } from "./Grid/Grid";
import { Heading } from "./Heading/Heading";
import { Text } from "./Text/Text";

const meta = {
  title: "Typography",
  tags: [],
  parameters: {
    controls: { disable: true },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Editorial: Story = {
  render: () => (
    <Box>
      <Heading level={1}>Every role has a reason</Heading>
      <Box xsPt={8} xsPb={4}>
        <Text variant="deck">
          The type hierarchy reads before the copy does. A reader scanning this
          page knows the headline, the standfirst, and the section structure
          before engaging with a single body sentence.
        </Text>
      </Box>
      <Text variant="byline">Broadsheet Design System</Text>
      <Box xsPt={24}>
        <Divider />
      </Box>
      <Box xsPt={24}>
        <Grid gap={48}>
          <Grid.Item m={8}>
            <Box display="flex" flexDirection="column" xsGap={16}>
              <Box>
                <Heading level={2}>Headings do the structural work</Heading>
                <Box xsPt={8}>
                  <Text variant="body">
                    An H1 names the page&apos;s primary fact — one per page,
                    uppercase by the component, never by typing in caps. An H2
                    names a section of related content within the page. An H3
                    names a subsection or aside. The rule is simple: never skip
                    a level. If a fourth level seems necessary, the content
                    usually needs restructuring more than it needs a smaller
                    heading — though a fourth level can be added to the{" "}
                    <code>Heading</code> component if the hierarchy genuinely
                    calls for it.
                  </Text>
                </Box>
              </Box>
              <Box>
                <Heading level={2}>Body and deck carry the prose</Heading>
                <Box xsPt={8}>
                  <Text variant="body">
                    The deck is the standfirst — one sentence directly beneath
                    the H1 that bridges the headline to the body. Slightly
                    larger than body text but muted to sand-11, it earns its
                    size by doing real explanatory work, not by decorating the
                    page. The body role is the workhorse: Source Serif 4 at 16px
                    with a 1.5 line height, used for full sentences the reader
                    actually engages with.
                  </Text>
                </Box>
              </Box>
              <Box>
                <Heading level={2}>
                  Currency inherits, it does not impose
                </Heading>
                <Box xsPt={8}>
                  <Text variant="body">
                    Unlike every other element here, <code>Currency</code> is a
                    modifier rather than a role. It formats a cents integer as a
                    dollar amount and applies tabular-nums so that digits align
                    across rows. Everything else — family, size, color — is
                    inherited from the surrounding context. Inside a headline it
                    looks like a headline. Inside body copy it looks like body
                    copy. Your net worth today: <Currency value={17238800} />.
                  </Text>
                </Box>
              </Box>
            </Box>
          </Grid.Item>
          <Grid.Item m={4}>
            <Divider />
            <Box xsPt={12}>
              <Heading level={3}>Support roles</Heading>
              <Box xsPt={12} display="flex" flexDirection="column" xsGap={12}>
                <Box>
                  <Text variant="caption" as="span">
                    Byline
                  </Text>
                  <Box xsPt={2}>
                    <Text variant="body">
                      Free-floating metadata: author credit, date strap,
                      copyright. Sits on its own line. Uppercase with wider
                      tracking than caption.
                    </Text>
                  </Box>
                </Box>
                <Box>
                  <Text variant="caption" as="span">
                    Caption
                  </Text>
                  <Box xsPt={2}>
                    <Text variant="body">
                      A label paired with a value beside or below it. The
                      smallest text in the system. Renders as a span by default
                      so it sits inline with its value.
                    </Text>
                  </Box>
                </Box>
                <Box>
                  <Text variant="caption" as="span">
                    Currency
                  </Text>
                  <Box xsPt={2}>
                    <Text variant="body">
                      A modifier, not a role. Wraps a cents integer, formats it
                      as a dollar amount, and applies tabular-nums so digits
                      align in columns.
                    </Text>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Grid.Item>
        </Grid>
      </Box>
    </Box>
  ),
};
