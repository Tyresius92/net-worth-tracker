import * as RadixCheckbox from "@radix-ui/react-checkbox";
import { useId } from "react";

import { Box } from "../Box/Box";

import styles from "./Checkbox.module.css";

export interface CheckboxProps {
  name: string;
  label: string;
  defaultChecked?: boolean;
  disabled?: boolean;
  required?: boolean;
}

export const Checkbox = ({
  label,
  name,
  defaultChecked,
  disabled,
  required,
}: CheckboxProps) => {
  const inputId = useId();

  return (
    <Box display="flex" alignItems="center" gap={8} mb={20}>
      <RadixCheckbox.Root
        id={inputId}
        name={name}
        defaultChecked={defaultChecked}
        disabled={disabled}
        required={required}
        className={styles.root}
      >
        <RadixCheckbox.Indicator className={styles.indicator}>
          <svg
            width="14"
            height="14"
            viewBox="0 0 10 10"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M1.5 5L4 7.5L8.5 2"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </RadixCheckbox.Indicator>
      </RadixCheckbox.Root>
      <label htmlFor={inputId} className={styles.label}>
        {label}
      </label>
    </Box>
  );
};
