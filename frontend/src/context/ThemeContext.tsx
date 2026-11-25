import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { ACCENT_THEMES, type AccentKey } from "../constants";

const STORAGE_KEY = "edutrack_theme";

interface ThemeState {
  accent: AccentKey;
  dark: boolean;
}

interface ThemeContextValue {
  accent: AccentKey;
  accentColor: string;
  dark: boolean;
  setAccent: (accent: AccentKey) => void;
  toggleDark: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function readStoredTheme(): ThemeState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<ThemeState>;
      if (parsed.accent && parsed.accent in ACCENT_THEMES) {
        return { accent: parsed.accent, dark: Boolean(parsed.dark) };
      }
    }
  } catch {
    // Ignore corrupt storage and fall back to defaults.
  }
  return { accent: "indigo", dark: false };
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ThemeState>(readStoredTheme);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--accent", ACCENT_THEMES[state.accent].color);
    root.setAttribute("data-theme", state.dark ? "dark" : "light");
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      accent: state.accent,
      accentColor: ACCENT_THEMES[state.accent].color,
      dark: state.dark,
      setAccent: (accent) => setState((prev) => ({ ...prev, accent })),
      toggleDark: () => setState((prev) => ({ ...prev, dark: !prev.dark })),
    }),
    [state],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used inside <ThemeProvider>");
  }
  return context;
}