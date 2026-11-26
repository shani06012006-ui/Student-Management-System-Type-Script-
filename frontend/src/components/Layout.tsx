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
import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { initials } from "../utils/format";
import { Topbar } from "./Topbar";

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
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Close the mobile drawer whenever the route changes.
  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname]);

  // Stop the page from scrolling behind the open drawer.
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="app-shell">
      {drawerOpen && <div className="sidebar-backdrop" onClick={() => setDrawerOpen(false)} />}

      <aside className={`sidebar${drawerOpen ? " sidebar--open" : ""}`}>
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

      <div className="main">
        <Topbar onMenuClick={() => setDrawerOpen(true)} />
        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}