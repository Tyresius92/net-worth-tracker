import React from "react";

import { ColorOption, SpaceOption, StrokeValue } from "../_GlobalStyles/types";

import styles from "./Box.module.css";

type ColumnCount = 1 | 2 | 3 | 4 | 5;
type SpacingBp = "xs" | "s" | "m" | "l" | "xl";
type SpacingSide =
  | "pl"
  | "pr"
  | "pt"
  | "pb"
  | "ml"
  | "mr"
  | "mt"
  | "mb"
  | "row-gap"
  | "col-gap";
type SpacingVar = `--box-${SpacingSide}-${SpacingBp}`;

type BoxCSSProperties = React.CSSProperties &
  Partial<Record<`--box-col-${"xs" | "s" | "m" | "l" | "xl"}`, ColumnCount>> &
  Partial<Record<SpacingVar, string>>;

interface BaseBoxProps extends Pick<
  React.HTMLAttributes<HTMLDivElement>,
  "id" | "children" | "role"
> {
  // Padding — xs is the mobile base; each breakpoint cascades upward unless overridden
  xsP?: SpaceOption;
  xsPx?: SpaceOption;
  xsPy?: SpaceOption;
  xsPt?: SpaceOption;
  xsPb?: SpaceOption;
  xsPl?: SpaceOption;
  xsPr?: SpaceOption;

  sP?: SpaceOption;
  sPx?: SpaceOption;
  sPy?: SpaceOption;
  sPt?: SpaceOption;
  sPb?: SpaceOption;
  sPl?: SpaceOption;
  sPr?: SpaceOption;

  mP?: SpaceOption;
  mPx?: SpaceOption;
  mPy?: SpaceOption;
  mPt?: SpaceOption;
  mPb?: SpaceOption;
  mPl?: SpaceOption;
  mPr?: SpaceOption;

  lP?: SpaceOption;
  lPx?: SpaceOption;
  lPy?: SpaceOption;
  lPt?: SpaceOption;
  lPb?: SpaceOption;
  lPl?: SpaceOption;
  lPr?: SpaceOption;

  xlP?: SpaceOption;
  xlPx?: SpaceOption;
  xlPy?: SpaceOption;
  xlPt?: SpaceOption;
  xlPb?: SpaceOption;
  xlPl?: SpaceOption;
  xlPr?: SpaceOption;

  // Margin
  xsM?: SpaceOption;
  xsMx?: SpaceOption;
  xsMy?: SpaceOption;
  xsMt?: SpaceOption;
  xsMb?: SpaceOption;
  xsMl?: SpaceOption;
  xsMr?: SpaceOption;

  sM?: SpaceOption;
  sMx?: SpaceOption;
  sMy?: SpaceOption;
  sMt?: SpaceOption;
  sMb?: SpaceOption;
  sMl?: SpaceOption;
  sMr?: SpaceOption;

  mM?: SpaceOption;
  mMx?: SpaceOption;
  mMy?: SpaceOption;
  mMt?: SpaceOption;
  mMb?: SpaceOption;
  mMl?: SpaceOption;
  mMr?: SpaceOption;

  lM?: SpaceOption;
  lMx?: SpaceOption;
  lMy?: SpaceOption;
  lMt?: SpaceOption;
  lMb?: SpaceOption;
  lMl?: SpaceOption;
  lMr?: SpaceOption;

  xlM?: SpaceOption;
  xlMx?: SpaceOption;
  xlMy?: SpaceOption;
  xlMt?: SpaceOption;
  xlMb?: SpaceOption;
  xlMl?: SpaceOption;
  xlMr?: SpaceOption;

  // Gap — xsGap is shorthand for both row-gap and column-gap at xs;
  // xsRowGap / xsColumnGap are more specific and take precedence
  xsGap?: SpaceOption;
  sGap?: SpaceOption;
  mGap?: SpaceOption;
  lGap?: SpaceOption;
  xlGap?: SpaceOption;
  xsRowGap?: SpaceOption;
  sRowGap?: SpaceOption;
  mRowGap?: SpaceOption;
  lRowGap?: SpaceOption;
  xlRowGap?: SpaceOption;
  xsColumnGap?: SpaceOption;
  sColumnGap?: SpaceOption;
  mColumnGap?: SpaceOption;
  lColumnGap?: SpaceOption;
  xlColumnGap?: SpaceOption;

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
}

