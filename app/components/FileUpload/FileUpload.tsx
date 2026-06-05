import React, { useId } from "react";

import { Box } from "../Box/Box";

import styles from "./FileUpload.module.css";

type FileType = "csv" | "pdf" | "png" | "jpg" | "svg" | "xlsx" | "txt" | "json";

const FILE_TYPE_EXTENSIONS: Record<FileType, string[]> = {
  csv: [".csv"],
  pdf: [".pdf"],
  png: [".png"],
  jpg: [".jpg", ".jpeg"],
  svg: [".svg"],
  xlsx: [".xlsx"],
  txt: [".txt"],
  json: [".json"],
};

interface FileUploadProps
  extends Pick<
    React.InputHTMLAttributes<HTMLInputElement>,
    "required" | "autoFocus"
  > {
  label: string;
  name: string;
  accept?: FileType[];
  multiple?: boolean;
  hintText?: string;
  errorMessage?: string;
  disabled?: boolean;
}

export const FileUpload = ({
  label,
  name,
  accept,
  multiple,
  hintText,
  errorMessage,
  disabled,
  ...rest
}: FileUploadProps) => {
  const inputId = useId();
  const hintId = useId();
  const errorId = useId();

  return (
    <Box display="flex" flexDirection="column" xsGap={4} xsMb={20}>
      <label htmlFor={inputId} className={styles.label}>
        {label}
      </label>
      <input
        id={inputId}
        type="file"
        name={name}
        accept={accept?.flatMap((t) => FILE_TYPE_EXTENSIONS[t]).join(",")}
        multiple={multiple}
        disabled={disabled}
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
