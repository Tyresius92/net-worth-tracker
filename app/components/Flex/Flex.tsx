import { SpaceOption } from "../_GlobalStyles/types";

// Define our own props instead of importing from Box
export interface FlexProps
  extends Pick<React.HTMLAttributes<HTMLDivElement>, "id" | "children"> {
  // Box spacing props
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

  // Flex container properties
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

  // Flex item properties
  flex?: string | number;
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

export const Flex = ({
  children,
  // Box spacing props with the same defaults as Box
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

  // Flex properties
  flexDirection,
  flexWrap,
  justifyContent,
  alignItems,
  alignContent,
  gap,
  rowGap,
  columnGap,
  flex,
  flexGrow,
  flexShrink,
  flexBasis,
  alignSelf,
  ...otherProps
}: FlexProps) => {
  return (
    <div
      {...otherProps}
      style={{
        display: "flex",
        // Box spacing styles
        ...(pl && { paddingInlineStart: `var(--space-${pl})` }),
        ...(pr && { paddingInlineEnd: `var(--space-${pr})` }),
        ...(pt && { paddingBlockStart: `var(--space-${pt})` }),
        ...(pb && { paddingBlockEnd: `var(--space-${pb})` }),

        ...(ml && { marginInlineStart: `var(--space-${ml})` }),
        ...(mr && { marginInlineEnd: `var(--space-${mr})` }),
        ...(mt && { marginBlockStart: `var(--space-${mt})` }),
        ...(mb && { marginBlockEnd: `var(--space-${mb})` }),

        // Flex styles
        ...(flexDirection && { flexDirection }),
        ...(flexWrap && { flexWrap }),
        ...(justifyContent && { justifyContent }),
        ...(alignItems && { alignItems }),
        ...(alignContent && { alignContent }),
        ...(gap && { gap: `var(--space-${gap})` }),
        ...(rowGap && { rowGap: `var(--space-${rowGap})` }),
        ...(columnGap && { columnGap: `var(--space-${columnGap})` }),
        ...(flex !== undefined && { flex }),
        ...(flexGrow !== undefined && { flexGrow }),
        ...(flexShrink !== undefined && { flexShrink }),
        ...(flexBasis && { flexBasis }),
        ...(alignSelf && { alignSelf }),
      }}
    >
      {children}
    </div>
  );
};
