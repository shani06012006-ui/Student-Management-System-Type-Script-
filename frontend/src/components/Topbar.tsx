import {
  Bell,
  ChevronDown,
  LogOut,
  Menu,
  Moon,
  Search,
  Settings as SettingsIcon,
  Sun,
} from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { STATUS_LABELS } from "../constants";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useDashboardStats } from "../hooks/useDashboardStats";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import { fetchStudents } from "../services/studentService";
import type { Student } from "../types";
import { formatDate, initials } from "../utils/format";

type OpenMenu = "search" | "notifications" | "profile" | null;

interface TopbarProps {
  onMenuClick: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const { username, logout } = useAuth();
  const { dark, toggleDark } = useTheme();
  const { stats } = useDashboardStats();
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query.trim(), 300);
  const [results, setResults] = useState<Student[]>([]);
  const [searching, setSearching] = useState(false);
  const [openMenu, setOpenMenu] = useState<OpenMenu>(null);
  const rootRef = useRef<HTMLElement>(null);

  const notifications = stats?.recent.slice(0, 5) ?? [];

  // Live search: fetch matching students while the user types.
  useEffect(() => {
    if (!debouncedQuery) {
      setResults([]);
      setSearching(false);
      return;
    }
    let active = true;
    setSearching(true);
    fetchStudents({
      page: 1,
      search: debouncedQuery,
      status: "",
      department: "",
      year_level: "",
      ordering: "first_name",
    })
      .then((res) => {
        if (active) setResults(res.results.slice(0, 5));
      })
      .catch(() => {
        if (active) setResults([]);
      })
      .finally(() => {
        if (active) setSearching(false);
      });
    return () => {
      active = false;
    };
  }, [debouncedQuery]);

  // Close any open menu on outside click or Escape.
  useEffect(() => {
    const onMouseDown = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpenMenu(null);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpenMenu(null);
    };
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  const toggleMenu = (menu: Exclude<OpenMenu, null>) =>
    setOpenMenu((current) => (current === menu ? null : menu));

  const openStudent = (student: Student) => {
    setQuery("");
    setOpenMenu(null);
    navigate(`/students?search=${encodeURIComponent(student.email)}`);
  };

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const term = query.trim();
    if (!term) return;
    setOpenMenu(null);
    navigate(`/students?search=${encodeURIComponent(term)}`);
  };

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <header className="topbar" ref={rootRef}>
      <button type="button" className="topbar__menu" onClick={onMenuClick} aria-label="Open menu">
        <Menu size={20} />
      </button>

      <div className="topbar__search">
        <form onSubmit={handleSearchSubmit}>
          <Search size={17} />
          <input
            value={query}
            placeholder="Search students by name, email or ID"
            aria-label="Search students"
            onFocus={() => setOpenMenu("search")}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpenMenu("search");
            }}
          />
        </form>

        {openMenu === "search" && query.trim() !== "" && (
          <div className="dropdown dropdown--search">
            {searching && <div className="dropdown__empty">Searching…</div>}
            {!searching && results.length === 0 && (
              <div className="dropdown__empty">No students match “{query.trim()}”.</div>
            )}
            {!searching &&
              results.map((student) => (
                <button
                  key={student.id}
                  type="button"
                  className="dropdown__item"
                  onClick={() => openStudent(student)}
                >
                  <div className="avatar avatar--sm">{initials(student.first_name, student.last_name)}</div>
                  <div className="dropdown__text">
                    <strong>{student.full_name}</strong>
                    <span>
                      {student.student_id ?? "—"} · {student.email}
                    </span>
                  </div>
                  <span className={`badge badge--${student.status}`}>{STATUS_LABELS[student.status]}</span>
                </button>
              ))}
          </div>
        )}
      </div>

      <div className="topbar__actions">
        <button
          type="button"
          className="icon-btn-round"
          onClick={toggleDark}
          aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
          title={dark ? "Light mode" : "Dark mode"}
        >
          {dark ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <div className="topbar__menu-wrap">
          <button
            type="button"
            className="icon-btn-round"
            aria-label="Notifications"
            aria-expanded={openMenu === "notifications"}
            onClick={() => toggleMenu("notifications")}
          >
            <Bell size={18} />
            {notifications.length > 0 && <span className="notif-dot" />}
          </button>

          {openMenu === "notifications" && (
            <div className="dropdown dropdown--right">
              <div className="dropdown__header">
                <strong>Recent enrollments</strong>
                <span>Latest students added</span>
              </div>
              {notifications.length === 0 && <div className="dropdown__empty">No recent activity.</div>}
              {notifications.map((student) => (
                <button
                  key={student.id}
                  type="button"
                  className="dropdown__item"
                  onClick={() => openStudent(student)}
                >
                  <div className="avatar avatar--sm">{initials(student.first_name, student.last_name)}</div>
                  <div className="dropdown__text">
                    <strong>{student.full_name}</strong>
                    <span>Enrolled {formatDate(student.enrollment_date)}</span>
                  </div>
                </button>
              ))}
              <button
                type="button"
                className="dropdown__footer"
                onClick={() => {
                  setOpenMenu(null);
                  navigate("/students");
                }}
              >
                View all students
              </button>
            </div>
          )}
        </div>

        <div className="topbar__menu-wrap">
          <button
            type="button"
            className="profile-btn"
            aria-expanded={openMenu === "profile"}
            onClick={() => toggleMenu("profile")}
          >
            <div className="avatar">{initials(username ?? "U")}</div>
            <span className="profile-btn__name">{username}</span>
            <ChevronDown size={16} className="profile-btn__chev" />
          </button>

          {openMenu === "profile" && (
            <div className="dropdown dropdown--right">
              <div className="dropdown__header">
                <strong>{username}</strong>
                <span>Administrator</span>
              </div>
              <button
                type="button"
                className="dropdown__item"
                onClick={() => {
                  setOpenMenu(null);
                  navigate("/settings");
                }}
              >
                <SettingsIcon size={18} />
                <span>Settings</span>
              </button>
              <div className="dropdown__divider" />
              <button type="button" className="dropdown__item dropdown__item--danger" onClick={handleLogout}>
                <LogOut size={18} />
                <span>Sign out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}