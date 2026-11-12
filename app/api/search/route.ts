import { NextResponse } from "next/server";
import { tmdb, MovieSummary } from "@/lib/tmdb";
import { fail } from "@/lib/api";

export async function GET(req: Request) {
  try {
    const q = new URL(req.url).searchParams.get("q")?.trim();
    if (!q) return NextResponse.json({ results: [] });
    const data = await tmdb<{ results: MovieSummary[] }>("/search/movie", { query: q, include_adult: "false" });
    return NextResponse.json({ results: data.results });
  } catch (e) {
    return fail(e);
  }
}
