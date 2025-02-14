export interface TableRowProps {
  children: React.ReactNode;
}

export const TableRow = ({ children }: TableRowProps): JSX.Element => (
  <tr>{children}</tr>
);
