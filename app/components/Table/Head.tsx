import styles from "./Table.module.css";

export interface TableHeadProps {
  children: React.ReactNode;
}

export const TableHead = ({ children }: TableHeadProps): JSX.Element => {
  return (
    <thead className={styles.head}>
      <tr>{children}</tr>
    </thead>
  );
};
