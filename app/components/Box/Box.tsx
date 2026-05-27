import React from "react";

import { ColorOption, SpaceOption, StrokeValue } from "../_GlobalStyles/types";

import styles from "./Box.module.css";

type ColumnCount = 1 | 2 | 3 | 4 | 5;

interface BoxCSSProperties extends React.CSSProperties {
  "--box-col-xs"?: ColumnCount;
  "--box-col-s"?: ColumnCount;
  "--box-col-m"?: ColumnCount;
  "--box-col-l"?: ColumnCount;
  "--box-col-xl"?: ColumnCount;
}

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
  /**
   * @deprecated Use `border`, `borderX`, `borderY`, `borderTop`, `borderRight`, `borderBottom`, `borderLeft` instead.
   */
  borderColor?: ColorOption;
  color?: ColorOption;

  border?: StrokeValue;
  borderX?: StrokeValue;
  borderY?: StrokeValue;
  borderTop?: StrokeValue;
  borderRight?: StrokeValue;
  borderBottom?: StrokeValue;
  borderLeft?: StrokeValue;
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

interface ColumnBoxProps extends BaseBoxProps {
  display?: never;
  xsColumns: ColumnCount;
  sColumns?: ColumnCount;
  mColumns?: ColumnCount;
  lColumns?: ColumnCount;
  xlColumns?: ColumnCount;
  columnGap?: SpaceOption;
  columnRule?: StrokeValue;
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

type BoxProps = BlockBoxProps | FlexBoxProps | ColumnBoxProps;

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

    border,
    borderX = border,
    borderY = border,
    borderTop = borderY,
    borderRight = borderX,
    borderBottom = borderY,
    borderLeft = borderX,

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

  const isColumnBox = "xsColumns" in props;

  const columnStyles: BoxCSSProperties = (() => {
    if (!("xsColumns" in props)) return {};
    const {
      xsColumns,
      sColumns = xsColumns,
      mColumns = sColumns,
      lColumns = mColumns,
      xlColumns = lColumns,
      columnGap,
      columnRule,
    } = props;
    return {
      "--box-col-xs": xsColumns,
      "--box-col-s": sColumns,
      "--box-col-m": mColumns,
      "--box-col-l": lColumns,
      "--box-col-xl": xlColumns,
      ...(columnGap && { columnGap: `var(--space-${columnGap})` }),
      ...(columnRule && {
        columnRuleWidth: columnRule.width ?? 1,
        columnRuleStyle: columnRule.style ?? "solid",
        columnRuleColor: `var(--color-${columnRule.color})`,
      }),
    };
  })();

  const boxStyle: BoxCSSProperties = {
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
    ...(borderTop && {
      borderTopWidth: borderTop.width ?? 1,
      borderTopStyle: borderTop.style ?? "solid",
      borderTopColor: `var(--color-${borderTop.color})`,
    }),
    ...(borderRight && {
      borderRightWidth: borderRight.width ?? 1,
      borderRightStyle: borderRight.style ?? "solid",
      borderRightColor: `var(--color-${borderRight.color})`,
    }),
    ...(borderBottom && {
      borderBottomWidth: borderBottom.width ?? 1,
      borderBottomStyle: borderBottom.style ?? "solid",
      borderBottomColor: `var(--color-${borderBottom.color})`,
    }),
    ...(borderLeft && {
      borderLeftWidth: borderLeft.width ?? 1,
      borderLeftStyle: borderLeft.style ?? "solid",
      borderLeftColor: `var(--color-${borderLeft.color})`,
    }),
    ...(color && { color: `var(--color-${color})` }),
    ...(maxWidth && { maxWidth: `${maxWidth}px` }),
    ...(textAlign && { textAlign }),
    ...(hyphens && { hyphens }),
    ...columnStyles,
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
  };

  return (
    <Tag
      id={id}
      className={isColumnBox ? styles.columns : undefined}
      style={boxStyle}
    >
      {children}
    </Tag>
  );
};
