import { Outlet } from "react-router";

import styles from "./layout.module.css";

export default function LoginLayout() {
  return (
    <div className={styles.layout}>
      <Outlet />
    </div>
  );
}
