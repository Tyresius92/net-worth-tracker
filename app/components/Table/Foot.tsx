import styles from "./Table.module.css";

export interface TableFootProps {
  children: React.ReactNode;
}

export const TableFoot = ({ children }: TableFootProps) => {
  return (
    <tfoot className={styles.foot}>
      <tr>{children}</tr>
    </tfoot>
  );
};
