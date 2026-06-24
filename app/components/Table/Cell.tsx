import styles from "./Table.module.css";

type CellAlign = "start" | "end" | "center";

const alignClass: Partial<Record<CellAlign, string>> = {
  end: styles["cell-end"],
  center: styles["cell-center"],
};

export interface TableCellProps {
  children?: React.ReactNode;
  align?: CellAlign;
}

export const TableCell = ({ children, align = "start" }: TableCellProps) => {
  const modifier = alignClass[align];
  return (
    <td className={modifier ? `${styles.cell} ${modifier}` : styles.cell}>
      {children}
    </td>
  );
};
