import { useEffect, useState } from "react";
import {
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { formatCurrency } from "~/utils/currencyUtils";

import styles from "./BalanceChart.module.css";

export interface BalanceChartProps {
  balances: {
    date: string;
    amount: number;
  }[];
}

export const BalanceChart = ({ balances }: BalanceChartProps) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className={styles.wrapper}>
      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart
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
            tick={{ fill: "var(--color-sand-11)" }}
            stroke="var(--color-sand-7)"
          />
          <YAxis
            tickFormatter={(val) =>
              formatCurrency(val * 100, { includeCents: false })
            }
            tick={{ fill: "var(--color-sand-11)" }}
            stroke="var(--color-sand-7)"
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
              border: "1px solid var(--color-sand-7)",
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
            dot={false}
            activeDot={true}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};
