import {
  NavLink as RRNavLink,
  NavLinkProps as RRNavLinkProps,
} from "react-router";

import styles from "./NavLink.module.css";

export interface NavLinkProps extends Pick<RRNavLinkProps, "to" | "children"> {}

export const NavLink = (props: NavLinkProps) => {
  return <RRNavLink {...props} className={styles.link} />;
};
