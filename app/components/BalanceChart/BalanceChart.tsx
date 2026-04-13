import { useEffect, useState } from "react";
import {
  ComposedChart,
  Line,
  ReferenceLine,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { formatCurrency } from "~/utils/currencyUtils";

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
    <div style={{}}>
      <h2>Your net worth history</h2>
      <div
        style={{
          alignItems: "center",
          backgroundColor: "var(--color-sand-5)",
          borderRadius: 32,
          display: "flex",
          width: 730,
          height: 400,
        }}
      >
        <ComposedChart
          // id="asdf"
          width={730}
          height={400}
          margin={{
            right: 20,
            left: 20,
            top: 20,
            bottom: 20,
          }}
          data={balances.map((snap) => ({
            date: snap.date,
            amount: snap.amount / 100,
          }))}
        >
          {/* <Legend /> */}
          <XAxis
            dataKey="date"
            height={90}
            minTickGap={20}
            angle={-60}
            textAnchor="end"
          />
          <YAxis
            tickFormatter={(val) =>
              formatCurrency(val * 100, { includeCents: false })
            }
          />
          <Tooltip
            formatter={(val) => {
              if (typeof val !== "number") {
                return `Invalid type: ${typeof val}`;
              }

              return formatCurrency(val * 100);
            }}
          />
          <ReferenceLine y={0} stroke="#000" />
          <Line
            isAnimationActive={false}
            type="monotone"
            dataKey="amount"
            stroke="green"
            dot={false}
            activeDot={true}
          />
        </ComposedChart>
      </div>
    </div>
  );
};