type BoxProps = BlockBoxProps | FlexBoxProps | ColumnBoxProps;

function sv(value: SpaceOption | undefined): string | undefined {
  return value !== undefined ? `var(--space-${value})` : undefined;
}

export const Box = (props: BoxProps) => {
  const {
    id,
    children,

    xsP,
    xsPx = xsP,
    xsPy = xsP,
    xsPl = xsPx,
    xsPr = xsPx,
    xsPt = xsPy,
    xsPb = xsPy,

    sP,
    sPx = sP,
    sPy = sP,
    sPl = sPx,
    sPr = sPx,
    sPt = sPy,
    sPb = sPy,

    mP,
    mPx = mP,
    mPy = mP,
    mPl = mPx,
    mPr = mPx,
    mPt = mPy,
    mPb = mPy,

    lP,
    lPx = lP,
    lPy = lP,
    lPl = lPx,
    lPr = lPx,
    lPt = lPy,
    lPb = lPy,

    xlP,
    xlPx = xlP,
    xlPy = xlP,
    xlPl = xlPx,
    xlPr = xlPx,
    xlPt = xlPy,
    xlPb = xlPy,

    xsM,
    xsMx = xsM,
    xsMy = xsM,
    xsMl = xsMx,
    xsMr = xsMx,
    xsMt = xsMy,
    xsMb = xsMy,

    sM,
    sMx = sM,
    sMy = sM,
    sMl = sMx,
    sMr = sMx,
    sMt = sMy,
    sMb = sMy,

    mM,
    mMx = mM,
    mMy = mM,
    mMl = mMx,
    mMr = mMx,
    mMt = mMy,
    mMb = mMy,

    lM,
    lMx = lM,
    lMy = lM,
    lMl = lMx,
    lMr = lMx,
    lMt = lMy,
    lMb = lMy,

    xlM,
    xlMx = xlM,
    xlMy = xlM,
    xlMl = xlMx,
    xlMr = xlMx,
    xlMt = xlMy,
    xlMb = xlMy,

    xsGap,
    xsRowGap = xsGap,
    xsColumnGap = xsGap,
    sGap,
    sRowGap = sGap,
    sColumnGap = sGap,
    mGap,
    mRowGap = mGap,
    mColumnGap = mGap,
    lGap,
    lRowGap = lGap,
    lColumnGap = lGap,
    xlGap,
    xlRowGap = xlGap,
    xlColumnGap = xlGap,

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
    role,

    flexGrow,
    flexShrink,
    flexBasis,
    alignSelf,
  } = props;

  const Tag = is;

  const isColumnBox = "xsColumns" in props;

  const columnStyles: BoxCSSProperties = (() => {
    if (!("xsColumns" in props)) {
      return {};
    }
    const {
      xsColumns,
      sColumns = xsColumns,
      mColumns = sColumns,
      lColumns = mColumns,
      xlColumns = lColumns,
      columnRule,
    } = props;
    return {
      "--box-col-xs": xsColumns,
      "--box-col-s": sColumns,
      "--box-col-m": mColumns,
      "--box-col-l": lColumns,
      "--box-col-xl": xlColumns,
      ...(columnRule && {
        columnRuleWidth: columnRule.width ?? 1,
        columnRuleStyle: columnRule.style ?? "solid",
        columnRuleColor: `var(--color-${columnRule.color})`,
      }),
    };
  })();

  const spacingVars: BoxCSSProperties = {
    ...(sv(xsPl) && { "--box-pl-xs": sv(xsPl) }),
    ...(sv(xsPr) && { "--box-pr-xs": sv(xsPr) }),
    ...(sv(xsPt) && { "--box-pt-xs": sv(xsPt) }),
    ...(sv(xsPb) && { "--box-pb-xs": sv(xsPb) }),
    ...(sv(xsMl) && { "--box-ml-xs": sv(xsMl) }),
    ...(sv(xsMr) && { "--box-mr-xs": sv(xsMr) }),
    ...(sv(xsMt) && { "--box-mt-xs": sv(xsMt) }),
    ...(sv(xsMb) && { "--box-mb-xs": sv(xsMb) }),
    ...(sv(xsRowGap) && { "--box-row-gap-xs": sv(xsRowGap) }),
    ...(sv(xsColumnGap) && { "--box-col-gap-xs": sv(xsColumnGap) }),

    ...(sv(sPl) && { "--box-pl-s": sv(sPl) }),
    ...(sv(sPr) && { "--box-pr-s": sv(sPr) }),
    ...(sv(sPt) && { "--box-pt-s": sv(sPt) }),
    ...(sv(sPb) && { "--box-pb-s": sv(sPb) }),
    ...(sv(sMl) && { "--box-ml-s": sv(sMl) }),
    ...(sv(sMr) && { "--box-mr-s": sv(sMr) }),
    ...(sv(sMt) && { "--box-mt-s": sv(sMt) }),
    ...(sv(sMb) && { "--box-mb-s": sv(sMb) }),
    ...(sv(sRowGap) && { "--box-row-gap-s": sv(sRowGap) }),
    ...(sv(sColumnGap) && { "--box-col-gap-s": sv(sColumnGap) }),

    ...(sv(mPl) && { "--box-pl-m": sv(mPl) }),
    ...(sv(mPr) && { "--box-pr-m": sv(mPr) }),
    ...(sv(mPt) && { "--box-pt-m": sv(mPt) }),
    ...(sv(mPb) && { "--box-pb-m": sv(mPb) }),
    ...(sv(mMl) && { "--box-ml-m": sv(mMl) }),
    ...(sv(mMr) && { "--box-mr-m": sv(mMr) }),
    ...(sv(mMt) && { "--box-mt-m": sv(mMt) }),
    ...(sv(mMb) && { "--box-mb-m": sv(mMb) }),
    ...(sv(mRowGap) && { "--box-row-gap-m": sv(mRowGap) }),
    ...(sv(mColumnGap) && { "--box-col-gap-m": sv(mColumnGap) }),

    ...(sv(lPl) && { "--box-pl-l": sv(lPl) }),
    ...(sv(lPr) && { "--box-pr-l": sv(lPr) }),
    ...(sv(lPt) && { "--box-pt-l": sv(lPt) }),
    ...(sv(lPb) && { "--box-pb-l": sv(lPb) }),
    ...(sv(lMl) && { "--box-ml-l": sv(lMl) }),
    ...(sv(lMr) && { "--box-mr-l": sv(lMr) }),
    ...(sv(lMt) && { "--box-mt-l": sv(lMt) }),
    ...(sv(lMb) && { "--box-mb-l": sv(lMb) }),
    ...(sv(lRowGap) && { "--box-row-gap-l": sv(lRowGap) }),
    ...(sv(lColumnGap) && { "--box-col-gap-l": sv(lColumnGap) }),

    ...(sv(xlPl) && { "--box-pl-xl": sv(xlPl) }),
    ...(sv(xlPr) && { "--box-pr-xl": sv(xlPr) }),
    ...(sv(xlPt) && { "--box-pt-xl": sv(xlPt) }),
    ...(sv(xlPb) && { "--box-pb-xl": sv(xlPb) }),
    ...(sv(xlMl) && { "--box-ml-xl": sv(xlMl) }),
    ...(sv(xlMr) && { "--box-mr-xl": sv(xlMr) }),
    ...(sv(xlMt) && { "--box-mt-xl": sv(xlMt) }),
    ...(sv(xlMb) && { "--box-mb-xl": sv(xlMb) }),
    ...(sv(xlRowGap) && { "--box-row-gap-xl": sv(xlRowGap) }),
    ...(sv(xlColumnGap) && { "--box-col-gap-xl": sv(xlColumnGap) }),
  };

  const hasSpacing = Object.keys(spacingVars).length > 0;

  const boxStyle: BoxCSSProperties = {
    borderRadius: "inherit",
    ...(hasSpacing ? spacingVars : {}),
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
          ...(props.flexDirection && { flexDirection: props.flexDirection }),
          ...(props.flexWrap && { flexWrap: props.flexWrap }),
          ...(props.justifyContent && { justifyContent: props.justifyContent }),
          ...(props.alignItems && { alignItems: props.alignItems }),
          ...(props.alignContent && { alignContent: props.alignContent }),
        }
      : {}),
  };

  const className =
    [
      hasSpacing ? styles.box : undefined,
      isColumnBox ? styles.columns : undefined,
    ]
      .filter(Boolean)
      .join(" ") || undefined;

  return (
    <Tag id={id} className={className} style={boxStyle} role={role}>
      {children}
    </Tag>
  );
};
