export type Gender = "male" | "female" | "other";
export type StudentStatus = "active" | "inactive" | "graduated";
export type Department =
  | "computer_science"
  | "engineering"
  | "business"
  | "arts"
  | "science";

/** Shape returned by the Django API for a student. */
export interface Student {
  id: number;
  student_id: string | null;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  phone: string;
  date_of_birth: string | null;
  gender: Gender;
  department: Department;
  year_level: number;
  /** DRF serializes DecimalField as a string, e.g. "3.82". */
  gpa: string | null;
  status: StudentStatus;
  address: string;
  enrollment_date: string;
  created_at: string;
  updated_at: string;
}

/** Writable fields only; used for create / update requests. */
export type StudentPayload = Omit<
  Student,
  "id" | "student_id" | "full_name" | "created_at" | "updated_at"
>;

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface TokenPair {
  access: string;
  refresh: string;
}

export interface DepartmentStat {
  department: Department;
  label: string;
  count: number;
  active: number;
  average_gpa: number | null;
}

export interface YearStat {
  year_level: number;
  count: number;
}

export interface GenderStat {
  gender: Gender;
  label: string;
  count: number;
}

export interface GpaBand {
  label: string;
  count: number;
}

export interface EnrollmentPoint {
  /** "YYYY-MM" */
  month: string;
  count: number;
}

export interface DashboardStats {
  total: number;
  active: number;
  inactive: number;
  graduated: number;
  average_gpa: number | null;
  by_department: DepartmentStat[];
  by_year: YearStat[];
  by_gender: GenderStat[];
  gpa_distribution: GpaBand[];
  enrollment_trend: EnrollmentPoint[];
  recent: Student[];
  top_students: Student[];
}

/** Everything that filters the student list (no pagination). */
export interface StudentFilters {
  search: string;
  status: StudentStatus | "";
  department: Department | "";
  year_level: number | "";
  ordering: string;
}

export interface StudentQuery extends StudentFilters {
  page: number;
}