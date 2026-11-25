import { BarChart3 } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { EmptyState } from "../components/EmptyState";
import { Panel } from "../components/Panel";
import { DEPARTMENT_LABELS } from "../constants";
import { useTheme } from "../context/ThemeContext";
import { useDashboardStats } from "../hooks/useDashboardStats";
import { chartTheme, PALETTE } from "../utils/chart";
import { gpaTone, initials } from "../utils/format";

export function AnalyticsPage() {
  const { accentColor, dark } = useTheme();
  const { stats, error, loading, reload } = useDashboardStats();
  const ct = chartTheme(dark);

  if (loading && !stats) {
    return (
      <div className="page">
        <div className="skeleton-grid">
          <div className="skeleton" />
          <div className="skeleton" />
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

  if (stats.total === 0) {
    return (
      <div className="page">
        <EmptyState
          icon={BarChart3}
          title="Nothing to analyze yet"
          description="Add students to see year-level, GPA and gender analytics."
        />
      </div>
    );
  }

  const yearData = stats.by_year.map((y) => ({ label: `Year ${y.year_level}`, count: y.count }));
  const genderData = stats.by_gender.map((g, i) => ({
    name: g.label,
    value: g.count,
    color: PALETTE[i % PALETTE.length],
  }));
  const deptGpaData = stats.by_department
    .filter((d) => d.average_gpa !== null)
    .map((d) => ({ label: DEPARTMENT_LABELS[d.department], gpa: d.average_gpa ?? 0 }));

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>Analytics</h1>
          <p className="muted">Enrollment and academic performance from live data.</p>
        </div>
      </header>

      <div className="dash-row dash-row--equal">
        <Panel title="Students by year level">
          <div className="chart">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={yearData} margin={{ top: 10, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={ct.grid} vertical={false} />
                <XAxis dataKey="label" tick={{ fill: ct.tick, fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fill: ct.tick, fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={ct.tooltip} cursor={{ fill: "transparent" }} />
                <Bar dataKey="count" name="Students" fill={accentColor} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Gender distribution">
          <div className="chart">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={genderData} dataKey="value" nameKey="name" innerRadius="55%" outerRadius="85%" paddingAngle={3} stroke="none">
                  {genderData.map((d) => (
                    <Cell key={d.name} fill={d.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={ct.tooltip} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="legend">
            {genderData.map((d) => (
              <li key={d.name}>
                <span className="legend__dot" style={{ background: d.color }} />
                {d.name}
                <strong>{d.value}</strong>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <div className="dash-row dash-row--equal">
        <Panel title="GPA distribution" subtitle="Number of students per GPA band">
          <div className="chart">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.gpa_distribution} margin={{ top: 10, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={ct.grid} vertical={false} />
                <XAxis dataKey="label" tick={{ fill: ct.tick, fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fill: ct.tick, fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={ct.tooltip} cursor={{ fill: "transparent" }} />
                <Bar dataKey="count" name="Students" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Average GPA by department" subtitle="Out of 4.0">
          <div className="chart">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptGpaData} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={ct.grid} horizontal={false} />
                <XAxis type="number" domain={[0, 4]} tick={{ fill: ct.tick, fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="label" width={130} tick={{ fill: ct.tick, fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={ct.tooltip} cursor={{ fill: "transparent" }} />
                <Bar dataKey="gpa" name="Avg GPA" fill={accentColor} radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      <Panel title="Top performers" subtitle="Highest GPA students">
        {stats.top_students.length === 0 ? (
          <p className="muted">No GPA records yet.</p>
        ) : (
          <ol className="rank-list">
            {stats.top_students.map((s, index) => (
              <li key={s.id} className="rank-list__item">
                <span className="rank">{index + 1}</span>
                <div className="avatar avatar--sm">{initials(s.first_name, s.last_name)}</div>
                <div className="rank-list__name">
                  <strong>{s.full_name}</strong>
                  <span className="muted small">{DEPARTMENT_LABELS[s.department]}</span>
                </div>
                <span className={`gpa-chip gpa-chip--${gpaTone(s.gpa)}`}>{s.gpa}</span>
              </li>
            ))}
          </ol>
        )}
      </Panel>
    </div>
  );
}