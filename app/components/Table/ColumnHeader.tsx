import styles from "./Table.module.css";

export interface TableColumnHeaderProps {
  children: React.ReactNode;
}

export const TableColumnHeader = ({
  children,
}: TableColumnHeaderProps): JSX.Element => {
  return (
    <th scope="col" className={styles["column-header"]}>
      {children}
    </th>
  );
};
