export const formatCurrency = (cents: number, { includeCents = true } = {}) => {
  return Intl.NumberFormat("en", {
    style: "currency",
    currency: "usd",
    maximumFractionDigits: includeCents ? 2 : 0,
    minimumFractionDigits: includeCents ? 2 : 0,
  }).format(cents / 100);
};
