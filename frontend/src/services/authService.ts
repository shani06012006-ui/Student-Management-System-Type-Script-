import type { TokenPair } from "../types";
import { api } from "./api";

export async function login(username: string, password: string): Promise<TokenPair> {
  const { data } = await api.post<TokenPair>("/auth/login/", { username, password });
  return data;
}
