import React from "react";

import styles from "./Text.module.css";

type TextRole = "deck" | "body" | "byline" | "caption" | "code";
type TagElement = "p" | "span" | "code";

export interface TextProps {
  variant: TextRole;
  children: React.ReactNode;
  as?: TagElement;
}

const defaultElements: Record<TextRole, TagElement> = {
  deck: "p",
  body: "p",
  byline: "p",
  caption: "span",
  code: "code",
};

export const Text = ({ variant, children, as }: TextProps) => {
  const Tag = as ?? defaultElements[variant];
  return <Tag className={styles[variant]}>{children}</Tag>;
};
