import { useEffect, useState } from "react";
import {
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { VisuallyHidden } from "~/components/VisuallyHidden/VisuallyHidden";
import { formatCurrency } from "~/utils/currencyUtils";

import styles from "./BalanceChart.module.css";

export interface BalanceChartProps {
  balances: {
    date: string;
    amount: number;
  }[];
  title: string;
}

export const BalanceChart = ({ balances, title }: BalanceChartProps) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className={styles.wrapper} aria-label={title}>
      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart
          accessibilityLayer
          margin={{ right: 20, left: 20, top: 20, bottom: 20 }}
          data={balances.map((snap) => ({
            date: snap.date,
            amount: snap.amount / 100,
          }))}
        >
          <XAxis
            dataKey="date"
            height={90}
            minTickGap={20}
            angle={-60}
            textAnchor="end"
            tick={{
              fill: "var(--color-sand-11)",
              color: "var(--color-sand-11)",
              fontWeight: "bold",
            }}
            stroke="var(--color-sand-11)"
          />
          <YAxis
            tickFormatter={(val) =>
              formatCurrency(val * 100, { includeCents: false })
            }
            tick={{
              fill: "var(--color-sand-11)",
              color: "var(--color-sand-11)",
              fontWeight: "bold",
            }}
            stroke="var(--color-sand-11)"
          />
          <CartesianGrid
            horizontal
            vertical={false}
            color="var(--color-sand-5)"
          />
          <Tooltip
            formatter={(val) => {
              if (typeof val !== "number") {
                return `Invalid type: ${typeof val}`;
              }
              return formatCurrency(val * 100);
            }}
            contentStyle={{
              backgroundColor: "var(--color-sand-2)",
              borderRadius: 0,
              color: "var(--color-sand-12)",
            }}
          />
          <ReferenceLine y={0} stroke="var(--color-sand-12)" />
          <Line
            isAnimationActive={false}
            type="monotone"
            dataKey="amount"
            stroke="var(--color-sand-12)"
            strokeWidth={2}
            dot={false}
            activeDot={true}
          />
        </ComposedChart>
      </ResponsiveContainer>
      <VisuallyHidden>
        <table>
          <caption>{title}</caption>
          <thead>
            <tr>
              <th scope="col">Date</th>
              <th scope="col">Amount</th>
            </tr>
          </thead>
          <tbody>
            {balances.map((balance) => (
              <tr key={balance.date}>
                <td>{balance.date}</td>
                <td>{formatCurrency(balance.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </VisuallyHidden>
    </div>
  );
};
