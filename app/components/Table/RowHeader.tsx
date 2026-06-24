import styles from "./Table.module.css";

export interface TableColumnHeaderProps {
  children: React.ReactNode;
}

export const TableRowHeader = ({
  children,
}: TableColumnHeaderProps) => {
  return (
    <th scope="row" className={styles["row-header"]}>
      {children}
    </th>
  );
};
