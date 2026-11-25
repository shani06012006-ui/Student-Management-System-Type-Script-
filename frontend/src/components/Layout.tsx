import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

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
          <span className="brand__logo">🎓</span>
          <span className="brand__name">EduTrack</span>
        </div>

        <nav className="sidebar__nav">
          <NavLink to="/" end className={({ isActive }) => `nav-link${isActive ? " nav-link--active" : ""}`}>
            Dashboard
          </NavLink>
          <NavLink to="/students" className={({ isActive }) => `nav-link${isActive ? " nav-link--active" : ""}`}>
            Students
          </NavLink>
        </nav>

        <div className="sidebar__footer">
          <div className="avatar">{username?.charAt(0).toUpperCase() ?? "?"}</div>
          <div className="sidebar__user">
            <strong>{username}</strong>
            <button type="button" className="link-btn" onClick={handleLogout}>
              Log out
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
