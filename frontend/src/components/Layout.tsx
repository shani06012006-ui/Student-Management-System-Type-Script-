import {
  BarChart3,
  Building2,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Plus,
  Settings as SettingsIcon,
  Users,
  type LucideIcon,
} from "lucide-react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { initials } from "../utils/format";

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
}

const OVERVIEW: NavItem[] = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
];

const MANAGEMENT: NavItem[] = [
  { to: "/students", label: "Students", icon: Users },
  { to: "/departments", label: "Departments", icon: Building2 },
];

const SYSTEM: NavItem[] = [{ to: "/settings", label: "Settings", icon: SettingsIcon }];

function NavSection({ title, items }: { title: string; items: NavItem[] }) {
  return (
    <div className="nav-section">
      <span className="nav-section__title">{title}</span>
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => `nav-link${isActive ? " nav-link--active" : ""}`}
          >
            <Icon size={18} />
            <span>{item.label}</span>
          </NavLink>
        );
      })}
    </div>
  );
}

export function Layout() {
  const { username, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand__logo">
            <GraduationCap size={20} />
          </div>
          <div className="brand__text">
            <span className="brand__name">EduTrack</span>
            <span className="brand__tag">Student Management</span>
          </div>
        </div>

        <button
          type="button"
          className="btn btn--primary btn--block sidebar__cta"
          onClick={() => navigate("/students?new=1")}
        >
          <Plus size={16} /> Add student
        </button>

        <nav className="sidebar__nav">
          <NavSection title="Overview" items={OVERVIEW} />
          <NavSection title="Management" items={MANAGEMENT} />
          <NavSection title="System" items={SYSTEM} />
        </nav>

        <div className="sidebar__footer">
          <div className="avatar">{initials(username ?? "U")}</div>
          <div className="sidebar__user">
            <strong>{username}</strong>
            <button type="button" className="link-btn" onClick={handleLogout}>
              <LogOut size={14} /> Log out
            </button>
          </div>
        </div>
      </aside>

      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}