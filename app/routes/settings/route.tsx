import type { LoaderFunctionArgs } from "react-router";
import { useLoaderData } from "react-router";

import { Box } from "~/components/Box/Box";
import { Divider } from "~/components/Divider/Divider";
import { Link } from "~/components/Link/Link";
import { getRecoveryCodeCount } from "~/models/recovery-code.server";
import { getUser, loginRedirect } from "~/session.server";

import styles from "./settings.module.css";

export const loader = async ({ request, url }: LoaderFunctionArgs) => {
  const user = await getUser(request);
  if (!user) return loginRedirect(url);

  const recoveryCodeCount = user.twoFactorEnabled
    ? await getRecoveryCodeCount(user.id)
    : null;

  return { twoFactorEnabled: user.twoFactorEnabled, recoveryCodeCount };
};

export default function SettingsRoute() {
  const { twoFactorEnabled, recoveryCodeCount } =
    useLoaderData<typeof loader>();

  return (
    <div className={styles.page}>
      <h1 className={styles.heading}>Settings</h1>

      <div className={styles.section}>
        <p className={styles.sectionHeading}>Two-Factor Authentication</p>
        <Box border={{ color: "sand-7" }}>
          <div className={styles.row}>
            <span className={styles.label}>Status</span>
            <span className={styles.value}>
              {twoFactorEnabled ? (
                <span className={`${styles.badge} ${styles.enabled}`}>
                  Enabled
                </span>
              ) : (
                <span className={`${styles.badge} ${styles.disabled}`}>
                  Not enabled
                </span>
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
                  <Link to="/settings/recovery_codes">Manage</Link>
                </span>
              </div>
              <Divider variant="light" />
              <div className={styles.row}>
                <span className={styles.label}>
                  Disable two-factor authentication
                </span>
                <span className={styles.value}>
                  <Link to="/settings/disable_mfa">Disable</Link>
                </span>
              </div>
            </>
          ) : (
            <div className={styles.row}>
              <span className={styles.label}>
                Protect your account with an authenticator app. Required to add
                wire services.
              </span>
              <span className={styles.value}>
                <Link to="/settings/enable_mfa">Set up</Link>
              </span>
            </div>
          )}
        </Box>
      </div>

      <div className={styles.section}>
        <p className={styles.sectionHeading}>Password</p>
        <Box border={{ color: "sand-7" }}>
          <div className={styles.row}>
            <span className={styles.label}>Change password</span>
            <span className={styles.value}>
              <Link to="/settings/change_password">Change</Link>
            </span>
          </div>
        </Box>
      </div>

      <div className={styles.section}>
        <p className={styles.sectionHeading}>The record</p>
        <Box border={{ color: "sand-7" }}>
          <div className={styles.row}>
            <span className={styles.label}>
              Download all figures as a spreadsheet
            </span>
            <span className={styles.value}>
              <Link to="/settings/export_data" reloadDocument>
                Download
              </Link>
            </span>
          </div>
          <Divider variant="light" />
          <div className={styles.row}>
            <span className={styles.label}>
              Upload a spreadsheet to import figures in bulk
            </span>
            <span className={styles.value}>
              <Link to="/settings/import_data">Import</Link>
            </span>
          </div>
        </Box>
      </div>

      <div className={styles.section}>
        <p className={styles.sectionHeading}>Danger Zone</p>
        <Box border={{ color: "red-7" }}>
          <div className={styles.row}>
            <span className={styles.label}>
              Permanently close your record and delete all associated data
            </span>
            <span className={styles.value}>
              <Link to="/settings/delete_account">Close your record</Link>
            </span>
          </div>
        </Box>
      </div>
    </div>
  );
}
