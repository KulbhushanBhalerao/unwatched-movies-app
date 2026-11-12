import { NextResponse } from "next/server";
import { tmdb, MovieSummary } from "@/lib/tmdb";
import { fail } from "@/lib/api";

// Passes whitelisted filters through to TMDB's /discover/movie.
export async function GET(req: Request) {
  try {
    const p = new URL(req.url).searchParams;
    const region = p.get("region") || "US";
    const providers = p.get("providers"); // pipe-separated ids = OR
    const data = await tmdb<{ results: MovieSummary[]; total_pages: number }>("/discover/movie", {
      include_adult: "false",
      sort_by: p.get("sort") || "popularity.desc",
      page: p.get("page") || 1,
      with_genres: p.get("genres") || undefined, // comma = AND, pipe = OR
      "vote_average.gte": p.get("minRating") || undefined,
      "vote_count.gte": p.get("minVotes") || 200,
      "primary_release_date.gte": p.get("yearFrom") ? `${p.get("yearFrom")}-01-01` : undefined,
      "primary_release_date.lte": p.get("yearTo") ? `${p.get("yearTo")}-12-31` : undefined,
      "with_runtime.lte": p.get("maxRuntime") || undefined,
      with_original_language: p.get("language") || undefined,
      ...(providers
        ? { with_watch_providers: providers, watch_region: region, with_watch_monetization_types: "flatrate|free|ads" }
        : {}),
    });
    return NextResponse.json({ results: data.results, totalPages: Math.min(data.total_pages, 500) });
  } catch (e) {
    return fail(e);
  }
}
