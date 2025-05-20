import { Link as RRLink, LinkProps as RRLinkProps } from "react-router";

import styles from "./Link.module.css";

export interface LinkProps extends Pick<RRLinkProps, "to" | "children"> {}

export const Link = (props: LinkProps) => {
  return <RRLink {...props} className={styles.link} />;
};
