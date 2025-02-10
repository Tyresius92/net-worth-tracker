export interface TableColumnHeaderProps {
  children: React.ReactNode;
}

export const TableColumnHeader = ({
  children,
}: TableColumnHeaderProps): JSX.Element => {
  return (
    <th
      scope="col"
      style={{
        paddingBlock: 4,
        paddingInline: 8,
        fontWeight: "bold",
        borderWidth: 1,
        borderStyle: "solid",
        borderColor: "black",
        textAlign: "start",
        minWidth: "fit-content",
      }}
    >
      {children}
    </th>
  );
};
