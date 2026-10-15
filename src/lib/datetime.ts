/** Absolute date-time for logs, or an em dash when absent */
export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString();
}

/** Short relative time: "in 4 min", "2 h ago" */
export function formatRelative(iso: string | null | undefined): string {
  if (!iso) return "";
  const diffMs = new Date(iso).getTime() - Date.now();
  if (Number.isNaN(diffMs)) return "";

  const abs = Math.abs(diffMs);
  const minutes = Math.round(abs / 60_000);
  const hours = Math.round(abs / 3_600_000);
  const days = Math.round(abs / 86_400_000);

  const value =
    abs < 60_000
      ? "<1 min"
      : minutes < 60
        ? `${minutes} min`
        : hours < 24
          ? `${hours} h`
          : `${days} d`;

  return diffMs >= 0 ? `in ${value}` : `${value} ago`;
}
