import type {
  DashboardStats,
  PaginatedResponse,
  Student,
  StudentPayload,
  StudentQuery,
} from "../types";
import { api } from "./api";

export async function fetchStudents(query: StudentQuery): Promise<PaginatedResponse<Student>> {
  const params: Record<string, string | number> = { page: query.page };
  if (query.search) params.search = query.search;
  if (query.status) params.status = query.status;
  if (query.department) params.department = query.department;

  const { data } = await api.get<PaginatedResponse<Student>>("/students/", { params });
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
