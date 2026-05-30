import styles from "./Table.module.css";

export interface TableFootProps {
  children: React.ReactNode;
}

export const TableFoot = ({ children }: TableFootProps): JSX.Element => {
  return (
    <tfoot className={styles.foot}>
      <tr>{children}</tr>
    </tfoot>
  );
};
