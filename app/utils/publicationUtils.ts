const ROMAN_NUMERALS: [number, string][] = [
  [1000, "M"],
  [900, "CM"],
  [500, "D"],
  [400, "CD"],
  [100, "C"],
  [90, "XC"],
  [50, "L"],
  [40, "XL"],
  [10, "X"],
  [9, "IX"],
  [5, "V"],
  [4, "IV"],
  [1, "I"],
];

function toRoman(n: number): string {
  let result = "";
  let remaining = n;
  for (const [value, numeral] of ROMAN_NUMERALS) {
    while (remaining >= value) {
      result += numeral;
      remaining -= value;
    }
  }
  return result;
}

const EPOCH_MS = new Date("2025-10-14").getTime();
const MS_PER_DAY = 1000 * 60 * 60 * 24;

export function getDaysSinceEpoch(): number {
  return Math.floor((Date.now() - EPOCH_MS) / MS_PER_DAY);
}

export function getPublicationLabel(input: number): string {
  const vol = Math.ceil(input / 30);
  const no = ((input - 1) % 30) + 1;
  return `Vol ${toRoman(vol)} · No. ${toRoman(no)}`;
}
