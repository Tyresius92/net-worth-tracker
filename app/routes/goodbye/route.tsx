import { Divider } from "~/components/Divider/Divider";
import { Link } from "~/components/Link/Link";

import styles from "./goodbye.module.css";

export default function GoodbyePage() {
  return (
    <article className={styles.article}>
      <div className={styles.headlineArea}>
        <Divider variant="light" />
        <h1>Account Deleted</h1>
        <Divider variant="light" />
      </div>

      <p className={styles.body}>
        Your account and all associated data have been permanently deleted. We
        hope to see you again someday.
      </p>

      <p>
        <Link to="/login">Return to login</Link>
      </p>
    </article>
  );
}
