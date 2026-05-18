import type { ReactNode } from "react";
import { Link as RRLink, LinkProps as RRLinkProps } from "react-router";

import styles from "./Link.module.css";

interface InternalLinkProps extends Pick<RRLinkProps, "to" | "children"> {}
interface ExternalLinkProps {
  href: URL;
  children: ReactNode;
  newTab?: boolean;
}

export type LinkProps = InternalLinkProps | ExternalLinkProps;

export const Link = (props: LinkProps) => {
  if ("href" in props) {
    return (
      <a
        {...props}
        href={props.href.toString()}
        {...(props.newTab && {
          target: "_blank",
          rel: "noopener noreferrer",
        })}
        className={styles.link}
      >
        {props.children}
      </a>
    );
  }
  return <RRLink {...props} className={styles.link} />;
};
