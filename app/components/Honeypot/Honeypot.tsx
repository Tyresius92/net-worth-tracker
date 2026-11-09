import { useId } from "react";

import styles from "./Honeypot.module.css";

interface HoneypotProps {
  /** The form field name the server checks. Should look like a plausible field (e.g. "website"). */
  name: string;
}

/**
 * A form field that real people never see or reach. Bots that fill in every
 * input will fill it in, which the server treats as a sign of automation.
 */
export const Honeypot = ({ name }: HoneypotProps) => {
  const id = useId();

  return (
    <div aria-hidden="true" className={styles.honeypot}>
      <label htmlFor={id}>Leave this field empty</label>
      <input
        id={id}
        type="text"
        name={name}
        tabIndex={-1}
        autoComplete="off"
        defaultValue=""
      />
    </div>
  );
};
