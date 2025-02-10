
export interface TableColumnHeaderProps {
  children: React.ReactNode;
}

export const TableRowHeader = ({
  children,
}: TableColumnHeaderProps): JSX.Element => {
  return (
    <th scope="row">
      {children}
    </th>
  );
};
