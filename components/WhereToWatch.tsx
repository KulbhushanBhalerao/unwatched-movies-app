"use client";
import { useEffect, useState } from "react";
import { img, Provider } from "@/lib/tmdb";

type Region = { link?: string; flatrate?: Provider[]; rent?: Provider[]; buy?: Provider[]; ads?: Provider[]; free?: Provider[] };

export default function WhereToWatch({ data }: { data: Record<string, Region> }) {
  const regions = Object.keys(data).sort();
  const [region, setRegion] = useState("US");
  useEffect(() => {
    try {
      const r = JSON.parse(localStorage.getItem("prefs") || "{}").region;
      if (r) setRegion(r);
    } catch {}
  }, []);
  const d = data[region];
  const groups: [string, Provider[] | undefined][] = [
    ["Stream", d?.flatrate],
    ["Free / with ads", [...(d?.free ?? []), ...(d?.ads ?? [])]],
    ["Rent", d?.rent],
    ["Buy", d?.buy],
  ];
  return (
    <section className="space-y-3">
      <div className="flex items-center gap-3">
        <h2 className="text-xl font-semibold">Where to watch</h2>
        <select value={region} onChange={(e) => setRegion(e.target.value)} className="rounded bg-neutral-900 p-1 text-sm">
          {(regions.includes(region) ? regions : [region, ...regions]).map((r) => (
            <option key={r}>{r}</option>
          ))}
        </select>
      </div>
      {!d && <p className="text-neutral-500">Not available on any known service in {region}.</p>}
      {groups
        .filter(([, l]) => l?.length)
        .map(([label, list]) => (
          <div key={label} className="flex items-center gap-3">
            <span className="w-28 text-sm text-neutral-400">{label}</span>
            <div className="flex flex-wrap gap-2">
              {list!.map((p) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={p.provider_id} src={img(p.logo_path, "w92")!} alt={p.provider_name} title={p.provider_name} className="w-10 h-10 rounded-lg" />
              ))}
            </div>
          </div>
        ))}
      {d?.link && (
        <a href={d.link} target="_blank" rel="noreferrer" className="text-xs text-neutral-500 underline">
          Details on TMDB / JustWatch
        </a>
      )}
    </section>
  );
}
