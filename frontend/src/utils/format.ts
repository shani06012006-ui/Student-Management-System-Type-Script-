export function initials(first: string, last = ""): string {
  return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
}

/** Accepts "YYYY-MM-DD" (parsed as local date) or a full ISO timestamp. */
export function formatDate(value: string): string {
  const normalized = value.length === 10 ? `${value}T00:00:00` : value;
  return new Date(normalized).toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/** "2026-03" -> "Mar 26" */
export function formatMonth(value: string): string {
  const [year, month] = value.split("-").map(Number);
  return new Date(year, month - 1, 1).toLocaleDateString(undefined, {
    month: "short",
    year: "2-digit",
  });
}

export function percent(part: number, whole: number): number {
  return whole === 0 ? 0 : Math.round((part / whole) * 100);
}

export function gpaTone(gpa: string | number | null): "good" | "mid" | "low" | "none" {
  if (gpa === null) return "none";
  const value = Number(gpa);
  if (value >= 3.5) return "good";
  if (value >= 2.5) return "mid";
  return "low";
}