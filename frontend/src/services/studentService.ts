import type {
  DashboardStats,
  PaginatedResponse,
  Student,
  StudentFilters,
  StudentPayload,
  StudentQuery,
} from "../types";
import { api } from "./api";

function filterParams(filters: StudentFilters): Record<string, string | number> {
  const params: Record<string, string | number> = {};
  if (filters.search) params.search = filters.search;
  if (filters.status) params.status = filters.status;
  if (filters.department) params.department = filters.department;
  if (filters.year_level !== "") params.year_level = filters.year_level;
  if (filters.ordering) params.ordering = filters.ordering;
  return params;
}

export async function fetchStudents(query: StudentQuery): Promise<PaginatedResponse<Student>> {
  const { data } = await api.get<PaginatedResponse<Student>>("/students/", {
    params: { ...filterParams(query), page: query.page },
  });
  return data;
}

export async function createStudent(payload: StudentPayload): Promise<Student> {
  const { data } = await api.post<Student>("/students/", payload);
  return data;
}

export async function updateStudent(id: number, payload: Partial<StudentPayload>): Promise<Student> {
  const { data } = await api.patch<Student>(`/students/${id}/`, payload);
  return data;
}

export async function deleteStudent(id: number): Promise<void> {
  await api.delete(`/students/${id}/`);
}

export async function fetchStats(): Promise<DashboardStats> {
  const { data } = await api.get<DashboardStats>("/students/stats/");
  return data;
}

export async function exportStudentsCsv(filters: StudentFilters): Promise<Blob> {
  const { data } = await api.get<Blob>("/students/export/", {
    params: filterParams(filters),
    responseType: "blob",
  });
  return data;
}