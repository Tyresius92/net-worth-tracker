import { TableBody } from "./Body";
import { TableCell } from "./Cell";
import { TableColumnHeader } from "./ColumnHeader";
import { TableFoot } from "./Foot";
import { TableHead } from "./Head";
import { TableRow } from "./Row";
import { TableRowHeader } from "./RowHeader";
import styles from "./Table.module.css";

export interface TableProps {
  children: React.ReactNode;
  caption: string;
}

export const Table = ({ children, caption }: TableProps): JSX.Element => {
  return (
    <div className={styles["scroll-wrapper"]}>
      <table className={styles.table}>
        <caption className={styles.caption}>{caption}</caption>
        {children}
      </table>
    </div>
  );
};

Table.Head = TableHead;
Table.ColumnHeader = TableColumnHeader;
Table.RowHeader = TableRowHeader;

Table.Body = TableBody;
Table.Row = TableRow;
Table.Cell = TableCell;

Table.Foot = TableFoot;
