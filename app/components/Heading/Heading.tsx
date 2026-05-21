import React from "react";

import styles from "./Heading.module.css";

export interface HeadingProps {
  level: 1 | 2 | 3;
  children: React.ReactNode;
}

const tags = { 1: "h1", 2: "h2", 3: "h3" } as const;
const levelClass = {
  1: styles.level1,
  2: styles.level2,
  3: styles.level3,
} as const;

export const Heading = ({ level, children }: HeadingProps) => {
  const Tag = tags[level];
  return (
    <Tag className={`${styles.base} ${levelClass[level]}`}>{children}</Tag>
  );
};
