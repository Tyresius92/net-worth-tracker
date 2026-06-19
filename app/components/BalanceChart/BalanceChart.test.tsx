import { render, screen } from "@testing-library/react";
import { beforeAll, describe, expect, it, vi } from "vitest";

import { BalanceChart } from "./BalanceChart";

beforeAll(() => {
  global.ResizeObserver = class ResizeObserver {
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
  };
});

const BALANCES = [
  { date: "Jan 1, 2024", amount: 100000 },
  { date: "Feb 1, 2024", amount: 150000 },
];

describe("BalanceChart", () => {
  it("renders the accessible table with the chart title as caption", () => {
    render(<BalanceChart balances={BALANCES} title="Net Worth" />);
    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(screen.getByText("Net Worth")).toBeInTheDocument();
  });

  it("renders a row for each balance entry plus the header row", () => {
    render(<BalanceChart balances={BALANCES} title="Net Worth" />);
    expect(screen.getAllByRole("row")).toHaveLength(3); // 1 header + 2 data rows
  });

  it("renders the date for each balance entry", () => {
    render(<BalanceChart balances={BALANCES} title="Net Worth" />);
    expect(screen.getByText("Jan 1, 2024")).toBeInTheDocument();
    expect(screen.getByText("Feb 1, 2024")).toBeInTheDocument();
  });

  it("renders the formatted amount for each balance entry", () => {
    render(<BalanceChart balances={BALANCES} title="Net Worth" />);
    expect(screen.getByText("$1,000.00")).toBeInTheDocument();
    expect(screen.getByText("$1,500.00")).toBeInTheDocument();
  });
});
