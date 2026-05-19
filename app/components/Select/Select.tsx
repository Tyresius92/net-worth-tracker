import { useId } from "react";

import { Box } from "../Box/Box";

import styles from "./Select.module.css";

export interface SelectProps {
  name: string;
  label: string;
  options: {
    value: string;
    label: string;
  }[];
  defaultValue?: string;
  disabled?: boolean;
  errorMessage?: string;
}

export const Select = ({
  label,
  name,
  options,
  defaultValue,
  disabled,
  errorMessage,
}: SelectProps) => {
  const inputId = useId();
  const errorId = useId();

  return (
    <Box display="flex" flexDirection="column" gap={4} mb={20}>
      <label htmlFor={inputId} className={styles.label}>
        {label}
      </label>

      <select
        name={name}
        id={inputId}
        defaultValue={defaultValue}
        disabled={disabled}
        aria-describedby={errorId}
        aria-invalid={errorMessage ? true : undefined}
        className={styles.select}
      >
        <option value="">--Please choose an option--</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {errorMessage ? (
        <div id={errorId} className={styles.error_message}>
          &#9888; {errorMessage}
        </div>
      ) : null}
    </Box>
  );
};
