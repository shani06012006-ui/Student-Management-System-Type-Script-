import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Pencil,
  Plus,
  Search,
  Trash2,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { EmptyState } from "../components/EmptyState";
import { StudentForm } from "../components/StudentForm";
import {
  DEPARTMENTS,
  DEPARTMENT_LABELS,
  PAGE_SIZE,
  STATUSES,
  STATUS_LABELS,
  YEAR_LEVELS,
} from "../constants";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import { getErrorMessage } from "../services/errors";
import {
  createStudent,
  deleteStudent,
  exportStudentsCsv,
  fetchStudents,
  updateStudent,
} from "../services/studentService";
import type {
  Department,
  PaginatedResponse,
  Student,
  StudentFilters,
  StudentPayload,
  StudentStatus,
} from "../types";
import { formatDate, gpaTone, initials } from "../utils/format";

type SortField = "first_name" | "student_id" | "year_level" | "gpa" | "enrollment_date";
interface SortState {
  field: SortField;
  dir: "asc" | "desc";
}
type FormMode = { kind: "closed" } | { kind: "create" } | { kind: "edit"; student: Student };

interface SortableHeaderProps {
  label: string;
  field: SortField;
  sort: SortState;
  onSort: (field: SortField) => void;
  className?: string;
}

function SortableHeader({ label, field, sort, onSort, className }: SortableHeaderProps) {
  const active = sort.field === field;
  const Icon = active ? (sort.dir === "asc" ? ArrowUp : ArrowDown) : ArrowUpDown;
  return (
    <th className={className}>
      <button
        type="button"
        className={`th-sort${active ? " th-sort--active" : ""}`}
        onClick={() => onSort(field)}
      >
        {label}
        <Icon size={14} />
      </button>
    </th>
  );
}

