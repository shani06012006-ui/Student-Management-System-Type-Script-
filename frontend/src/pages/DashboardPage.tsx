import { useEffect, useState } from "react";
import { StatCard } from "../components/StatCard";
import { getErrorMessage } from "../services/errors";
import { fetchStats } from "../services/studentService";
import type { DashboardStats } from "../types";

export function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats()
      .then(setStats)
      .catch((err: unknown) => setError(getErrorMessage(err, "Could not load dashboard")));
  }, []);

  if (error) return <div className="alert alert--error">{error}</div>;
  if (!stats) return <div className="loading">Loading dashboard…</div>;

  const maxCount = Math.max(1, ...stats.by_department.map((d) => d.count));

  return (
    <section>
      <header className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p className="muted">Overview of enrolled students</p>
        </div>
      </header>

      <div className="stats-grid">
        <StatCard label="Total students" value={stats.total} accent="indigo" />
        <StatCard label="Active" value={stats.active} hint={`${stats.inactive} inactive`} accent="green" />
        <StatCard label="Graduated" value={stats.graduated} accent="sky" />
        <StatCard label="Average GPA" value={stats.average_gpa?.toFixed(2) ?? "—"} accent="amber" />
      </div>

      <div className="card">
        <h2 className="card__title">Students by department</h2>
        {stats.by_department.length === 0 && <p className="muted">No students yet.</p>}
        <ul className="bar-list">
          {stats.by_department.map((dept) => (
            <li key={dept.department} className="bar-list__item">
              <span className="bar-list__label">{dept.label}</span>
              <div className="bar-list__track">
                <div className="bar-list__fill" style={{ width: `${(dept.count / maxCount) * 100}%` }} />
              </div>
              <span className="bar-list__count">{dept.count}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
