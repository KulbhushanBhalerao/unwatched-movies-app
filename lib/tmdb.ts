const BASE = "https://api.themoviedb.org/3";

export const img = (path: string | null | undefined, size = "w342") =>
  path ? `https://image.tmdb.org/t/p/${size}${path}` : null;

export async function tmdb<T>(path: string, params: Record<string, string | number | undefined> = {}): Promise<T> {
  const token = process.env.TMDB_TOKEN;
  if (!token) throw new Error("TMDB_TOKEN is not set. Add it to .env (see .env.example).");
  const url = new URL(BASE + path);
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== "") url.searchParams.set(k, String(v));
  }
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}`, accept: "application/json" },
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error(`TMDB ${res.status} for ${path}`);
  return res.json();
}

export interface MovieSummary {
  id: number;
  title: string;
  poster_path: string | null;
  release_date?: string;
  vote_average: number;
  overview?: string;
  genre_ids?: number[];
}

export interface Provider { provider_id: number; provider_name: string; logo_path: string }
