import { useId } from "react";

import { Box } from "../Box/Box";
import { Flex } from "../Flex/Flex";

export interface SelectProps {
  name: string;
  label: string;
  options: {
    value: string;
    label: string;
  }[];
  defaultValue?: string;
  errorMessage?: string;
}

export const Select = ({
  label,
  name,
  options,
  defaultValue,
  errorMessage,
}: SelectProps) => {
  const inputId = useId();
  const errorId = useId();

  return (
    <Flex flexDirection="column" gap={4} mb={20}>
      <label htmlFor={inputId}>{label}</label>

      <select
        name={name}
        id={inputId}
        defaultValue={defaultValue}
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
    </Flex>
  );
};
