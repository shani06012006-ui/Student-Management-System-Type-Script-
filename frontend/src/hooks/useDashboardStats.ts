import { useCallback, useEffect, useState } from "react";
import { fetchStats } from "../services/studentService";
import { getErrorMessage } from "../services/errors";
import type { DashboardStats } from "../types";

/** Loads /students/stats/ once per mount and exposes a reload function. */
export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchStats()
      .then((data) => {
        if (active) {
          setStats(data);
          setError(null);
        }
      })
      .catch((err: unknown) => {
        if (active) setError(getErrorMessage(err, "Could not load data from the server"));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [version]);

  const reload = useCallback(() => setVersion((v) => v + 1), []);

  return { stats, error, loading, reload };
}