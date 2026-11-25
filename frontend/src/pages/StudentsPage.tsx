import { useEffect, useState } from "react";
import { StudentForm } from "../components/StudentForm";
import { DEPARTMENTS, DEPARTMENT_LABELS, PAGE_SIZE, STATUSES, STATUS_LABELS } from "../constants";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import { getErrorMessage } from "../services/errors";
import {
  createStudent,
  deleteStudent,
  fetchStudents,
  updateStudent,
} from "../services/studentService";
import type { Department, PaginatedResponse, Student, StudentPayload, StudentStatus } from "../types";

/** Discriminated union: the form is either closed, adding, or editing a specific student. */
type FormMode = { kind: "closed" } | { kind: "create" } | { kind: "edit"; student: Student };

export function StudentsPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StudentStatus | "">("");
  const [department, setDepartment] = useState<Department | "">("");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search, 350);

  const [data, setData] = useState<PaginatedResponse<Student> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const [mode, setMode] = useState<FormMode>({ kind: "closed" });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Any filter change goes back to page 1.
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, status, department]);

  // Fetch whenever a query input changes. The `active` flag ignores stale responses.
  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchStudents({ page, search: debouncedSearch, status, department })
      .then((res) => {
        if (active) {
          setData(res);
          setError(null);
        }
      })
      .catch((err: unknown) => {
        if (active) setError(getErrorMessage(err, "Failed to load students"));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [page, debouncedSearch, status, department, reloadKey]);

  useEffect(() => {
    if (!notice) return;
    const id = window.setTimeout(() => setNotice(null), 3000);
    return () => window.clearTimeout(id);
  }, [notice]);

  const handleSave = async (payload: StudentPayload) => {
    setSaving(true);
    setFormError(null);
    try {
      if (mode.kind === "edit") {
        await updateStudent(mode.student.id, payload);
        setNotice("Student updated successfully");
      } else {
        await createStudent(payload);
        setNotice("Student added successfully");
      }
      setMode({ kind: "closed" });
      setReloadKey((k) => k + 1);
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (student: Student) => {
    if (!window.confirm(`Delete ${student.full_name}? This cannot be undone.`)) return;
    try {
      await deleteStudent(student.id);
      setNotice("Student deleted");
      setReloadKey((k) => k + 1);
    } catch (err) {
      setError(getErrorMessage(err, "Delete failed"));
    }
  };

  const openCreate = () => {
    setFormError(null);
    setMode({ kind: "create" });
  };

  const openEdit = (student: Student) => {
    setFormError(null);
    setMode({ kind: "edit", student });
  };

  const closeForm = () => setMode({ kind: "closed" });

  const totalPages = data ? Math.max(1, Math.ceil(data.count / PAGE_SIZE)) : 1;
  const rows = data?.results ?? [];

  return (
    <section>
      <header className="page-header">
        <div>
          <h1>Students</h1>
          <p className="muted">{data ? `${data.count} total records` : "Loading…"}</p>
        </div>
        <button type="button" className="btn btn--primary" onClick={openCreate}>
          + Add student
        </button>
      </header>

      {notice && <div className="toast">{notice}</div>}

      <div className="toolbar">
        <input
          className="input toolbar__search"
          placeholder="Search by name, email or ID…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className="input" value={status} onChange={(e) => setStatus(e.target.value as StudentStatus | "")}>
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
          ))}
        </select>
        <select className="input" value={department} onChange={(e) => setDepartment(e.target.value as Department | "")}>
          <option value="">All departments</option>
          {DEPARTMENTS.map((d) => (
            <option key={d} value={d}>{DEPARTMENT_LABELS[d]}</option>
          ))}
        </select>
      </div>

      {error && <div className="alert alert--error">{error}</div>}

      <div className="card card--table">
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Department</th>
                <th>Year</th>
                <th>GPA</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && rows.length === 0 && (
                <tr><td colSpan={8} className="center muted">Loading students…</td></tr>
              )}
              {!loading && rows.length === 0 && (
                <tr><td colSpan={8} className="center muted">No students match your filters.</td></tr>
              )}
              {rows.map((student) => (
                <tr key={student.id}>
                  <td className="mono">{student.student_id ?? "—"}</td>
                  <td>
                    <div className="person">
                      <div className="avatar avatar--sm">{student.first_name.charAt(0)}</div>
                      {student.full_name}
                    </div>
                  </td>
                  <td>{student.email}</td>
                  <td>{DEPARTMENT_LABELS[student.department]}</td>
                  <td>Year {student.year_level}</td>
                  <td>{student.gpa ?? "—"}</td>
                  <td>
                    <span className={`badge badge--${student.status}`}>{STATUS_LABELS[student.status]}</span>
                  </td>
                  <td className="text-right">
                    <button type="button" className="btn btn--ghost btn--sm" onClick={() => openEdit(student)}>
                      Edit
                    </button>
                    <button type="button" className="btn btn--danger btn--sm" onClick={() => handleDelete(student)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <footer className="pagination">
          <span className="muted">Page {page} of {totalPages}</span>
          <div>
            <button type="button" className="btn btn--ghost btn--sm" disabled={page <= 1 || loading} onClick={() => setPage((p) => p - 1)}>
              Previous
            </button>
            <button type="button" className="btn btn--ghost btn--sm" disabled={!data?.next || loading} onClick={() => setPage((p) => p + 1)}>
              Next
            </button>
          </div>
        </footer>
      </div>

      {mode.kind !== "closed" && (
        <StudentForm
          initial={mode.kind === "edit" ? mode.student : null}
          submitting={saving}
          serverError={formError}
          onSubmit={handleSave}
          onCancel={closeForm}
        />
      )}
    </section>
  );
}
