export interface TableCellProps {
  children: React.ReactNode;
}

export const TableCell = ({ children }: TableCellProps): JSX.Element => {
  return (
    <td
      style={{
        paddingBlock: 4,
        paddingInline: 8,
        borderWidth: 1,
        borderStyle: "solid",
        borderColor: "var(--color-slate-8)",
      }}
    >
      {children}
    </td>
  );
};
