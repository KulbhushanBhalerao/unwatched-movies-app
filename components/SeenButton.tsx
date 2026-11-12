"use client";
import { MovieRef, useSeen } from "./SeenProvider";

export default function SeenButton({ movie, compact = false }: { movie: MovieRef; compact?: boolean }) {
  const { seen, markSeen, unmark } = useSeen();
  const isSeen = seen.has(movie.id);
  return (
    <button
      onClick={(e) => { e.preventDefault(); if (isSeen) unmark(movie.id); else markSeen(movie); }}
      className={`rounded font-medium ${compact ? "px-2 py-1 text-xs" : "px-4 py-2 text-sm"} ${isSeen ? "bg-emerald-600 text-white" : "bg-white/10 hover:bg-white/20"}`}
    >
      {isSeen ? "✓ Seen" : "Mark as seen"}
    </button>
  );
}
