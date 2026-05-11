import type { LoaderFunctionArgs } from "react-router";
import { useLoaderData } from "react-router";

import { Box } from "~/components/Box/Box";
import { Divider } from "~/components/Divider/Divider";
import { Link } from "~/components/Link/Link";
import { getRecoveryCodeCount } from "~/models/recovery-code.server";
import { requireUser } from "~/session.server";

import styles from "./settings.module.css";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await requireUser(request);

  const recoveryCodeCount = user.twoFactorEnabled
    ? await getRecoveryCodeCount(user.id)
    : null;

  return { twoFactorEnabled: user.twoFactorEnabled, recoveryCodeCount };
};

export default function SettingsRoute() {
  const { twoFactorEnabled, recoveryCodeCount } = useLoaderData<typeof loader>();

  return (
    <div className={styles.page}>
      <h1 className={styles.heading}>Settings</h1>

      <div className={styles.section}>
        <p className={styles.sectionHeading}>Two-Factor Authentication</p>
        <Box borderColor="sand-7">
          <div className={styles.row}>
            <span className={styles.label}>Status</span>
            <span className={styles.value}>
              {twoFactorEnabled ? (
                <span className={`${styles.badge} ${styles.enabled}`}>Enabled</span>
              ) : (
                <span className={`${styles.badge} ${styles.disabled}`}>Not enabled</span>
              )}
            </span>
          </div>

          <Divider variant="light" />

          {twoFactorEnabled ? (
            <>
              <div className={styles.row}>
                <span className={styles.label}>Recovery codes</span>
                <span className={styles.value}>
                  {recoveryCodeCount} of 10 remaining &middot;{" "}
                  <Link to="/settings/recovery-codes">Manage</Link>
                </span>
              </div>
            </>
          ) : (
            <div className={styles.row}>
              <span className={styles.label}>
                Protect your account with an authenticator app. Required to connect bank accounts
                via Plaid.
              </span>
              <span className={styles.value}>
                <Link to="/settings/enable_mfa">Set up</Link>
              </span>
            </div>
          )}
        </Box>
      </div>
    </div>
  );
}
