import type { Department, Gender, StudentStatus } from "./types";

export const PAGE_SIZE = 10;

export const DEPARTMENT_LABELS: Record<Department, string> = {
  computer_science: "Computer Science",
  engineering: "Engineering",
  business: "Business",
  arts: "Arts",
  science: "Science",
};

export const STATUS_LABELS: Record<StudentStatus, string> = {
  active: "Active",
  inactive: "Inactive",
  graduated: "Graduated",
};

export const GENDER_LABELS: Record<Gender, string> = {
  male: "Male",
  female: "Female",
  other: "Other",
};

export const DEPARTMENTS = Object.keys(DEPARTMENT_LABELS) as Department[];
export const STATUSES = Object.keys(STATUS_LABELS) as StudentStatus[];
export const GENDERS = Object.keys(GENDER_LABELS) as Gender[];
export const YEAR_LEVELS = [1, 2, 3, 4, 5, 6];

export const ACCENT_THEMES = {
  indigo: { label: "Indigo", color: "#4f46e5" },
  emerald: { label: "Emerald", color: "#059669" },
  rose: { label: "Rose", color: "#e11d48" },
  amber: { label: "Amber", color: "#d97706" },
  sky: { label: "Sky", color: "#0284c7" },
  violet: { label: "Violet", color: "#7c3aed" },
} as const;

export type AccentKey = keyof typeof ACCENT_THEMES;