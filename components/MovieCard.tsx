import Link from "next/link";
import { img, MovieSummary } from "@/lib/tmdb";
import SeenButton from "./SeenButton";

export default function MovieCard({ m }: { m: MovieSummary }) {
  const poster = img(m.poster_path);
  return (
    <div className="group rounded-lg overflow-hidden bg-neutral-900 border border-white/5 flex flex-col">
      <Link href={`/movie/${m.id}`} className="block aspect-[2/3] bg-neutral-800">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {poster ? <img src={poster} alt={m.title} className="w-full h-full object-cover" loading="lazy" /> : <div className="p-3 text-neutral-500 text-sm">No poster</div>}
      </Link>
      <div className="p-3 space-y-2 flex-1 flex flex-col">
        <Link href={`/movie/${m.id}`} className="font-medium leading-tight hover:underline">{m.title}</Link>
        <div className="text-xs text-neutral-400">{m.release_date?.slice(0, 4) || "—"} · ⭐ {m.vote_average ? m.vote_average.toFixed(1) : "–"}</div>
        <div className="mt-auto pt-1"><SeenButton movie={m} compact /></div>
      </div>
    </div>
  );
}
