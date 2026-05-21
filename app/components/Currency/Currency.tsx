import { formatCurrency } from "~/utils/currencyUtils";

import styles from "./Currency.module.css";

export interface CurrencyProps {
  value: number;
  includeCents?: boolean;
}

export const Currency = ({ value, includeCents }: CurrencyProps) => {
  return (
    <span className={styles.currency}>
      {formatCurrency(value, { includeCents })}
    </span>
  );
};
