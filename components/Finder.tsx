"use client";
import { useEffect, useRef, useState } from "react";
import MovieCard from "./MovieCard";
import { useSeen } from "./SeenProvider";
import { img, MovieSummary, Provider } from "@/lib/tmdb";

const GENRES: [number, string][] = [[28,"Action"],[12,"Adventure"],[16,"Animation"],[35,"Comedy"],[80,"Crime"],[99,"Documentary"],[18,"Drama"],[10751,"Family"],[14,"Fantasy"],[36,"History"],[27,"Horror"],[10402,"Music"],[9648,"Mystery"],[10749,"Romance"],[878,"Sci-Fi"],[53,"Thriller"],[10752,"War"],[37,"Western"]];
const REGIONS = ["US","GB","CA","AU","IN","DE","FR","ES","IT","BR","MX","JP"];
const SORTS: [string, string][] = [["popularity.desc","Most popular"],["vote_average.desc","Highest rated"],["primary_release_date.desc","Newest"],["revenue.desc","Box office"]];

export default function Finder() {
  const { seen } = useSeen();
  const [q, setQ] = useState("");
  const [region, setRegion] = useState("US");
  const [providers, setProviders] = useState<Provider[]>([]);
  const [myProviders, setMyProviders] = useState<number[]>([]);
  const [genres, setGenres] = useState<number[]>([]);
  const [minRating, setMinRating] = useState(7);
  const [yearFrom, setYearFrom] = useState("");
  const [yearTo, setYearTo] = useState("");
  const [maxRuntime, setMaxRuntime] = useState("");
  const [sort, setSort] = useState("popularity.desc");
  const [hideSeen, setHideSeen] = useState(true);
  const [results, setResults] = useState<MovieSummary[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const reqId = useRef(0);

  // restore saved prefs
  useEffect(() => {
    try {
      const s = JSON.parse(localStorage.getItem("prefs") || "{}");
      if (s.region) setRegion(s.region);
      if (s.myProviders) setMyProviders(s.myProviders);
    } catch {}
  }, []);
  useEffect(() => { localStorage.setItem("prefs", JSON.stringify({ region, myProviders })); }, [region, myProviders]);

  useEffect(() => {
    fetch(`/api/providers?region=${region}`).then((r) => r.json()).then((d) => setProviders(d.results ?? []));
  }, [region]);

  async function run(p: number, append: boolean) {
    const id = ++reqId.current;
    setLoading(true); setError(null);
    try {
      let data: { results?: MovieSummary[]; totalPages?: number; error?: string };
      if (q.trim()) {
        data = await fetch(`/api/search?q=${encodeURIComponent(q)}`).then((r) => r.json());
      } else {
        const params = new URLSearchParams({ region, sort, page: String(p), minRating: String(minRating) });
        if (genres.length) params.set("genres", genres.join("|"));
        if (myProviders.length) params.set("providers", myProviders.join("|"));
        if (yearFrom) params.set("yearFrom", yearFrom);
        if (yearTo) params.set("yearTo", yearTo);
        if (maxRuntime) params.set("maxRuntime", maxRuntime);
        data = await fetch(`/api/discover?${params}`).then((r) => r.json());
      }
      if (id !== reqId.current) return;
      if (data.error) throw new Error(data.error);
      setResults((prev) => (append ? [...prev, ...(data.results ?? [])] : data.results ?? []));
      setTotalPages(q.trim() ? 1 : data.totalPages ?? 1);
      setPage(p);
    } catch (e) {
      if (id === reqId.current) setError(e instanceof Error ? e.message : "Failed");
    } finally {
      if (id === reqId.current) setLoading(false);
    }
  }

  // debounce re-query on any criteria change
  useEffect(() => {
    const t = setTimeout(() => run(1, false), 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, region, myProviders, genres, minRating, yearFrom, yearTo, maxRuntime, sort]);

  const toggle = <T,>(arr: T[], v: T) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);
  const visible = hideSeen ? results.filter((m) => !seen.has(m.id)) : results;
  const searching = q.trim().length > 0;

  return (
    <div className="space-y-6">
      <input
        value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search for a movie…"
        className="w-full rounded-lg bg-neutral-900 border border-white/10 px-4 py-3 text-lg outline-none focus:border-amber-500"
      />
      <div className={`grid gap-6 md:grid-cols-[260px_1fr] ${searching ? "" : ""}`}>
        <aside className="space-y-5 text-sm">
          <h2 className="font-semibold text-base">Find my next movie</h2>
          {searching && <p className="text-amber-400">Filters apply when search is empty.</p>}
          <label className="block space-y-1"><span className="text-neutral-400">Country</span>
            <select value={region} onChange={(e) => { setRegion(e.target.value); setMyProviders([]); }} className="w-full rounded bg-neutral-900 p-2">
              {REGIONS.map((r) => <option key={r}>{r}</option>)}
            </select>
          </label>
          <div className="space-y-1">
            <span className="text-neutral-400">My streaming services</span>
            <div className="flex flex-wrap gap-2">
              {providers.slice(0, 16).map((p) => (
                <button key={p.provider_id} title={p.provider_name} onClick={() => setMyProviders(toggle(myProviders, p.provider_id))}
                  className={`rounded-lg overflow-hidden border-2 ${myProviders.includes(p.provider_id) ? "border-amber-500" : "border-transparent opacity-60"}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img(p.logo_path, "w92")!} alt={p.provider_name} className="w-9 h-9" />
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-neutral-400">Genres (any)</span>
            <div className="flex flex-wrap gap-1.5">
              {GENRES.map(([id, name]) => (
                <button key={id} onClick={() => setGenres(toggle(genres, id))}
                  className={`rounded-full px-2.5 py-1 text-xs ${genres.includes(id) ? "bg-amber-500 text-black" : "bg-white/10"}`}>{name}</button>
              ))}
            </div>
          </div>
          <label className="block space-y-1"><span className="text-neutral-400">Min rating: {minRating}</span>
            <input type="range" min={0} max={9} step={0.5} value={minRating} onChange={(e) => setMinRating(+e.target.value)} className="w-full" />
          </label>
          <div className="flex gap-2">
            <input placeholder="From year" value={yearFrom} onChange={(e) => setYearFrom(e.target.value.replace(/\D/g, "").slice(0, 4))} className="w-1/2 rounded bg-neutral-900 p-2" />
            <input placeholder="To year" value={yearTo} onChange={(e) => setYearTo(e.target.value.replace(/\D/g, "").slice(0, 4))} className="w-1/2 rounded bg-neutral-900 p-2" />
          </div>
          <label className="block space-y-1"><span className="text-neutral-400">Max runtime</span>
            <select value={maxRuntime} onChange={(e) => setMaxRuntime(e.target.value)} className="w-full rounded bg-neutral-900 p-2">
              <option value="">Any</option><option value="90">≤ 90 min</option><option value="120">≤ 2 h</option><option value="150">≤ 2.5 h</option>
            </select>
          </label>
          <label className="block space-y-1"><span className="text-neutral-400">Sort by</span>
            <select value={sort} onChange={(e) => setSort(e.target.value)} className="w-full rounded bg-neutral-900 p-2">
              {SORTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={hideSeen} onChange={(e) => setHideSeen(e.target.checked)} /> Hide movies I&apos;ve seen</label>
        </aside>
        <section>
          {error && <p className="text-red-400 mb-3">{error}</p>}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {visible.map((m) => <MovieCard key={m.id} m={m} />)}
          </div>
          {!loading && !error && visible.length === 0 && <p className="text-neutral-500">No movies match.</p>}
          {loading && <p className="text-neutral-500 mt-4">Loading…</p>}
          {!searching && !loading && page < totalPages && (
            <button onClick={() => run(page + 1, true)} className="mt-6 rounded bg-white/10 px-4 py-2 hover:bg-white/20">Load more</button>
          )}
        </section>
      </div>
    </div>
  );
}
