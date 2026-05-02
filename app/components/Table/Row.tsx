import styles from "./Table.module.css";

export interface TableRowProps {
  children: React.ReactNode;
}

export const TableRow = ({ children }: TableRowProps): JSX.Element => (
  <tr className={styles.row}>{children}</tr>
);
