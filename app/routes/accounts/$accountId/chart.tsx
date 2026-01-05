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

export interface AccountChartProps {
  balances: {
    date: string;
    amount: number;
  }[];
}

export const AccountChart = ({ balances }: AccountChartProps) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div style={{ width: 730, height: 350 }}>
      <ComposedChart
        id="asdf"
        width={730}
        height={450}
        margin={{
          right: 20,
          left: 20,
          // top: 20, bottom: 20
        }}
        data={balances.map((snap) => ({
          date: snap.date,
          amount: snap.amount / 100,
        }))}
      >
        <XAxis
          dataKey="date"
          // tickMargin={40}
          height={200}
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
  );
};