export function StudentsPage() {
  const [params, setParams] = useSearchParams();

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StudentStatus | "">(
    () => STATUSES.find((s) => s === params.get("status")) ?? "",
  );
  const [department, setDepartment] = useState<Department | "">(
    () => DEPARTMENTS.find((d) => d === params.get("department")) ?? "",
  );
  const [year, setYear] = useState<number | "">(() => {
    const value = Number(params.get("year"));
    return YEAR_LEVELS.includes(value) ? value : "";
  });
  const [sort, setSort] = useState<SortState>({ field: "enrollment_date", dir: "desc" });
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
  const [exporting, setExporting] = useState(false);

  const filters: StudentFilters = useMemo(
    () => ({
      search: debouncedSearch,
      status,
      department,
      year_level: year,
      ordering: sort.dir === "desc" ? `-${sort.field}` : sort.field,
    }),
    [debouncedSearch, status, department, year, sort],
  );

  // Any filter or sort change returns to page 1.
  useEffect(() => {
    setPage(1);
  }, [filters]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchStudents({ ...filters, page })
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
  }, [filters, page, reloadKey]);

  useEffect(() => {
    if (!notice) return;
    const id = window.setTimeout(() => setNotice(null), 3000);
    return () => window.clearTimeout(id);
  }, [notice]);

  // Opens the create form when arriving from the sidebar "Add student" button.
  const openNew = params.get("new") === "1";
  useEffect(() => {
    if (!openNew) return;
    setFormError(null);
    setMode({ kind: "create" });
    const next = new URLSearchParams(params);
    next.delete("new");
    setParams(next, { replace: true });
  }, [openNew, params, setParams]);

  const toggleSort = (field: SortField) =>
    setSort((prev) =>
      prev.field === field
        ? { field, dir: prev.dir === "asc" ? "desc" : "asc" }
        : { field, dir: "asc" },
    );

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

  const handleExport = async () => {
    setExporting(true);
    try {
      const blob = await exportStudentsCsv(filters);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `students-${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      setNotice("CSV exported");
    } catch (err) {
      setError(getErrorMessage(err, "Export failed"));
    } finally {
      setExporting(false);
    }
  };

  const rows = data?.results ?? [];
  const count = data?.count ?? 0;
  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE));
  const from = count === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, count);
  const hasFilters = Boolean(debouncedSearch || status || department || year);

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>Students</h1>
          <p className="muted">{data ? `${count} student${count === 1 ? "" : "s"} found` : "Loading…"}</p>
        </div>
        <div className="header-actions">
          <button type="button" className="btn btn--ghost" onClick={handleExport} disabled={exporting || count === 0}>
            <Download size={16} /> {exporting ? "Exporting…" : "Export CSV"}
          </button>
          <button
            type="button"
            className="btn btn--primary"
            onClick={() => {
              setFormError(null);
              setMode({ kind: "create" });
            }}
          >
            <Plus size={16} /> Add student
          </button>
        </div>
      </header>

      {notice && <div className="toast">{notice}</div>}

      <div className="toolbar">
        <div className="search">
          <Search size={16} />
          <input
            placeholder="Search by name, email or ID…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select className="input input--select" value={department} onChange={(e) => setDepartment(e.target.value as Department | "")}>
          <option value="">All departments</option>
          {DEPARTMENTS.map((d) => (
            <option key={d} value={d}>
              {DEPARTMENT_LABELS[d]}
            </option>
          ))}
        </select>
        <select
          className="input input--select"
          value={year}
          onChange={(e) => setYear(e.target.value === "" ? "" : Number(e.target.value))}
        >
          <option value="">All years</option>
          {YEAR_LEVELS.map((y) => (
            <option key={y} value={y}>
              Year {y}
            </option>
          ))}
        </select>
      </div>

      <div className="segmented" role="group" aria-label="Filter by status">
        {(["", ...STATUSES] as const).map((value) => (
          <button
            key={value || "all"}
            type="button"
            aria-pressed={status === value}
            className={`segmented__btn${status === value ? " segmented__btn--active" : ""}`}
            onClick={() => setStatus(value)}
          >
            {value === "" ? "All" : STATUS_LABELS[value]}
          </button>
        ))}
      </div>

      {error && <div className="alert alert--error">{error}</div>}

      <div className="card card--flush">
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <SortableHeader label="Student" field="first_name" sort={sort} onSort={toggleSort} />
                <SortableHeader label="ID" field="student_id" sort={sort} onSort={toggleSort} />
                <th>Department</th>
                <SortableHeader label="Year" field="year_level" sort={sort} onSort={toggleSort} />
                <SortableHeader label="GPA" field="gpa" sort={sort} onSort={toggleSort} />
                <th>Status</th>
                <SortableHeader label="Enrolled" field="enrollment_date" sort={sort} onSort={toggleSort} />
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && rows.length === 0 && (
                <tr>
                  <td colSpan={8} className="center muted">
                    Loading students…
                  </td>
                </tr>
              )}
              {!loading && rows.length === 0 && (
                <tr>
                  <td colSpan={8}>
                    <EmptyState
                      icon={Users}
                      title={hasFilters ? "No matching students" : "No students yet"}
                      description={
                        hasFilters
                          ? "Try clearing the search or changing the filters."
                          : "Click “Add student” to create the first record."
                      }
                    />
                  </td>
                </tr>
              )}
              {rows.map((student) => (
                <tr key={student.id} className={loading ? "row--loading" : ""}>
                  <td>
                    <div className="person">
                      <div className="avatar avatar--sm">{initials(student.first_name, student.last_name)}</div>
                      <div>
                        <strong>{student.full_name}</strong>
                        <div className="muted small">{student.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="mono">{student.student_id ?? "—"}</td>
                  <td>{DEPARTMENT_LABELS[student.department]}</td>
                  <td>Year {student.year_level}</td>
                  <td>
                    <span className={`gpa-chip gpa-chip--${gpaTone(student.gpa)}`}>{student.gpa ?? "—"}</span>
                  </td>
                  <td>
                    <span className={`badge badge--${student.status}`}>{STATUS_LABELS[student.status]}</span>
                  </td>
                  <td>{formatDate(student.enrollment_date)}</td>
                  <td className="text-right">
                    <button
                      type="button"
                      className="icon-action"
                      aria-label={`Edit ${student.full_name}`}
                      onClick={() => {
                        setFormError(null);
                        setMode({ kind: "edit", student });
                      }}
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      type="button"
                      className="icon-action icon-action--danger"
                      aria-label={`Delete ${student.full_name}`}
                      onClick={() => handleDelete(student)}
                    >
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <footer className="pagination">
          <span className="muted">
            Showing {from}–{to} of {count}
          </span>
          <div className="pagination__controls">
            <button
              type="button"
              className="btn btn--ghost btn--sm"
              disabled={page <= 1 || loading}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft size={14} /> Previous
            </button>
            <span className="pagination__page">
              {page} / {totalPages}
            </span>
            <button
              type="button"
              className="btn btn--ghost btn--sm"
              disabled={!data?.next || loading}
              onClick={() => setPage((p) => p + 1)}
            >
              Next <ChevronRight size={14} />
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
          onCancel={() => setMode({ kind: "closed" })}
        />
      )}
    </div>
  );
}