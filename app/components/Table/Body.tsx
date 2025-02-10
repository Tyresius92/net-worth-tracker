export interface TableBodyProps {
  children: React.ReactNode;
}

export const TableBody = ({ children }: TableBodyProps): JSX.Element => {
  return <tbody>{children}</tbody>;
};
