export interface TableHeadProps {
  children: React.ReactNode;
}

export const TableHead = ({ children }: TableHeadProps): JSX.Element => {
  return (
    <thead>
      <tr>{children}</tr>
    </thead>
  );
};
