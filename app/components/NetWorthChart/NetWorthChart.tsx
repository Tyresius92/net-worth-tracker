"use client";
import { VictoryChart, VictoryLine } from "victory";

export interface NetWorthChartProps {
  data: {
    x: Date;
    y: number;
  }[];
}

export const NetWorthChart = ({ data }: NetWorthChartProps) => {
  return (
    <div>
      <div>
        <VictoryChart>
          <VictoryLine data={data} />
        </VictoryChart>
      </div>
      <div>{JSON.stringify(data, undefined, 2)}</div>
    </div>
  );
};
