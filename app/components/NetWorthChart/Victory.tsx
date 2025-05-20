import {
  VictoryChart,
  VictoryLine,
  VictoryTheme,
  VictoryAxis,
  VictoryBar,
  VictoryStack,
} from "victory";

import { NormalizedNetWorth } from "~/utils/accountUtils";
import { formatCurrency } from "~/utils/currencyUtils";

export interface NetWorthChartProps {
  data: NormalizedNetWorth;
}

export const NetWorthChart = (props: NetWorthChartProps) => {
  return (
    <div>
      <VictoryChart theme={VictoryTheme.clean} domainPadding={{ x: 20, y: 20 }}>
        <VictoryLine
          data={props.data.netWorth.map((row) => ({
            x: row.date,
            y: row.amount / 100,
          }))}
        />
        <VictoryStack>
          {props.data.accounts.map((account) => (
            <VictoryBar
              key={account.accountId}
              data={account.balances.map((balance) => ({
                x: balance.date,
                y: balance.amount / 100,
                fill: balance.amount < 0 ? "red" : "green",
              }))}
              labels={({ datum }) => `${formatCurrency(datum.y * 100)}`}
            />
          ))}
        </VictoryStack>
        <VictoryAxis
          dependentAxis
          tickFormat={(value) =>
            formatCurrency(value * 100, { includeCents: false })
          }
        />
        <VictoryAxis orientation="bottom" offsetY={60} />
      </VictoryChart>
    </div>
  );
};
