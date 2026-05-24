import React from "react";

import { FontSizeOption } from "../_GlobalStyles/types";

import styles from "./Heading.module.css";

export interface HeadingProps {
  level: 1 | 2 | 3;
  children: React.ReactNode;
  fontSize?: FontSizeOption;
}

const tags = { 1: "h1", 2: "h2", 3: "h3" } as const;
const levelClass = {
  1: styles.level1,
  2: styles.level2,
  3: styles.level3,
} as const;

export const Heading = ({ level, children, fontSize }: HeadingProps) => {
  const Tag = tags[level];
  return (
    <Tag
      className={`${styles.base} ${levelClass[level]}`}
      style={fontSize ? { fontSize: `var(--font-size-${fontSize})` } : undefined}
    >
      {children}
    </Tag>
  );
};
