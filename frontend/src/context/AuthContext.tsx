import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { login as loginRequest } from "../services/authService";
import { tokenStorage } from "../services/tokenStorage";

interface AuthContextValue {
  isAuthenticated: boolean;
  username: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [username, setUsername] = useState<string | null>(() =>
    tokenStorage.getAccess() ? tokenStorage.getUsername() : null,
  );

  const login = useCallback(async (name: string, password: string) => {
    const tokens = await loginRequest(name, password);
    tokenStorage.save(tokens, name);
    setUsername(name);
  }, []);

  const logout = useCallback(() => {
    tokenStorage.clear();
    setUsername(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ isAuthenticated: username !== null, username, login, logout }),
    [username, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return context;
}
