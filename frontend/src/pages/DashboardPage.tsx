import { ArrowRight, Award, Percent, Plus, TrendingUp, Users } from "lucide-react";
import {
  Area,
  AreaChart,
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
import { Link, useNavigate } from "react-router-dom";
import { EmptyState } from "../components/EmptyState";
import { Panel } from "../components/Panel";
import { StatCard } from "../components/StatCard";
import { STATUS_LABELS } from "../constants";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useDashboardStats } from "../hooks/useDashboardStats";
import { chartTheme, STATUS_COLORS } from "../utils/chart";
import { formatDate, formatMonth, gpaTone, initials, percent } from "../utils/format";
import { Users as UsersIcon } from "lucide-react";

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export function DashboardPage() {
  const { username } = useAuth();
  const { accentColor, dark } = useTheme();
  const { stats, error, loading, reload } = useDashboardStats();
  const navigate = useNavigate();
  const ct = chartTheme(dark);

  if (loading && !stats) {
    return (
      <div className="page">
        <div className="skeleton-grid">
          {[0, 1, 2, 3].map((i) => (
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

  if (stats.total === 0) {
    return (
      <div className="page">
        <EmptyState
          icon={UsersIcon}
          title="No students yet"
          description="Add your first student to start seeing analytics on this dashboard."
          action={
            <button type="button" className="btn btn--primary" onClick={() => navigate("/students?new=1")}>
              <Plus size={16} /> Add first student
            </button>
          }
        />
      </div>
    );
  }

  const enrollmentData = stats.enrollment_trend.map((p) => ({
    month: formatMonth(p.month),
    count: p.count,
  }));
  const departmentData = stats.by_department.map((d) => ({ label: d.label, count: d.count }));
  const gpaData = stats.gpa_distribution;

  const statusCounts = { active: stats.active, inactive: stats.inactive, graduated: stats.graduated };
  const statusData = (Object.keys(statusCounts) as (keyof typeof statusCounts)[])
    .map((key) => ({
      name: STATUS_LABELS[key],
      value: statusCounts[key],
      color: STATUS_COLORS[key],
    }))
    .filter((d) => d.value > 0);

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">
            {new Date().toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" })}
          </p>
          <h1>
            {greeting()}, {username} 
          </h1>
          <p className="muted">Here is what is happening across your student body.</p>
        </div>
        <Link to="/students?new=1" className="btn btn--primary">
          <Plus size={16} /> Add student
        </Link>
      </header>

      <div className="stats-grid">
        <StatCard
          label="Total students"
          value={stats.total}
          hint={`Across ${stats.by_department.length} departments`}
          icon={Users}
        />
        <StatCard
          label="Active rate"
          value={`${percent(stats.active, stats.total)}%`}
          hint={`${stats.active} currently active`}
          icon={Percent}
          tone="success"
        />
        <StatCard
          label="Average GPA"
          value={stats.average_gpa?.toFixed(2) ?? "—"}
          hint="Students with a recorded GPA"
          icon={TrendingUp}
          tone="warning"
        />
        <StatCard
          label="Graduated"
          value={stats.graduated}
          hint={`${stats.inactive} inactive`}
          icon={Award}
          tone="info"
        />
      </div>

      <div className="dash-row dash-row--wide">
        <Panel title="Enrollment trend" subtitle="New enrollments per month">
          <div className="chart chart--lg">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={enrollmentData} margin={{ top: 10, right: 12, left: -16, bottom: 0 }}>
                <defs>
                  <linearGradient id="enrollFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={accentColor} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={accentColor} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={ct.grid} vertical={false} />
                <XAxis dataKey="month" tick={{ fill: ct.tick, fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fill: ct.tick, fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={ct.tooltip} />
                <Area
                  type="monotone"
                  dataKey="count"
                  name="Enrollments"
                  stroke={accentColor}
                  strokeWidth={2.5}
                  fill="url(#enrollFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Status breakdown" subtitle="Current student status">
          <div className="chart chart--donut">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius="62%"
                  outerRadius="90%"
                  paddingAngle={3}
                  stroke="none"
                >
                  {statusData.map((d) => (
                    <Cell key={d.name} fill={d.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={ct.tooltip} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="legend">
            {statusData.map((d) => (
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
        <Panel title="Students by department">
          <div className="chart">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentData} margin={{ top: 10, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={ct.grid} vertical={false} />
                <XAxis dataKey="label" tick={{ fill: ct.tick, fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fill: ct.tick, fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={ct.tooltip} cursor={{ fill: "transparent" }} />
                <Bar dataKey="count" name="Students" fill={accentColor} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="GPA distribution" subtitle="How grades are spread">
          <div className="chart">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={gpaData} margin={{ top: 10, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={ct.grid} vertical={false} />
                <XAxis dataKey="label" tick={{ fill: ct.tick, fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fill: ct.tick, fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={ct.tooltip} cursor={{ fill: "transparent" }} />
                <Bar dataKey="count" name="Students" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      <Panel
        title="Recent enrollments"
        subtitle="Latest students added to the system"
        action={
          <Link to="/students" className="link-cta">
            View all <ArrowRight size={14} />
          </Link>
        }
      >
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Department</th>
                <th>GPA</th>
                <th>Status</th>
                <th>Enrolled</th>
              </tr>
            </thead>
            <tbody>
              {stats.recent.map((s) => (
                <tr key={s.id}>
                  <td>
                    <div className="person">
                      <div className="avatar avatar--sm">{initials(s.first_name, s.last_name)}</div>
                      <div>
                        <strong>{s.full_name}</strong>
                        <div className="muted small">{s.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>{s.department.replace(/_/g, " ")}</td>
                  <td>
                    <span className={`gpa-chip gpa-chip--${gpaTone(s.gpa)}`}>{s.gpa ?? "—"}</span>
                  </td>
                  <td>
                    <span className={`badge badge--${s.status}`}>{STATUS_LABELS[s.status]}</span>
                  </td>
                  <td>{formatDate(s.enrollment_date)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}