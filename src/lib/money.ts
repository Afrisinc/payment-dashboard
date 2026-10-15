/** Format an integer RWF amount: 12,500 RWF */
export function formatRwf(amount: number): string {
  return `${Math.round(amount).toLocaleString("en-US")} RWF`;
}
