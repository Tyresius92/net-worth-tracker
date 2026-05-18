import React from "react";

import { ColorOption, SpaceOption } from "../_GlobalStyles/types";

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

  bg?: ColorOption;
  borderColor?: ColorOption;
  color?: ColorOption;

  maxWidth?: number;
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

  bg,
  borderColor,
  color,

  maxWidth,
}: BoxProps) => {
  return (
    <div
      style={{
        borderRadius: "inherit",
        ...(pl && { paddingInlineStart: `var(--space-${pl})` }),
        ...(pr && { paddingInlineEnd: `var(--space-${pr})` }),
        ...(pt && { paddingBlockStart: `var(--space-${pt})` }),
        ...(pb && { paddingBlockEnd: `var(--space-${pb})` }),

        ...(ml && { marginInlineStart: `var(--space-${ml})` }),
        ...(mr && { marginInlineEnd: `var(--space-${mr})` }),
        ...(mt && { marginBlockStart: `var(--space-${mt})` }),
        ...(mb && { marginBlockEnd: `var(--space-${mb})` }),

        ...(bg && { backgroundColor: `var(--color-${bg})` }),
        ...(borderColor && { border: `1px solid var(--color-${borderColor})` }),
        ...(color && { color: `var(--color-${color})` }),
        ...(maxWidth && { maxWidth: `${maxWidth}px` }),
      }}
    >
      {children}
    </div>
  );
};
