import { lazy, Suspense, useEffect } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { Layout } from "./components/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";

const LoginPage = lazy(() => import("./pages/LoginPage").then((m) => ({ default: m.LoginPage })));
const DashboardPage = lazy(() => import("./pages/DashboardPage").then((m) => ({ default: m.DashboardPage })));
const AnalyticsPage = lazy(() => import("./pages/AnalyticsPage").then((m) => ({ default: m.AnalyticsPage })));
const StudentsPage = lazy(() => import("./pages/StudentsPage").then((m) => ({ default: m.StudentsPage })));
const DepartmentsPage = lazy(() => import("./pages/DepartmentsPage").then((m) => ({ default: m.DepartmentsPage })));
const SettingsPage = lazy(() => import("./pages/SettingsPage").then((m) => ({ default: m.SettingsPage })));

const SITE_NAME = "EduTrack";

const PAGE_META: Record<string, { title: string; description: string }> = {
  "/login": {
    title: "Sign in",
    description: "Sign in to EduTrack to manage students, departments and academic reports.",
  },
  "/": {
    title: "Dashboard",
    description: "Live overview of enrollments, active rate, average GPA and department statistics.",
  },
  "/analytics": {
    title: "Analytics",
    description: "Year-level, gender and GPA analytics for every student in EduTrack.",
  },
  "/students": {
    title: "Students",
    description: "Search, filter, sort, edit and export student records.",
  },
  "/departments": {
    title: "Departments",
    description: "Student counts and average GPA for each academic department.",
  },
  "/settings": {
    title: "Settings",
    description: "Personalize theme, accent color and export options.",
  },
};

function setMetaTag(attr: "name" | "property", key: string, content: string) {
  let tag = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute(attr, key);
    document.head.appendChild(tag);
  }
  tag.content = content;
}

/** Updates the page title and description when the route changes. */
function SeoManager() {
  const { pathname } = useLocation();

  useEffect(() => {
    const meta = PAGE_META[pathname] ?? PAGE_META["/"];
    const fullTitle = `${meta.title} · ${SITE_NAME}`;
    document.title = fullTitle;
    setMetaTag("name", "description", meta.description);
    setMetaTag("property", "og:title", fullTitle);
    setMetaTag("property", "og:description", meta.description);
  }, [pathname]);

  return null;
}

function PageLoader() {
  return <div className="loading">Loading…</div>;
}

export default function App() {
  return (
    <>
      <SeoManager />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="students" element={<StudentsPage />} />
            <Route path="departments" element={<DepartmentsPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </>
  );
}