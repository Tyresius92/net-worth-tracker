import React from "react";

import { ColorOption, SpaceOption } from "../_GlobalStyles/types";

interface BaseBoxProps
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
  /**
   * @deprecated I am rethinking the approach to maxWidth
   */
  maxWidth?: number;

  is?: "div" | "article" | "section";

  textAlign?: "left" | "center" | "right" | "justify";
  hyphens?: "auto" | "none" | "manual";

  flexGrow?: number;
  flexShrink?: number;
  flexBasis?: string;
  alignSelf?:
    | "auto"
    | "flex-start"
    | "flex-end"
    | "center"
    | "baseline"
    | "stretch";
}

interface BlockBoxProps extends BaseBoxProps {
  display?: "block";
}

interface FlexBoxProps extends BaseBoxProps {
  display: "flex";
  flexDirection?: "row" | "row-reverse" | "column" | "column-reverse";
  flexWrap?: "nowrap" | "wrap" | "wrap-reverse";
  justifyContent?:
    | "flex-start"
    | "flex-end"
    | "center"
    | "space-between"
    | "space-around"
    | "space-evenly";
  alignItems?: "stretch" | "flex-start" | "flex-end" | "center" | "baseline";
  alignContent?:
    | "stretch"
    | "flex-start"
    | "flex-end"
    | "center"
    | "space-between"
    | "space-around";
  gap?: SpaceOption;
  rowGap?: SpaceOption;
  columnGap?: SpaceOption;
}

type BoxProps = BlockBoxProps | FlexBoxProps;

export const Box = (props: BoxProps) => {
  const {
    id,
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

    textAlign,
    hyphens,

    is = "div",

    flexGrow,
    flexShrink,
    flexBasis,
    alignSelf,
  } = props;

  const Tag = is;

  return (
    <Tag
      id={id}
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
        ...(textAlign && { textAlign }),
        ...(hyphens && { hyphens }),

        ...(flexGrow !== undefined && { flexGrow }),
        ...(flexShrink !== undefined && { flexShrink }),
        ...(flexBasis && { flexBasis }),
        ...(alignSelf && { alignSelf }),

        ...(props.display === "flex"
          ? {
              display: "flex",
              ...(props.gap && { gap: `var(--space-${props.gap})` }),
              ...(props.rowGap && { rowGap: `var(--space-${props.rowGap})` }),
              ...(props.columnGap && {
                columnGap: `var(--space-${props.columnGap})`,
              }),
              ...(props.flexDirection && {
                flexDirection: props.flexDirection,
              }),
              ...(props.flexWrap && { flexWrap: props.flexWrap }),
              ...(props.justifyContent && {
                justifyContent: props.justifyContent,
              }),
              ...(props.alignItems && { alignItems: props.alignItems }),
              ...(props.alignContent && { alignContent: props.alignContent }),
            }
          : {}),
      }}
    >
      {children}
    </Tag>
  );
};
