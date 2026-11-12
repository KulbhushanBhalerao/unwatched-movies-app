"use client";
import { createContext, useCallback, useContext, useEffect, useState } from "react";

export interface SeenItem { tmdbId: number; title: string; posterPath: string | null; year: string | null; rating: number | null; seenAt: string }
export interface MovieRef { id: number; title: string; poster_path: string | null; release_date?: string }
interface User { id: number; email: string }

interface Ctx {
  user: User | null;
  ready: boolean;
  seen: Map<number, SeenItem>;
  markSeen(m: MovieRef, rating?: number | null): Promise<void>;
  unmark(id: number): Promise<void>;
  auth(mode: "login" | "register", email: string, password: string): Promise<string | null>;
  logout(): Promise<void>;
  openAuth(): void;
  authOpen: boolean;
  closeAuth(): void;
}

const C = createContext<Ctx>(null as unknown as Ctx);
export const useSeen = () => useContext(C);

export function SeenProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [seen, setSeen] = useState<Map<number, SeenItem>>(new Map());
  const [authOpen, setAuthOpen] = useState(false);

  const load = useCallback(async () => {
    const me = await fetch("/api/auth/me").then((r) => r.json());
    setUser(me.user);
    if (me.user) {
      const s = await fetch("/api/seen").then((r) => r.json());
      setSeen(new Map((s.seen as SeenItem[]).map((x) => [x.tmdbId, x])));
    } else setSeen(new Map());
    setReady(true);
  }, []);
  useEffect(() => { load(); }, [load]);

  const markSeen: Ctx["markSeen"] = async (m, rating = null) => {
    if (!user) return setAuthOpen(true);
    const res = await fetch("/api/seen", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ tmdbId: m.id, title: m.title, posterPath: m.poster_path, year: m.release_date, rating }),
    });
    if (res.ok) {
      const { seen: row } = await res.json();
      setSeen((prev) => new Map(prev).set(row.tmdbId, row));
    }
  };
  const unmark: Ctx["unmark"] = async (id) => {
    const res = await fetch(`/api/seen?tmdbId=${id}`, { method: "DELETE" });
    if (res.ok) setSeen((prev) => { const n = new Map(prev); n.delete(id); return n; });
  };
  const auth: Ctx["auth"] = async (mode, email, password) => {
    const res = await fetch(`/api/auth/${mode}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) return (await res.json()).error ?? "Something went wrong";
    await load();
    setAuthOpen(false);
    return null;
  };
  const logout = async () => { await fetch("/api/auth/logout", { method: "POST" }); await load(); };

  return (
    <C.Provider value={{ user, ready, seen, markSeen, unmark, auth, logout, authOpen, openAuth: () => setAuthOpen(true), closeAuth: () => setAuthOpen(false) }}>
      {children}
    </C.Provider>
  );
}
