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
