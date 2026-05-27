import styles from "./Divider.module.css";

export interface DividerProps {
  variant?: "default" | "light" | "heavy";
}

export const Divider = ({ variant = "default" }: DividerProps) => {
  return <hr className={styles[variant]} />;
};
