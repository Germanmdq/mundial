const MATCH_DATE_FORMATTER = new Intl.DateTimeFormat("es-AR", {
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "America/Argentina/Buenos_Aires",
});

const MATCH_DATE_LONG_FORMATTER = new Intl.DateTimeFormat("es-AR", {
  day: "2-digit",
  month: "long",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "America/Argentina/Buenos_Aires",
});

export function formatMatchDate(kickoffAt?: string | null, variant: "short" | "long" = "short"): string {
  if (!kickoffAt) return "Por definir";

  const date = new Date(kickoffAt);
  if (Number.isNaN(date.getTime())) return "Por definir";

  return variant === "long" ? MATCH_DATE_LONG_FORMATTER.format(date) : MATCH_DATE_FORMATTER.format(date);
}
