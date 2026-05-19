import { Divider } from "../Divider/Divider";
import { Link } from "../Link/Link";

import styles from "./Footer.module.css";

export interface FooterProps {
  user: { id: string } | null;
}

export const Footer = ({ user }: FooterProps) => {
  const year = new Date().getFullYear();

  return (
    <footer>
      <Divider />
      <div className={styles.footer}>
        <span className={styles.copyright}>© {year} Tyrel Clayton</span>
        <nav className={styles.links}>
          {!user ? (
            <>
              <Link
                href={
                  new URL("https://github.com/Tyresius92/net-worth-tracker")
                }
              >
                View source on GitHub
              </Link>
              <span className={styles.separator} aria-hidden="true">
                ·
              </span>
            </>
          ) : null}
          <Link to="privacy">Privacy policy</Link>
          <span className={styles.separator} aria-hidden="true">
            ·
          </span>
          <Link to="contact">Contact</Link>
        </nav>
      </div>
    </footer>
  );
};
