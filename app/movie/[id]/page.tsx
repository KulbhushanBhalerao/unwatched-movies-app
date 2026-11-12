import { notFound } from "next/navigation";
import { img, tmdb, Provider } from "@/lib/tmdb";
import SeenButton from "@/components/SeenButton";
import WhereToWatch from "@/components/WhereToWatch";

interface Movie {
  id: number;
  title: string;
  tagline: string;
  overview: string;
  poster_path: string | null;
  release_date: string;
  runtime: number | null;
  vote_average: number;
  vote_count: number;
  status: string;
  budget: number;
  revenue: number;
  original_language: string;
  original_title: string;
  genres: { id: number; name: string }[];
  production_companies: { id: number; name: string }[];
  belongs_to_collection: { name: string } | null;
  credits: {
    cast: { id: number; name: string; character: string; profile_path: string | null }[];
    crew: { id: number; name: string; job: string }[];
  };
  keywords: { keywords: { id: number; name: string }[] };
  videos: { results: { key: string; site: string; type: string; official: boolean }[] };
  "watch/providers": { results: Record<string, { link?: string; flatrate?: Provider[]; rent?: Provider[]; buy?: Provider[] }> };
}

const money = (n: number) => (n ? `$${n.toLocaleString("en-US")}` : null);

export default async function MoviePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) notFound();
  let m: Movie;
  try {
    m = await tmdb<Movie>(`/movie/${id}`, { append_to_response: "credits,keywords,videos,watch/providers" });
  } catch (e) {
    if (e instanceof Error && e.message.includes("404")) notFound();
    throw e;
  }
  const directors = m.credits.crew.filter((c) => c.job === "Director").map((c) => c.name);
  const writers = [...new Set(m.credits.crew.filter((c) => ["Writer", "Screenplay"].includes(c.job)).map((c) => c.name))];
  const trailers = m.videos.results.filter((v) => v.site === "YouTube" && v.type === "Trailer");
  const trailer = trailers.find((v) => v.official) ?? trailers[0];
  const facts: [string, string | null][] = [
    ["Original title", m.original_title !== m.title ? m.original_title : null],
    ["Collection", m.belongs_to_collection?.name ?? null],
    ["Budget", money(m.budget)],
    ["Box office", money(m.revenue)],
    ["Original language", m.original_language.toUpperCase()],
    ["Production", m.production_companies.map((c) => c.name).join(", ") || null],
    ["Status", m.status],
  ];
  const ref = { id: m.id, title: m.title, poster_path: m.poster_path, release_date: m.release_date };

  return (
    <article className="space-y-8">
      <div className="flex flex-col md:flex-row gap-6">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {m.poster_path && <img src={img(m.poster_path, "w500")!} alt={m.title} className="w-56 rounded-lg self-start" />}
        <div className="space-y-3">
          <h1 className="text-3xl font-bold">
            {m.title} <span className="text-neutral-500 font-normal">({m.release_date?.slice(0, 4)})</span>
          </h1>
          {m.tagline && <p className="italic text-neutral-400">“{m.tagline}”</p>}
          <p className="text-sm text-neutral-300">
            ⭐ {m.vote_average.toFixed(1)} ({m.vote_count.toLocaleString()} votes)
            {m.runtime ? ` · ${Math.floor(m.runtime / 60)}h ${m.runtime % 60}m` : ""} · {m.genres.map((g) => g.name).join(", ")}
          </p>
          <p className="max-w-3xl">{m.overview}</p>
          {directors.length > 0 && (
            <p className="text-sm">
              <b>Director:</b> {directors.join(", ")}
            </p>
          )}
          {writers.length > 0 && (
            <p className="text-sm">
              <b>Writers:</b> {writers.slice(0, 4).join(", ")}
            </p>
          )}
          <div className="flex gap-3 items-center pt-2">
            <SeenButton movie={ref} />
            {trailer && (
              <a href={`https://www.youtube.com/watch?v=${trailer.key}`} target="_blank" rel="noreferrer" className="text-sm underline">
                ▶ Trailer
              </a>
            )}
          </div>
        </div>
      </div>

      <WhereToWatch data={m["watch/providers"].results} />

      <section>
        <h2 className="text-xl font-semibold mb-3">Top cast</h2>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {m.credits.cast.slice(0, 16).map((c) => (
            <div key={c.id} className="w-28 shrink-0 text-xs">
              {c.profile_path ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={img(c.profile_path, "w185")!} alt={c.name} className="rounded-lg aspect-[2/3] object-cover w-full" />
              ) : (
                <div className="aspect-[2/3] rounded-lg bg-neutral-800" />
              )}
              <div className="font-medium mt-1">{c.name}</div>
              <div className="text-neutral-500">{c.character}</div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">Facts &amp; details</h2>
        <dl className="grid sm:grid-cols-[160px_1fr] gap-y-1 text-sm">
          {facts
            .filter(([, v]) => v)
            .map(([k, v]) => (
              <div key={k} className="contents">
                <dt className="text-neutral-400">{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
        </dl>
        {m.keywords.keywords.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {m.keywords.keywords.slice(0, 20).map((k) => (
              <span key={k.id} className="rounded-full bg-white/10 px-2.5 py-1 text-xs">
                {k.name}
              </span>
            ))}
          </div>
        )}
      </section>
    </article>
  );
}
