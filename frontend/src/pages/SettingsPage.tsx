import { Check, Download, LogOut, Moon, Sun } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Panel } from "../components/Panel";
import { ACCENT_THEMES, type AccentKey } from "../constants";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useDashboardStats } from "../hooks/useDashboardStats";
import { getErrorMessage } from "../services/errors";
import { exportStudentsCsv } from "../services/studentService";
import { initials } from "../utils/format";

const ACCENT_KEYS = Object.keys(ACCENT_THEMES) as AccentKey[];

export function SettingsPage() {
  const { username, logout } = useAuth();
  const { accent, setAccent, dark, toggleDark } = useTheme();
  const { stats, error } = useDashboardStats();
  const navigate = useNavigate();

  const [exporting, setExporting] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);

  const apiStatus = error ? "Offline" : stats ? "Connected" : "Checking…";

  const handleExportAll = async () => {
    setExporting(true);
    setMessage(null);
    try {
      const blob = await exportStudentsCsv({
        search: "",
        status: "",
        department: "",
        year_level: "",
        ordering: "first_name",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `all-students-${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      setMessage({ type: "ok", text: "All students exported." });
    } catch (err) {
      setMessage({ type: "error", text: getErrorMessage(err, "Export failed") });
    } finally {
      setExporting(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>Settings</h1>
          <p className="muted">Personalize your workspace and manage your session.</p>
        </div>
      </header>

      <div className="settings-grid">
        <Panel title="Profile">
          <div className="profile">
            <div className="avatar avatar--xl">{initials(username ?? "U")}</div>
            <div>
              <strong className="profile__name">{username}</strong>
              <p className="muted">Administrator</p>
            </div>
          </div>
          <button type="button" className="btn btn--danger" onClick={handleLogout}>
            <LogOut size={16} /> Sign out
          </button>
        </Panel>

        <Panel title="Appearance" subtitle="Choose an accent color and display mode">
          <div className="setting-row">
            <div>
              <strong>Accent color</strong>
              <p className="muted small">Applies to buttons, charts and highlights.</p>
            </div>
            <div className="swatches">
              {ACCENT_KEYS.map((key) => (
                <button
                  key={key}
                  type="button"
                  className={`swatch${accent === key ? " swatch--active" : ""}`}
                  style={{ background: ACCENT_THEMES[key].color }}
                  aria-label={`Use ${ACCENT_THEMES[key].label} accent`}
                  aria-pressed={accent === key}
                  onClick={() => setAccent(key)}
                >
                  {accent === key && <Check size={14} />}
                </button>
              ))}
            </div>
          </div>

          <div className="setting-row">
            <div>
              <strong>Dark mode</strong>
              <p className="muted small">Easier on the eyes at night.</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={dark}
              className={`switch${dark ? " switch--on" : ""}`}
              onClick={toggleDark}
            >
              <span className="switch__thumb">{dark ? <Moon size={12} /> : <Sun size={12} />}</span>
            </button>
          </div>
        </Panel>

        <Panel title="Data" subtitle="Export and connection status">
          <div className="setting-row">
            <div>
              <strong>Export all students</strong>
              <p className="muted small">Downloads every record as a CSV file.</p>
            </div>
            <button type="button" className="btn btn--ghost" onClick={handleExportAll} disabled={exporting}>
              <Download size={16} /> {exporting ? "Exporting…" : "Export CSV"}
            </button>
          </div>

          <div className="setting-row">
            <div>
              <strong>API connection</strong>
              <p className="muted small">Django backend at 127.0.0.1:8000</p>
            </div>
            <span className={`status-pill status-pill--${apiStatus === "Connected" ? "ok" : apiStatus === "Offline" ? "bad" : "wait"}`}>
              {apiStatus}
            </span>
          </div>

          {message && <div className={`alert ${message.type === "ok" ? "alert--success" : "alert--error"}`}>{message.text}</div>}
        </Panel>
      </div>
    </div>
  );
}