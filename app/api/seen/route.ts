import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUser } from "@/lib/auth";
import { fail } from "@/lib/api";

export async function GET() {
  const user = await getUser();
  if (!user) return NextResponse.json({ seen: [] });
  const seen = await prisma.seen.findMany({ where: { userId: user.id }, orderBy: { seenAt: "desc" } });
  return NextResponse.json({ seen });
}

export async function POST(req: Request) {
  const user = await getUser();
  if (!user) return fail("Sign in to track movies", 401);
  const b = await req.json();
  if (!Number.isInteger(b.tmdbId) || typeof b.title !== "string") return fail("Bad request", 400);
  const rating = Number.isInteger(b.rating) && b.rating >= 1 && b.rating <= 10 ? b.rating : null;
  const data = {
    title: b.title.slice(0, 300),
    posterPath: typeof b.posterPath === "string" ? b.posterPath : null,
    year: typeof b.year === "string" ? b.year.slice(0, 4) : null,
    rating,
  };
  const row = await prisma.seen.upsert({
    where: { userId_tmdbId: { userId: user.id, tmdbId: b.tmdbId } },
    create: { userId: user.id, tmdbId: b.tmdbId, ...data },
    update: { rating: data.rating },
  });
  return NextResponse.json({ seen: row });
}

export async function DELETE(req: Request) {
  const user = await getUser();
  if (!user) return fail("Sign in", 401);
  const tmdbId = Number(new URL(req.url).searchParams.get("tmdbId"));
  if (!Number.isInteger(tmdbId)) return fail("Bad request", 400);
  await prisma.seen.deleteMany({ where: { userId: user.id, tmdbId } });
  return NextResponse.json({ ok: true });
}
