import React from "react";

import { SpaceOption } from "../_GlobalStyles/types";

import styles from "./Grid.module.css";

type ColSpan = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
// 0 resets to auto-placement (useful for cancelling a carry-upward offset)
type ColOffset = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;

interface GridCSSProperties extends React.CSSProperties {
  "--grid-gap"?: string;
  "--grid-row-gap"?: string;
}

interface GridItemCSSProperties extends React.CSSProperties {
  "--gi-span-xs": number;
  "--gi-span-s": number;
  "--gi-span-m": number;
  "--gi-span-l": number;
  "--gi-span-xl": number;
  "--gi-col-start-xs": string | number;
  "--gi-col-start-s": string | number;
  "--gi-col-start-m": string | number;
  "--gi-col-start-l": string | number;
  "--gi-col-start-xl": string | number;
  "--gi-order-xs": number;
  "--gi-order-s": number;
  "--gi-order-m": number;
  "--gi-order-l": number;
  "--gi-order-xl": number;
}

interface GridProps {
  children: React.ReactNode;
  gap?: SpaceOption;
  rowGap?: SpaceOption;
}

interface GridItemProps {
  children?: React.ReactNode;

  xs?: ColSpan;
  s?: ColSpan;
  m?: ColSpan;
  l?: ColSpan;
  xl?: ColSpan;

  xsOffset?: ColOffset;
  sOffset?: ColOffset;
  mOffset?: ColOffset;
  lOffset?: ColOffset;
  xlOffset?: ColOffset;

  xsOrder?: number;
  sOrder?: number;
  mOrder?: number;
  lOrder?: number;
  xlOrder?: number;

  alignSelf?: "center";
}

const colStart = (offset: number) => (offset === 0 ? "auto" : offset + 1);

const GridItem = ({
  children,
  xs = 12,
  s = xs,
  m = s,
  l = m,
  xl = l,
  xsOffset = 0,
  sOffset = xsOffset,
  mOffset = sOffset,
  lOffset = mOffset,
  xlOffset = lOffset,
  xsOrder = 0,
  sOrder = xsOrder,
  mOrder = sOrder,
  lOrder = mOrder,
  xlOrder = lOrder,
  alignSelf,
}: GridItemProps) => {
  const itemStyle: GridItemCSSProperties = {
    "--gi-span-xs": xs,
    "--gi-span-s": s,
    "--gi-span-m": m,
    "--gi-span-l": l,
    "--gi-span-xl": xl,
    "--gi-col-start-xs": colStart(xsOffset),
    "--gi-col-start-s": colStart(sOffset),
    "--gi-col-start-m": colStart(mOffset),
    "--gi-col-start-l": colStart(lOffset),
    "--gi-col-start-xl": colStart(xlOffset),
    "--gi-order-xs": xsOrder,
    "--gi-order-s": sOrder,
    "--gi-order-m": mOrder,
    "--gi-order-l": lOrder,
    "--gi-order-xl": xlOrder,
    alignSelf,
  };

  return (
    <div className={styles.item} style={itemStyle}>
      {children}
    </div>
  );
};

export const Grid = ({ children, gap, rowGap }: GridProps) => {
  const gridStyle: GridCSSProperties = {
    ...(gap && { "--grid-gap": `var(--space-${gap})` }),
    ...(rowGap && { "--grid-row-gap": `var(--space-${rowGap})` }),
  };

  return (
    <div className={styles.grid} style={gridStyle} data-testid="grid">
      {children}
    </div>
  );
};

Grid.Item = GridItem;
