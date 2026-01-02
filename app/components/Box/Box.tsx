import React from "react";

import { ColorOption, SpaceOption } from "../_GlobalStyles/types";

type BoxMarginOption = SpaceOption | "auto";

export interface BoxProps
  extends Pick<React.HTMLAttributes<HTMLDivElement>, "id" | "children"> {
  p?: SpaceOption;
  px?: SpaceOption;
  py?: SpaceOption;
  pl?: SpaceOption;
  pr?: SpaceOption;
  pt?: SpaceOption;
  pb?: SpaceOption;

  m?: BoxMarginOption;
  mx?: BoxMarginOption;
  my?: BoxMarginOption;
  ml?: BoxMarginOption;
  mr?: BoxMarginOption;
  mt?: BoxMarginOption;
  mb?: BoxMarginOption;

  bg?: ColorOption;
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
  color,

  maxWidth,
}: BoxProps) => {
  return (
    <div
      style={{
        ...(pl && { paddingInlineStart: `var(--space-${pl})` }),
        ...(pr && { paddingInlineEnd: `var(--space-${pr})` }),
        ...(pt && { paddingBlockStart: `var(--space-${pt})` }),
        ...(pb && { paddingBlockEnd: `var(--space-${pb})` }),

        ...(ml && {
          marginInlineStart: ml === "auto" ? "auto" : `var(--space-${ml})`,
        }),
        ...(mr && {
          marginInlineEnd: mr === "auto" ? "auto" : `var(--space-${mr})`,
        }),
        ...(mt && {
          marginBlockStart: mt === "auto" ? "auto" : `var(--space-${mt})`,
        }),
        ...(mb && {
          marginBlockEnd: mb === "auto" ? "auto" : `var(--space-${mb})`,
        }),

        ...(bg && { backgroundColor: `var(--color-${bg})` }),
        ...(color && { color: `var(--color-${color})` }),
        ...(maxWidth && { maxWidth: `${maxWidth}px` }),
      }}
    >
      {children}
    </div>
  );
};
