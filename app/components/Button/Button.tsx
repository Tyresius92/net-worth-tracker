import React from "react";

import styles from "./Button.module.css";

export interface ButtonProps extends Pick<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "children" | "onClick" | "type" | "name" | "value" | "disabled"
> {
  variant?: "primary" | "secondary" | "danger";
}

export const Button = ({ variant = "primary", ...props }: ButtonProps) => {
  return (
    <button className={`${styles.button} ${styles[variant]}`} {...props} />
  );
};
