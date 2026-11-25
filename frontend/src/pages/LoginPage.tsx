import { ArrowRight, Eye, EyeOff, GraduationCap, Lock, User } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getErrorMessage } from "../services/errors";

export function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? "/";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!username.trim() || !password) {
      setError("Please enter your username and password.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await login(username.trim(), password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(getErrorMessage(err, "Invalid username or password"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-shell">
      <aside className="login-hero">
        <div className="brand">
          <div className="brand__logo">
            <GraduationCap size={20} />
          </div>
          <span className="brand__name">EduTrack</span>
        </div>

        <div className="login-hero__copy">
          <h2>Manage your students with clarity.</h2>
          <p>Track enrollments, academic performance and departments in one place.</p>
          <ul className="login-hero__points">
            <li>Live dashboard analytics</li>
            <li>Secure JWT authentication</li>
            <li>One-click CSV export</li>
          </ul>
        </div>

        <span className="login-hero__footer">© {new Date().getFullYear()} EduTrack</span>
      </aside>

      <section className="login-panel">
        <div className="login-card">
          <div className="login-card__header">
            <h1>Welcome back</h1>
            <p className="muted">Sign in to continue to your dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="form">
            <label className="field">
              <span className="field__label">Username</span>
              <div className="input-icon">
                <User size={16} />
                <input
                  className="input"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </label>

            <label className="field">
              <span className="field__label">Password</span>
              <div className="input-icon">
                <Lock size={16} />
                <input
                  className="input"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="input-icon__action"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </label>

            {error && <div className="alert alert--error">{error}</div>}

            <button type="submit" className="btn btn--primary btn--block btn--lg" disabled={loading}>
              {loading ? "Signing in…" : "Sign in"} {!loading && <ArrowRight size={16} />}
            </button>
          </form>

          <p className="login-card__hint">Demo account: admin / admin123</p>
        </div>
      </section>
    </div>
  );
}