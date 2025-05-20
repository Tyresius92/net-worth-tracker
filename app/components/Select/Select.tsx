import { useId } from "react";

import { Box } from "../Box/Box";

export interface SelectProps {
  name: string;
  label: string;
  options: {
    value: string;
    label: string;
  }[];
  errorMessage?: string;
}

export const Select = ({ label, options, errorMessage }: SelectProps) => {
  const inputId = useId();
  const errorId = useId();

  return (
    <Box>
      <label htmlFor={inputId}>{label}</label>

      <select
        name="pets"
        id={inputId}
        aria-describedby={errorId}
        aria-invalid={errorMessage ? true : undefined}
      >
        <option value="">--Please choose an option--</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {errorMessage ? <Box id={errorId}>{errorMessage}</Box> : null}
    </Box>
  );
};
