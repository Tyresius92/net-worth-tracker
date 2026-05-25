import React from "react";

import styles from "./Text.module.css";

type TextRole = "deck" | "body" | "byline" | "caption" | "code";
type TagElement = "p" | "span" | "code";

export interface TextProps {
  variant?: TextRole;
  children: React.ReactNode;
  as?: TagElement;
  dropCap?: boolean;
}

const defaultElements: Record<TextRole, TagElement> = {
  deck: "p",
  body: "p",
  byline: "p",
  caption: "span",
  code: "code",
};

export const Text = ({
  variant = "body",
  children,
  as,
  dropCap,
}: TextProps) => {
  const Tag = as ?? defaultElements[variant];
  const className = dropCap
    ? `${styles[variant]} ${styles.dropCap}`
    : styles[variant];
  return <Tag className={className}>{children}</Tag>;
};
