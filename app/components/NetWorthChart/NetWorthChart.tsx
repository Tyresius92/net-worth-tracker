"use client";
import { Account } from "@prisma/client";
import { useMemo } from "react";
import {
  VictoryAxis,
  VictoryBar,
  VictoryChart,
  VictoryLine,
  VictoryStack,
  VictoryTooltip,
} from "victory";

const colors = ["red", "blue"];

export interface NetWorthChartProps {
  accounts: {
    id: Account["id"];
    balances: {
      date: string;
      amount: number;
    }[];
  }[];
}

function dateDiffInDays(a: Date, b: Date) {
  const _MS_PER_DAY = 1000 * 60 * 60 * 24;
  // Discard the time and time-zone information.
  const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());

  return Math.floor((utc2 - utc1) / _MS_PER_DAY);
}

export const NetWorthChart = ({ accounts }: NetWorthChartProps) => {
  const data = useMemo(() => {
    let earliestDate: string | null = null;
    let latestDate: string | null = null;
    accounts.forEach((account) => {
      account.balances.forEach((balance) => {
        if (!earliestDate || !latestDate) {
          earliestDate = balance.date;
          latestDate = balance.date;
        }

        if (balance.date < earliestDate) {
          earliestDate = balance.date;
        }
        if (balance.date > latestDate) {
          latestDate = balance.date;
        }
      });
    });

    return accounts.map((account) => {
      const filledInDates = account.balances.reduce<
        { amount: number; date: string }[]
      >((newArray, currentModel, index, originalArray) => {
        const nextModel = originalArray[index + 1];

        if (index === 0 && nextModel) {
          const currentDate = earliestDate;
          const daysBetween = dateDiffInDays(new Date(currentDate!), new Date(nextModel.date));

          const fillerDates = Array.from(
            { length: daysBetween - 1 },
            (value, dayIndex) => {
              const foo = new Date(currentDate!);
              foo.setDate(foo.getDate() + dayIndex + 1);

              return {
                amount: currentModel.amount,
                date: foo.toISOString().substring(0, 10),
              };
            },
          );
          newArray.push(currentModel, ...fillerDates);
        }

        if (
          index === originalArray.length - 1 &&
          currentModel.date < latestDate!
        ) {
          const currentDate = currentModel.date;
          const daysBetween = dateDiffInDays(new Date(currentDate), new Date(latestDate!));

          const fillerDates = Array.from(
            { length: daysBetween - 1 },
            (value, dayIndex) => {
              const foo = new Date(currentDate!);
              foo.setDate(foo.getDate() + dayIndex + 1);

              return {
                amount: currentModel.amount,
                date: foo.toISOString().substring(0, 10),
              };
            },
          );
          newArray.push(currentModel, ...fillerDates);
        }

        if (index !== 0 && nextModel) {
          const currentDate = currentModel.date;
          const daysBetween = dateDiffInDays(new Date(currentDate), new Date(nextModel.date));

          const fillerDates = Array.from(
            { length: daysBetween - 1 },
            (value, dayIndex) => {
              const foo = new Date(currentDate);
              foo.setDate(foo.getDate() + dayIndex + 1);

              return {
                amount: currentModel.amount,
                date: foo.toISOString().substring(0, 10),
              };
            },
          );

          newArray.push(currentModel, ...fillerDates);
        }

        return newArray;
      }, []);

      return {
        id: account.id,
        balances: filledInDates,
      };
    });
  }, [accounts]);

  const netWorth = useMemo(() => {
    const map = data.reduce<Record<string, number>>((acc, curr) => {
      curr.balances.forEach((bal) => {
        const key = bal.date;
        if (!acc[key]) {
          acc[key] = 0;
        }
        acc[key] += bal.amount;
      });

      return acc;
    }, {});

    return Object.entries(map).map(([dateStr, bal]) => ({
      x: dateStr,
      y: bal / 100,
    }));
  }, [data]);

  console.log("asdf data", {
    data,
    netWorth,
  });

  return (
    <div>
      <div>
        <VictoryChart>
          <VictoryAxis
            crossAxis
            style={{
              tickLabels: { angle: -60, paddingBlockStart: 50 },
            }}
            tickCount={10}
          />
          <VictoryAxis dependentAxis />
          <VictoryStack>
            {data.map((account, index) => {
              return (
                <VictoryBar
                  style={{
                    data: {
                      fill: colors[index % colors.length],
                    },
                  }}
                  key={account.id}
                  data={account.balances.map((bal) => ({
                    x: bal.date,
                    y: bal.amount / 100,
                  }))}
                />
              );
            })}
          </VictoryStack>
          <VictoryLine
            labelComponent={<VictoryTooltip labelPlacement="parallel" />}
            data={netWorth.map((val) => ({
              ...val,
              x: val.x,
            }))}
          />
        </VictoryChart>
      </div>
      <div>
        <pre>{JSON.stringify(accounts, undefined, 2)}</pre>
      </div>
    </div>
  );
};
