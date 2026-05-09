import styles from "./Divider.module.css";

export interface DividerProps {
  variant?: "default" | "light";
}

export const Divider = ({ variant = "default" }: DividerProps) => {
  return <hr className={variant === "light" ? styles.light : styles.divider} />;
};
