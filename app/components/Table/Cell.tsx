import styles from "./Table.module.css";

export interface TableCellProps {
  children: React.ReactNode;
}

export const TableCell = ({ children }: TableCellProps): JSX.Element => {
  return <td className={styles.cell}>{children}</td>;
};
