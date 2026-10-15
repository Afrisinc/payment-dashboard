export type MobileNetwork = "MTN" | "Airtel";

const RWANDA_MOBILE = /^(?:250|0)?(7[2389]\d{7})$/;

/**
 * Parse a Rwanda mobile money number (0788123456, +250788123456, 250788123456, 788123456).
 * Returns null when the number is not a valid MTN or Airtel Rwanda number.
 */
export function parseRwandaPhone(
  input: string,
): { local: string; international: string; network: MobileNetwork } | null {
  const digits = input.replace(/\D/g, "");
  const match = RWANDA_MOBILE.exec(digits);
  if (!match) return null;

  const subscriber = match[1];
  const network: MobileNetwork =
    subscriber.startsWith("78") || subscriber.startsWith("79")
      ? "MTN"
      : "Airtel";

  return {
    local: `0${subscriber}`,
    international: `250${subscriber}`,
    network,
  };
}

/** Format a phone number for display: 0788 123 456 */
export function formatRwandaPhone(input: string): string {
  const parsed = parseRwandaPhone(input);
  if (!parsed) return input;
  const local = parsed.local;
  return `${local.slice(0, 4)} ${local.slice(4, 7)} ${local.slice(7)}`;
}
