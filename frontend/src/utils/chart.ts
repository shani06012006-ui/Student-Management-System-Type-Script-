import type { StudentStatus } from "../types";

export const STATUS_COLORS: Record<StudentStatus, string> = {
  active: "#10b981",
  inactive: "#ef4444",
  graduated: "#0ea5e9",
};

export const PALETTE = ["#6366f1", "#10b981", "#f59e0b", "#0ea5e9", "#ec4899", "#8b5cf6"];

/** Colors for Recharts axes, grid and tooltips in light or dark mode. */
export function chartTheme(dark: boolean) {
  const border = dark ? "#1f2a40" : "#e2e8f0";
  return {
    tick: dark ? "#94a3b8" : "#64748b",
    grid: border,
    tooltip: {
      background: dark ? "#111a2e" : "#ffffff",
      border: `1px solid ${border}`,
      borderRadius: 10,
      color: dark ? "#e2e8f0" : "#0f172a",
      fontSize: 13,
      boxShadow: "0 8px 24px rgba(15, 23, 42, 0.12)",
    },
  };
}