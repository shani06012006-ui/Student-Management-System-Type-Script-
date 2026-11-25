import type { TokenPair } from "../types";

const ACCESS_KEY = "edutrack_access_token";
const REFRESH_KEY = "edutrack_refresh_token";
const USERNAME_KEY = "edutrack_username";

export const tokenStorage = {
  getAccess: (): string | null => localStorage.getItem(ACCESS_KEY),
  getRefresh: (): string | null => localStorage.getItem(REFRESH_KEY),
  getUsername: (): string | null => localStorage.getItem(USERNAME_KEY),

  save(tokens: TokenPair, username: string): void {
    localStorage.setItem(ACCESS_KEY, tokens.access);
    localStorage.setItem(REFRESH_KEY, tokens.refresh);
    localStorage.setItem(USERNAME_KEY, username);
  },

  setAccess(token: string): void {
    localStorage.setItem(ACCESS_KEY, token);
  },

  clear(): void {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(USERNAME_KEY);
  },
};
