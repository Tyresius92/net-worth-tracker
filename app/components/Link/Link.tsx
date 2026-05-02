import type { ReactNode } from "react";
import { Link as RRLink, LinkProps as RRLinkProps } from "react-router";

import styles from "./Link.module.css";

type InternalLinkProps = Pick<RRLinkProps, "to" | "children">;
type ExternalLinkProps = {
  href: string;
  children: ReactNode;
  target?: string;
  rel?: string;
};

export type LinkProps = InternalLinkProps | ExternalLinkProps;

export const Link = (props: LinkProps) => {
  if ("href" in props) {
    return <a {...props} className={styles.link} />;
  }
  return <RRLink {...props} className={styles.link} />;
};
