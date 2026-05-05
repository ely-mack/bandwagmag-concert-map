const MOUNTAIN_TZ = "America/Denver";

export function formatShowDate(ms: number): string {
  return new Date(ms).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: MOUNTAIN_TZ,
  });
}

export function formatShowDateShort(ms: number): string {
  return new Date(ms).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: MOUNTAIN_TZ,
  });
}

export function formatShowTime(ms: number): string {
  return new Date(ms).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: MOUNTAIN_TZ,
  });
}

export function formatShowDateTime(ms: number): string {
  return `${formatShowDateShort(ms)} · ${formatShowTime(ms)}`;
}

export function formatPrice(cents?: number): string | undefined {
  if (typeof cents !== "number") return undefined;
  const dollars = cents >= 100 ? cents / 100 : cents;
  return `$${dollars.toFixed(dollars % 1 === 0 ? 0 : 2)}`;
}
