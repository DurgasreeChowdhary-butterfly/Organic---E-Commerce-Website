/** Format a number as Indian Rupees, e.g. formatCurrency(1499) -> "₹1,499". */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}
