import { NextResponse } from "next/server";
import { tmdb, Provider } from "@/lib/tmdb";
import { fail } from "@/lib/api";

export async function GET(req: Request) {
  try {
    const region = new URL(req.url).searchParams.get("region") || "US";
    const data = await tmdb<{ results: (Provider & { display_priorities?: Record<string, number> })[] }>(
      "/watch/providers/movie", { watch_region: region });
    const list = data.results
      .sort((a, b) => (a.display_priorities?.[region] ?? 999) - (b.display_priorities?.[region] ?? 999))
      .slice(0, 40);
    return NextResponse.json({ results: list });
  } catch (e) {
    return fail(e);
  }
}
