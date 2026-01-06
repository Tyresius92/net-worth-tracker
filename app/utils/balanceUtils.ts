export interface BalanceDay {
  date: string; // YYYY-MM-DD
  amount: number;
}

export const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Parses a YYYY-MM-DD date string into a Date object
 * Forces local midnight, avoids timezone shifting
 */
export const parseDate = (date: string): Date => {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(y, m - 1, d);
};

/**
 * Formats a Date object into a YYYY-MM-DD string
 */
export const formatDate = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

/**
 * Adds the specified number of days to a Date
 */
export const addDays = (date: Date, days: number): Date => {
  return new Date(date.getTime() + days * DAY_MS);
};

/**
 * Returns the current date at midnight (start of day)
 */
export const startOfToday = (): Date => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
};

/**
 * Fills sparse daily BalanceDay data by carrying the last known value forward.
 */
export const fillDailyBalanceDayData = (data: BalanceDay[]): BalanceDay[] => {
  if (data.length === 0) return [];

  // Collapse duplicates (last one wins)
  const byDate = data.reduce<Map<string, BalanceDay>>((map, item) => {
    map.set(item.date, item);
    return map;
  }, new Map());

  const startDate = parseDate(data[0].date);
  const today = startOfToday();

  const result: BalanceDay[] = [];

  let current = startDate;
  let lastKnown: BalanceDay | undefined;

  while (current <= today) {
    const dateStr = formatDate(current);
    const existing = byDate.get(dateStr);

    if (existing) {
      lastKnown = existing;
    }

    if (lastKnown) {
      result.push({
        date: dateStr,
        amount: lastKnown.amount,
      });
    }

    current = addDays(current, 1);
  }

  return result;
};
