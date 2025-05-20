import { Box } from "../Box/Box";

import { TableBody } from "./Body";
import { TableCell } from "./Cell";
import { TableColumnHeader } from "./ColumnHeader";
import { TableHead } from "./Head";
import { TableRow } from "./Row";
import { TableRowHeader } from "./RowHeader";

export interface TableProps {
  children: React.ReactNode;
  caption: string;
}

export const Table = ({ children, caption }: TableProps): JSX.Element => {
  return (
    <Box>
      <table>
        <caption>{caption}</caption>
        {children}
      </table>
    </Box>
  );
};

Table.Head = TableHead;
Table.ColumnHeader = TableColumnHeader;
Table.RowHeader = TableRowHeader;

Table.Body = TableBody;
Table.Row = TableRow;
Table.Cell = TableCell;
