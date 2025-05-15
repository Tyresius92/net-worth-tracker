import { useId, useMemo } from "react";
import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  Bar,
  // Tooltip
} from "recharts";

import { NormalizedNetWorth } from "~/utils/accountUtils";
import { formatCurrency } from "~/utils/currencyUtils";

export interface NetWorthChartProps {
  data: NormalizedNetWorth;
}

export const NetWorthChart = (props: NetWorthChartProps) => {
  const id = useId();

  const accountIds = props.data.accounts.map((acc) => acc.accountId);
  const normalizedData = useMemo(() => {
    const result = [];

    const months = props.data.netWorth.map((entry) => entry.date);

    for (let i = 0; i < months.length; i++) {
      const row: Record<string, number | string> = {
        date: months[i],
        netWorth: props.data.netWorth[i].amount / 100,
      };

      for (const account of props.data.accounts) {
        const balance = (account.balances[i]?.amount ?? 0) / 100;
        row[account.accountId] = balance;
      }

      result.push(row);
    }

    return result;
  }, [props.data]);

  return (
    <div>
      <ComposedChart id={id} width={730} height={250} data={normalizedData}>
        <XAxis
          dataKey="date"
          tickCount={Math.ceil(normalizedData.length / 2)}
        />
        <YAxis
          tickFormatter={(val) =>
            `${formatCurrency(val * 100 / 1000, { includeCents: false })}K`
          }
        />
        {/* <Tooltip /> */}
        {/* <Legend /> */}
        {/* <CartesianGrid stroke="#f5f5f5" /> */}
        {/* <Area type="monotone" dataKey="amt" fill="#8884d8" stroke="#8884d8" /> */}
        {accountIds.map((id) => (
          <Bar key={id} stackId="a" dataKey={id} barSize={20} fill="#413ea0" />
        ))}
        <Line type="monotone" dataKey="netWorth" stroke="#ff7300" />
      </ComposedChart>
    </div>
  );
};
