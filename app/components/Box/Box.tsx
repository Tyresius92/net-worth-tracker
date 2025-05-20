import React from "react";

import { SpaceOption } from "../_GlobalStyles/types";

export interface BoxProps
  extends Pick<React.HTMLAttributes<HTMLDivElement>, "id" | "children"> {
  p?: SpaceOption;
  px?: SpaceOption;
  py?: SpaceOption;
  pl?: SpaceOption;
  pr?: SpaceOption;
  pt?: SpaceOption;
  pb?: SpaceOption;

  m?: SpaceOption;
  mx?: SpaceOption;
  my?: SpaceOption;
  ml?: SpaceOption;
  mr?: SpaceOption;
  mt?: SpaceOption;
  mb?: SpaceOption;
}

export const Box = ({
  children,
  p,
  px = p,
  py = p,
  pl = px,
  pr = px,
  pt = py,
  pb = py,

  m,
  mx = m,
  my = m,
  ml = mx,
  mr = mx,
  mt = my,
  mb = my,
}: BoxProps) => {
  return (
    <div
      style={{
        ...(pl && { paddingInlineStart: `var(--space-${pl})` }),
        ...(pr && { paddingInlineEnd: `var(--space-${pr})` }),
        ...(pt && { paddingBlockStart: `var(--space-${pt})` }),
        ...(pb && { paddingBlockEnd: `var(--space-${pb})` }),

        ...(ml && { marginInlineStart: `var(--space-${ml})` }),
        ...(mr && { marginInlineEnd: `var(--space-${mr})` }),
        ...(mt && { marginBlockStart: `var(--space-${mt})` }),
        ...(mb && { marginBlockEnd: `var(--space-${mb})` }),
      }}
    >
      {children}
    </div>
  );
};
