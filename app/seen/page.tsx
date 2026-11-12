"use client";
import Link from "next/link";
import { useSeen } from "@/components/SeenProvider";
import { img } from "@/lib/tmdb";

export default function SeenPage() {
  const { user, ready, seen, unmark, openAuth } = useSeen();
  if (!ready) return <p className="text-neutral-500">Loading…</p>;
  if (!user) return <p>Please <button className="underline" onClick={openAuth}>sign in</button> to see your list.</p>;
  const items = [...seen.values()];
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Movies I&apos;ve seen ({items.length})</h1>
      {items.length === 0 && <p className="text-neutral-500">Nothing yet. Mark movies as seen from the <Link className="underline" href="/">search page</Link>.</p>}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
        {items.map((s) => (
          <div key={s.tmdbId} className="rounded-lg overflow-hidden bg-neutral-900">
            <Link href={`/movie/${s.tmdbId}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {s.posterPath ? <img src={img(s.posterPath)!} alt={s.title} className="aspect-[2/3] w-full object-cover" /> : <div className="aspect-[2/3] p-2 text-sm">{s.title}</div>}
            </Link>
            <div className="p-2 text-xs space-y-1">
              <div className="font-medium">{s.title} {s.year && <span className="text-neutral-500">({s.year})</span>}</div>
              <button onClick={() => unmark(s.tmdbId)} className="text-red-400 underline">Remove</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
