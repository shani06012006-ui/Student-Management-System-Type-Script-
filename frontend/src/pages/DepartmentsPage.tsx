import { ArrowRight, Building2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { DEPARTMENTS, DEPARTMENT_LABELS } from "../constants";
import { useDashboardStats } from "../hooks/useDashboardStats";

export function DepartmentsPage() {
  const { stats, error, loading, reload } = useDashboardStats();
  const navigate = useNavigate();

  if (loading && !stats) {
    return (
      <div className="page">
        <div className="skeleton-grid">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page">
        <div className="alert alert--error">
          {error}{" "}
          <button type="button" className="link-btn" onClick={reload}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  // Include every department, even those with zero students.
  const rows = DEPARTMENTS.map((dept) => {
    const found = stats.by_department.find((d) => d.department === dept);
    return {
      department: dept,
      label: DEPARTMENT_LABELS[dept],
      count: found?.count ?? 0,
      active: found?.active ?? 0,
      averageGpa: found?.average_gpa ?? null,
    };
  }).sort((a, b) => b.count - a.count);

  const maxCount = Math.max(1, ...rows.map((r) => r.count));

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>Departments</h1>
          <p className="muted">Click a department to view its students.</p>
        </div>
      </header>

      <div className="dept-grid">
        {rows.map((row) => (
          <button
            key={row.department}
            type="button"
            className="dept-card"
            onClick={() => navigate(`/students?department=${row.department}`)}
          >
            <div className="dept-card__top">
              <div className="dept-card__icon">
                <Building2 size={20} />
              </div>
              <span className="dept-card__count">{row.count}</span>
            </div>
            <h3>{row.label}</h3>
            <p className="muted">
              {row.active} active · Avg GPA {row.averageGpa?.toFixed(2) ?? "—"}
            </p>
            <div className="meter">
              <div className="meter__fill" style={{ width: `${(row.count / maxCount) * 100}%` }} />
            </div>
            <span className="dept-card__link">
              View students <ArrowRight size={14} />
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}