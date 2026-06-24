import { useId, type InputHTMLAttributes, type Ref } from "react";

import { Box } from "../Box/Box";

import styles from "./TextInput.module.css";

interface TextInputProps
  extends Pick<
    InputHTMLAttributes<HTMLInputElement>,
    | "required"
    | "autoFocus"
    | "autoComplete"
    | "placeholder"
    | "pattern"
    | "defaultValue"
    | "disabled"
    | "step"
    | "minLength"
  > {
  label: string;
  name: string;
  type: "text" | "email" | "password" | "number" | "url" | "date";

  errorMessage?: string;
  hintText?: string;
  step?: number;
  ref?: Ref<HTMLInputElement>;
}

export const TextInput = ({
  label,
  errorMessage,
  hintText,
  ref,
  ...rest
}: TextInputProps) => {
  const inputId = useId();
  const errorId = useId();
  const hintId = useId();

  return (
    <Box display="flex" flexDirection="column" xsGap={4} xsMb={20}>
      <label htmlFor={inputId} className={styles.label}>
        {label}
      </label>
      <input
        id={inputId}
        ref={ref}
        aria-describedby={`${errorId} ${hintId}`}
        aria-invalid={errorMessage ? true : undefined}
        className={styles.input}
        {...rest}
      />
      {hintText ? (
        <div id={hintId} className={styles.hint}>
          &#9432; {hintText}
        </div>
      ) : null}
      {errorMessage ? (
        <div id={errorId} className={styles.error_message}>
          &#9888; {errorMessage}
        </div>
      ) : null}
    </Box>
  );
};
